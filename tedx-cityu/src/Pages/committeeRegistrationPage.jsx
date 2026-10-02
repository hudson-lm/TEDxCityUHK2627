import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import '@fontsource/commissioner/400.css';
import '@fontsource/commissioner/600.css';
import '@fontsource/commissioner/700.css';
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
const CV_ACCEPT = '.pdf,.doc,.docx';
const PORTFOLIO_REQUIRED_DEPARTMENTS = ['Creative', 'Marketing and Communication'];
const CITYU_EMAIL_PATTERN = /^[^\s@]+@my\.cityu\.edu\.hk$/i;

const Page = styled.main`
  min-height: 100vh;
  color: #211915;
  background:
    linear-gradient(rgba(112, 18, 35, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(112, 18, 35, 0.035) 1px, transparent 1px),
    #f3ede1;
  background-size: 28px 28px;
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  padding: clamp(5.5rem, 12vw, 9rem) 1.5rem clamp(5rem, 10vw, 8rem);
  color: #f8efdf;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255, 231, 179, 0.2) 0%, rgba(255, 220, 150, 0.06) 24%, transparent 56%),
    linear-gradient(101deg, #31050f 0%, #6f1027 7%, #25040d 18%, transparent 28%),
    linear-gradient(259deg, #31050f 0%, #6f1027 7%, #25040d 18%, transparent 28%),
    linear-gradient(180deg, #140b0c 0%, #080607 100%);
  border-bottom: 1px solid #c7a467;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(90deg, transparent 0 10%, rgba(255,255,255,0.025) 10.2%, transparent 10.7%),
      linear-gradient(90deg, rgba(0,0,0,0.54), transparent 16%, transparent 84%, rgba(0,0,0,0.54));
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -8rem;
    width: min(760px, 85vw);
    height: 11rem;
    transform: translateX(-50%);
    background: radial-gradient(ellipse, rgba(207, 172, 105, 0.21), transparent 67%);
    pointer-events: none;
  }
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
  width: min(980px, 100%);
  margin: 0 auto;
  text-align: center;
`;

const Eyebrow = styled.p`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  margin: 0 0 1.5rem;
  color: #d8b777;
  font-family: 'Commissioner', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;

  &::before,
  &::after {
    content: '';
    width: clamp(2.5rem, 8vw, 6rem);
    height: 1px;
    background: linear-gradient(90deg, transparent, #d8b777);
  }

  &::after { transform: rotate(180deg); }
`;

const HeroTitle = styled.h1`
  max-width: 900px;
  margin: 0 auto;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(3.4rem, 9vw, 7.6rem);
  font-weight: 400;
  letter-spacing: -0.055em;
  line-height: 0.88;

  span {
    display: block;
    color: #cf243f;
    font-style: italic;
  }
`;

const HeroCopy = styled.p`
  max-width: 620px;
  margin: 2rem auto 0;
  color: #d7cec1;
  font-family: 'Commissioner', sans-serif;
  font-size: clamp(0.98rem, 2vw, 1.1rem);
  line-height: 1.8;
`;

const StageDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1.75rem;
  align-items: center;
  justify-content: center;
  margin-top: 2.25rem;
  color: #bcae9d;
  font-family: 'Commissioner', sans-serif;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;

  span + span::before {
    content: '✦';
    margin-right: 1.75rem;
    color: #c7a467;
  }

  @media (max-width: 520px) {
    flex-direction: column;
    span + span::before { display: none; }
  }
`;

const Content = styled.section`
  display: grid;
  grid-template-columns: minmax(250px, 0.65fr) minmax(0, 1.35fr);
  gap: clamp(2rem, 5vw, 5rem);
  width: min(1080px, calc(100% - 2rem));
  margin: 0 auto;
  padding: clamp(4rem, 8vw, 7rem) 0;

  @media (max-width: 850px) {
    grid-template-columns: 1fr;
  }
`;

const Aside = styled.aside`
  align-self: start;
  position: relative;
  padding: 2.5rem 2rem 2.25rem;
  color: #f8efdf;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.045), transparent 35%),
    #5a0d20;
  border: 1px solid #c7a467;
  box-shadow: 0 20px 45px rgba(52, 12, 20, 0.2);

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 1.25rem;
    right: 1.25rem;
    height: 1px;
    background: rgba(216, 183, 119, 0.52);
  }

  &::before { top: 1rem; }
  &::after { bottom: 1rem; }

  h2 {
    margin: 0 0 1.15rem;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 2rem;
    font-weight: 400;
    line-height: 1.05;
  }

  p, li {
    color: #e6dbcc;
    font-family: 'Commissioner', sans-serif;
    font-size: 0.92rem;
    line-height: 1.7;
  }

  ul { padding-left: 1.25rem; }
  li + li { margin-top: 0.6rem; }
  li::marker { color: #d8b777; }
`;

const SectionKicker = styled.p`
  margin: 0 0 0.65rem;
  color: #b78b43;
  font-family: 'Commissioner', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
`;

const FormCard = styled.div`
  position: relative;
  padding: clamp(1.25rem, 4vw, 3rem);
  background:
    radial-gradient(circle at top right, rgba(183, 139, 67, 0.08), transparent 18rem),
    #fffdf8;
  border: 1px solid #c9b58d;
  box-shadow: 0 24px 70px rgba(55, 33, 25, 0.14);

  &::before {
    content: '';
    position: absolute;
    inset: 0.6rem;
    border: 1px solid rgba(183, 139, 67, 0.2);
    pointer-events: none;
  }
`;

const FormTitle = styled.h2`
  margin: 0 0 0.5rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 4vw, 3.1rem);
  font-weight: 400;
  letter-spacing: -0.035em;
