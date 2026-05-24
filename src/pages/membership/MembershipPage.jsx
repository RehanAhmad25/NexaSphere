import { useEffect, useMemo, useRef, useState } from 'react';
import useFormValidation from '../../hooks/useFormValidation';
import { DynamicIcon, IconArrowLeft, IconArrowRight, IconBolt, IconShieldCheck, IconUsers } from '../../shared/Icons';
import Footer from '../../shared/Footer';
import { Turnstile } from '@marsidev/react-turnstile';

const WHATSAPP_COMMUNITY = 'https://chat.whatsapp.com/Jjc5cuUKENu0RC1vWSEs20';
const LINKEDIN_PAGE      = 'https://www.linkedin.com/showcase/glbajaj-nexasphere/';

const COURSE_OPTIONS  = ['B-Tech', 'MBA', 'Other'];
const BRANCH_OPTIONS  = [
  'Computer Science Engineering (CSE)',
  'Computer Science (CS)',
  'Information Technology (IT)',
  'AI & Machine Learning (AIML)',
  'Computer Science & Design (CSD)',
  'MBA',
  'Other',
];
const SECTION_OPTIONS  = ['A', 'B', 'C', 'D', 'E', 'F', 'Other'];
const SEMESTER_OPTIONS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const GROUP_OPTIONS    = [
  'NexaSphere Cybersecurity',
  'NexaSphere AI/ML',
  'NexaSphere Web Development',
  'NexaSphere Cloud Wing',
  'NexaSphere Management Crew',
  'NexaSphere Android Development',
  'NexaSphere AWS',
  'NexaSphere Career & Placement',
];

const MEMBERSHIP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyRQOW3Xjv13vXvft8ezD9sJdvjV3kf-VHm1l_mImHRDUAEqsilK0wb5QBD5GOkixwe/exec';

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function Field({ label, required, hint, error, errorId, children }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <div style={{
          fontFamily: 'Orbitron,monospace',
          fontSize: '.72rem',
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--t1)',
        }}>
          {label}{required ? <span style={{ color: 'var(--c4)', marginLeft: 6 }}>*</span> : null}
        </div>
        {hint ? <div style={{ color: 'var(--t3)', fontSize: '.82rem' }}>{hint}</div> : null}
      </div>
      {children}
      {error && (
        <div
          id={errorId}
          role="alert"
          style={{
            color: '#ef4444',
            fontSize: '.85rem',
            marginTop: 4,
            fontWeight: 600,
            animation: 'fadeIn .25s ease'
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', maxLength, inputMode: inputModeProp, onPaste, onBlur, ...rest }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      onPaste={onPaste}
      placeholder={placeholder}
      type={type}
      maxLength={maxLength}
      inputMode={inputModeProp || (type === 'tel' ? 'numeric' : undefined)}
      style={{
        width: '100%',
        padding: '12px 14px',
        background: 'var(--card2)',
        border: rest['aria-invalid'] === 'true' ? '1px solid #ef4444' : '1px solid var(--bdr2)',
        borderRadius: 'var(--r2)',
        color: 'var(--t1)',
        fontFamily: 'Rajdhani,sans-serif',
        fontSize: '.98rem',
        outline: 'none',
        boxSizing: 'border-box',
      }}
      onFocus={e => { e.target.style.borderColor = rest['aria-invalid'] === 'true' ? '#ef4444' : 'var(--c1b)'; e.target.style.boxShadow = rest['aria-invalid'] === 'true' ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : 'var(--sh1)'; }}
      onBlur={e  => {
        e.target.style.borderColor = rest['aria-invalid'] === 'true' ? '#ef4444' : 'var(--bdr2)';
        e.target.style.boxShadow = 'none';
        if (onBlur) onBlur(e);
      }}
      {...rest}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 5, onBlur, ...rest }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%',
        padding: '12px 14px',
        background: 'var(--card2)',
        border: rest['aria-invalid'] === 'true' ? '1px solid #ef4444' : '1px solid var(--bdr2)',
        borderRadius: 'var(--r2)',
        color: 'var(--t1)',
        fontFamily: 'Rajdhani,sans-serif',
        fontSize: '.98rem',
        outline: 'none',
        resize: 'vertical',
        boxSizing: 'border-box',
      }}
      onFocus={e => { e.target.style.borderColor = rest['aria-invalid'] === 'true' ? '#ef4444' : 'var(--c1b)'; e.target.style.boxShadow = rest['aria-invalid'] === 'true' ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : 'var(--sh1)'; }}
      onBlur={e  => {
        e.target.style.borderColor = rest['aria-invalid'] === 'true' ? '#ef4444' : 'var(--bdr2)';
        e.target.style.boxShadow = 'none';
        if (onBlur) onBlur(e);
      }}
      {...rest}
    />
  );
}

const SELECT_ARROW = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23CC1111' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`;

