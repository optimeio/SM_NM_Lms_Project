import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    showPassword: false,
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Reset password:', formData.password);
    setIsSuccess(true);
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
            <h1 className="auth-title">Reset Password</h1>
            <p className="auth-subtitle">Create a new password for your account</p>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                <h2 style={{ color: 'var(--black-soft)', marginBottom: '10px' }}>Password Reset Successful</h2>
                <p style={{ color: 'var(--gray-600)', marginBottom: '30px' }}>
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
                <Link to="/login" className="btn btn-primary">
                  Back to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ color: 'var(--gray-600)', marginBottom: '20px', fontSize: '14.5px', lineHeight: 1.6 }}>
                Please enter your new password below. Make sure it's at least 8 characters long.
              </p>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type={formData.showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type={formData.showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-checkbox" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="showPassword"
                    checked={formData.showPassword}
                    onChange={handleChange}
                    style={{ accentColor: '#C41E3A' }}
                  />
                  Show password
                </label>
              </div>

              <button
                type="submit"
                className="auth-button"
              >
                Reset Password
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