`;

const RequiredNote = styled.p`
  margin: 0 0 2rem;
  color: #6d625a;
  font-family: 'Commissioner', sans-serif;
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
  color: #352922;
  font-family: 'Commissioner', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
`;

const controlStyles = `
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem 0.9rem;
  color: #211915;
  background: #fffefa;
  border: 1px solid #b9aa96;
  border-radius: 2px;
  font: 0.96rem 'Commissioner', sans-serif;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;

  &:focus {
    outline: none;
    background: #fff;
    border-color: #8e1730;
    box-shadow: 0 0 0 3px rgba(142, 23, 48, 0.12);
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
  color: #756c65;
  font-family: 'Commissioner', sans-serif;
  font-size: 0.8rem;
  line-height: 1.4;
`;

const FileInput = styled(Input)`
  padding: 0.65rem;

  &::file-selector-button {
    margin-right: 0.8rem;
    padding: 0.55rem 0.8rem;
    color: #f8efdf;
    background: #4b0c1b;
    border: 0;
    font: 600 0.82rem 'Commissioner', sans-serif;
    letter-spacing: 0.04em;
    cursor: pointer;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  margin: 1.5rem 0;
  color: #4d413a;
  font-family: 'Commissioner', sans-serif;
  font-size: 0.95rem;
  line-height: 1.5;

  input {
    flex: 0 0 auto;
    width: 1.2rem;
    height: 1.2rem;
    margin-top: 0.15rem;
    accent-color: #8e1730;
  }
`;

const Message = styled.div`
  margin: 0 0 1.25rem;
  padding: 1rem;
  color: ${(props) => (props.$success ? '#175c2d' : '#9c152c')};
  background: ${(props) => (props.$success ? '#e8f7ed' : '#fff0f2')};
  border: 2px solid currentColor;
  font-family: 'Commissioner', sans-serif;
  font-weight: 600;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem 1.5rem;
  color: #fff8ea;
  background: #7b1028;
  border: 1px solid #4b0918;
  border-radius: 2px;
  box-shadow: 0 10px 24px rgba(94, 12, 31, 0.2);
  font-family: 'Commissioner', sans-serif;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    background: #941534;
    transform: translateY(-2px);
    box-shadow: 0 14px 28px rgba(94, 12, 31, 0.26);
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
    color: #fff8ea;
    background: #7b1028;
    border: 1px solid #c7a467;
    border-radius: 50%;
    font-size: 3rem;
    line-height: 4.5rem;
  }

  h2 {
    margin: 0 0 1rem;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(1.8rem, 5vw, 3rem);
    font-weight: 400;
  }

  p {
    max-width: 520px;
    margin: 0 auto;
    color: #555;
    font-family: 'Commissioner', sans-serif;
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
  portfolioLink: '',
  availabilityAcknowledged: false,
  privacyConsent: false,
};

const friendlyError = (error = '') => {
  const normalized = error.toLowerCase();
  if (normalized.includes('committee_registrations_email_address_key') || normalized.includes('duplicate key')) {
    return 'An application has already been submitted with this email address.';
  }
  if (normalized.includes('committee_registrations_email_address_check')) {
    return 'Please use your CityUHK email address ending in @my.cityu.edu.hk.';
  }
  if (normalized.includes('fetch') || normalized.includes('network')) {
    return 'We could not reach the registration service. Check your connection and try again.';
  }
  if (normalized.includes('permission') || normalized.includes('row-level security')) {
    return 'Applications are not configured yet. Please contact the TEDxCityUHK team.';
  }
  if (normalized.includes('portfolio is required')) {
    return 'Please add a portfolio link because Creative or Marketing & Communication is one of your department choices.';
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

    if (!CITYU_EMAIL_PATTERN.test(form.email.trim())) {
      setMessage('Please use your CityUHK email address ending in @my.cityu.edu.hk.');
      return;
    }

    if (requiresPortfolio && !form.portfolioLink.trim()) {
      setMessage('Please add a portfolio link because Creative or Marketing & Communication is one of your department choices.');
      return;
    }

    const fileError = validateFile(form.cvFile, CV_MAX_SIZE, 'Your CV');
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
          <StageDetails aria-label="Recruitment details">
            <span>2026–27 season</span>
            <span>City University of Hong Kong</span>
          </StageDetails>
        </HeroInner>
      </Hero>

      <Content>
        <Aside>
          <SectionKicker>Act I · Before you apply</SectionKicker>
          <h2>Your call sheet</h2>
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
              <SectionKicker>Act II · Take your place</SectionKicker>
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
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    maxLength="254"
                    placeholder="name@my.cityu.edu.hk"
                    pattern="[^@\s]+@my\.cityu\.edu\.hk"
                    title="Use your CityUHK email address ending in @my.cityu.edu.hk"
                    required
                  />
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
                  <Label htmlFor="portfolioLink">Portfolio link {requiresPortfolio ? '*' : ''}</Label>
                  <Input
                    id="portfolioLink"
                    name="portfolioLink"
                    type="url"
                    value={form.portfolioLink}
                    onChange={handleChange}
                    placeholder="https://"
                    maxLength="1000"
                    required={requiresPortfolio}
                  />
                  <HelpText>Required for Creative or Marketing &amp; Communication. Make sure reviewers can open the link.</HelpText>
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
