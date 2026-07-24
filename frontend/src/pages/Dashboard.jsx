import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Video, FileText, GraduationCap, Award, FolderOpen, 
  Trophy, MessageSquare, Calendar, User, Settings, LogOut, Search, Bell, ChevronDown,
  Megaphone, ShieldCheck, Play, BookOpenCheck, Medal
} from 'lucide-react';
import nmLogo from '../assets/nm_logo.png';
import smLogo from '../assets/sm_logo.png';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ fullName: 'Aravindh K' });
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Courses', icon: <BookOpen size={20} /> },
    { name: 'Live Classes', icon: <Video size={20} /> },
    { name: 'Assignments', icon: <FileText size={20} /> },
    { name: 'Exams', icon: <ShieldCheck size={20} /> },
    { name: 'Certificates', icon: <Award size={20} /> },
    { name: 'Study Materials', icon: <FolderOpen size={20} /> },
    { name: 'Leaderboard', icon: <Trophy size={20} /> },
    { name: 'Messages', icon: <MessageSquare size={20} />, badge: 2 },
    { name: 'Calendar', icon: <Calendar size={20} /> },
    { name: 'Profile', icon: <User size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="sidebar-brand-area">
          <img src={nmLogo} alt="Naan Mudhalvan Logo" className="db-sidebar-logo" />
          <div className="powered-by-box">
            <span className="powered-text">POWERED BY</span>
            <img src={smLogo} alt="SM Groups Logo" className="db-powered-logo" />
          </div>
        </div>

        <nav className="db-sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => setActiveTab(item.name)}
                  className={`sidebar-menu-btn ${activeTab === item.name ? 'active' : ''}`}
                >
                  <span className="sidebar-icon-wrap">{item.icon}</span>
                  <span className="sidebar-label">{item.name}</span>
                  {item.badge && <span className="menu-badge-count">{item.badge}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="db-sidebar-footer">
          <button onClick={handleSignOut} className="sidebar-logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="db-main-area">
        {/* Header */}
        <header className="db-header">
          <div className="db-header-welcome">
            <h2>Welcome back, {user.fullName} 👋</h2>
            <p>Keep learning, keep growing!</p>
          </div>

          <div className="db-header-controls">
            <div className="db-search-bar">
              <Search className="search-icon" size={18} />
              <input type="text" placeholder="Search for courses, classes..." />
            </div>

            <button className="control-btn notification-btn">
              <Bell size={20} />
              <span className="bell-badge-count">3</span>
            </button>

            <div className="db-user-dropdown">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" 
                alt="Profile Avatar" 
                className="user-avatar-img" 
              />
              <ChevronDown size={16} className="dropdown-arrow" />
            </div>
          </div>
        </header>

        {/* Dashboard Panels */}
        <div className="db-body-content">
          {activeTab === 'Dashboard' ? (
            <>
              {/* Stats Cards Row */}
              <div className="db-stats-row">
                <div className="db-stat-card">
                  <div className="stat-icon-container cap-bg">
                    <GraduationCap size={24} className="stat-icon-cap" />
                  </div>
                  <div className="stat-text-info">
                    <h3>12</h3>
                    <p>Enrolled Courses</p>
                  </div>
                </div>

                <div className="db-stat-card">
                  <div className="stat-icon-container book-bg">
                    <BookOpenCheck size={24} className="stat-icon-book" />
                  </div>
                  <div className="stat-text-info">
                    <h3>6</h3>
                    <p>Completed Courses</p>
                  </div>
                </div>

                <div className="db-stat-card">
                  <div className="stat-icon-container points-bg">
                    <Medal size={24} className="stat-icon-points" />
                  </div>
                  <div className="stat-text-info">
                    <h3>1250</h3>
                    <p>Reward Points</p>
                  </div>
                </div>

                <div className="db-stat-card">
                  <div className="stat-icon-container rank-bg">
                    <Trophy size={24} className="stat-icon-rank" />
                  </div>
                  <div className="stat-text-info">
                    <h3>Top 15%</h3>
                    <p>Leaderboard Rank</p>
                  </div>
                </div>
              </div>

              {/* Main Widgets Grid */}
              <div className="db-grid-content">
                {/* Left Column */}
                <div className="grid-left-col">
                  {/* Banner Card */}
                  <div className="db-banner-card">
                    <div className="banner-text-content">
                      <h2>Learn Today, Lead Tomorrow!</h2>
                      <p>
                        Explore quality courses, join live classes, complete assignments and achieve your goals.
                      </p>
                      <button className="btn-banner-explore">Explore Courses &rarr;</button>
                    </div>
                    <div className="banner-graphic-content">
                      <img 
                        src="https://cdni.iconscout.com/illustration/premium/thumb/student-character-using-laptop-for-online-education-4822765-4019183.png" 
                        alt="3D Student Graphic" 
                        className="banner-3d-img" 
                      />
                    </div>
                  </div>

                  {/* My Learning widget */}
                  <div className="db-my-learning-widget">
                    <div className="widget-header">
                      <h3>My Learning</h3>
                      <button className="widget-view-all">View All</button>
                    </div>

                    <div className="learning-progress-card">
                      <div className="course-progress-info">
                        <div className="course-logo-circle">
                          <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" 
                            alt="Python Logo" 
                            className="course-logo-img" 
                          />
                        </div>
                        <div className="course-details-wrap">
                          <h4>Python Programming for Beginners</h4>
                          <span className="course-sub-label">Course Progress</span>
                          <div className="progress-bar-container">
                            <div className="progress-bar-filled" style={{ width: '72%' }}></div>
                          </div>
                          <div className="progress-meta-text">
                            <span>12 / 16 Lessons Completed</span>
                            <span className="percentage-text">72%</span>
                          </div>
                        </div>
                        <button className="btn-continue-learning">Continue Learning</button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Announcements */}
                  <div className="db-announcements-widget">
                    <div className="widget-header">
                      <h3>Recent Announcements</h3>
                      <button className="widget-view-all">View All</button>
                    </div>

                    <div className="announcements-list">
                      <div className="announcement-item">
                        <div className="announcement-icon-circle icon-red">
                          <Megaphone size={18} />
                        </div>
                        <div className="announcement-text-details">
                          <h4>Holiday Notice</h4>
                          <p>College will remain closed on May 27, 2024 on account of Memorial Day.</p>
                          <span className="announcement-time-stamp">2 hours ago</span>
                        </div>
                      </div>

                      <div className="announcement-item">
                        <div className="announcement-icon-circle icon-blue">
                          <Calendar size={18} />
                        </div>
                        <div className="announcement-text-details">
                          <h4>Exam Schedule Released</h4>
                          <p>End Semester Examination Timetable is now available.</p>
                          <span className="announcement-time-stamp">1 day ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="grid-right-col">
                  {/* Upcoming Live Class */}
                  <div className="db-live-class-card">
                    <div className="widget-header">
                      <h3>Upcoming Live Class</h3>
                      <button className="widget-view-all">View All</button>
                    </div>

                    <div className="live-class-details-card">
                      <div className="live-class-header-row">
                        <div className="date-badge-box">
                          <span className="date-month">MAY</span>
                          <span className="date-day">24</span>
                          <span className="date-weekday">Fri</span>
                        </div>
                        <div className="time-instructor-details">
                          <span className="live-time-slot">10:00 AM - 11:30 AM</span>
                          <h4>Data Structures Using Python</h4>
                          <span className="instructor-name">by Mr. Dinesh Kumar</span>
                        </div>
                      </div>
                      <div className="live-badge-glow-wrap">
                        <span className="live-glow-dot"></span>
                        <span className="live-text-tag">Live Class</span>
                      </div>
                      <button className="btn-join-live-class">
                        <Play size={16} fill="currentColor" style={{ marginRight: '6px' }} />
                        <span>Join Class</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Access Grid */}
                  <div className="db-quick-access-widget">
                    <h3>Quick Access</h3>
                    <div className="quick-access-buttons-grid">
                      <button className="quick-access-btn" onClick={() => setActiveTab('My Courses')}>
                        <div className="quick-icon-circle icon-bg-red">
                          <BookOpen size={20} />
                        </div>
                        <span>My Courses</span>
                      </button>

                      <button className="quick-access-btn" onClick={() => setActiveTab('Live Classes')}>
                        <div className="quick-icon-circle icon-bg-blue">
                          <Video size={20} />
                        </div>
                        <span>Live Classes</span>
                      </button>

                      <button className="quick-access-btn" onClick={() => setActiveTab('Assignments')}>
                        <div className="quick-icon-circle icon-bg-orange">
                          <FileText size={20} />
                        </div>
                        <span>Assignments</span>
                      </button>

                      <button className="quick-access-btn" onClick={() => setActiveTab('Exams')}>
                        <div className="quick-icon-circle icon-bg-green">
                          <ShieldCheck size={20} />
                        </div>
                        <span>Exams</span>
                      </button>

                      <button className="quick-access-btn" onClick={() => setActiveTab('Certificates')}>
                        <div className="quick-icon-circle icon-bg-purple">
                          <Award size={20} />
                        </div>
                        <span>Certificates</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="db-fallback-view">
              <div className="fallback-inner-card">
                <BookOpen size={48} className="fallback-icon" />
                <h3>{activeTab} Content</h3>
                <p>This is a placeholder page for the {activeTab} section. In the future, this page will show live learning modules and databases.</p>
                <button className="btn-back-dashboard" onClick={() => setActiveTab('Dashboard')}>Back to Dashboard</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
