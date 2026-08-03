import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-text">
          © {new Date().getFullYear()} Vraj Goti — Designed &amp; engineered with{' '}
          <span className="footer-heart"></span>{' '}
          using React &amp; Vite. All systems nominal.
        </p>
      </div>
    </footer>
  );
}
