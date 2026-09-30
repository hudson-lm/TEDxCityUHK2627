import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { submitCommitteeApplication } from '../services/registrationService';

const DEPARTMENTS = [
  'Creative',
  'Technical',
  'Marketing and Communication',
  'Human Resources',
  'Finance and Sponsorship',
  'Event Management and Procurement',
  'Speaker Relations',
];

const YEARS_OF_STUDY = [
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4 or above',
  'Postgraduate',
  'Other',
];

const CV_MAX_SIZE = 10 * 1024 * 1024;
const PORTFOLIO_MAX_SIZE = 20 * 1024 * 1024;
const CV_ACCEPT = '.pdf,.doc,.docx';
const PORTFOLIO_ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.jpeg,.png';
const PORTFOLIO_REQUIRED_DEPARTMENTS = ['Creative', 'Marketing and Communication'];

const Page = styled.main`
  min-height: 100vh;
  color: #111;
  background:
    radial-gradient(circle at 12% 8%, rgba(235, 0, 40, 0.2), transparent 24rem),
    linear-gradient(145deg, #fff 0%, #f5f5f5 52%, #e9e9e9 100%);
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  padding: clamp(4rem, 10vw, 8rem) 1.5rem clamp(3rem, 7vw, 5rem);
  color: #fff;
  background: #050505;

  &::after {
    content: 'X';
    position: absolute;
    right: -0.06em;
    bottom: -0.38em;
    color: #eb0028;
    font-family: 'Bungee', sans-serif;
    font-size: clamp(16rem, 42vw, 38rem);
    line-height: 1;
    opacity: 0.3;
    pointer-events: none;
  }
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
  width: min(1080px, 100%);
  margin: 0 auto;
`;

const Eyebrow = styled.p`
  margin: 0 0 1rem;
  color: #eb0028;
  font-family: 'Bungee', sans-serif;
  font-size: 0.9rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`;

const HeroTitle = styled.h1`
  max-width: 850px;
  margin: 0;
  font-family: 'Bungee', sans-serif;
  font-size: clamp(2.7rem, 8vw, 6.5rem);
  line-height: 0.98;
  text-transform: uppercase;

  span { color: #eb0028; }
`;

const HeroCopy = styled.p`
  max-width: 650px;
  margin: 1.5rem 0 0;
  color: #dedede;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.7;
`;

const Content = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 0.65fr) minmax(0, 1.35fr);
  gap: clamp(2rem, 5vw, 5rem);
  width: min(1080px, calc(100% - 2rem));
  margin: 0 auto;
  padding: clamp(3rem, 7vw, 6rem) 0;

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
`;

const Aside = styled.aside`
  align-self: start;
  padding: 2rem;
  color: #fff;
  background: #111;
  border-top: 8px solid #eb0028;
  box-shadow: 10px 10px 0 #eb0028;

  h2 {
    margin: 0 0 1rem;
    font-family: 'Bungee', sans-serif;
    font-size: 1.5rem;
    text-transform: uppercase;
  }

  p, li {
    color: #d5d5d5;
    font-family: 'Poppins', sans-serif;
    line-height: 1.6;
  }

  ul { padding-left: 1.25rem; }
  li + li { margin-top: 0.6rem; }
`;

const FormCard = styled.div`
  padding: clamp(1.25rem, 4vw, 3rem);
  background: #fff;
  border: 3px solid #111;
  box-shadow: 12px 12px 0 #111;
`;

const FormTitle = styled.h2`
  margin: 0 0 0.5rem;
  font-family: 'Bungee', sans-serif;
  font-size: clamp(1.7rem, 4vw, 2.7rem);
  text-transform: uppercase;
`;

const RequiredNote = styled.p`
  margin: 0 0 2rem;
  color: #555;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.45rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
`;

const controlStyles = `
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem 0.9rem;
  color: #111;
  background: #fafafa;
  border: 2px solid #222;
  border-radius: 0;
  font: 1rem 'Poppins', sans-serif;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #eb0028;
    box-shadow: 4px 4px 0 rgba(235, 0, 40, 0.25);
  }
`;

const Input = styled.input`${controlStyles}`;
const Select = styled.select`${controlStyles}`;
const Textarea = styled.textarea`
  ${controlStyles}
  min-height: 145px;
  resize: vertical;
`;

const HelpText = styled.p`
  margin: 0.45rem 0 0;
  color: #666;
  font-family: 'Poppins', sans-serif;
  font-size: 0.8rem;
  line-height: 1.4;
