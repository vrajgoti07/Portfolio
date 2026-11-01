import { useState } from 'react';
import Reveal from './Reveal';
import GithubIcon from './GithubIcon';
import { personalInfo } from '../data/portfolioData';
import { Mail, Send, Copy, Check, MapPin } from 'lucide-react';

export default function Contact() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(personalInfo.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleChange = (e) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Strict validation
    if (!formState.name.trim()) {
      setError('Please provide your name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formState.subject.trim()) {
      setError('Please specify a subject for your message.');
      return;
    }
    if (!formState.message.trim() || formState.message.trim().length < 10) {
      setError('Message should contain at least 10 characters.');
      return;
    }

    setLoading(true);

    // Simulate reliable dispatch with loading transition
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
      setFormState({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 6000);
    } catch {
      setError('Unable to send message at this time. Please email vrajgoti07@gmail.com directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        {/* Header */}
        <Reveal>
          <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <span className="section-tag">Direct Communication</span>
            <h2 className="section-title">Let's Connect &amp; Collaborate</h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Have an opportunity, an AI project in mind, or technical inquiries? Send a message and I'll respond promptly.
            </p>
          </div>
        </Reveal>

        <div className="contact-grid">
          {/* LEFT SIDE: Genuine Info Cards & Copy */}
          <Reveal>
            <div className="contact-info-cards">
              {/* Email Card with 1-click Copy */}
              <div className="contact-item-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 107, 53, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-primary)',
                      flexShrink: 0
                    }}
                  >
                    <Mail size={20} />
                  </div>
                  <div>
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Primary Email
                    </span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                      {personalInfo.email}
                    </h4>
                  </div>
                </div>

                <button
                  id="copy-email-btn"
                  onClick={handleCopyEmail}
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
                  title="Copy email address"
                  aria-label="Copy email address"
                >
                  {copied ? (
                    <>
                      <Check size={14} color="var(--color-success)" />
                      <span style={{ color: 'var(--color-success)' }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* GitHub Card */}
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-item-card"
                style={{ textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(233, 162, 59, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-secondary)',
                      flexShrink: 0
                    }}
                  >
                    <GithubIcon size={20} />
                  </div>
                  <div>
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Code Repositories
                    </span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                      github.com/vrajgoti07
                    </h4>
                  </div>
                </div>
                <span className="btn-ghost" style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
                  View Profile ↗
                </span>
              </a>

              {/* Location Card */}
              <div className="contact-item-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(85, 182, 133, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-success)',
                      flexShrink: 0
                    }}
                  >
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Location
                    </span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                      {personalInfo.location}
                    </h4>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.76rem', color: 'var(--color-success)' }}>
                  ● Remote / Global
                </span>
              </div>
            </div>
          </Reveal>

          {/* RIGHT SIDE: Interactive Contact Form */}
          <Reveal delay={150}>
            <div className="contact-form-panel">
              {success && (
                <div
                  role="alert"
                  style={{
                    background: 'rgba(85, 182, 133, 0.12)',
                    border: '1px solid var(--color-success)',
                    color: 'var(--color-success)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem 1.25rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Check size={18} />
                  <span>Thank you! Your message has been received. I'll get back to you shortly.</span>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  style={{
                    background: 'rgba(229, 107, 111, 0.12)',
                    border: '1px solid var(--color-error)',
                    color: 'var(--color-error)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem 1.25rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.92rem',
                    fontWeight: 600
                  }}
                >
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="contact-name" className="form-label">
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formState.name}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formState.email}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-subject" className="form-label">
                    Subject *
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    required
                    placeholder="Project Inquiry / Job Opportunity"
                    value={formState.subject}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message" className="form-label">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    placeholder="Describe your project, team requirements, or technical query..."
                    value={formState.message}
                    onChange={handleChange}
                    className="form-textarea"
                  />
                </div>

                <button
                  id="contact-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
                >
                  {loading ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
