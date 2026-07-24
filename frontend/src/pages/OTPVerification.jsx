import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    console.log('OTP Submitted:', otpCode);
  };

  const handleResend = () => {
    setTimeLeft(120);
    console.log('Resend OTP');
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
            <h1 className="auth-title">Verify OTP</h1>
            <p className="auth-subtitle">Enter the 6-digit code sent to your email</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength="1"
                  whileFocus={{ scale: 1.1 }}
                  transition={{ type: 'spring' }}
                />
              ))}
            </div>

            <div className="otp-timer">
              Time remaining: <strong>{timeLeft}s</strong>
              <br />
              {timeLeft < 120 && (
                <span>
                  Didn't receive the code?{' '}
                  <span
                    className="resend"
                    onClick={handleResend}
                    style={{ cursor: 'pointer' }}
                  >
                    Resend OTP
                  </span>
                </span>
              )}
            </div>

            <button
              type="submit"
              className="auth-button"
            >
              Verify OTP
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/login" style={{ color: 'var(--red-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
                ← Back to Login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
