import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    year: '',
    district: '',
    college: '',
    otherCollege: '',
    department: '',
    otherDepartment: '',
    agreeTerms: false,
  });

  const colleges = [
    'Government College of Engineering, Salem (GCE Salem)',
    'Sona College of Technology',
    'PSG College of Technology',
    'Coimbatore Institute of Technology',
    'Thiagarajar College of Engineering',
    'Other'
  ];

  const departments = [
    'CSE',
    'IT',
    'ECE',
    'EEE',
    'MECH',
    'CIVIL',
    'Other'
  ];

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const districts = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
    'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
    'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
    'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
    'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
    'Vellore', 'Viluppuram', 'Virudhunagar'
  ];

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = 'Full Name is required.';
        } else if (value.trim().length < 3) {
          error = 'Name must be at least 3 characters.';
        }
        break;
      case 'gender':
        if (!value) {
          error = 'Gender selection is required.';
        }
        break;
      case 'email':
        if (!value) {
          error = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address.';
        }
        break;
      case 'phone':
        if (!value) {
          error = 'Phone number is required.';
        } else if (!/^[6-9]\d{9}$/.test(value)) {
          error = 'Enter a valid 10-digit Indian phone number.';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required.';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters.';
        } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(value)) {
          error = 'Password must contain both letters and numbers.';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password.';
        } else if (value !== formData.password) {
          error = 'Passwords do not match.';
        }
        break;
      case 'year':
        if (!value) {
          error = 'Year selection is required.';
        }
        break;
      case 'district':
        if (!value) {
          error = 'District selection is required.';
        }
        break;
      case 'college':
        if (!value) {
          error = 'College selection is required.';
        }
        break;
      case 'otherCollege':
        if (formData.college === 'Other' && !value.trim()) {
          error = 'Please enter your college name.';
        }
        break;
      case 'department':
        if (!value) {
          error = 'Department selection is required.';
        }
        break;
      case 'otherDepartment':
        if (formData.department === 'Other' && !value.trim()) {
          error = 'Please enter your department name.';
        }
        break;
      case 'agreeTerms':
        if (!value) {
          error = 'You must agree to the Terms of Service.';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val,
    }));

    const fieldError = validateField(name, val);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError,
    }));

    // If password changes, re-validate confirm password
    if (name === 'password' && formData.confirmPassword) {
      const confirmErr = val === formData.confirmPassword ? '' : 'Passwords do not match.';
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmErr,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Strict Email Uniqueness Check (Local & Session)
      const storedUsersRaw = localStorage.getItem('registeredUsers');
      const existingUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const isDuplicate = existingUsers.some(
        u => u && u.email && u.email.toLowerCase().trim() === formData.email.toLowerCase().trim()
      );

      if (isDuplicate) {
        setServerError(`An account with email (${formData.email}) is already registered. Only one student per email is allowed. Please log in.`);
        setIsSubmitting(false);
        return;
      }

      const payload = { ...formData, email: formData.email.toLowerCase().trim(), role: 'student' };
      if (formData.college === 'Other' && formData.otherCollege) {
        payload.college = formData.otherCollege;
      }
      if (formData.department === 'Other' && formData.otherDepartment) {
        payload.department = formData.otherDepartment;
      }
      delete payload.otherCollege;
      delete payload.otherDepartment;

      let registeredUser = payload;

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (response.ok && data.user) {
          registeredUser = data.user;
        } else if (!response.ok) {
          setServerError(data.message || 'Registration failed.');
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.warn('Backend server unavailable, proceeding with local registration fallback.', err);
      }

      // Persist in registeredUsers array & active session
      const currentStored = localStorage.getItem('registeredUsers');
      const currentUsers = currentStored ? JSON.parse(currentStored) : [];
      const updatedUsers = [...currentUsers.filter(u => u && u.email && u.email.toLowerCase() !== registeredUser.email.toLowerCase()), registeredUser];
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      localStorage.setItem('user', JSON.stringify(registeredUser));

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Registration connection error:', err);
      setServerError('Registration failed. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>

          {serverError && (
            <div style={{ background: '#fff1f2', color: '#c41e3a', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 500, border: '1px solid #fecdd3' }}>
              ⚠️ {serverError}
            </div>
          )}

          {isSuccess && (
            <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '15px', fontWeight: 600, textAlign: 'center', border: '1px solid #bbf7d0' }}>
              ✓ Account created successfully! Redirecting to login page...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            {/* PERSONAL DETAILS SECTION */}
            <div style={{ marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', color: '#0a0a0a', marginBottom: '15px', fontWeight: 700 }}>Personal Details</h3>
              
              <div className={`form-group ${errors.fullName ? 'error' : ''}`}>
                <label className="form-label">Full Name <span style={{ color: 'var(--red-primary)' }}>*</span></label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className={`form-group ${errors.gender ? 'error' : ''}`}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Gender <span style={{ color: 'var(--red-primary)' }}>*</span></label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {['Male', 'Female', 'Other'].map(option => (
                    <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', color: '#374151', fontWeight: 500 }}>
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={formData.gender === option}
                        onChange={handleChange}
                        style={{ accentColor: '#C41E3A' }}
                        required
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {errors.gender && <span className="error-message">{errors.gender}</span>}
              </div>
            </div>

            {/* CONTACT & SECURITY SECTION */}
            <div style={{ marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', color: '#0a0a0a', marginBottom: '15px', fontWeight: 700 }}>Contact & Security</h3>

              <div className={`form-group ${errors.email ? 'error' : ''}`}>
                <label className="form-label">Email Address <span style={{ color: 'var(--red-primary)' }}>*</span></label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className={`form-group ${errors.phone ? 'error' : ''}`}>
                <label className="form-label">Phone Number <span style={{ color: 'var(--red-primary)' }}>*</span></label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className={`form-group ${errors.password ? 'error' : ''}`}>
                  <label className="form-label">Password <span style={{ color: 'var(--red-primary)' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="form-input"
                      placeholder="Min 8 chars"
                      value={formData.password}
                      onChange={handleChange}
                      style={{ paddingRight: '40px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className={`form-group ${errors.confirmPassword ? 'error' : ''}`}>
                  <label className="form-label">Confirm Password <span style={{ color: 'var(--red-primary)' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      className="form-input"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      style={{ paddingRight: '40px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>

            {/* ACADEMIC DETAILS SECTION */}
            <div style={{ marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', color: '#0a0a0a', marginBottom: '15px', fontWeight: 700 }}>Academic Details</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className={`form-group ${errors.year ? 'error' : ''}`}>
                  <label className="form-label">Year <span style={{ color: 'var(--red-primary)' }}>*</span></label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="form-input"
                    style={{ background: '#fff', height: '48px' }}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="I Year">I Year</option>
                    <option value="II Year">II Year</option>
                    <option value="III Year">III Year</option>
                    <option value="IV Year">IV Year</option>
                  </select>
                  {errors.year && <span className="error-message">{errors.year}</span>}
                </div>

                <div className={`form-group ${errors.district ? 'error' : ''}`}>
                  <label className="form-label">District <span style={{ color: 'var(--red-primary)' }}>*</span></label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="form-input"
                    style={{ background: '#fff', height: '48px' }}
                    required
                  >
                    <option value="">Select District</option>
                    {districts.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                  {errors.district && <span className="error-message">{errors.district}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className={`form-group ${errors.college ? 'error' : ''}`}>
                  <label className="form-label">College <span style={{ color: 'var(--red-primary)' }}>*</span></label>
                  <select
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    className="form-input"
                    style={{ background: '#fff', height: '48px' }}
                    required
                  >
                    <option value="">Select College</option>
                    {colleges.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  {errors.college && <span className="error-message">{errors.college}</span>}

                  {formData.college === 'Other' && (
                    <div className={`form-group ${errors.otherCollege ? 'error' : ''}`} style={{ marginTop: '10px' }}>
                      <label className="form-label">Custom College Name <span style={{ color: 'var(--red-primary)' }}>*</span></label>
                      <input
                        type="text"
                        name="otherCollege"
                        className="form-input"
                        placeholder="Enter your college name"
                        value={formData.otherCollege || ''}
                        onChange={handleChange}
                        required
                      />
                      {errors.otherCollege && <span className="error-message">{errors.otherCollege}</span>}
                    </div>
                  )}
                </div>

                <div className={`form-group ${errors.department ? 'error' : ''}`}>
                  <label className="form-label">Department <span style={{ color: 'var(--red-primary)' }}>*</span></label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="form-input"
                    style={{ background: '#fff', height: '48px' }}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <span className="error-message">{errors.department}</span>}

                  {formData.department === 'Other' && (
                    <div className={`form-group ${errors.otherDepartment ? 'error' : ''}`} style={{ marginTop: '10px' }}>
                      <label className="form-label">Custom Department Name <span style={{ color: 'var(--red-primary)' }}>*</span></label>
                      <input
                        type="text"
                        name="otherDepartment"
                        className="form-input"
                        placeholder="Enter department name"
                        value={formData.otherDepartment || ''}
                        onChange={handleChange}
                        required
                      />
                      {errors.otherDepartment && <span className="error-message">{errors.otherDepartment}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AGREEMENTS & SUBMIT */}
            <div className={`form-group ${errors.agreeTerms ? 'error' : ''}`} style={{ marginBottom: '25px' }}>
              <label className="form-checkbox" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#4b5563', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  style={{ marginTop: '4px', cursor: 'pointer', accentColor: '#C41E3A' }}
                  required
                />
                <span>I agree to the Terms of Service & Privacy Policy of The SM Groups <span style={{ color: 'var(--red-primary)' }}>*</span></span>
              </label>
              {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}