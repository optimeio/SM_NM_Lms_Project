import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Lock, Eye, EyeOff, Landmark, Code2, Lightbulb, BarChart2,
  GraduationCap, BookOpen, Trophy, Rocket
} from 'lucide-react';
import nmLogo from '../assets/nm_logo.png';
import smLogo from '../assets/sm_logo.png';
import studentsBg from '../assets/electronics_learning.png';
import '../styles/Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Register Number or Email ID is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 4) newErrors.password = 'Password must be at least 4 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setServerError('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockUser = {
        fullName: formData.username.includes('@') ? formData.username.split('@')[0] : 'Aravindh K',
        email: formData.username.includes('@') ? formData.username : 'aravindh.k@example.com',
        college: 'Sona College of Technology',
        department: 'Information Technology',
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      navigate('/dashboard');
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-landing-container">
      <div className="bg-dot-pattern" />

      {/* ── LEFT PANEL (60%) ─────────────────────────────── */}
      <div className="login-left-panel">
        
        {/* Logos */}
        <div className="logos-wrapper">
          <img src={nmLogo} alt="Naan Mudhalvan" className="nm-logo" />
          <div className="vertical-divider" />
          <img src={smLogo} alt="SM Groups" className="sm-logo" />
          <a href="#login-section" className="mobile-header-login-btn">
            Login
          </a>
        </div>

        {/* Hero Title */}
        <h1 className="hero-title">
          <span className="title-highlight">Naan Mudhalvan</span>
          <span className="title-sub">Learning Platform</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="hero-description">
          Empowering Students.<br />Building a Better Tomorrow.
        </p>

        {/* Feature Cards Row */}
        <div className="hero-badges-row">
          <div className="hero-badge-item">
            <div className="hbi-icon-wrapper">
              <Code2 size={22} />
            </div>
            <div className="hbi-text-container">
              <span className="hbi-title">💻 Code.</span>
              <span className="hbi-sub">Learn</span>
            </div>
          </div>
          
          <div className="hero-badge-item">
            <div className="hbi-icon-wrapper">
              <Lightbulb size={22} />
            </div>
            <div className="hbi-text-container">
              <span className="hbi-title">💡 Think.</span>
              <span className="hbi-sub">Innovate</span>
            </div>
          </div>

          <div className="hero-badge-item">
            <div className="hbi-icon-wrapper">
              <BarChart2 size={22} />
            </div>
            <div className="hbi-text-container">
              <span className="hbi-title">📈 Build.</span>
              <span className="hbi-sub">Succeed</span>
            </div>
          </div>
        </div>

        {/* Student image with floating tech pills */}
        <div className="students-illustration">
          <div className="image-glow-backdrop" />
          
          {/* Floating tech pills */}
          <div className="tech-pill pill-pcb">PCB</div>
          <div className="tech-pill pill-iot">IoT</div>
          <div className="tech-pill pill-embedded">Embedded</div>
          <div className="tech-pill pill-sensors">Sensors</div>
          <div className="tech-pill pill-mcu">MCU</div>
          <div className="tech-pill pill-surface">Surface Modelling</div>

          <img src={studentsBg} alt="Students Studying" className="students-photo" />

          {/* Bottom rounded feature strip banner */}
          <div className="course-topics-banner">
            <div className="feature-strip-item">
              <GraduationCap size={18} color="#C8104D" />
              <span>Expert Mentorship</span>
            </div>
            <div className="fsi-divider" />
            <div className="feature-strip-item">
              <BookOpen size={18} color="#C8104D" />
              <span>Industry Relevant Skills</span>
            </div>
            <div className="fsi-divider" />
            <div className="feature-strip-item">
              <Trophy size={18} color="#C8104D" />
              <span>Hands-on Learning</span>
            </div>
            <div className="fsi-divider" />
            <div className="feature-strip-item">
              <Rocket size={18} color="#C8104D" />
              <span>Future Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (40%) ─────────────────────────────── */}
      <div className="login-right-panel" id="login-section">
        
        {/* Glassmorphism Login Card */}
        <div className="login-card">
          <div className="card-user-icon-wrapper">
            <User size={28} />
          </div>
          
          <h2 className="card-title">Student Login</h2>
          <p className="card-subtitle">
            Welcome Back!<br />Login to continue your learning journey.
          </p>

          {serverError && <div className="login-error-alert">{serverError}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Username */}
            <div className="login-input-group">
              <label className="input-label">Register Number / Email</label>
              <div className="input-wrapper">
                <User className="input-icon" size={17} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter Register Number or Email"
                  className={`login-input ${errors.username ? 'has-error' : ''}`}
                />
              </div>
              {errors.username && <span className="input-error-msg">{errors.username}</span>}
            </div>

            {/* Password */}
            <div className="login-input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`login-input ${errors.password ? 'has-error' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <span className="input-error-msg">{errors.password}</span>}
            </div>

            <div className="forgot-password-link">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-login-submit">
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            <div className="login-or-divider"><span>OR</span></div>

            <button type="button" className="btn-college-login">
              <Landmark size={17} style={{ marginRight: '8px' }} />
              <span>Login with College ID</span>
            </button>

            <div className="register-redirect">
              <span>New Student? </span>
              <Link to="/register" className="register-link">Register Here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}