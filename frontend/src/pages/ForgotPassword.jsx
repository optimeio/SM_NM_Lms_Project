import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Forgot password for:', email);
    setIsSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-subtitle">
              Remember your password? <Link to="/login">Sign in</Link>
            </p>
          </div>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
                <h2 style={{ color: 'var(--black-soft)', marginBottom: '10px' }}>Check Your Email</h2>
                <p style={{ color: 'var(--gray-600)', marginBottom: '20px' }}>
                  We've sent password recovery instructions to <strong>{email}</strong>
                </p>
                <p style={{ color: 'var(--gray-400)', marginBottom: '30px', fontSize: '13.5px' }}>
                  If you don't see the email, check your spam folder.
                </p>
                <Link to="/login" className="btn btn-primary">
                  Back to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ color: 'var(--gray-600)', marginBottom: '20px', fontSize: '14.5px', lineHeight: 1.6 }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-button"
              >
                Send Reset Link
              </button>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/login" style={{ color: 'var(--red-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