function StyledSelect({ value, onChange, children, placeholder, onBlur, ...rest }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '12px 14px',
        background: 'var(--card2)',
        border: rest['aria-invalid'] === 'true' ? '1px solid #ef4444' : '1px solid var(--bdr2)',
        borderRadius: 'var(--r2)',
        color: value ? 'var(--t1)' : 'var(--t3)',
        fontFamily: 'Rajdhani,sans-serif',
        fontSize: '.98rem',
        outline: 'none',
        cursor: 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: SELECT_ARROW,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        paddingRight: '36px',
        boxSizing: 'border-box',
      }}
      onFocus={e => { e.target.style.borderColor = rest['aria-invalid'] === 'true' ? '#ef4444' : 'var(--c1b)'; e.target.style.boxShadow = rest['aria-invalid'] === 'true' ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : 'var(--sh1)'; }}
      onBlur={e  => {
        e.target.style.borderColor = rest['aria-invalid'] === 'true' ? '#ef4444' : 'var(--bdr2)';
        e.target.style.boxShadow = 'none';
        if (onBlur) onBlur(e);
      }}
      {...rest}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {children}
    </select>
  );
}

function PillRadio({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="btn btn-outline btn-sm"
            style={{
              background:   active ? 'linear-gradient(135deg,var(--c1),var(--c2))' : undefined,
              color:        active ? '#fff' : undefined,
              borderColor:  active ? 'transparent' : undefined,
              boxShadow:    active ? '0 0 18px var(--c1g)' : undefined,
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function MultiSelectChips({ options, values, onToggle, ...rest }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }} {...rest}>
      {options.map(opt => {
        const active = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className="btn btn-outline btn-sm"
            aria-pressed={active}
            style={{
              background:  active ? 'rgba(0,212,255,.12)' : undefined,
              borderColor: active ? 'var(--c1)' : undefined,
              color:       active ? 'var(--t1)' : undefined,
              boxShadow:   active ? '0 0 14px var(--c1g)' : undefined,
              textTransform: 'none',
              letterSpacing: '.03em',
              fontSize: '.82rem',
            }}
          >
            {active ? '✓' : ''}{opt}
          </button>
        );
      })}
    </div>
  );
}

