import { supabase } from '../supabaseClient';

const APPLICATION_FILES_BUCKET = 'committee-application-files';
const PORTFOLIO_REQUIRED_DEPARTMENTS = ['Creative', 'Marketing and Communication'];

const createApplicationId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const randomValue = Math.floor(Math.random() * 16);
    const value = character === 'x' ? randomValue : (randomValue & 0x3) | 0x8;
    return value.toString(16);
  });
};

const safeFileName = (name) => name
  .normalize('NFKD')
  .replace(/[^a-zA-Z0-9._-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(-180) || 'file';

const uploadApplicationFile = async (applicationId, fileType, file) => {
  if (!file) {
    return null;
  }

  const path = `${applicationId}/${fileType}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(APPLICATION_FILES_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type || undefined,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return path;
};

const missingConfigurationResult = () => ({
  success: false,
  error: 'Supabase is not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to .env.local.',
});

export const submitRegistration = async (registrationData) => {
  if (!supabase) {
    return missingConfigurationResult();
  }

  try {
    const { data, error } = await supabase
      .from('registration')
      .insert([
        {
          name: registrationData.name,
          email_address: registrationData.email,
          phone_number: registrationData.phone,
          is_cityu_student: registrationData.isCityUStudent,
          student_id: registrationData.isCityUStudent ? registrationData.studentId : null,
          requires_guest_pass: !registrationData.isCityUStudent ? registrationData.requiresGuestPass : null,
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Registration error:', error.message);
    return { success: false, error: error.message };
  }
};

export const fetchAllRegistrations = async () => {
  if (!supabase) {
    return missingConfigurationResult();
  }

  try {
    const { data, error } = await supabase
      .from('registration')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Fetch error:', error.message);
    return { success: false, error: error.message };
  }
};

export const submitCommitteeApplication = async (applicationData) => {
  if (!supabase) {
    return missingConfigurationResult();
  }

  try {
    const requiresPortfolio = PORTFOLIO_REQUIRED_DEPARTMENTS.includes(applicationData.firstChoice)
      || PORTFOLIO_REQUIRED_DEPARTMENTS.includes(applicationData.secondChoice);

    if (requiresPortfolio && !applicationData.portfolioFile) {
      throw new Error('Portfolio is required for Creative and Marketing and Communication applicants.');
    }

    const applicationId = createApplicationId();
    const cvStoragePath = await uploadApplicationFile(applicationId, 'cv', applicationData.cvFile);
    const portfolioStoragePath = await uploadApplicationFile(
      applicationId,
      'portfolio',
      applicationData.portfolioFile,
    );

    const { error } = await supabase
      .from('committee_registrations')
      .insert([
        {
          id: applicationId,
          full_name: applicationData.fullName.trim(),
          preferred_name: applicationData.preferredName.trim() || null,
          email_address: applicationData.email.trim().toLowerCase(),
          phone_number: applicationData.phone.trim(),
          student_id: applicationData.studentId.trim().toUpperCase(),
          programme: applicationData.programme.trim(),
          year_of_study: applicationData.yearOfStudy,
          first_choice: applicationData.firstChoice,
          second_choice: applicationData.secondChoice || null,
          motivation: applicationData.motivation.trim(),
          cv_storage_path: cvStoragePath,
          portfolio_storage_path: portfolioStoragePath,
          availability_acknowledged: applicationData.availabilityAcknowledged,
        },
      ]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Committee application error:', error.message);
    return { success: false, error: error.message };
  }
};
