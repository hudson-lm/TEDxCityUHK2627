import { supabase } from '../supabaseClient';

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
    const { error } = await supabase
      .from('committee_registrations')
      .insert([
        {
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
          experience: applicationData.experience.trim() || null,
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
