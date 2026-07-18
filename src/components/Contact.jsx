import React, { useState } from 'react';
import Reveal from './Reveal';

// SVG Icons
const Mail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const Github = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Twitter = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const CONTACT_LINKS = [
  {
    icon: <Mail />,
    label: 'Email',
    value: 'vrajgoti07@gmail.com',
    href: 'mailto:vrajgoti07@gmail.com',
    color: '#6C63FF',
  },
  {
    icon: <Github />,
    label: 'GitHub',
    value: 'github.com/vrajgoti07',
    href: 'https://github.com/vrajgoti07',
    color: '#ffffff',
  },
  {
    icon: <Linkedin />,
    label: 'LinkedIn',
    value: 'https://www.linkedin.com/in/vraj-goti-102967324/',
    href: 'https://www.linkedin.com/in/vraj-goti-102967324/',
    color: '#0A66C2',
  },
  // {
  //   icon: <Twitter />,
  //   label: 'Twitter / X',
  //   value: '@vrajgoti',
  //   href: 'https://twitter.com/vrajgoti',
  //   color: '#1DA1F2',
  // },
];

export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormState({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact">
      <div className="container">
        {/* Header */}
        <Reveal>
          <div style={{ marginBottom: '3rem' }}>
            <span className="section-tag">Say Hello</span>
            <h2 className="section-title">Let's Work Together</h2>
            <p className="section-desc">
              Whether you have a project in mind, a position to fill, or just want to connect — my inbox is always open.
            </p>
          </div>
        </Reveal>

        <div className="contact-grid">
          {/* Form */}
          <Reveal>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Your Name</label>
                <input
                  id="contact-name"
                  name="name"
                  className="form-input"
                  type="text"
                  placeholder="John Doe"
                  value={formState.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  name="email"
                  className="form-input"
                  type="email"
                  placeholder="john@company.com"
                  value={formState.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  className="form-textarea"
                  placeholder="Tell me about your project..."
                  value={formState.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                id="contact-submit"
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {submitted ? '✓ Message Sent!' : 'Send Message'}
              </button>

              {submitted && (
                <p style={{ color: '#00FF88', fontFamily: 'var(--font-code)', fontSize: '0.8rem', textAlign: 'center' }}>
                  Thanks! I'll get back to you within 24 hours.
                </p>
              )}
            </form>
          </Reveal>

          {/* Contact links */}
          <Reveal delay={150}>
            <div>
              <p style={{
                fontFamily: 'var(--font-code)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}>
                Or reach me directly
              </p>
              <div className="contact-links">
                {CONTACT_LINKS.map((link, i) => (
                  <a
                    key={i}
                    id={`contact-link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-link-item"
                  >
                    <div
                      className="contact-link-icon"
                      style={{
                        background: `${link.color}18`,
                        color: link.color,
                      }}
                    >
                      {link.icon}
                    </div>
                    <div>
                      <span className="contact-link-label">{link.label}</span>
                      <span className="contact-link-value">{link.value}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