export default function MembershipPage({ onBack }) {
  const [step, setStep]   = useState(0); 
  const [busy, setBusy]   = useState(false);
  const [done, setDone]   = useState(false);
  const [err,  setErr]    = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const topRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState('');
  
  useEffect(() => {
    try {
      const submitted = JSON.parse(localStorage.getItem('ns_member_emails') || '[]');
      if (submitted.length > 0) setAlreadySubmitted(true);
    } catch { /* ignore */ }
  }, []);

  const {
    values: form,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setValues,
    setErrors,
  } = useFormValidation(
    {
      fullName:     '',
      collegeEmail: '',
      rollNumber:   '',
      course:       '',
      courseOther:  '',
      branch:       '',
      branchOther:  '',
      section:      '',
      sectionOther: '',
      semester:     '',
      whatsapp:     '',
      groups:       [],
      whyJoin:      '',
    },
    {
      fullName: { required: true, requiredMessage: 'Full name is required' },
      collegeEmail: {
        required: true,
        requiredMessage: 'College email is required',
        email: true,
        emailMessage: 'Please enter a valid email address',
        custom: (val) => {
          if (val && !val.endsWith('@glbajajgroup.org')) {
            return 'Please use your official GL Bajaj email (@glbajajgroup.org)';
          }
        }
      },
      rollNumber: { required: true, requiredMessage: 'University roll number is required' },
      course: { required: true, requiredMessage: 'Course is required' },
      courseOther: {
        custom: (val, values) => {
          if (values.course === 'Other' && !String(val || '').trim()) {
            return 'Course specification is required';
          }
        }
      },
      branch: { required: true, requiredMessage: 'Branch/Department is required' },
      branchOther: {
        custom: (val, values) => {
          if (values.branch === 'Other' && !String(val || '').trim()) {
            return 'Branch specification is required';
          }
        }
      },
      section: { required: true, requiredMessage: 'Section is required' },
      sectionOther: {
        custom: (val, values) => {
          if (values.section === 'Other' && !String(val || '').trim()) {
            return 'Section specification is required';
          }
        }
      },
      semester: { required: true, requiredMessage: 'Semester is required' },
      whatsapp: {
        required: true,
        requiredMessage: 'WhatsApp number is required',
        phone: true,
        phoneMessage: 'WhatsApp number must be exactly 10 digits'
      },
      groups: {
        custom: (val) => {
          if (!val || val.length === 0) {
            return 'Please select at least one group';
          }
        }
      },
      whyJoin: { required: true, requiredMessage: 'Please explain why you want to join' },
    }
  );

  const stepFields = {
    1: ['fullName', 'collegeEmail', 'rollNumber', 'course', 'courseOther', 'branch', 'branchOther', 'section', 'sectionOther', 'semester', 'whatsapp'],
    2: ['groups', 'whyJoin']
  };

  const missingRequired = useMemo(() => {
    const missing = [];
    const fields = stepFields[step] || [];
    for (const f of fields) {
      const v = form[f];
      if (f === 'groups') {
        if (!v || v.length === 0) missing.push(f);
      } else if (f === 'courseOther') {
        if (form.course === 'Other' && !String(v || '').trim()) missing.push(f);
      } else if (f === 'branchOther') {
        if (form.branch === 'Other' && !String(v || '').trim()) missing.push(f);
      } else if (f === 'sectionOther') {
        if (form.section === 'Other' && !String(v || '').trim()) missing.push(f);
      } else if (f === 'collegeEmail') {
        const email = String(v || '').trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !email.endsWith('@glbajajgroup.org')) {
          missing.push(f);
        }
      } else if (f === 'whatsapp') {
        const phone = String(v || '').trim();
        if (!phone || !/^\d{10}$/.test(phone)) missing.push(f);
      } else {
        if (!String(v || '').trim()) missing.push(f);
      }
    }
    return missing;
  }, [form, step]);

  const canNext = missingRequired.length === 0;

  function scrollTop() {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  
  async function submit() {
    setErr('');
    setBusy(true);
    try {
      const emailKey = String(form.whatsapp || '').trim(); 
      try {
        const existing = JSON.parse(localStorage.getItem('ns_member_emails') || '[]');
        if (existing.includes(emailKey)) {
          setErr('This number has already been used to submit a membership form. Each member may submit only once.');
          setBusy(false);
          return;
        }
      } catch { /* ignore */ }

      const payload = {
        fullName:     form.fullName.trim(),
        collegeEmail: form.collegeEmail.trim().toLowerCase(),
        rollNumber:   form.rollNumber.trim(),
        course:       form.course === 'Other' ? (form.courseOther.trim() || 'Other') : form.course,
        branch:       form.branch === 'Other' ? (form.branchOther.trim() || 'Other') : form.branch,
        section:      form.section === 'Other' ? form.sectionOther : form.section,
        semester:     form.semester,
        whatsapp:     form.whatsapp,
        groups:       form.groups.join(', '),
        whyJoin:      form.whyJoin.trim(),
        submittedAt:  new Date().toISOString(),
        userAgent:    navigator.userAgent,
        formType:     'membership',
        captchaToken: captchaToken
      };

      const res = await fetch(MEMBERSHIP_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data && data.ok === false)) {
        throw new Error(data?.error || 'Membership form submission failed');
      }

      
      try {
        const existing = JSON.parse(localStorage.getItem('ns_member_emails') || '[]');
        existing.push(emailKey);
        localStorage.setItem('ns_member_emails', JSON.stringify(existing));
      } catch { /* ignore */ }

      setDone(true);
      scrollTop();
    } catch (e) {
      setErr(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('fired'); obs.unobserve(e.target); }
      });
    }, { threshold: .1, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('#pg-member .pop-flip, #pg-member .pop-in, #pg-member .pop-word, #pg-member .pop-scale')
      .forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [step]);

  
  const steps = useMemo(() => [
    
    {
      title:    'About NexaSphere',
      subtitle: 'NexaSphere Membership Form — GL Bajaj Group of Institutions',
      icon:     <IconBolt style={{ width: 18, height: 18 }} />,
      render: () => (
        <div style={{ display: 'grid', gap: 18 }}>
          
          <div style={{
            background: 'rgba(255,180,0,.08)',
            border: '1px solid rgba(255,180,0,.32)',
            borderRadius: 'var(--r3)',
            padding: '14px 18px',
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <span style={{ display: 'flex', color: '#ffb400', flexShrink: 0 }}><DynamicIcon name="AlertTriangle" size={22} /></span>
            <div style={{ lineHeight: 1.75 }}>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: '.75rem', letterSpacing: '.1em', color: 'var(--t1)', marginBottom: 6, textTransform: 'uppercase' }}>
                Important — Read Before Proceeding
              </div>
              <div style={{ fontSize: '.9rem', color: 'var(--t2)' }}>
                This form can be filled <b style={{ color: 'var(--t1)' }}>only once</b> per device.
                Please <b style={{ color: 'var(--t1)' }}>read all questions carefully</b> and
                <b style={{ color: 'var(--t1)' }}> verify your details</b> before submitting.
                Once submitted, you will not be able to edit your response.
              </div>
            </div>
          </div>

          
          <p style={{ color: 'var(--t2)', lineHeight: 1.8, fontSize: '.96rem' }}>
            <span className="grad-text" style={{ fontWeight: 700 }}>NexaSphere</span> is the official
            student tech ecosystem at <b style={{ color: 'var(--t1)' }}>GL Bajaj Group of Institutions, Mathura</b>.
            We bring together students from all branches and years under one platform — organising and
            supporting <b>tech and non-tech events</b> across every domain:
          </p>

          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 10,
          }}>
            {[
              { icon: '🔐', label: 'Cybersecurity' },
              { icon: '🤖', label: 'AI / Machine Learning' },
              { icon: '🌐', label: 'Web Development' },
              { icon: '☁️', label: 'Cloud & AWS' },
              { icon: '📱', label: 'Android Development' },
              { icon: '📢', label: 'Management & Events' },
              { icon: '💼', label: 'Career & Placement' },
              { icon: '🎨', label: 'Design & Media' },
            ].map(d => (
              <div key={d.label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--card)',
                border: '1px solid var(--bdr)',
                borderRadius: 'var(--r2)',
                padding: '10px 14px',
              }}>
                <span style={{ display: 'flex', color: 'var(--c1)' }}><DynamicIcon name={d.icon} size={20} /></span>
                <span style={{ fontSize: '.88rem', color: 'var(--t2)', fontFamily: 'Rajdhani,sans-serif', fontWeight: 600 }}>{d.label}</span>
              </div>
            ))}
          </div>

          
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--bdr)',
            borderRadius: 'var(--r3)',
            padding: 18,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div className="corner-tl"/><div className="corner-br"/>
            <div style={{
              fontFamily: 'Space Mono,monospace', fontSize: '.65rem',
              color: 'var(--t3)', letterSpacing: '.22em',
              textTransform: 'uppercase', marginBottom: 10,
            }}>As a NexaSphere Member you get</div>
            <ul style={{ paddingLeft: 18, display: 'grid', gap: 8, color: 'var(--t2)', fontSize: '.92rem' }}>
              <li>Access to <b>exclusive WhatsApp domain groups</b> for learning & collaboration</li>
              <li>Early access to <b>workshops, hackathons, and events</b></li>
              <li>Network with peers and Core Team across all domains</li>
              <li><b>Certificates</b> for events you participate in</li>
              <li>Career, placement, and industry insights from our sessions</li>
            </ul>
          </div>

          
          <div style={{
            background: 'linear-gradient(135deg,rgba(0,119,181,.10),rgba(0,212,255,.05))',
            border: '1px solid rgba(0,119,181,.24)',
            borderRadius: 'var(--r2)',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: '1.1rem' }}>🔗</span>
            <span style={{ fontSize: '.88rem', color: 'var(--t2)', flex: 1 }}>
              Before filling the form, please follow our official LinkedIn page:
            </span>
            <a
              href={LINKEDIN_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ textTransform: 'none', letterSpacing: 0, fontSize: '.82rem' }}
            >Follow on LinkedIn</a>
          </div>
        </div>
      )
    },
    {
        title:    'Personal Details',
        subtitle: 'Fill in your basic information accurately using your college details.',
        icon:     <IconUsers style={{ width: 18, height: 18 }} />,
      render: () => (
        <div style={{ display: 'grid', gap: 18 }}>
          <Field
            label="Full Name"
            required
            error={touched.fullName && errors.fullName}
            errorId="error-fullName"
          >
            <Input
              id="input-fullName"
              value={form.fullName}
              onChange={v => handleChange('fullName', v.replace(/[^a-zA-Z\s.\-']/g, ''))}
              onBlur={() => handleBlur('fullName')}
              placeholder="Your full name"
              maxLength={60}
              aria-invalid={touched.fullName && errors.fullName ? "true" : "false"}
              aria-describedby={touched.fullName && errors.fullName ? "error-fullName" : undefined}
            />
          </Field>

          <Field
            label="College Email ID"
            required
            hint="Use your official college email"
            error={touched.collegeEmail && errors.collegeEmail}
            errorId="error-collegeEmail"
          >
            <Input
              id="input-collegeEmail"
              value={form.collegeEmail}
              onChange={v => handleChange('collegeEmail', v.trim().toLowerCase())}
              onBlur={() => handleBlur('collegeEmail')}
              placeholder="yourname@glbajajgroup.org"
              type="email"
              maxLength={100}
              aria-invalid={touched.collegeEmail && errors.collegeEmail ? "true" : "false"}
              aria-describedby={touched.collegeEmail && errors.collegeEmail ? "error-collegeEmail" : undefined}
            />
          </Field>

          <Field
            label="University Roll Number"
            required
            error={touched.rollNumber && errors.rollNumber}
            errorId="error-rollNumber"
          >
            <Input
              id="input-rollNumber"
              value={form.rollNumber}
              onChange={v => handleChange('rollNumber', v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15))}
              onBlur={() => handleBlur('rollNumber')}
              placeholder="e.g. 2301234"
              maxLength={15}
              aria-invalid={touched.rollNumber && errors.rollNumber ? "true" : "false"}
              aria-describedby={touched.rollNumber && errors.rollNumber ? "error-rollNumber" : undefined}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
            <Field
              label="Course"
              required
              error={(touched.course && errors.course) || (touched.courseOther && errors.courseOther)}
              errorId="error-course"
            >
              <div style={{ display: 'grid', gap: 8 }}>
                <StyledSelect
                  id="input-course"
                  value={form.course}
                  onChange={v => handleChange('course', v)}
                  onBlur={() => handleBlur('course')}
                  placeholder="Select course"
                  aria-invalid={touched.course && errors.course ? "true" : "false"}
                  aria-describedby={touched.course && errors.course ? "error-course" : undefined}
                >
                  {COURSE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </StyledSelect>
                {form.course === 'Other' && (
                  <Input
                    id="input-courseOther"
                    value={form.courseOther}
                    onChange={v => handleChange('courseOther', v.replace(/[^a-zA-Z0-9\s\-&().]/g, ''))}
                    onBlur={() => handleBlur('courseOther')}
                    placeholder="Specify your course"
                    maxLength={60}
                    aria-invalid={touched.courseOther && errors.courseOther ? "true" : "false"}
                    aria-describedby={touched.courseOther && errors.courseOther ? "error-course" : undefined}
                  />
                )}
              </div>
            </Field>

            <Field
              label="Branch / Department"
              required
              error={(touched.branch && errors.branch) || (touched.branchOther && errors.branchOther)}
              errorId="error-branch"
            >
              <div style={{ display: 'grid', gap: 8 }}>
                <StyledSelect
                  id="input-branch"
                  value={form.branch}
                  onChange={v => handleChange('branch', v)}
                  onBlur={() => handleBlur('branch')}
                  placeholder="Select branch"
                  aria-invalid={touched.branch && errors.branch ? "true" : "false"}
                  aria-describedby={touched.branch && errors.branch ? "error-branch" : undefined}
                >
                  {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </StyledSelect>
                {form.branch === 'Other' && (
                  <Input
                    id="input-branchOther"
                    value={form.branchOther}
                    onChange={v => handleChange('branchOther', v.replace(/[^a-zA-Z0-9\s\-&().]/g, ''))}
                    onBlur={() => handleBlur('branchOther')}
                    placeholder="Specify your branch"
                    maxLength={60}
                    aria-invalid={touched.branchOther && errors.branchOther ? "true" : "false"}
                    aria-describedby={touched.branchOther && errors.branchOther ? "error-branch" : undefined}
                  />
                )}
              </div>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
            <Field
              label="Section"
              required
              hint="Academic Section (A/B/C/...)"
              error={(touched.section && errors.section) || (touched.sectionOther && errors.sectionOther)}
              errorId="error-section"
            >
              <div style={{ display: 'grid', gap: 8 }}>
                <StyledSelect
                  id="input-section"
                  value={form.section}
                  onChange={v => handleChange('section', v)}
                  onBlur={() => handleBlur('section')}
                  placeholder="-- Select Section --"
                  aria-invalid={touched.section && errors.section ? "true" : "false"}
                  aria-describedby={touched.section && errors.section ? "error-section" : undefined}
                >
                  {SECTION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </StyledSelect>
                {form.section === 'Other' && (
                  <div style={{ marginTop: 10 }}>
                    <Input
                      id="input-sectionOther"
                      value={form.sectionOther}
                      onChange={v => handleChange('sectionOther', v)}
                      onBlur={() => handleBlur('sectionOther')}
                      placeholder="Type your section manually..."
                      aria-invalid={touched.sectionOther && errors.sectionOther ? "true" : "false"}
                      aria-describedby={touched.sectionOther && errors.sectionOther ? "error-section" : undefined}
                    />
                  </div>
                )}
              </div>
            </Field>

            <Field
              label="Semester"
              required
              error={touched.semester && errors.semester}
              errorId="error-semester"
            >
              <StyledSelect
                id="input-semester"
                value={form.semester}
                onChange={v => handleChange('semester', v)}
                onBlur={() => handleBlur('semester')}
                placeholder="Select semester"
                aria-invalid={touched.semester && errors.semester ? "true" : "false"}
                aria-describedby={touched.semester && errors.semester ? "error-semester" : undefined}
              >
                {SEMESTER_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </StyledSelect>
            </Field>
          </div>

          <Field
            label="WhatsApp Number"
            required
            hint="10-digit mobile number"
            error={touched.whatsapp && errors.whatsapp}
            errorId="error-whatsapp"
          >
            <Input
              id="input-whatsapp"
              value={form.whatsapp}
              onChange={v => handleChange('whatsapp', String(v || '').replace(/[^\d]/g, '').slice(0, 10))}
              onBlur={() => handleBlur('whatsapp')}
              onPaste={e => {
                e.preventDefault();
                const pasted = e.clipboardData.getData('text').replace(/[^\d]/g, '').slice(0, 10);
                handleChange('whatsapp', pasted);
              }}
              placeholder="10-digit mobile number"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              aria-invalid={touched.whatsapp && errors.whatsapp ? "true" : "false"}
              aria-describedby={touched.whatsapp && errors.whatsapp ? "error-whatsapp" : undefined}
            />
          </Field>
        </div>
      ),
    },

    {
      title:    'Domain Selection',
      subtitle: 'Choose the NexaSphere groups you want to join and share your motivation.',
      icon:     <IconBolt style={{ width: 18, height: 18 }} />,
      render: () => (
        <div style={{ display: 'grid', gap: 20 }}>
          <Field
            label="Which NexaSphere groups would you like to join?"
            required
            hint="Select one or more."
            error={touched.groups && errors.groups}
            errorId="error-groups"
          >
            <MultiSelectChips
              id="input-groups"
              options={GROUP_OPTIONS}
              values={form.groups}
              onToggle={opt => {
                const nextVal = form.groups.includes(opt)
                  ? form.groups.filter(x => x !== opt)
                  : [...form.groups, opt];
                handleChange('groups', nextVal);
              }}
              aria-invalid={touched.groups && errors.groups ? "true" : "false"}
              aria-describedby={touched.groups && errors.groups ? "error-groups" : undefined}
            />
          </Field>

          <Field
            label="Why do you want to join NexaSphere?"
            required
            error={touched.whyJoin && errors.whyJoin}
            errorId="error-whyJoin"
          >
            <TextArea
              id="input-whyJoin"
              value={form.whyJoin}
              onChange={v => handleChange('whyJoin', v)}
              onBlur={() => handleBlur('whyJoin')}
              placeholder="Share your motivation and what you hope to learn or contribute."
              rows={6}
              aria-invalid={touched.whyJoin && errors.whyJoin ? "true" : "false"}
              aria-describedby={touched.whyJoin && errors.whyJoin ? "error-whyJoin" : undefined}
            />
          </Field>
        </div>
      ),
    },
  ], [form, errors, touched]);

  const current  = steps[step];
  const progress = step / (steps.length - 1);

  
  return (
    <div id="pg-member" ref={topRef}>
      <style>{`
        .member-hero { text-align:center; padding:64px 24px 46px; position:relative; }
        .member-hero-bg {
          position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(ellipse 60% 55% at 50% 0%, rgba(123,111,255,.10) 0%, transparent 62%),
            radial-gradient(ellipse 40% 40% at 20% 85%, rgba(0,212,255,.07) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 80% 70%, rgba(189,92,255,.05) 0%, transparent 55%);
        }
        [data-theme="light"] .member-hero-bg {
          background:
            radial-gradient(ellipse 60% 55% at 50% 0%, rgba(109,40,217,.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 20% 85%, rgba(194,119,10,.04) 0%, transparent 55%);
        }
        .member-divider {
          width:100%; height:1px;
          background:linear-gradient(90deg,transparent,var(--c2) 18%,var(--c1) 50%,var(--c3) 82%,transparent);
          opacity:.18; margin:0 auto;
        }
        .member-shell {
          max-width:860px; margin:0 auto;
          background:var(--card); border:1px solid var(--bdr);
          border-radius:var(--r4); overflow:hidden;
          position:relative; box-shadow:var(--shcard);
        }
        [data-theme="light"] .member-shell {
          background:#fff; border-color:rgba(28,25,23,.1);
          box-shadow:0 8px 44px rgba(0,0,0,.10);
        }
        .member-topbar {
          padding:18px 18px 14px; border-bottom:1px solid var(--bdr);
          background:linear-gradient(180deg,rgba(123,111,255,.04),transparent);
        }
        [data-theme="light"] .member-topbar { background:linear-gradient(180deg,rgba(109,40,217,.03),transparent); }
        .member-progress {
          height:8px; background:rgba(255,255,255,.04);
          border:1px solid var(--bdr); border-radius:999px; overflow:hidden;
        }
        [data-theme="light"] .member-progress { background:rgba(28,25,23,.04); }
        .member-progress > div {
          height:100%; width:0%;
          background:linear-gradient(90deg,var(--c2),var(--c1),var(--c3));
          box-shadow:0 0 18px var(--c1g);
          transition:width .35s cubic-bezier(.22,1,.36,1);
        }
        .member-body { padding:22px 18px 18px; }
        @media (min-width:720px){
          .member-body  { padding:26px 26px 22px; }
          .member-topbar{ padding:18px 26px 14px; }
        }
      `}</style>

      
      <div className="member-hero">
        <div className="member-hero-bg"/>
        {onBack ? (
          <button
            onClick={onBack}
            className="btn btn-outline btn-sm"
            style={{ position:'absolute', top:24, left:24 }}
          >
            <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
              <IconArrowLeft style={{ width:14, height:14 }}/> Back
            </span>
          </button>
        ) : null}

        <div className="pop-in" style={{
          display:'inline-block',
          background:'linear-gradient(135deg,var(--c2),var(--c3))',
          borderRadius:999, padding:'7px 22px',
          fontFamily:'Orbitron,monospace', fontSize:'.85rem',
          fontWeight:700, letterSpacing:'.1em',
          color:'#fff', textTransform:'uppercase',
          boxShadow:'0 0 24px rgba(123,111,255,.4)',
          marginBottom:16,
        }}>
          Membership Form
        </div>

        <h1 className="section-title pop-word" style={{ marginBottom:14 }}>
          Join NexaSphere Community
        </h1>
        <p className="pop-in" style={{
          color:'var(--t2)',
          fontSize:'clamp(.9rem,2vw,1.08rem)',
          maxWidth:660, margin:'0 auto',
          lineHeight:1.75, animationDelay:'.12s',
        }}>
          NexaSphere connects students with opportunities across Tech and Non-Tech domains —
          development, cloud, cybersecurity, management, and career growth.
        </p>
        <div className="member-divider" style={{ marginTop:34, maxWidth:780 }}/>
      </div>

      <div className="container" style={{ paddingBottom:86 }}>
        <div className="member-shell pop-scale">
          <div className="corner-tl"/><div className="corner-br"/>

          
          <div className="member-topbar">
            <div style={{
              display:'flex', justifyContent:'space-between',
              alignItems:'center', gap:14, flexWrap:'wrap', marginBottom:12,
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{
                  width:44, height:44, borderRadius:14,
                  background:'linear-gradient(135deg,rgba(123,111,255,.25),rgba(0,212,255,.15))',
                  border:'1px solid var(--bdr2)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 0 20px rgba(123,111,255,.12)',
                  fontSize:'1.25rem',
                }}>
                  {done ? <IconShieldCheck style={{ width:18, height:18 }}/> : current.icon}
                </div>
                <div>
                  <div style={{
                    fontFamily:'Orbitron,monospace', fontSize:'.9rem',
                    letterSpacing:'.08em', color:'var(--t1)',
                    display:'flex', gap:10, alignItems:'baseline', flexWrap:'wrap',
                  }}>
                    <span>{done ? 'Submission Complete' : current.title}</span>
                    {!done ? (
                      <span style={{ fontFamily:'Space Mono,monospace', fontSize:'.62rem', letterSpacing:'.18em', color:'var(--t3)' }}>
                        SECTION {step + 1}/{steps.length}
                      </span>
                    ) : null}
                  </div>
                  <div style={{ color:'var(--t2)', fontSize:'.9rem' }}>
                    {done
                      ? 'Thank you for joining NexaSphere — GL Bajaj Group of Institutions 🚀'
                      : current.subtitle}
                  </div>
                </div>
              </div>

              <div style={{ fontFamily:'Space Mono,monospace', fontSize:'.62rem', letterSpacing:'.14em', color:'var(--t3)', textTransform:'uppercase', textAlign:'right' }}>
                {done ? 'Form Submitted' : `Section ${step + 1} of ${steps.length}`}
              </div>
            </div>

            <div className="member-progress">
              <div style={{ width: `${Math.round(progress * 100)}%` }}/>
            </div>
          </div>

          
          <div className="member-body">
            {alreadySubmitted && !done ? (
              <div style={{
                background:'rgba(255,45,120,.08)', border:'1px solid rgba(255,45,120,.22)',
                borderRadius:'var(--r3)', padding:'20px 22px', textAlign:'center',
              }}>
                <div style={{ display:'flex', justifyContent:'center', color:'#ff2d78', marginBottom:10 }}><DynamicIcon name="AlertTriangle" size={22} /></div>
                <div style={{ color:'var(--t1)', fontSize:'.98rem', fontWeight:600, marginBottom:16 }}>
                  Membership Form Already Submitted
                </div>
                <div style={{ color:'var(--t2)', fontSize:'.88rem', lineHeight:1.6, marginBottom:24 }}>
                  A membership form has already been submitted from this device.<br/>
                  If you need to update your application, please contact us at{' '}
                  <a href="mailto:nexasphere@glbajajgroup.org" style={{ color:'var(--c1)', fontWeight:600 }}>
                    nexasphere@glbajajgroup.org
                  </a>
                </div>

                <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
                  <a
                    href={WHATSAPP_COMMUNITY}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                    style={{ flex:1, minWidth:0, justifyContent:'center' }}
                  >
                    Join WhatsApp Community
                  </a>
                  <a
                    href={LINKEDIN_PAGE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ flex:1, minWidth:0, justifyContent:'center' }}
                  >
                    NexaSphere LinkedIn
                  </a>
                </div>
              </div>
            ) : done ? (
              /* ── Success screen ── */
              <div style={{ display:'grid', gap:18 }}>
                <div style={{
                  background:'linear-gradient(135deg,rgba(123,111,255,.08),rgba(0,212,255,.06))',
                  border:'1px solid var(--bdr2)', borderRadius:'var(--r3)',
                  padding:22, position:'relative', overflow:'hidden', textAlign:'center',
                }}>
                  <div className="corner-tl"/><div className="corner-br"/>
                  <div style={{ fontSize:'2.4rem', marginBottom:14 }}>🚀</div>
                  <div style={{ fontFamily:'Orbitron,monospace', fontSize:'1rem', color:'var(--t1)', fontWeight:700, marginBottom:12 }}>
                    Thank you for filling the NexaSphere Membership Form!
                  </div>
                  <p style={{ color:'var(--t2)', lineHeight:1.8, maxWidth:540, margin:'0 auto' }}>
                    Your form has been successfully submitted. 🎉
                    <br/><br/>
                    Now request to join the NexaSphere WhatsApp group using the link below — and
                    <b style={{ color:'var(--t1)' }}> mention that you have already filled the NexaSphere form</b>.
                    <br/><br/>
                    Our team will verify your responses and add you to the respective NexaSphere spaces/groups.
                  </p>
                </div>

                
                <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
                  <a
                    className="btn btn-whatsapp"
                    href={WHATSAPP_COMMUNITY}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                      Join NexaSphere WhatsApp Group <IconArrowRight/>
                    </span>
                  </a>
                  <a
                    className="btn btn-outline"
                    href={LINKEDIN_PAGE}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                      Follow on LinkedIn <IconArrowRight/>
                    </span>
                  </a>
                </div>

                <div style={{
                  background:'var(--card)', border:'1px solid var(--bdr)',
                  borderRadius:'var(--r2)', padding:'14px 16px',
                  fontSize:'.88rem', color:'var(--t3)', lineHeight:1.7, textAlign:'center',
                }}>
                  📌 Also make sure to follow the official NexaSphere LinkedIn page for updates.<br/>
                  <b style={{ color:'var(--t2)' }}>Stay connected and keep building 🚀 — NexaSphere Team</b>
                </div>
              </div>
            ) : (
              <>
                {current.render()}

                {err ? (
                  <div style={{
                    marginTop:18,
                    background:'rgba(255,45,120,.10)', border:'1px solid rgba(255,45,120,.22)',
                    color:'var(--t1)', borderRadius:'var(--r2)', padding:'12px 14px', fontWeight:600,
                  }}>
                    {err}
                  </div>
                ) : null}

                
                 <div style={{ marginTop:22, display:'flex', justifyContent:'space-between', gap:10, flexWrap:'wrap' }}>
                  <button
                    className="btn btn-outline"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setErr('');
                      if (step === 0) { if (onBack) onBack(); }
                      else { setStep(s => clamp(s - 1, 0, steps.length - 1)); scrollTop(); }
                    }}
                  >
                    <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                      <IconArrowLeft/> Back
                    </span>
                  </button>

                  {step < steps.length - 1 ? (
                    <button
                      className="btn btn-primary btn-ripple"
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        const fields = stepFields[step];
                        if (fields) {
                          const isStepValid = validateForm(fields);
                          if (!isStepValid) {
                            setErr('Please complete all required fields (*) with valid details to proceed.');
                            const firstInvalid = fields.find(f => {
                              const v = form[f];
                              if (f === 'groups') return !v || v.length === 0;
                              if (f === 'courseOther') return form.course === 'Other' && !String(v || '').trim();
                              if (f === 'branchOther') return form.branch === 'Other' && !String(v || '').trim();
                              if (f === 'sectionOther') return form.section === 'Other' && !String(v || '').trim();
                              if (f === 'collegeEmail') {
                                const email = String(v || '').trim();
                                return !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !email.endsWith('@glbajajgroup.org');
                              }
                              if (f === 'whatsapp') {
                                const phone = String(v || '').trim();
                                return !phone || !/^\d{10}$/.test(phone);
                              }
                              return !String(v || '').trim();
                            });
                            if (firstInvalid) {
                              const el = document.getElementById(`input-${firstInvalid}`);
                              if (el) {
                                el.focus();
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }
                            }
                            return;
                          }
                        }
                        setErr('');
                        setStep(s => clamp(s + 1, 0, steps.length - 1));
                        scrollTop();
                      }}
                    >
                      <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                        Continue <IconArrowRight/>
                      </span>
                    </button>
                  ) : (
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
                    <Turnstile
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                      onSuccess={(token) => {
                        console.log("Turnstile Token generated:", token);
                        setCaptchaToken(token);
                      }}
                    />
                    <button
                      className="btn btn-primary btn-ripple"
                      type="button"
                  disabled={busy || !captchaToken}
                  onClick={() => {

                    const fields = stepFields[step];
                    if (fields) {
                      const isStepValid = validateForm(fields);
                      if (!isStepValid) {
                        setErr('Please complete all required fields (*) with valid details to submit.');
                        const firstInvalid = fields.find(f => {
                          const v = form[f];
                          if (f === 'groups') return !v || v.length === 0;
                          if (f === 'whyJoin') return !String(v || '').trim();
                          return false;
                        });
                        if (firstInvalid) {
                          const el = document.getElementById(`input-${firstInvalid}`);
                          if (el) {
                            el.focus();
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }
                        return;
                      }
                    }

                    if (!captchaToken) {
                      setErr('Please complete the CAPTCHA to submit.');
                      return;
                    }

                    submit();
}}
                    >
                      {busy ? 'Submitting…' : 'Submit Membership Form'}
                    </button>
                  </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pop-in" style={{
          marginTop:18, textAlign:'center',
          color:'var(--t3)', fontSize:'.82rem',
        }}>
          Need help? Contact NexaSphere team via WhatsApp or email nexasphere@glbajajgroup.org
        </div>

        <Footer />
      </div>
    </div>
  );
}


