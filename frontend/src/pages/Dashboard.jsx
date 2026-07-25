import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Video, FileText, GraduationCap, Award, FolderOpen, 
  Trophy, MessageSquare, Calendar, User, Settings, LogOut, Search, Bell, ChevronDown,
  Megaphone, ShieldCheck, Play, BookOpenCheck, Medal, Menu, X, Code2, Cpu, Wifi,
  Settings2, Compass, BarChart3, Sparkles
} from 'lucide-react';
import nmLogo from '../assets/nm_logo.png';
import smLogo from '../assets/sm_logo.png';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    year: '',
    gender: ''
  });
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [profileMessage, setProfileMessage] = useState('');

  const [courseFilter, setCourseFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role === 'admin') {
      navigate('/admin');
      return;
    }
    setUser(parsedUser);
    setProfileForm(parsedUser);
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUser(profileForm);
    localStorage.setItem('user', JSON.stringify(profileForm));

    const storedUsersRaw = localStorage.getItem('registeredUsers');
    if (storedUsersRaw) {
      const existingUsers = JSON.parse(storedUsersRaw);
      const updatedUsers = existingUsers.map(u => 
        (u.email && u.email === profileForm.email) ? { ...u, ...profileForm } : u
      );
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    }

    setIsEditingProfile(false);
    triggerToast('✓ Profile details updated successfully!');
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

  const allCoursesData = [
    { id: 1, title: 'Python Programming for Beginners', category: 'Software & Coding', progress: 72, lessons: '12 / 16 Lessons', color: '#3B82F6', icon: <Code2 size={22} color="#3B82F6" />, status: 'progress' },
    { id: 2, title: 'PCB Design & Schematics Modelling', category: 'Hardware Electronics', progress: 45, lessons: '8 / 18 Lessons', color: '#10B981', icon: <Cpu size={22} color="#10B981" />, status: 'progress' },
    { id: 3, title: 'IoT Systems & Sensors Interfacing', category: 'Embedded & IoT', progress: 90, lessons: '18 / 20 Lessons', color: '#F59E0B', icon: <Wifi size={22} color="#F59E0B" />, status: 'progress' },
    { id: 4, title: 'Microcontroller Architecture & Assembly', category: 'Embedded Systems', progress: 30, lessons: '5 / 15 Lessons', color: '#8B5CF6', icon: <Settings2 size={22} color="#8B5CF6" />, status: 'progress' },
    { id: 5, title: 'Surface Modelling & CAD Design', category: 'Mechanical & CAD', progress: 100, lessons: '14 / 14 Lessons', color: '#EC4899', icon: <Compass size={22} color="#EC4899" />, status: 'completed' },
    { id: 6, title: 'Data Structures & Algorithms', category: 'Computer Science', progress: 100, lessons: '22 / 22 Lessons', color: '#EF4444', icon: <BarChart3 size={22} color="#EF4444" />, status: 'completed' }
  ];

  const filteredCourses = allCoursesData.filter(c => {
    const matchesFilter = courseFilter === 'all' || c.status === courseFilter;
    const matchesSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="db-sidebar-backdrop" 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`db-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand-area">
          <img src={nmLogo} alt="Naan Mudhalvan Logo" className="db-sidebar-logo" />
          <div className="powered-by-box">
            <span className="powered-text">POWERED BY</span>
            <img src={smLogo} alt="SM Groups Logo" className="db-powered-logo" />
          </div>
          <button 
            className="mobile-sidebar-close-btn" 
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="db-sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => {
                    setActiveTab(item.name);
                    setIsMobileSidebarOpen(false);
                    if (item.name === 'Profile' || item.name === 'Settings') {
                      setProfileForm(user);
                    }
                  }}
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
          <div className="db-header-welcome" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              className="db-mobile-hamburger-btn" 
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div>
              <h2>Welcome back, {user.fullName || 'Student'} 👋</h2>
              <p>Keep learning, keep growing!</p>
            </div>
          </div>

          <div className="db-header-controls">
            <div className="db-search-bar">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search for courses, classes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActiveTab('My Courses');
                    triggerToast(`🔍 Searching courses for "${searchQuery}"`);
                  }
                }}
              />
            </div>

            <button 
              className="control-btn notification-btn"
              onClick={() => {
                setActiveTab('Messages');
                triggerToast('🔔 Displaying your recent notifications');
              }}
            >
              <Bell size={20} />
              <span className="bell-badge-count">3</span>
            </button>

            <div className="db-user-dropdown" onClick={() => { setActiveTab('Profile'); setProfileForm(user); }}>
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" 
                alt="Profile Avatar" 
                className="user-avatar-img" 
              />
              <ChevronDown size={16} className="dropdown-arrow" />
            </div>
          </div>
        </header>

        {/* Dynamic Interactive Toast Notification */}
        {toastMessage && (
          <div style={{
            position: 'sticky',
            top: '15px',
            zIndex: 999,
            margin: '10px 30px 0 30px',
            background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            fontWeight: 600,
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <span>{toastMessage}</span>
            <button 
              onClick={() => setToastMessage('')}
              style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Dashboard Panels */}
        <div className="db-body-content">
          {activeTab === 'Dashboard' ? (
            <>
              {/* Stats Cards Row */}
              <div className="db-stats-row">
                <div className="db-stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('My Courses')}>
                  <div className="stat-icon-container cap-bg">
                    <GraduationCap size={24} className="stat-icon-cap" />
                  </div>
                  <div className="stat-text-info">
                    <h3>12</h3>
                    <p>Enrolled Courses</p>
                  </div>
                </div>

                <div className="db-stat-card" style={{ cursor: 'pointer' }} onClick={() => { setActiveTab('My Courses'); setCourseFilter('completed'); }}>
                  <div className="stat-icon-container book-bg">
                    <BookOpenCheck size={24} className="stat-icon-book" />
                  </div>
                  <div className="stat-text-info">
                    <h3>6</h3>
                    <p>Completed Courses</p>
                  </div>
                </div>

                <div className="db-stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('Leaderboard')}>
                  <div className="stat-icon-container points-bg">
                    <Medal size={24} className="stat-icon-points" />
                  </div>
                  <div className="stat-text-info">
                    <h3>1250</h3>
                    <p>Reward Points</p>
                  </div>
                </div>

                <div className="db-stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('Leaderboard')}>
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
                      <button className="btn-banner-explore" onClick={() => setActiveTab('My Courses')}>Explore Courses &rarr;</button>
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
                      <button className="widget-view-all" onClick={() => setActiveTab('My Courses')}>View All</button>
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
                        <button className="btn-continue-learning" onClick={() => { setActiveTab('My Courses'); triggerToast('🚀 Resuming Python Programming for Beginners...'); }}>Continue Learning</button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Announcements */}
                  <div className="db-announcements-widget">
                    <div className="widget-header">
                      <h3>Recent Announcements</h3>
                      <button className="widget-view-all" onClick={() => setActiveTab('Messages')}>View All</button>
                    </div>

                    <div className="announcements-list">
                      <div className="announcement-item" style={{ cursor: 'pointer' }} onClick={() => triggerToast('📢 Holiday Notice: College closed on May 27th.')}>
                        <div className="announcement-icon-circle icon-red">
                          <Megaphone size={18} />
                        </div>
                        <div className="announcement-text-details">
                          <h4>Holiday Notice</h4>
                          <p>College will remain closed on May 27, 2024 on account of Memorial Day.</p>
                          <span className="announcement-time-stamp">2 hours ago</span>
                        </div>
                      </div>

                      <div className="announcement-item" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('Exams')}>
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
                      <button className="widget-view-all" onClick={() => setActiveTab('Live Classes')}>View All</button>
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
                      <button className="btn-join-live-class" onClick={() => { setActiveTab('Live Classes'); triggerToast('🎥 Connecting to Data Structures Live Stream...'); }}>
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
          ) : activeTab === 'My Courses' ? (
            <div className="db-tab-content-container">
              <div className="tab-header-row">
                <h3>My Enrolled Courses</h3>
                <div className="tab-filter-pills">
                  <button className={`tab-pill ${courseFilter === 'all' ? 'active' : ''}`} onClick={() => setCourseFilter('all')}>All Courses ({allCoursesData.length})</button>
                  <button className={`tab-pill ${courseFilter === 'progress' ? 'active' : ''}`} onClick={() => setCourseFilter('progress')}>In Progress (4)</button>
                  <button className={`tab-pill ${courseFilter === 'completed' ? 'active' : ''}`} onClick={() => setCourseFilter('completed')}>Completed (2)</button>
                </div>
              </div>
              <div className="courses-cards-grid">
                {filteredCourses.map(course => (
                  <div key={course.id} className="custom-course-card">
                    <div className="ccc-badge-row">
                      <span className="ccc-icon-tag">{course.icon}</span>
                      <span className="ccc-cat-label">{course.category}</span>
                    </div>
                    <h4>{course.title}</h4>
                    <div className="ccc-progress-wrap">
                      <div className="ccc-bar-bg">
                        <div className="ccc-bar-fill" style={{ width: `${course.progress}%`, background: course.color }}></div>
                      </div>
                      <div className="ccc-meta-info">
                        <span>{course.lessons}</span>
                        <strong>{course.progress}%</strong>
                      </div>
                    </div>
                    <button 
                      className="btn-ccc-action"
                      onClick={() => triggerToast(course.progress === 100 ? `✓ ${course.title} is completed! Reviewing certificate.` : `🚀 Opening ${course.title} workspace...`)}
                    >
                      {course.progress === 100 ? 'Review Course ✓' : 'Continue Learning →'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'Live Classes' ? (
            <div className="db-tab-content-container">
              <div className="tab-header-row">
                <h3>Live Interactive Classes</h3>
                <span className="live-status-pill">🔴 1 Session Live Now</span>
              </div>
              <div className="live-sessions-list">
                {[
                  { id: 1, title: 'Data Structures Using Python (Masterclass)', time: 'Today, 10:00 AM - 11:30 AM', instructor: 'Mr. Dinesh Kumar', status: 'LIVE NOW', isLive: true },
                  { id: 2, title: 'PCB Layout Design Routing Workshop', time: 'Tomorrow, 02:00 PM - 04:00 PM', instructor: 'Dr. S. Kanthaswamy', status: 'UPCOMING', isLive: false },
                  { id: 3, title: 'Sensors Interfacing & ESP32 Microcontrollers', time: 'May 28, 11:00 AM - 01:00 PM', instructor: 'Prof. Anitha R', status: 'SCHEDULED', isLive: false }
                ].map(session => (
                  <div key={session.id} className={`live-session-item ${session.isLive ? 'highlight-live' : ''}`}>
                    <div className="lsi-left">
                      <div className="lsi-icon-box">
                        <Video size={24} color={session.isLive ? '#DC2626' : '#2563EB'} />
                      </div>
                      <div className="lsi-info">
                        <h4>{session.title}</h4>
                        <p>Instructor: <strong>{session.instructor}</strong> • {session.time}</p>
                      </div>
                    </div>
                    <div className="lsi-right">
                      <span className={`lsi-status-badge ${session.isLive ? 'badge-live' : 'badge-scheduled'}`}>
                        {session.status}
                      </span>
                      <button 
                        className={`btn-session-action ${session.isLive ? 'btn-live-join' : 'btn-live-remind'}`}
                        onClick={() => triggerToast(session.isLive ? `🎥 Joining live stream for ${session.title}` : `🔔 Reminder set for ${session.title}`)}
                      >
                        {session.isLive ? '▶ Join Stream' : '🔔 Add Reminder'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'Assignments' ? (
            <div className="db-tab-content-container">
              <div className="tab-header-row">
                <h3>Assignments & Quizzes</h3>
                <button className="widget-view-all" onClick={() => triggerToast('📤 Opening Assignment Upload Dialog...')}>Upload New Assignment</button>
              </div>
              <div className="assignments-table-container">
                <table className="custom-dashboard-table">
                  <thead>
                    <tr>
                      <th>Assignment Title</th>
                      <th>Course</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th>Grade / Score</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 1, title: 'Python List Comprehension & Dicts', course: 'Python Programming', deadline: 'May 26, 2024', status: 'Submitted', score: '95 / 100', color: '#16a34a' },
                      { id: 2, title: 'Circuit Schematic for Temperature Sensor', course: 'PCB Design & Schematics', deadline: 'May 29, 2024', status: 'Pending Upload', score: 'Pending', color: '#d97706' },
                      { id: 3, title: 'ESP32 MQTT Publish & Subscribe Lab', course: 'IoT Systems & Sensors', deadline: 'Jun 02, 2024', status: 'In Review', score: 'Processing', color: '#2563eb' }
                    ].map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.title}</strong></td>
                        <td>{item.course}</td>
                        <td>{item.deadline}</td>
                        <td><span className="tbl-status-tag" style={{ color: item.color, background: `${item.color}15` }}>{item.status}</span></td>
                        <td><strong>{item.score}</strong></td>
                        <td>
                          <button 
                            className="tbl-btn-action"
                            onClick={() => triggerToast(`📄 Opening submission report for "${item.title}"`)}
                          >
                            View Submission
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'Exams' ? (
            <div className="db-tab-content-container">
              <div className="tab-header-row">
                <h3>Semester & Certification Examinations</h3>
              </div>
              <div className="exams-cards-grid">
                {[
                  { id: 1, title: 'Mid-Term Assessment: Embedded C & ARM', date: 'May 30, 2024', duration: '90 Minutes', marks: '100 Marks', status: 'Admit Card Ready' },
                  { id: 2, title: 'Naan Mudhalvan Skill Assessment Exam', date: 'June 05, 2024', duration: '120 Minutes', marks: '150 Marks', status: 'Scheduled' }
                ].map(exam => (
                  <div key={exam.id} className="exam-card-item">
                    <div className="eci-header">
                      <ShieldCheck size={28} color="var(--primary-red)" />
                      <div>
                        <h4>{exam.title}</h4>
                        <span className="eci-date-chip">📅 Date: {exam.date}</span>
                      </div>
                    </div>
                    <div className="eci-details-row">
                      <div><span>Duration:</span> <strong>{exam.duration}</strong></div>
                      <div><span>Total Marks:</span> <strong>{exam.marks}</strong></div>
                      <div><span>Status:</span> <strong style={{ color: '#16a34a' }}>{exam.status}</strong></div>
                    </div>
                    <button 
                      className="btn-exam-admit"
                      onClick={() => triggerToast(`📥 Downloading Admit Card PDF for ${exam.title}...`)}
                    >
                      Download Hall Ticket / Admit Card
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'Certificates' ? (
            <div className="db-tab-content-container">
              <div className="tab-header-row">
                <h3>My Earned Certificates</h3>
              </div>
              <div className="certificates-cards-grid">
                {[
                  { id: 1, title: 'Certificate of Excellence: Surface Modelling', issuedDate: 'April 15, 2024', certId: 'SM-NM-2024-8841', issuer: 'The SM Groups & Naan Mudhalvan' },
                  { id: 2, title: 'Certificate of Completion: Data Structures', issuedDate: 'March 10, 2024', certId: 'SM-NM-2024-3312', issuer: 'Sona College of Technology' }
                ].map(cert => (
                  <div key={cert.id} className="certificate-item-card">
                    <div className="cert-badge-wrap">
                      <Award size={36} color="#D97706" />
                    </div>
                    <h4>{cert.title}</h4>
                    <p className="cert-meta">Verified ID: <strong>{cert.certId}</strong></p>
                    <p className="cert-meta">Issued on {cert.issuedDate} by {cert.issuer}</p>
                    <div className="cert-actions-row">
                      <button 
                        className="btn-cert-download"
                        onClick={() => triggerToast(`📥 Verified Certificate ${cert.certId} downloaded!`)}
                      >
                        📥 Download PDF
                      </button>
                      <button 
                        className="btn-cert-share"
                        onClick={() => triggerToast(`🔗 Verification link for ${cert.certId} copied to clipboard!`)}
                      >
                        🔗 Share Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'Study Materials' ? (
            <div className="db-tab-content-container">
              <div className="tab-header-row">
                <h3>Downloadable Study Materials & Lab Notes</h3>
              </div>
              <div className="materials-list">
                {[
                  { id: 1, name: 'Python Complete Lecture Notes & Code Snippets.pdf', size: '14.2 MB', type: 'PDF Document', category: 'Software' },
                  { id: 2, name: 'PCB Schematic Symbol Libraries & Layout Rules.zip', size: '28.5 MB', type: 'ZIP Archive', category: 'Hardware' },
                  { id: 3, name: 'IoT Microcontroller Pins Reference Manual.pdf', size: '8.4 MB', type: 'PDF Document', category: 'IoT' }
                ].map(mat => (
                  <div key={mat.id} className="material-item">
                    <div className="mat-icon-box">
                      <FolderOpen size={24} color="var(--primary-red)" />
                    </div>
                    <div className="mat-details">
                      <h4>{mat.name}</h4>
                      <p>{mat.type} • {mat.size} • Category: <strong>{mat.category}</strong></p>
                    </div>
                    <button 
                      className="btn-mat-download"
                      onClick={() => triggerToast(`📥 Downloading "${mat.name}"...`)}
                    >
                      📥 Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'Leaderboard' ? (
            <div className="db-tab-content-container">
              <div className="tab-header-row">
                <h3>Naan Mudhalvan Student Leaderboard</h3>
                <span className="user-rank-highlight">🏆 Your Rank: #14 (1,250 Points)</span>
              </div>
              <div className="leaderboard-table-container">
                <table className="custom-dashboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Student Name</th>
                      <th>College</th>
                      <th>Department</th>
                      <th>Reward Points</th>
                      <th>Badges Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { rank: '1 🥇', name: 'Kavitha R', college: 'GCE Salem', dept: 'ECE', points: '2,840', badges: '🏆 Master Coder' },
                      { rank: '2 🥈', name: 'Vignesh M', college: 'Sona College of Tech', dept: 'IT', points: '2,610', badges: '⚡ Hardware Pro' },
                      { rank: '3 🥉', name: 'Priya S', college: 'PSG College of Tech', dept: 'CSE', points: '2,450', badges: '💡 Innovator' },
                      { rank: '14 ⭐', name: `${user.fullName || 'You'}`, college: `${user.college || 'Sona College'}`, dept: `${user.department || 'IT'}`, points: '1,250', badges: '🚀 Rising Star' }
                    ].map((row, idx) => (
                      <tr key={idx} className={row.name.includes(user.fullName || 'You') ? 'user-highlight-row' : ''}>
                        <td><strong>{row.rank}</strong></td>
                        <td><strong>{row.name}</strong></td>
                        <td>{row.college}</td>
                        <td>{row.dept}</td>
                        <td><strong style={{ color: 'var(--primary-red)' }}>{row.points} pts</strong></td>
                        <td>{row.badges}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'Messages' || activeTab === 'Calendar' ? (
            <div className="db-tab-content-container">
              <div className="tab-header-row">
                <h3>{activeTab} Overview</h3>
              </div>
              <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                {activeTab === 'Messages' ? (
                  <div>
                    <h4 style={{ marginBottom: '15px' }}>💬 Recent Messages & Support Notifications</h4>
                    <div style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '12px' }}>
                      <strong>Mentor Mr. Dinesh Kumar:</strong>
                      <p style={{ color: '#666', fontSize: '14px' }}>Please ensure your Python assignment is submitted before May 26th.</p>
                    </div>
                    <div style={{ borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                      <strong>Naan Mudhalvan Support:</strong>
                      <p style={{ color: '#666', fontSize: '14px' }}>Your enrollment in IoT Systems Workshop has been confirmed!</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ marginBottom: '15px' }}>📅 Upcoming Schedule Calendar</h4>
                    <p style={{ fontSize: '14px', color: '#444' }}>• May 24: Live Class — Data Structures Using Python (10:00 AM)</p>
                    <p style={{ fontSize: '14px', color: '#444', marginTop: '8px' }}>• May 26: Deadline — Python List Comprehension Assignment</p>
                    <p style={{ fontSize: '14px', color: '#444', marginTop: '8px' }}>• May 30: Mid-Term Assessment Exam</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'Profile' || activeTab === 'Settings' ? (
            <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>Student Profile & Details</h3>
                {!isEditingProfile && (
                  <button 
                    onClick={() => { setIsEditingProfile(true); setProfileForm(user); }}
                    style={{ background: 'var(--primary-red)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              {profileMessage && (
                <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '14px', borderRadius: '10px', marginBottom: '20px', fontWeight: 600, border: '1px solid #bbf7d0' }}>
                  {profileMessage}
                </div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Full Name</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={profileForm.fullName || ''} 
                      onChange={handleProfileChange}
                      required 
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={profileForm.email || ''} 
                      onChange={handleProfileChange}
                      required 
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Phone Number</label>
                    <input 
                      type="text" 
                      name="phone" 
                      value={profileForm.phone || ''} 
                      onChange={handleProfileChange}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>College</label>
                    <input 
                      type="text" 
                      name="college" 
                      value={profileForm.college || ''} 
                      onChange={handleProfileChange}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Department</label>
                    <input 
                      type="text" 
                      name="department" 
                      value={profileForm.department || ''} 
                      onChange={handleProfileChange}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Year</label>
                    <input 
                      type="text" 
                      name="year" 
                      value={profileForm.year || ''} 
                      onChange={handleProfileChange}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Gender</label>
                    <select 
                      name="gender" 
                      value={profileForm.gender || ''} 
                      onChange={handleProfileChange}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', background: '#fff' }}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button 
                      type="submit"
                      style={{ background: 'var(--primary-red)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Save Profile Changes
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ background: '#f9fafb', padding: '18px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, display: 'block' }}>FULL NAME</span>
                    <strong style={{ fontSize: '16px', color: '#111827' }}>{user.fullName || 'Not provided'}</strong>
                  </div>

                  <div style={{ background: '#f9fafb', padding: '18px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, display: 'block' }}>EMAIL ADDRESS</span>
                    <strong style={{ fontSize: '16px', color: '#111827' }}>{user.email || 'Not provided'}</strong>
                  </div>

                  <div style={{ background: '#f9fafb', padding: '18px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, display: 'block' }}>PHONE NUMBER</span>
                    <strong style={{ fontSize: '16px', color: '#111827' }}>{user.phone || 'Not provided'}</strong>
                  </div>

                  <div style={{ background: '#f9fafb', padding: '18px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, display: 'block' }}>GENDER</span>
                    <strong style={{ fontSize: '16px', color: '#111827' }}>{user.gender || 'Not provided'}</strong>
                  </div>

                  <div style={{ background: '#f9fafb', padding: '18px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, display: 'block' }}>COLLEGE</span>
                    <strong style={{ fontSize: '16px', color: '#111827' }}>{user.college || 'Not provided'}</strong>
                  </div>

                  <div style={{ background: '#f9fafb', padding: '18px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, display: 'block' }}>DEPARTMENT & YEAR</span>
                    <strong style={{ fontSize: '16px', color: '#111827' }}>{user.department || 'Not provided'} {user.year ? `(${user.year})` : ''}</strong>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
