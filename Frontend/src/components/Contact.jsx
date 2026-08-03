import React, { useState } from 'react';
import Reveal from './Reveal';

// SVG Icons
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const SERVICES = [
  'Backend Architecture',
  'API Development',
  'Database Design',
  'Full Stack App',
  'General Inquiry',
];

export default function Contact() {
  const [selectedService, setSelectedService] = useState('Backend Architecture');
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('vrajgoti07@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleChange = (e) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormState({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact">
      <div className="container">
        {/* Header */}
        <Reveal>
          <div style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
            <span className="section-tag">Get In Touch</span>
            <h2 className="section-title" style={{ fontSize: '2.5rem' }}>Let's Build Something Great</h2>
            <p className="section-desc" style={{ margin: '0 auto', maxWidth: '640px' }}>
              Have a project in mind, a position to fill, or technical queries? Send me a message and I'll get back to you within 24 hours.
            </p>
          </div>
        </Reveal>

        {/* Top Info Cards Grid */}
        <Reveal delay={100}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            marginBottom: '3rem',
          }}>
            {/* Email Card */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }} className="contact-info-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(108, 99, 255, 0.12)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <MailIcon />
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.35rem 0.75rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-code)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
                </button>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-code)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Direct Email
                </span>
                <a
                  href="mailto:vrajgoti07@gmail.com"
                  style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    marginTop: '0.2rem',
                  }}
                >
                  vrajgoti07@gmail.com
                </a>
              </div>
            </div>

            {/* GitHub Card */}
            <a
              href="https://github.com/vrajgoti07"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              className="contact-info-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <GithubIcon />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontFamily: 'var(--font-code)' }}>
                  View Profile ↗
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-code)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  GitHub
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  @vrajgoti07
                </div>
              </div>
            </a>

            {/* LinkedIn Card */}
            <a
              href="https://www.linkedin.com/in/vraj-goti-102967324/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              className="contact-info-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(10, 102, 194, 0.15)',
                  color: '#0A66C2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <LinkedinIcon />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontFamily: 'var(--font-code)' }}>
                  Connect ↗
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-code)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  LinkedIn
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  Vraj Goti
                </div>
              </div>
            </a>

            {/* Location & Status Card */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
            }} className="contact-info-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(0, 212, 255, 0.12)',
                  color: 'var(--accent-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <MapPinIcon />
                </div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '100px',
                  background: 'rgba(0, 255, 136, 0.12)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  color: '#00FF88',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-code)',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00FF88', boxShadow: '0 0 8px #00FF88' }} />
                  Available
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-code)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Location & Time
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  India (IST · UTC+5:30)
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Contact Form Section */}
        <Reveal delay={200}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '24px',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-md)',
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Service Selection Pills */}
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-code)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  What are you interested in?
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {SERVICES.map((service) => {
                    const isSelected = selectedService === service;
                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => setSelectedService(service)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '100px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          fontFamily: 'var(--font-body)',
                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-card)',
                          background: isSelected ? 'rgba(108, 99, 255, 0.18)' : 'var(--bg-surface)',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {service}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Email Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label htmlFor="contact-name" style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                  }}>
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.85rem 1.1rem',
                      borderRadius: '12px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-card)',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-card)')}
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                  }}>
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="alex@company.com"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.85rem 1.1rem',
                      borderRadius: '12px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-card)',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-card)')}
                  />
                </div>
              </div>

              {/* Message Input */}
              <div>
                <label htmlFor="contact-message" style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                }}>
                  Project Details / Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="5"
                  placeholder="Describe your project, requirements, or goals..."
                  value={formState.message}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.9rem 1.1rem',
                    borderRadius: '12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '130px',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-card)')}
                />
              </div>

              {/* Submit Button & Confirmation */}
              <div>
                <button
                  id="contact-submit"
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.95rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    cursor: 'pointer',
                  }}
                >
                  {submitted ? (
                    <><CheckIcon /> Message Sent Successfully!</>
                  ) : (
                    <><SendIcon /> Send Message</>
                  )}
                </button>

                {submitted && (
                  <p style={{
                    marginTop: '1rem',
                    color: '#00FF88',
                    fontFamily: 'var(--font-code)',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    background: 'rgba(0, 255, 136, 0.08)',
                    border: '1px solid rgba(0, 255, 136, 0.2)',
                    borderRadius: '8px',
                    padding: '0.6rem',
                  }}>
                    Thank you! Your message has been sent. I will review it and reply shortly.
                  </p>
                )}
              </div>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
