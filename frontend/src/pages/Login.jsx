import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Lock, Eye, EyeOff, Landmark, Code2, Lightbulb, BarChart2,
  GraduationCap, BookOpen, Trophy, Rocket
} from 'lucide-react';
import tnskillLogo from '../assets/tnskill_logo.png';
import smLogo from '../assets/sm_logo.png';
import studentsBg from '../assets/robotics_hero.jpg';
import '../styles/Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    clientKey: '59e8bb42f89d5ee93ff466be97022427', 
    clientSecret: 'f7a761767124aef8b904c49b52a555d6' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Register Number or Email ID is required';
    if (!formData.password) newErrors.password = 'Password is required';
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
      await new Promise((resolve) => setTimeout(resolve, 600));

      const inputUser = formData.username.trim().toLowerCase();
      const inputPass = formData.password.trim();

      // 1. Admin Authentication Check
      if (inputUser === 'thesmgroups@gmail.com' || inputUser === 'admin@smgroups.com') {
        if (inputPass === 'TSMGPVT@2026') {
          const adminObj = {
            fullName: 'SM Groups Administrator',
            email: 'thesmgroups@gmail.com',
            role: 'admin',
            college: 'The SM Groups Admin',
            department: 'Administration'
          };
          localStorage.setItem('user', JSON.stringify(adminObj));
          navigate('/admin');
          return;
        } else {
          setServerError('Invalid Admin Password. Please check your admin credentials.');
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Student Login via Client Key & Secret Key + Credentials
      const key = formData.clientKey.trim();
      const secret = formData.clientSecret.trim();

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_key: key,
          client_secret: secret,
          username: inputUser,
          password: inputPass
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.token) {
            localStorage.setItem('token', data.token);
          }
          navigate('/dashboard');
          return;
        }
      }
      const errData = await res.json().catch(() => ({}));
      setServerError(errData.message || 'Invalid Client Key, Secret Key, or Student Credentials.');
    } catch {
      setServerError('Something went wrong during login. Please try again.');
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
          <img src={tnskillLogo} alt="TNSkill" className="nm-logo" />
          <div className="vertical-divider" />
          <img src={smLogo} alt="SM Groups" className="sm-logo" />
          <a href="#login-section" className="mobile-header-login-btn">
            Login
          </a>
        </div>

        {/* Hero Title */}
        <h1 className="hero-title">
          <span className="title-highlight">TNSkill</span>
          <span className="title-sub">Learning Platform</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="hero-description">
          Empowering Students.<br />Building a Better Tomorrow.
        </p>

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

            <button type="submit" disabled={isSubmitting} className="btn-login-submit">
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}