`;

const FileInput = styled(Input)`
  padding: 0.65rem;

  &::file-selector-button {
    margin-right: 0.8rem;
    padding: 0.55rem 0.8rem;
    color: #fff;
    background: #111;
    border: 0;
    font: 700 0.85rem 'Poppins', sans-serif;
    cursor: pointer;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  margin: 1.5rem 0;
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  line-height: 1.5;

  input {
    flex: 0 0 auto;
    width: 1.2rem;
    height: 1.2rem;
    margin-top: 0.15rem;
    accent-color: #eb0028;
  }
`;

const Message = styled.div`
  margin: 0 0 1.25rem;
  padding: 1rem;
  color: ${(props) => (props.$success ? '#175c2d' : '#9c152c')};
  background: ${(props) => (props.$success ? '#e8f7ed' : '#fff0f2')};
  border: 2px solid currentColor;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem 1.5rem;
  color: #fff;
  background: #eb0028;
  border: 3px solid #111;
  box-shadow: 6px 6px 0 #111;
  font-family: 'Bungee', sans-serif;
  font-size: 1rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    background: #c80022;
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 #111;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const SuccessPanel = styled.div`
  padding: clamp(2rem, 7vw, 5rem) 1rem;
  text-align: center;

  div {
    width: 4.5rem;
    height: 4.5rem;
    margin: 0 auto 1.5rem;
    color: #fff;
    background: #eb0028;
    border-radius: 50%;
    font-size: 3rem;
    line-height: 4.5rem;
  }

  h2 {
    margin: 0 0 1rem;
    font-family: 'Bungee', sans-serif;
    font-size: clamp(1.8rem, 5vw, 3rem);
    text-transform: uppercase;
  }

  p {
    max-width: 520px;
    margin: 0 auto;
    color: #555;
    font-family: 'Poppins', sans-serif;
    line-height: 1.65;
  }
`;

const initialForm = {
  fullName: '',
  preferredName: '',
  email: '',
  phone: '',
  studentId: '',
  programme: '',
  yearOfStudy: '',
  firstChoice: '',
  secondChoice: '',
  motivation: '',
  cvFile: null,
  portfolioFile: null,
  availabilityAcknowledged: false,
  privacyConsent: false,
};

const friendlyError = (error = '') => {
  const normalized = error.toLowerCase();
  if (normalized.includes('committee_registrations_email_address_key') || normalized.includes('duplicate key')) {
    return 'An application has already been submitted with this email address.';
  }
  if (normalized.includes('fetch') || normalized.includes('network')) {
    return 'We could not reach the registration service. Check your connection and try again.';
  }
  if (normalized.includes('permission') || normalized.includes('row-level security')) {
    return 'Applications are not configured yet. Please contact the TEDxCityUHK team.';
  }
  if (normalized.includes('portfolio is required')) {
    return 'Please attach a portfolio because Creative or Marketing & Communication is one of your department choices.';
  }
  if (normalized.includes('file') || normalized.includes('storage') || normalized.includes('mime')) {
    return 'We could not upload one of your files. Check its format and size, then try again.';
  }
  return 'Your application could not be submitted right now. Please try again shortly.';
};

const validateFile = (file, maxSize, label) => {
  if (file && file.size > maxSize) {
    return `${label} must be smaller than ${maxSize / (1024 * 1024)} MB.`;
  }
  return '';
};

export default function CommitteeRegistrationPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const requiresPortfolio = PORTFOLIO_REQUIRED_DEPARTMENTS.includes(form.firstChoice)
    || PORTFOLIO_REQUIRED_DEPARTMENTS.includes(form.secondChoice);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    const nextValue = type === 'checkbox' ? checked : type === 'file' ? files?.[0] || null : value;
    setForm((current) => ({ ...current, [name]: nextValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (form.secondChoice && form.firstChoice === form.secondChoice) {
      setMessage('Please select two different department preferences.');
      return;
    }

    if (requiresPortfolio && !form.portfolioFile) {
      setMessage('Please attach a portfolio because Creative or Marketing & Communication is one of your department choices.');
      return;
    }

    const fileError = validateFile(form.cvFile, CV_MAX_SIZE, 'Your CV')
      || validateFile(form.portfolioFile, PORTFOLIO_MAX_SIZE, 'Your portfolio');
    if (fileError) {
      setMessage(fileError);
      return;
    }

    setLoading(true);
    const result = await submitCommitteeApplication(form);
    setLoading(false);

    if (result.success) {
      setSubmitted(true);
      setForm(initialForm);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setMessage(friendlyError(result.error));
    }
  };

  return (
    <Page>
      <Hero>
        <HeroInner>
          <Eyebrow>TEDxCityUHK Committee Recruitment</Eyebrow>
          <HeroTitle>Ideas need a <span>team.</span></HeroTitle>
          <HeroCopy>
            Help bring the next TEDxCityUHK experience to life. Tell us where you would like to contribute and why you want to join the committee.
          </HeroCopy>
        </HeroInner>
      </Hero>

      <Content>
        <Aside>
          <h2>Before you apply</h2>
          <p>Committee work is collaborative, hands-on, and spread across the event cycle.</p>
          <ul>
            <li>Choose the departments that best match your interests.</li>
            <li>Be specific about the skills and perspective you can bring.</li>
            <li>Shortlisted applicants will be contacted by the team.</li>
          </ul>
        </Aside>

        <FormCard>
          {submitted ? (
            <SuccessPanel role="status">
              <div aria-hidden="true">✓</div>
              <h2>Application received</h2>
              <p>Thank you for wanting to build TEDxCityUHK with us. We have saved your application and will contact you using the email address you provided.</p>
            </SuccessPanel>
          ) : (
            <form onSubmit={handleSubmit}>
              <FormTitle>Committee application</FormTitle>
              <RequiredNote>Fields marked with * are required.</RequiredNote>

              <Grid>
                <Field>
                  <Label htmlFor="fullName">Full name *</Label>
                  <Input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} autoComplete="name" maxLength="120" required />
                </Field>
                <Field>
                  <Label htmlFor="preferredName">Preferred name</Label>
                  <Input id="preferredName" name="preferredName" value={form.preferredName} onChange={handleChange} maxLength="80" />
                </Field>
                <Field>
                  <Label htmlFor="email">CityUHK email *</Label>
                  <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" maxLength="254" placeholder="name@my.cityu.edu.hk" required />
                </Field>
                <Field>
                  <Label htmlFor="phone">Phone number *</Label>
                  <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} autoComplete="tel" maxLength="30" placeholder="+852 XXXX XXXX" required />
                </Field>
                <Field>
                  <Label htmlFor="studentId">Student ID *</Label>
                  <Input id="studentId" name="studentId" value={form.studentId} onChange={handleChange} maxLength="30" required />
                </Field>
                <Field>
                  <Label htmlFor="programme">Programme / major *</Label>
                  <Input id="programme" name="programme" value={form.programme} onChange={handleChange} maxLength="160" required />
                </Field>
                <Field>
                  <Label htmlFor="yearOfStudy">Year of study *</Label>
                  <Select id="yearOfStudy" name="yearOfStudy" value={form.yearOfStudy} onChange={handleChange} required>
                    <option value="">Select your year</option>
                    {YEARS_OF_STUDY.map((year) => <option key={year} value={year}>{year}</option>)}
                  </Select>
                </Field>
              </Grid>

              <Grid>
                <Field>
                  <Label htmlFor="firstChoice">First department choice *</Label>
                  <Select id="firstChoice" name="firstChoice" value={form.firstChoice} onChange={handleChange} required>
                    <option value="">Select a department</option>
                    {DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
                  </Select>
                </Field>
                <Field>
                  <Label htmlFor="secondChoice">Second department choice</Label>
                  <Select id="secondChoice" name="secondChoice" value={form.secondChoice} onChange={handleChange}>
                    <option value="">No second choice</option>
                    {DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
                  </Select>
                </Field>
              </Grid>

              <Field>
                <Label htmlFor="motivation">Why do you want to join TEDxCityUHK? *</Label>
                <Textarea id="motivation" name="motivation" value={form.motivation} onChange={handleChange} minLength="40" maxLength="2000" required />
                <HelpText>At least 40 characters; maximum 2,000.</HelpText>
              </Field>

              <Grid>
                <Field>
                  <Label htmlFor="cvFile">CV / résumé</Label>
                  <FileInput id="cvFile" name="cvFile" type="file" accept={CV_ACCEPT} onChange={handleChange} />
                  <HelpText>PDF, DOC, or DOCX; maximum 10 MB.</HelpText>
                </Field>
                <Field>
                  <Label htmlFor="portfolioFile">Portfolio {requiresPortfolio ? '*' : ''}</Label>
                  <FileInput
                    id="portfolioFile"
                    name="portfolioFile"
                    type="file"
                    accept={PORTFOLIO_ACCEPT}
                    onChange={handleChange}
                    required={requiresPortfolio}
                  />
                  <HelpText>Required for Creative or Marketing &amp; Communication. PDF, Office file, ZIP, JPG, or PNG; maximum 20 MB.</HelpText>
                </Field>
              </Grid>

              <CheckboxLabel>
                <input type="checkbox" name="availabilityAcknowledged" checked={form.availabilityAcknowledged} onChange={handleChange} required />
                <span>I understand that committee members are expected to attend team meetings and contribute consistently throughout the event cycle. *</span>
              </CheckboxLabel>

              <CheckboxLabel>
                <input type="checkbox" name="privacyConsent" checked={form.privacyConsent} onChange={handleChange} required />
                <span>I consent to TEDxCityUHK using the information in this form to review my application and contact me about committee recruitment. *</span>
              </CheckboxLabel>

              {message && <Message role="alert">{message}</Message>}

              <SubmitButton type="submit" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit application'}
              </SubmitButton>
            </form>
          )}
        </FormCard>
      </Content>
    </Page>
  );
}
