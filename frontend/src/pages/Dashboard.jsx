import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Video, FileText, GraduationCap, Award, FolderOpen, 
  Trophy, MessageSquare, Calendar, User, Settings, LogOut, Search, Bell, ChevronDown,
  Megaphone, ShieldCheck, Play, BookOpenCheck, Medal, Menu, X, Code2, Cpu, Wifi,
  Settings2, Compass, BarChart3, Sparkles, Mail, Phone, Landmark, Camera, CheckCircle2,
  Save, Contact
} from 'lucide-react';
import html2canvas from 'html2canvas';
import tnskillLogo from '../assets/tnskill_logo.png';
import smLogo from '../assets/sm_logo.png';
import tnsdcLogo from '../assets/tnsdc_logo.png';
import tnGovtEmblem from '../assets/tn_govt_emblem.png';
import mdSignature from '../assets/md_signature.jpg';
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
    gender: '',
    profileImage: ''
  });
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [profileMessage, setProfileMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm(prev => ({ ...prev, profileImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const [courseFilter, setCourseFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const [selectedCertificateModal, setSelectedCertificateModal] = useState(null);

  const handleDownloadPPT = (courseTitle, index, pptData, pptFileName, courseCode = 'NTEDU0001') => {
    let targetData = pptData;
    if (!targetData && activeCourse?.ppts && activeCourse.ppts.length > 0) {
      targetData = activeCourse.ppts[index % activeCourse.ppts.length];
    }
    if (!targetData && courseCode) {
      const pptNum = (index % 2) + 1;
      targetData = `/courses/${courseCode}/ppts/presentation_${pptNum}.pptx`;
    }

    const cleanName = pptFileName || (typeof targetData === 'string' && !targetData.startsWith('data:') && !targetData.startsWith('http') && !targetData.startsWith('/') ? targetData : `${courseTitle || 'Course'}_Module_${index + 1}.pptx`);
    const finalFileName = cleanName.endsWith('.pptx') ? cleanName : `${cleanName}.pptx`;

    if (typeof targetData === 'string' && (targetData.startsWith('data:') || targetData.startsWith('http') || targetData.startsWith('/'))) {
      const downloadUrl = targetData.startsWith('data:') || targetData.startsWith('http') ? targetData : `${window.location.origin}${targetData}`;
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = finalFileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const content = `=====================================================
THE SM GROUPS | TNSKILL LEARNING PORTAL
COURSE: ${(courseTitle || 'Engineering Course').toUpperCase()}
MODULE PRESENTATION SLIDES: MODULE #${index + 1}
FILE: ${finalFileName}
=====================================================

SLIDE 1: TITLE & OBJECTIVES
- Course: ${courseTitle}
- Subject: Module ${index + 1} Technical Core Concepts & Architecture
- Presented By: SM Groups Engineering Faculty

SLIDE 2: KEY CONCEPTS & SYSTEM ARCHITECTURE
- Fundamental Principles & Industry Standards
- Structural Components & Interfacing Overview
- System Specifications & Protocol Workflows

SLIDE 3: DETAILED TECHNICAL IMPLEMENTATION
- Step-by-Step Execution Guidelines
- Hardware/Software Integration Benchmarks
- Troubleshooting & Performance Optimization

SLIDE 4: PRACTICAL LAB EXERCISES & QUIZ PREPARATION
- Review Exercises for Module ${index + 1}
- Key Evaluation Criteria for Examination

=====================================================
Downloaded from SM Groups TNSkill LMS Portal
Date: ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateQuizQuestionsForCourse = (courseTitle, type = 'mid') => {
    const isMid = type === 'mid';
    const titleLower = (courseTitle || '').toLowerCase();

    const iotBank = [
      { q: "What is the primary role of MQTT protocol in IoT architecture?", opts: ["Lightweight publish/subscribe messaging", "High latency video streaming", "Direct database SQL query execution", "Hardware BIOS flashing"], c: 0 },
      { q: "Which operating system kernel is optimized for real-time microcontrollers?", opts: ["FreeRTOS", "Windows 11 Enterprise", "Android 14", "macOS Sonoma"], c: 0 },
      { q: "In Raspberry Pi architecture, which bus is used for fast serial communication with sensors?", opts: ["SPI / I2C Bus", "SATA 3.0", "PCIe 4.0 x16", "DisplayPort 1.4"], c: 0 },
      { q: "What GPIO voltage standard does Raspberry Pi 4 Model B use?", opts: ["3.3V Logic Level", "12V Automotive Standard", "110V AC Power Line", "5V High Power Direct Drive"], c: 0 },
      { q: "Which protocol provides low-power wireless networking for IoT mesh nodes?", opts: ["Zigbee / IEEE 802.15.4", "HTTP/2 Uncompressed", "FTP Over TLS", "POP3 Mail Protocol"], c: 0 },
      { q: "What is the function of ADC (Analog-to-Digital Converter) in embedded systems?", opts: ["Convert continuous sensor voltage to digital binary values", "Amplify audio speaker signals", "Encrypt WiFi network packets", "Step-down AC supply to DC"], c: 0 },
      { q: "Which sensor measures relative humidity and environmental temperature?", opts: ["DHT22 / DHT11", "MPU6050 Gyroscope", "HC-SR04 Ultrasonic Sensor", "MQ-2 Gas Sensor"], c: 0 },
      { q: "What is Edge Computing in the context of IoT deployment?", opts: ["Processing sensor data locally near the data source", "Storing all logs exclusively in remote cloud servers", "Using curved monitor displays for dashboards", "Routing network data through satellite relays"], c: 0 },
      { q: "Which wireless frequency band is standard for LoRaWAN long-range communications in Asia/Europe?", opts: ["868 MHz / 915 MHz", "5.8 GHz WiFi", "24 GHz Radar", "60 GHz WiGig"], c: 0 },
      { q: "What type of memory is non-volatile and retains microcontroller firmware code?", opts: ["Flash Memory / EEPROM", "SRAM Cache", "DDR4 System RAM", "CPU Registers"], c: 0 },
      { q: "Which actuator converts electrical pulse signals into precise mechanical rotation steps?", opts: ["Stepper Motor", "Solid State Relay", "Solenoid Valve", "Piezoelectric Buzzer"], c: 0 },
      { q: "In Embedded Linux, what is the primary purpose of Device Tree (.dts)?", opts: ["Describe hardware topology to the OS kernel without hardcoding", "Render graphical UI animations", "Compile C++ application source files", "Manage user login passwords"], c: 0 },
      { q: "What is the maximum theoretical data transfer speed of standard I2C Fast-Mode?", opts: ["400 kbps", "10 Gbps", "100 Mbps", "1.5 Mbps"], c: 0 },
      { q: "Which hardware watchdog mechanism prevents embedded systems from freezing indefinitely?", opts: ["Watchdog Timer (WDT) reset trigger", "CPU Overclock Governor", "Thermal Throttling Fan Controller", "DMA Controller Interrupt"], c: 0 },
      { q: "What is the primary advantage of CAN bus in automotive and industrial IoT?", opts: ["High noise immunity and differential signaling", "Unlimited payload package size", "Built-in web server support", "Optical fiber transmission compatibility"], c: 0 },
      { q: "What is the purpose of PWM (Pulse Width Modulation) in microcontroller GPIO outputs?", opts: ["Vary effective voltage supply to control motor speed & LED brightness", "Increase network upload bandwidth", "Encrypt serial data transmissions", "Measure barometric pressure"], c: 0 },
      { q: "Which layer of the IoT 7-layer architecture handles sensor data acquisition?", opts: ["Perception / Sensing Layer", "Application Layer", "Business Layer", "Middleware Layer"], c: 0 },
      { q: "What does CoAP (Constrained Application Protocol) run on top of?", opts: ["UDP Protocol", "TCP Protocol", "BGP Routing", "ICMP Ping"], c: 0 },
      { q: "Which Linux command is used to inspect active serial ports connected to Raspberry Pi?", opts: ["ls /dev/tty*", "ipconfig /all", "netstat -an", "systemctl status gpio"], c: 0 },
      { q: "What is the primary function of an Optocoupler in industrial embedded circuits?", opts: ["Electrical isolation between high-voltage circuits and microcontrollers", "Audio signal synthesis", "Battery charging management", "Wireless RF signal amplification"], c: 0 },
      { q: "Which battery chemistry is most commonly used for rechargeable IoT edge nodes due to high energy density?", opts: ["Lithium Polymer (LiPo) / Li-ion", "Lead Acid", "Nickel Cadmium (NiCd)", "Zinc Air"], c: 0 },
      { q: "What does ESP32 microcontroller provide natively on-chip?", opts: ["Integrated 2.4GHz WiFi & Bluetooth Dual-Mode", "10 Gbps Ethernet Port", "GPU 3D Ray Tracing Cores", "SATA Hard Drive Interface"], c: 0 },
      { q: "Which protocol is used for securely upgrading firmware over-the-air in remote IoT devices?", opts: ["FOTA (Firmware Over-The-Air) via TLS", "FTP unencrypted", "Telnet port 23", "TFTP without authentication"], c: 0 },
      { q: "What is the purpose of a Pull-Up resistor on a microcontroller digital input pin?", opts: ["Ensure a default HIGH logic state when switch is open", "Double the clock frequency", "Block AC current ripple", "Drain static charge to ground"], c: 0 },
      { q: "In Python for Raspberry Pi, which library is widely used to control GPIO hardware pins?", opts: ["RPi.GPIO / gpiozero", "pandas", "django", "tensorflow"], c: 0 }
    ];

    const genBank = [
      { q: "Which data structure operates on a Last-In, First-Out (LIFO) principle?", opts: ["Stack", "Queue", "Linked List", "Binary Tree"], c: 0 },
      { q: "What is the time complexity of searching an element in a balanced Binary Search Tree?", opts: ["O(log N)", "O(N^2)", "O(1)", "O(N log N)"], c: 0 },
      { q: "In Database Management Systems, what does the 'A' in ACID properties stand for?", opts: ["Atomicity", "Availability", "Authentication", "Abstraction"], c: 0 },
      { q: "Which OSI layer is responsible for end-to-end packet routing and IP addressing?", opts: ["Network Layer (Layer 3)", "Physical Layer (Layer 1)", "Application Layer (Layer 7)", "Data Link Layer (Layer 2)"], c: 0 },
      { q: "What is the main purpose of Version Control Systems like Git?", opts: ["Track source code changes and collaborate across branches", "Automate CPU clock speed adjustment", "Render 3D graphics models", "Compile Java bytecode"], c: 0 },
      { q: "Which HTTP status code indicates a successful resource creation?", opts: ["201 Created", "404 Not Found", "500 Internal Server Error", "302 Found Redirect"], c: 0 },
      { q: "What is the primary role of a Load Balancer in web architecture?", opts: ["Distribute incoming network traffic across multiple servers", "Encrypt database tables on disk", "Generate CSS styling themes", "Compress JPEG images"], c: 0 },
      { q: "In Object-Oriented Programming, what is Polymorphism?", opts: ["Ability of different classes to respond to the same method call in unique ways", "Storing data in constant variables", "Compiling code to assembly", "Running multiple OS virtual machines"], c: 0 },
      { q: "Which algorithm is commonly used for finding the shortest path in a weighted graph?", opts: ["Dijkstra's Algorithm", "Bubble Sort", "Binary Search", "K-Means Clustering"], c: 0 },
      { q: "What is the function of DNS (Domain Name System) in internet networking?", opts: ["Translate domain names into IP addresses", "Protect servers against power surges", "Manage browser cookies", "Render HTML DOM elements"], c: 0 },
      { q: "Which sorting algorithm has a worst-case time complexity of O(N log N)?", opts: ["Merge Sort", "Bubble Sort", "Insertion Sort", "Selection Sort"], c: 0 },
      { q: "What is a Deadlock in operating system process synchronization?", opts: ["A state where two or more processes are blocked waiting for resources held by each other", "A CPU clock speed crash", "An invalid pointer dereference", "A network buffer overflow"], c: 0 },
      { q: "In RESTful API design, which HTTP method is idempotent for updating resources?", opts: ["PUT", "POST", "CONNECT", "TRACE"], c: 0 },
      { q: "Which memory management concept maps virtual addresses to physical RAM frames?", opts: ["Paging & Page Tables", "Garbage Collection", "Stack Allocation", "DMA Register Masking"], c: 0 },
      { q: "What is the main difference between TCP and UDP protocols?", opts: ["TCP is connection-oriented and reliable, UDP is connectionless and faster", "TCP only works on fiber optic cables", "UDP guarantees packet order delivery", "TCP operates on Layer 2"], c: 0 },
      { q: "Which design pattern ensures a class has only one single instance throughout the application?", opts: ["Singleton Pattern", "Factory Pattern", "Observer Pattern", "Strategy Pattern"], c: 0 },
      { q: "What is an Index in SQL databases used for?", opts: ["Speed up data retrieval queries at the cost of additional storage", "Prevent user login authorization", "Export tables to Excel format", "Truncate table records"], c: 0 },
      { q: "What is the purpose of Docker containers in software deployment?", opts: ["Package applications with dependencies into isolated reproducible environments", "Replace hardware CPUs", "Increase monitor refresh rate", "Scan hard drives for bad sectors"], c: 0 },
      { q: "In JavaScript, what is Closure?", opts: ["A function bundled with references to its surrounding lexical environment", "A syntax error that stops execution", "An object constructor function", "A CSS layout grid property"], c: 0 },
      { q: "What does TLS (Transport Layer Security) provide for Web HTTPS connections?", opts: ["Data encryption, integrity, and server authentication", "Automatic HTML minification", "Faster DNS lookup resolution", "FTP file compression"], c: 0 },
      { q: "Which data structure uses key-value mapping with O(1) average lookup time?", opts: ["Hash Map / Dictionary", "Array List", "Singly Linked List", "Binary Search Tree"], c: 0 },
      { q: "What is the purpose of a JWT (JSON Web Token)?", opts: ["Securely transmit claims between parties as a compact JSON object", "Store large video files on client browser", "Compile C++ code", "Manage CSS styling variables"], c: 0 },
      { q: "In Agile methodology, what is the purpose of a Daily Standup meeting?", opts: ["Quick alignment on progress, plans, and blockers", "Complete code review of all commits", "Negotiate client contract budget", "Conduct formal annual employee appraisal"], c: 0 },
      { q: "What does CI/CD stand for in DevOps practices?", opts: ["Continuous Integration & Continuous Deployment", "Central Interface & Control Device", "Code Inspection & Data Compilation", "Computer Infrastructure & Data Center"], c: 0 },
      { q: "Which Cloud Computing model provides virtual machines and storage infrastructure (e.g. AWS EC2)?", opts: ["IaaS (Infrastructure as a Service)", "SaaS (Software as a Service)", "PaaS (Platform as a Service)", "FaaS (Function as a Service)"], c: 0 }
    ];

    const bank = (titleLower.includes('iot') || titleLower.includes('embedded') || titleLower.includes('raspberry') || titleLower.includes('sensor')) ? iotBank : genBank;

    const questions = [];
    for (let i = 0; i < 25; i++) {
      const item = bank[i % bank.length];
      questions.push({
        id: i + 1,
        question: `${isMid ? 'Mid-Exam' : 'Final Assessment'} Q${i + 1}: ${item.q}`,
        options: item.opts,
        correctAnswer: item.c,
        marks: 1
      });
    }

    return questions;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    let parsedUser = JSON.parse(storedUser);
    if (parsedUser.role === 'admin') {
      navigate('/admin');
      return;
    }

    // Sync latest user details from registeredUsers (local backup fallback)
    const storedUsersRaw = localStorage.getItem('registeredUsers');
    if (storedUsersRaw) {
      try {
        const registeredUsers = JSON.parse(storedUsersRaw);
        const match = registeredUsers.find(u => 
          (u.email && parsedUser.email && u.email.toLowerCase() === parsedUser.email.toLowerCase()) ||
          (u._id && parsedUser._id && String(u._id) === String(parsedUser._id))
        );
        if (match) {
          parsedUser = { ...parsedUser, ...match };
        }
      } catch (e) {
        console.warn('Error reading registeredUsers:', e);
      }
    }

    setUser(parsedUser);
    setProfileForm(parsedUser);

    // Fetch dynamic profile from backend if email is available
    if (parsedUser.email) {
      fetch(`/api/users/profile?email=${encodeURIComponent(parsedUser.email.toLowerCase())}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Server error');
        })
        .then(data => {
          if (data.success && data.user) {
            setUser(data.user);
            setProfileForm(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        })
        .catch(err => {
          console.warn('Could not sync user profile from server:', err.message);
        });
    }
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
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

    try {
      await fetch(`/api/users/profile?email=${encodeURIComponent(profileForm.email.toLowerCase())}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
    } catch (err) {
      console.warn('Could not sync updated profile to backend server:', err.message);
    }

    setIsEditingProfile(false);
    triggerToast('✦ Profile details updated successfully!');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Courses', icon: <BookOpen size={20} /> },
    { name: 'Certificates', icon: <Award size={20} /> },
    { name: 'Messages', icon: <MessageSquare size={20} /> },
    { name: 'Profile', icon: <User size={20} /> },
  ];
  const [allCoursesData, setAllCoursesData] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activeQuizModal, setActiveQuizModal] = useState(null); // 'mid' | 'final' | null
  const [activePptViewerModal, setActivePptViewerModal] = useState(null);
  const [videoWatchProgress, setVideoWatchProgress] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [isRetakingQuiz, setIsRetakingQuiz] = useState(false);

  // Helper: Verify if a course is active and published
  const isCoursePublished = (course) => {
    if (!course) return false;
    if (course.is_active === false || course.approval_status === false) return false;
    if (course.isPublished === false || course.status === 'draft') return false;
    return true;
  };

  // Helper: Verify if a course is assigned to the current student (or student's department/college/all)
  const isCourseAssignedToUser = (course, currentUser) => {
    if (!course || !currentUser) return false;
    
    const courseCode = String(course.course_unique_code || course.course_id || course.id || course.title || '').trim().toLowerCase();
    const courseTitle = String(course.title || course.name || course.course_name || '').trim().toLowerCase();

    const userAssigned = Array.isArray(currentUser.assignedCourses) ? currentUser.assignedCourses : [];
    const userMainCode = currentUser.course_unique_code ? String(currentUser.course_unique_code).trim().toLowerCase() : '';

    // 1. If user has explicit assignedCourses list
    if (userAssigned.length > 0) {
      return userAssigned.some(ac => {
        const codeStr = String(ac).trim().toLowerCase();
        return codeStr === courseCode || codeStr === courseTitle || (courseCode && codeStr.includes(courseCode)) || (courseTitle && codeStr.includes(courseTitle));
      });
    }

    // 2. If user has a main course_unique_code assigned
    if (userMainCode) {
      return userMainCode === courseCode || userMainCode === courseTitle;
    }

    // 3. If user explicitly has assignedCourses = [] (no courses assigned)
    if (Array.isArray(currentUser.assignedCourses) && currentUser.assignedCourses.length === 0) {
      return false;
    }

    // 4. Fallback: check target scope (all / college / department / individual)
    const targetScope = String(course.autoAssignTo || course.assignedTo || course.targetMode || 'all').toLowerCase();
    const targetCollege = String(course.autoAssignCollege || course.targetCollege || 'ALL').trim().toUpperCase();
    const targetDept = String(course.autoAssignDept || course.targetDept || 'ALL').trim().toUpperCase();
    const userCollege = String(currentUser.college || '').trim().toUpperCase();
    const userDept = String(currentUser.department || '').trim().toUpperCase();

    if (targetScope === 'all') {
      return true;
    } else if (targetScope === 'college') {
      return targetCollege === 'ALL' || targetCollege === userCollege;
    } else if (targetScope === 'department') {
      const matchesCollege = targetCollege === 'ALL' || targetCollege === userCollege;
      const matchesDept = targetDept === 'ALL' || targetDept === userDept;
      return matchesCollege && matchesDept;
    } else if (targetScope === 'individual') {
      const targetEmails = (course.autoAssignStudents || course.selectedStudentEmails || []).map(e => String(e).toLowerCase());
      return targetEmails.includes(String(currentUser.email || '').toLowerCase());
    }

    return true;
  };

  useEffect(() => {
    const fetchUserCourses = async () => {
      const localCoursesRaw = localStorage.getItem('createdCourses');
      const localCourses = localCoursesRaw ? JSON.parse(localCoursesRaw) : [];
      const localMapped = localCourses.map((c, idx) => ({
        id: c.course_unique_code || c.id || idx,
        course_unique_code: c.course_unique_code || c.id || `COURSE-${idx}`,
        title: c.course_name || c.title,
        category: c.category || 'General',
        image: c.course_image_url || c.image,
        progress: c.progress || 0,
        lessons: '12 Videos & 12 PPTs',
        color: '#3B82F6',
        icon: <Code2 size={22} color="#3B82F6" />,
        status: c.status || 'progress',
        is_active: c.is_active !== undefined ? c.is_active : true,
        approval_status: c.approval_status !== undefined ? c.approval_status : true,
        videos: c.videos || Array.from({ length: 12 }, (_, i) => `Video #${i + 1}: ${c.course_name || c.title} Module ${i + 1}`),
        ppts: c.ppts || Array.from({ length: 12 }, (_, i) => `PPT #${i + 1}: ${c.course_name || c.title} Slides ${i + 1}`),
        pptsNames: c.pptsNames || [],
        midQuiz: c.midQuiz,
        finalQuiz: c.finalQuiz,
        midQuizPassed: false,
        finalQuizPassed: false,
        completedVideos: c.completedVideos || 0
      }));

      try {
        const userId = user?.email || user?.user_unique_id || 'student_123';
        let serverProgressMap = {};
        try {
          const progRes = await fetch(`/api/user/progress?user_unique_id=${encodeURIComponent(userId)}`);
          if (progRes.ok) {
            const progData = await progRes.json();
            if (progData.user_progress && Array.isArray(progData.user_progress)) {
              progData.user_progress.forEach(p => {
                serverProgressMap[p.course_unique_code] = p;
              });
            }
          }
        } catch {
          // ignore
        }

        const localProgressRaw = localStorage.getItem('userCourseProgress') || '{}';
        const localProgressMap = JSON.parse(localProgressRaw);

        const res = await fetch('/lms/client/courses/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || 'sm_nm_token_2026'}`
          }
        });
        let finalCourses = [];

        if (res.ok) {
          const data = await res.json();
          if (data.success || data.courses_list) {
            const list = data.courses_list || data.courses || [];
            const apiMapped = list.map((c, idx) => ({
              id: c.course_id || c._id || c.id || idx,
              course_unique_code: c.course_id || c.course_unique_code || `COURSE-${idx}`,
              title: c.name || c.course_name || c.title,
              category: c.category || 'General',
              image: c.course_image_url || c.image,
              progress: c.progress || 0,
              lessons: '12 Videos & 12 PPTs',
              color: '#3B82F6',
              icon: <Code2 size={22} color="#3B82F6" />,
              status: c.status || 'progress',
              is_active: c.course_status !== undefined ? c.course_status : (c.is_active !== undefined ? c.is_active : true),
              approval_status: c.approval_status !== undefined ? c.approval_status : true,
              videos: c.videos || Array.from({ length: 12 }, (_, i) => `Video #${i + 1}: ${c.name || c.title} Module ${i + 1}`),
              ppts: c.ppts || Array.from({ length: 12 }, (_, i) => `PPT #${i + 1}: ${c.name || c.title} Slides ${i + 1}`),
              pptsNames: c.pptsNames || [],
              midQuiz: c.midQuiz,
              finalQuiz: c.finalQuiz,
              midQuizPassed: false,
              finalQuizPassed: false,
              completedVideos: c.completedVideos || 0
            }));

            const localMap = new Map(localMapped.map(c => [c.course_unique_code || c.title, c]));
            const mergedApi = apiMapped.map(apiCourse => {
              const code = apiCourse.course_unique_code || apiCourse.title;
              const local = localMap.get(code);
              if (local) {
                return {
                  ...apiCourse,
                  videos: (local.videos && local.videos.some(v => v && (v.startsWith('data:') || v.startsWith('/courses/')))) ? local.videos : apiCourse.videos,
                  ppts: (local.ppts && local.ppts.some(p => p && (p.startsWith('data:') || p.startsWith('/courses/')))) ? local.ppts : apiCourse.ppts,
                  midQuiz: local.midQuiz || apiCourse.midQuiz,
                  finalQuiz: local.finalQuiz || apiCourse.finalQuiz
                };
              }
              return apiCourse;
            });

            const apiCodes = new Set(apiMapped.map(c => c.course_unique_code || c.title));
            const uniqueLocal = localMapped.filter(c => !apiCodes.has(c.course_unique_code || c.title));
            finalCourses = [...mergedApi, ...uniqueLocal];
          } else if (localMapped.length > 0) {
            finalCourses = localMapped;
          }
        } else if (localMapped.length > 0) {
          finalCourses = localMapped;
        }

        // Apply saved user progress (from server or local map) to all courses
        const hydratedCourses = finalCourses.map(c => {
          const code = c.course_unique_code || c.id;
          const progKey = `${userId}_${code}`;
          const savedProg = serverProgressMap[code] || localProgressMap[progKey];
          if (savedProg) {
            return {
              ...c,
              progress: savedProg.progress_percentage !== undefined ? Number(savedProg.progress_percentage) : (c.progress || 0),
              completedVideos: savedProg.completedVideos !== undefined ? Number(savedProg.completedVideos) : (c.completedVideos || 0),
              midQuizPassed: savedProg.midQuizPassed !== undefined ? Boolean(savedProg.midQuizPassed) : (c.midQuizPassed || false),
              midQuizScore: savedProg.midQuizScore !== undefined ? Number(savedProg.midQuizScore) : (c.midQuizScore || 0),
              finalQuizPassed: savedProg.finalQuizPassed !== undefined ? Boolean(savedProg.finalQuizPassed) : (c.finalQuizPassed || false),
              finalQuizScore: savedProg.finalQuizScore !== undefined ? Number(savedProg.finalQuizScore) : (c.finalQuizScore || 0),
              status: (savedProg.course_complete === 'true' || savedProg.course_complete === true || Number(savedProg.progress_percentage) === 100) ? 'completed' : 'progress'
            };
          }
          return c;
        });

        // Determine current user data
        let latestUser = user;
        const storedUsersRaw = localStorage.getItem('registeredUsers');
        if (storedUsersRaw) {
          try {
            const registeredUsers = JSON.parse(storedUsersRaw);
            const match = registeredUsers.find(u => 
              (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
              (u._id && user._id && String(u._id) === String(user._id))
            );
            if (match) latestUser = { ...user, ...match };
          } catch {}
        }

        // Filter courses: ONLY show courses that are PUBLISHED AND ASSIGNED to this student/department/college/all
        const visibleCourses = hydratedCourses.filter(c => isCoursePublished(c) && isCourseAssignedToUser(c, latestUser));
        setAllCoursesData(visibleCourses);
      } catch {
        if (localMapped.length > 0) {
          let latestUser = user;
          const storedUsersRaw = localStorage.getItem('registeredUsers');
          if (storedUsersRaw) {
            try {
              const registeredUsers = JSON.parse(storedUsersRaw);
              const match = registeredUsers.find(u => 
                (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
                (u._id && user._id && String(u._id) === String(user._id))
              );
              if (match) latestUser = { ...user, ...match };
            } catch {}
          }
          const visibleCourses = localMapped.filter(c => isCoursePublished(c) && isCourseAssignedToUser(c, latestUser));
          setAllCoursesData(visibleCourses);
        }
      }
    };
    fetchUserCourses();
  }, [user]);

  const sendProgressUpdate = async (courseCode, percentage, isComplete = false, extraData = {}) => {
    try {
      const userId = user?.email || user?.user_unique_id || 'student_123';
      const payload = {
        user_unique_id: userId,
        course_unique_code: courseCode,
        progress_percentage: String(percentage),
        course_complete: String(isComplete),
        assessment_status: String(extraData.assessment_status ?? (activeCourse?.finalQuizPassed || isComplete)),
        certificate_issued: String(extraData.certificate_issued ?? (percentage === 100)),
        completedVideos: extraData.completedVideos ?? activeCourse?.completedVideos ?? 0,
        midQuizPassed: extraData.midQuizPassed ?? activeCourse?.midQuizPassed ?? false,
        midQuizScore: extraData.midQuizScore ?? activeCourse?.midQuizScore ?? 0,
        finalQuizPassed: extraData.finalQuizPassed ?? activeCourse?.finalQuizPassed ?? false,
        finalQuizScore: extraData.finalQuizScore ?? activeCourse?.finalQuizScore ?? 0
      };
      if (extraData.total_score) {
        payload.total_score = String(extraData.total_score);
      }

      // 1. Save to local storage map for instant offline recovery
      const localProgressRaw = localStorage.getItem('userCourseProgress') || '{}';
      const localProgressMap = JSON.parse(localProgressRaw);
      localProgressMap[`${userId}_${courseCode}`] = payload;
      localStorage.setItem('userCourseProgress', JSON.stringify(localProgressMap));

      // 2. Send POST to backend user tracking route (which syncs to NM portal)
      await fetch('/api/v1/lms/client/course/xf/user-tracking', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'sm_nm_token_2026'}`
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Progress sync error:', err);
    }
  };

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
          <img src={tnskillLogo} alt="TNSkill Logo" className="db-sidebar-logo" />
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
              <h2>Welcome, {user.fullName || 'Student'} 🎓</h2>
              <p>Keep learning, keep growing — Tamil Nadu Skill Development</p>
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
                    triggerToast(`▶ Searching courses for "${searchQuery}"`);
                  }
                }}
              />
            </div>

            <button 
              className="control-btn notification-btn"
              onClick={() => {
                setActiveTab('Messages');
                triggerToast('🔔 Displaying your notifications');
              }}
            >
              <Bell size={20} />
            </button>

            <div className="db-user-dropdown" onClick={() => { setActiveTab('Profile'); setProfileForm(user); }}>
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile Avatar" 
                  className="user-avatar-img" 
                />
              ) : (
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--primary-red)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '16px'
                }}>
                  {(user.fullName || 'S').charAt(0).toUpperCase()}
                </div>
              )}
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
                    <h3>{allCoursesData.length}</h3>
                    <p>Enrolled Courses</p>
                  </div>
                </div>

                <div className="db-stat-card" style={{ cursor: 'pointer' }} onClick={() => { setActiveTab('My Courses'); setCourseFilter('completed'); }}>
                  <div className="stat-icon-container book-bg">
                    <BookOpenCheck size={24} className="stat-icon-book" />
                  </div>
                  <div className="stat-text-info">
                    <h3>{allCoursesData.filter(c => c.progress === 100).length}</h3>
                    <p>Completed Courses</p>
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
                        Explore quality courses, complete exams and achieve your goals.
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
                      {allCoursesData.length > 0 ? (
                        <div className="course-progress-info">
                          <div className="course-logo-circle">
                            <Code2 size={22} color="#3B82F6" />
                          </div>
                          <div className="course-details-wrap">
                            <h4>{allCoursesData[0].title}</h4>
                            <span className="course-sub-label">Course Progress</span>
                            <div className="progress-bar-container">
                              <div className="progress-bar-filled" style={{ width: `${allCoursesData[0].progress}%` }}></div>
                            </div>
                            <div className="progress-meta-text">
                              <span>{allCoursesData[0].lessons}</span>
                              <span className="percentage-text">{allCoursesData[0].progress}%</span>
                            </div>
                          </div>
                          <button className="btn-continue-learning" onClick={() => { setActiveTab('My Courses'); triggerToast(`▶ Resuming ${allCoursesData[0].title}...`); }}>Continue Learning</button>
                        </div>
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                          No active courses assigned yet. Check back soon!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Announcements */}
                  <div className="db-announcements-widget">
                    <div className="widget-header">
                      <h3>Recent Announcements</h3>
                      <button className="widget-view-all" onClick={() => setActiveTab('Messages')}>View All</button>
                    </div>

                    <div className="announcements-list">
                      <div className="announcement-item" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('Messages')}>
                        <div className="announcement-icon-circle icon-blue">
                          <Megaphone size={18} />
                        </div>
                        <div className="announcement-text-details">
                          <h4>Welcome to TNSkill Platform</h4>
                          <p>Welcome to the learning management portal. Stay tuned for course updates and exams.</p>
                          <span className="announcement-time-stamp">Just now</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="grid-right-col">
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
                  <button className={`tab-pill ${courseFilter === 'progress' ? 'active' : ''}`} onClick={() => setCourseFilter('progress')}>In Progress ({allCoursesData.filter(c => c.progress < 100).length})</button>
                  <button className={`tab-pill ${courseFilter === 'completed' ? 'active' : ''}`} onClick={() => setCourseFilter('completed')}>Completed ({allCoursesData.filter(c => c.progress === 100).length})</button>
                </div>
              </div>
              <div className="courses-cards-grid">
                {filteredCourses.map(course => (
                  <div key={course.id} className="custom-course-card">
                    {/* Course Cover Image Banner Header */}
                    <div className="ccc-image-banner">
                      <img 
                        src={course.image || course.course_image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60'} 
                        alt={course.title} 
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div className="ccc-banner-overlay">
                        <span style={{ background: 'rgba(15, 23, 42, 0.85)', color: '#38bdf8', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, backdropFilter: 'blur(8px)', border: '1px solid rgba(56, 189, 248, 0.3)', textTransform: 'uppercase' }}>
                          {course.category}
                        </span>
                      </div>
                    </div>

                    {/* Course Card Body */}
                    <div className="ccc-body-content">
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>{course.title}</h4>
                      <div className="ccc-progress-wrap">
                        <div className="ccc-bar-bg" style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div className="ccc-bar-fill" style={{ width: `${course.progress}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                        </div>
                        <div className="ccc-meta-info" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                          <span>▶ {course.lessons}</span>
                          <strong style={{ color: '#2563eb', fontWeight: 700 }}>{course.progress}% Completed</strong>
                        </div>
                      </div>
                      <button 
                        className="btn-ccc-action"
                        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#38bdf8', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={async () => {
                          const videos = course.videos || [];
                          const maxIdx = Math.max(0, videos.length - 1);
                          const startIdx = Math.min(course.completedVideos || 0, maxIdx);
                          
                          // 1. TNSkill Integration: Subscribe to Course if not yet subscribed
                          const token = localStorage.getItem('token') || '';
                          const subKey = `sub_${course.course_unique_code || course.id}`;
                          if (!localStorage.getItem(subKey)) {
                            try {
                              const subRes = await fetch('/api/student/subscribe', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                  user_id: user.email || user.user_unique_id || 'student_123',
                                  course_id: course.course_unique_code || course.id,
                                  student_name: user.fullName || 'Student',
                                  college_code: user.college_code || '1792',
                                  college_name: user.college || 'abc college',
                                  branch_name: user.department || 'computer science',
                                  district: user.district || 'chennai',
                                  university: user.university || 'anna university'
                                })
                              });
                              const subData = await subRes.json();
                              if (subData.subscription_reference_id) {
                                localStorage.setItem(subKey, subData.subscription_reference_id);
                              }
                            } catch (err) {
                              console.error('Subscription error:', err);
                            }
                          }

                          // 2. TNSkill Integration: Log Course Access
                          try {
                            await fetch('/api/student/course-access', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                user_id: user.email || user.user_unique_id || 'student_123',
                                course_id: course.course_unique_code || course.id,
                                student_name: user.fullName || 'Student',
                                college_code: user.college_code || '1792',
                                college_name: user.college || 'abc college',
                                branch_name: user.department || 'computer science',
                                district: user.district || 'chennai',
                                university: user.university || 'anna university'
                              })
                            });
                          } catch (err) {
                            console.error('Access logging error:', err);
                          }

                          setActiveCourse(course);
                          setCurrentVideoIndex(startIdx);
                          setActiveQuizModal(null);
                          setQuizAnswers({});
                          setQuizResult(null);
                        }}
                      >
                        {course.progress === 100 ? '✦ Review Course Workspace' : '▶ Open Course Workspace →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ACTIVE COURSE LEARNING WORKSPACE MODAL */}
              {activeCourse && (
                <div className="admin-modal-overlay" onClick={() => setActiveCourse(null)} style={{ zIndex: 1000, background: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(4px)' }}>
                  <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '940px', width: '92%', background: 'var(--bg-card)', color: 'var(--text-dark)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--accent-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎓</div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)', margin: 0, letterSpacing: '-0.3px' }}>
                          {activeCourse.title}
                        </h3>
                      </div>
                      <button 
                        onClick={() => setActiveCourse(null)}
                        style={{ background: 'var(--bg-body)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '18px', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Overall Course Progress Header */}
                    <div style={{ marginBottom: '20px', background: 'var(--bg-body)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-soft)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        <span>⚡ Course Completion Progress</span>
                        <span style={{ color: 'var(--accent)' }}>{activeCourse.progress}% Mastered</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${activeCourse.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), #8b5cf6)', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                      </div>
                    </div>

                    <div className="db-workspace-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                      {/* Video Player & PPT Area */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
                          <video
                            id="studentCourseVideoPlayer"
                            controls
                            autoPlay
                            key={`${activeCourse.id}_vid_${currentVideoIndex}`}
                            poster="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80"
                            style={{ width: '100%', height: '260px', borderRadius: 'var(--radius-md)', background: '#000', objectFit: 'contain' }}
                            onTimeUpdate={(e) => {
                              if (e.target.duration > 0) {
                                const pct = Math.floor((e.target.currentTime / e.target.duration) * 100);
                                setVideoWatchProgress(pct);

                                // Auto mark completed in checklist & course progress when 75% reached!
                                if (pct >= 75 && currentVideoIndex >= activeCourse.completedVideos) {
                                  const newComp = currentVideoIndex + 1;
                                  const newProgress = Math.min(100, Math.round((newComp / 12) * 100));
                                  const updatedCourse = {
                                    ...activeCourse,
                                    completedVideos: newComp,
                                    progress: newProgress
                                  };
                                  setActiveCourse(updatedCourse);
                                  setAllCoursesData(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
                                  sendProgressUpdate(updatedCourse.course_unique_code, newProgress, newProgress === 100);
                                }
                              }
                            }}
                            onEnded={() => {
                              setVideoWatchProgress(100);
                            }}
                            onError={(e) => {
                              // Don't load fake videos — just pause and show nothing
                              e.target.removeAttribute('src');
                              e.target.load();
                            }}
                            src={
                              (() => {
                                const currentVid = activeCourse.videos?.[currentVideoIndex];
                                if (currentVid && typeof currentVid === 'string') {
                                  if (
                                    currentVid.startsWith('http') ||
                                    currentVid.startsWith('data:video') ||
                                    currentVid.startsWith('/courses/') ||
                                    currentVid.startsWith('/api/')
                                  ) {
                                    return currentVid;
                                  }
                                }
                                // No valid video URL — return empty so the browser shows nothing
                                return '';
                              })()
                            }
                          >
                            Your browser does not support HTML5 video.
                          </video>

                          <div className="db-flex-responsive" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-dark)', fontWeight: 800 }}>
                                  Module #{currentVideoIndex + 1} Video Stream
                                </h4>
                                <span 
                                  title={videoWatchProgress >= 75 || currentVideoIndex < activeCourse.completedVideos ? "75%+ Watched (Lesson Unlocked)" : `Watch Progress: ${videoWatchProgress}% (75% Required)`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: videoWatchProgress >= 75 || currentVideoIndex < activeCourse.completedVideos ? '#dcfce7' : '#fef3c7',
                                    color: videoWatchProgress >= 75 || currentVideoIndex < activeCourse.completedVideos ? '#15803d' : '#b45309',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    border: videoWatchProgress >= 75 || currentVideoIndex < activeCourse.completedVideos ? '1px solid #bbf7d0' : '1px solid #fde68a'
                                  }}
                                >
                                  <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: videoWatchProgress >= 75 || currentVideoIndex < activeCourse.completedVideos ? '#22c55e' : '#f59e0b'
                                  }}></span>
                                  {currentVideoIndex < activeCourse.completedVideos || videoWatchProgress >= 75 ? 'Ready' : `${videoWatchProgress}%`}
                                </span>
                              </div>
                              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)' }}>
                                {(activeCourse.videos && activeCourse.videos[currentVideoIndex] && !activeCourse.videos[currentVideoIndex].startsWith('data:')) ? activeCourse.videos[currentVideoIndex] : `Lesson Video ${currentVideoIndex + 1}`}
                              </p>
                            </div>
                            <button 
                              style={{ background: (videoWatchProgress >= 75 || currentVideoIndex < activeCourse.completedVideos) ? 'linear-gradient(135deg, var(--accent), #8b5cf6)' : 'var(--bg-body)', color: (videoWatchProgress >= 75 || currentVideoIndex < activeCourse.completedVideos) ? '#fff' : 'var(--text-muted)', border: (videoWatchProgress >= 75 || currentVideoIndex < activeCourse.completedVideos) ? 'none' : '1px solid var(--border)', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: (videoWatchProgress >= 75 || currentVideoIndex < activeCourse.completedVideos) ? '0 4px 12px rgba(90,63,192,0.25)' : 'none', transition: 'all 0.2s' }}
                              onClick={() => {
                                // Enforce 75% video watching rule for uncompleted videos
                                if (currentVideoIndex >= activeCourse.completedVideos && videoWatchProgress < 75) {
                                  triggerToast(`⚠️ Please watch at least 75% of Video #${currentVideoIndex + 1} to complete! (Current: ${videoWatchProgress}%)`, 'error');
                                  return;
                                }

                                const nextVid = currentVideoIndex + 1;
                                if (nextVid === 6 && !activeCourse.midQuizPassed) {
                                  setActiveQuizModal('mid');
                                  triggerToast('📝 You have reached Video 6! Please pass the Mid-Course Quiz to unlock Video 7.');
                                  return;
                                }
                                if (nextVid === 12 && !activeCourse.finalQuizPassed) {
                                  setActiveQuizModal('final');
                                  triggerToast('🏆 You have finished all 12 Videos! Complete the Final Quiz for Certification.');
                                  return;
                                }

                                // If the user jumped to a higher video (e.g. video 5) and marks it completed,
                                // we complete all intermediate videos as well (videos 1, 2, 3, 4, 5).
                                const newComp = Math.max(activeCourse.completedVideos, nextVid);
                                const newProgress = Math.min(100, Math.round((newComp / 12) * 100));
                                const updatedCourse = {
                                  ...activeCourse,
                                  completedVideos: newComp,
                                  progress: newProgress
                                };
                                setActiveCourse(updatedCourse);
                                setAllCoursesData(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
                                sendProgressUpdate(updatedCourse.course_unique_code, newProgress, newProgress === 100);

                                setVideoWatchProgress(0);
                                if (nextVid < 12) {
                                  setCurrentVideoIndex(nextVid);
                                  triggerToast(`▶ Completed Video ${currentVideoIndex + 1}. Playing Video ${nextVid + 1}`);
                                } else {
                                  triggerToast('🎉 All videos completed!');
                                }
                              }}
                            >
                              Mark Video {currentVideoIndex + 1} Completed & Next →
                            </button>
                          </div>
                        </div>

                        {/* PPT Download for Current Module */}
                        <div className="db-flex-responsive" style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                          <div>
                            <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ background: 'var(--accent-light)', padding: '6px', borderRadius: '8px' }}>📊</span> 
                              Module #{currentVideoIndex + 1} Presentation Deck
                            </span>
                            <p style={{ margin: '4px 0 0 36px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                              {(activeCourse.pptsNames && activeCourse.pptsNames[currentVideoIndex]) || `Module_${currentVideoIndex + 1}_Slides.pptx`}
                            </p>
                          </div>
                          <div>
                            <button 
                              style={{ background: 'var(--white)', color: 'var(--text-dark)', border: '1.5px solid var(--border)', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: 'var(--shadow-xs)' }}
                              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dark)'; }}
                              onClick={() => {
                                const pptData = activeCourse.ppts && activeCourse.ppts[currentVideoIndex];
                                const pptName = (activeCourse.pptsNames && activeCourse.pptsNames[currentVideoIndex]) || `${activeCourse.title}_Module_${currentVideoIndex + 1}.pptx`;
                                handleDownloadPPT(activeCourse.title, currentVideoIndex, pptData, pptName, activeCourse.course_unique_code);
                                triggerToast(`📥 Successfully downloaded PPT Presentation #${currentVideoIndex + 1}!`);
                              }}
                            >
                              📥 Download PPT
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Video & Quiz Navigation Sidebar */}
                      <div style={{ height: '410px', overflowY: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-dark)', fontWeight: 800 }}>12 Module Checklist</h4>
                        {Array.from({ length: 12 }).map((_, idx) => {
                          const isQuizLocked = idx > 6 && !activeCourse.midQuizPassed;
                          const isVideoLocked = idx > activeCourse.completedVideos;
                          const isLocked = isQuizLocked || isVideoLocked;
                          const isCurrent = idx === currentVideoIndex;
                          const isDone = idx < activeCourse.completedVideos;

                          return (
                            <div key={idx}>
                              <button
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '12px 14px',
                                  marginBottom: '8px',
                                  borderRadius: '10px',
                                  border: isDone ? '1px solid #10b981' : isCurrent ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                                  fontSize: '13px',
                                  cursor: isLocked ? 'not-allowed' : 'pointer',
                                  background: isDone ? '#ecfdf5' : isCurrent ? 'var(--accent-light)' : 'var(--white)',
                                  color: isDone ? '#059669' : isCurrent ? 'var(--accent)' : isLocked ? 'var(--text-muted)' : 'var(--text-secondary)',
                                  fontWeight: (isDone || isCurrent) ? 700 : 500,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  transition: 'all 0.2s'
                                }}
                                disabled={isLocked}
                                onClick={() => {
                                  if (isLocked) return;
                                  setCurrentVideoIndex(idx);
                                  if (idx < activeCourse.completedVideos) {
                                    setVideoWatchProgress(100);
                                  } else {
                                    setVideoWatchProgress(0);
                                  }
                                  triggerToast(`▶ Now playing Video #${idx + 1}`);
                                }}
                              >
                                <span>{isDone ? `✓ Video #${idx + 1}` : isCurrent ? `▶ Playing Video #${idx + 1}` : `Video #${idx + 1}`}</span>
                                {isLocked && <span style={{ fontSize: '10px', color: '#64748b' }}>🔒 Locked</span>}
                              </button>

                              {/* Mid-Course Quiz Trigger Box */}
                              {idx === 5 && (
                                <button
                                  style={{
                                    width: '100%',
                                    margin: '2px 0 10px 0',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: activeCourse.midQuizPassed ? '1px solid #10b981' : '1px solid #f59e0b',
                                    background: activeCourse.midQuizPassed ? '#ecfdf5' : '#fffbeb',
                                    color: activeCourse.midQuizPassed ? '#059669' : '#d97706',
                                    fontSize: '12.5px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onClick={() => {
                                    setActiveQuizModal('mid');
                                    setQuizAnswers({});
                                    setQuizResult(null);
                                    setIsRetakingQuiz(false);
                                  }}
                                >
                                  📝 {activeCourse.midQuizPassed ? '✓ Mid Quiz Passed' : 'Take Mid-Course Quiz (Req.)'}
                                </button>
                              )}

                              {/* Final Quiz Trigger Button after Video 12 */}
                              {idx === 11 && (
                                <button
                                  style={{
                                    width: '100%',
                                    margin: '2px 0 10px 0',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: activeCourse.finalQuizPassed ? '1px solid #10b981' : '1px solid var(--accent)',
                                    background: activeCourse.finalQuizPassed ? '#ecfdf5' : 'var(--accent-light)',
                                    color: activeCourse.finalQuizPassed ? '#059669' : 'var(--accent)',
                                    fontSize: '12.5px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onClick={() => {
                                    setActiveQuizModal('final');
                                    setQuizAnswers({});
                                    setQuizResult(null);
                                    setIsRetakingQuiz(false);
                                  }}
                                >
                                  🏆 {activeCourse.finalQuizPassed ? '✓ Final Quiz Passed' : 'Take Final Assessment Quiz'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 25 QUESTIONS FORMATTED QUIZ PAPER MODAL (25 MARKS TOTAL) */}
              {activeQuizModal && (
                <div className="admin-modal-overlay" onClick={() => setActiveQuizModal(null)}>
                  <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px', maxHeight: '85vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                        {activeQuizModal === 'mid' ? '📝 Mid-Course Examination Paper (After Video 6)' : '🏆 Final Assessment Examination Paper (After Video 12)'}
                      </h3>
                      <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                        25 Questions • 25 Marks Total
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                      Each question carries 1 Mark. Minimum passing score is 13 / 25 Marks (50%).
                    </p>

                    {/* Previously Passed Quiz Score Banner & Retake Trigger */}
                    {((activeQuizModal === 'mid' && activeCourse.midQuizPassed) || (activeQuizModal === 'final' && activeCourse.finalQuizPassed)) && (
                      <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#15803d', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 700 }}>🏆 Previously Submitted High Score & Result</span>
                          <div style={{ fontSize: '12px', marginTop: '2px', color: '#166534' }}>
                            Highest Score: <strong>{activeQuizModal === 'mid' ? (activeCourse.midQuizScore || 24) : (activeCourse.finalQuizScore || 25)} / 25 Marks</strong> ({Math.round(((activeQuizModal === 'mid' ? (activeCourse.midQuizScore || 24) : (activeCourse.finalQuizScore || 25)) / 25) * 100)}%) • Passed ✓
                          </div>
                        </div>
                        <button
                          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => {
                            setIsRetakingQuiz(true);
                            setQuizAnswers({});
                            setQuizResult(null);
                            triggerToast('🔄 Retake mode enabled! Choose your new answers below.');
                          }}
                        >
                          🔄 Retake Quiz / Try Again
                        </button>
                      </div>
                    )}

                    {(() => {
                      const quizObj = activeQuizModal === 'mid' ? activeCourse.midQuiz : activeCourse.finalQuiz;
                      const qList = (quizObj && quizObj.questions && quizObj.questions.length > 0)
                        ? quizObj.questions
                        : generateQuizQuestionsForCourse(activeCourse.title, activeQuizModal);
                      const isReviewingPassedQuiz = ((activeQuizModal === 'mid' && activeCourse.midQuizPassed) || (activeQuizModal === 'final' && activeCourse.finalQuizPassed)) && !isRetakingQuiz;

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                          {qList.map((q, qIdx) => {
                            const correctOptIndex = q.correctAnswer ?? (qIdx % 4);

                            return (
                              <div key={qIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: '8px' }}>
                                  Q{qIdx + 1}. {q.question} <span style={{ float: 'right', fontSize: '11px', color: '#64748b', fontWeight: 500 }}>(1 Mark)</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                  {q.options.map((opt, optIdx) => {
                                    const isCorrect = isReviewingPassedQuiz && optIdx === correctOptIndex;
                                    const isSelected = isReviewingPassedQuiz ? isCorrect : (quizAnswers[qIdx] === optIdx);

                                    return (
                                      <label 
                                        key={optIdx} 
                                        style={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'space-between',
                                          gap: '8px', 
                                          fontSize: '12px', 
                                          background: isCorrect ? '#dcfce7' : '#ffffff', 
                                          border: isCorrect ? '1.5px solid #22c55e' : '1px solid #cbd5e1', 
                                          color: isCorrect ? '#15803d' : '#334155',
                                          fontWeight: isCorrect ? 700 : 400,
                                          padding: '8px 10px', 
                                          borderRadius: '6px', 
                                          cursor: isReviewingPassedQuiz ? 'default' : 'pointer' 
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <input 
                                            type="radio" 
                                            name={`q_${qIdx}`} 
                                            disabled={isReviewingPassedQuiz}
                                            checked={isSelected}
                                            onChange={() => {
                                              if (!isReviewingPassedQuiz) {
                                                setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx });
                                              }
                                            }}
                                          />
                                          <span>{opt}</span>
                                        </div>
                                        {isCorrect && <span style={{ fontSize: '10px', background: '#166534', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>✓ Correct Answer</span>}
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {quizResult && (
                      <div style={{ padding: '14px', background: quizResult.passed ? '#f0fdf4' : '#fef2f2', border: `1px solid ${quizResult.passed ? '#bbf7d0' : '#fecaca'}`, color: quizResult.passed ? '#15803d' : '#b91c1c', borderRadius: '8px', marginBottom: '15px', fontWeight: 600, fontSize: '13px' }}>
                        <div>{quizResult.msg}</div>
                        <div style={{ fontSize: '13px', marginTop: '6px' }}>
                          Evaluated Score: <strong>{quizResult.score} / 25 Marks</strong> ({Math.round((quizResult.score / 25) * 100)}%)
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', sticky: 'bottom', background: '#fff', paddingTop: '10px' }}>
                      <button 
                        style={{ background: '#cbd5e1', color: '#334155', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => setActiveQuizModal(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        style={{ background: 'var(--primary-red)', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                        onClick={() => {
                          const quizObj = activeQuizModal === 'mid' ? activeCourse.midQuiz : activeCourse.finalQuiz;
                          const qList = (quizObj && quizObj.questions && quizObj.questions.length > 0)
                            ? quizObj.questions
                            : Array.from({ length: 25 }).map((_, idx) => ({ correctAnswer: idx % 4 }));

                          let totalScore = 0;
                          qList.forEach((q, idx) => {
                            if (quizAnswers[idx] === (q.correctAnswer ?? (idx % 4))) {
                              totalScore += 1;
                            }
                          });

                          const prevScore = activeQuizModal === 'mid' ? (activeCourse.midQuizScore || 0) : (activeCourse.finalQuizScore || 0);
                          const newHighScore = Math.max(prevScore, totalScore);

                          if (activeQuizModal === 'mid') {
                            const isPassed = totalScore >= 13;
                            setQuizResult({ passed: isPassed, score: totalScore, msg: isPassed ? `✓ Mid Quiz Passed! Marks Scored: ${totalScore}/25 Marks.` : `❌ Mid Quiz Failed. Marks Scored: ${totalScore}/25 Marks. (Minimum 13 Required to pass)` });
                            
                            if (isPassed) {
                              const updated = { 
                                ...activeCourse, 
                                midQuizPassed: true,
                                midQuizScore: newHighScore,
                                completedVideos: Math.max(activeCourse.completedVideos, 6) 
                              };
                              setActiveCourse(updated);
                              setAllCoursesData(prev => prev.map(c => c.id === updated.id ? updated : c));
                              sendProgressUpdate(updated.course_unique_code, updated.progress, false, {
                                midQuizPassed: true,
                                midQuizScore: newHighScore,
                                completedVideos: Math.max(activeCourse.completedVideos, 6),
                                total_score: `${newHighScore}/25`
                              });
                              setCurrentVideoIndex(6); // Instantly set player to Video 7
                              setActiveQuizModal(null);
                              triggerToast(`⚡ Mid Quiz Completed (${totalScore}/25 Marks)! High Score: ${newHighScore}/25. Unlocked & Playing Video 7 ▶`);
                            } else {
                              triggerToast(`❌ Mid Quiz Failed (${totalScore}/25 Marks). Please try again to unlock Video 7!`, 'error');
                            }
                          } else {
                            const isPassed = totalScore >= 13;
                            setQuizResult({ passed: isPassed, score: totalScore, msg: isPassed ? `✓ Final Assessment Passed! Marks Scored: ${totalScore}/25 Marks.` : `❌ Final Assessment Failed. Marks Scored: ${totalScore}/25 Marks. (Minimum 13 Required for Certificate)` });
                            
                            if (isPassed) {
                              const updated = { 
                                ...activeCourse, 
                                finalQuizPassed: true,
                                finalQuizScore: newHighScore,
                                progress: 100, 
                                completedVideos: 12 
                              };
                              setActiveCourse(updated);
                              setAllCoursesData(prev => prev.map(c => c.id === updated.id ? updated : c));
                              sendProgressUpdate(updated.course_unique_code, 100, true, {
                                finalQuizPassed: true,
                                finalQuizScore: newHighScore,
                                completedVideos: 12,
                                assessment_status: 'true',
                                certificate_issued: 'true',
                                total_score: `${newHighScore}/25`
                              });
                              setActiveQuizModal(null);
                              setActiveCourse(null);
                              setActiveTab('Certificates'); // Instantly navigate to generated Certificate tab
                              triggerToast(`🎓 Final Assessment Passed (${totalScore}/25 Marks)! Certificate Generated & Unlocked!`);
                            } else {
                              triggerToast(`❌ Final Assessment Failed (${totalScore}/25 Marks). Please retake the quiz to earn your Certificate.`, 'error');
                            }
                          }
                        }}
                      >
                        Submit & Evaluate 25 Questions Paper
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ORIGINAL PPT DOCUMENT PRESENTATION VIEWER MODAL */}
              {activePptViewerModal && (
                <div className="admin-modal-overlay" onClick={() => setActivePptViewerModal(null)} style={{ zIndex: 1100 }}>
                  <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '950px', background: '#0f172a', color: '#fff', borderRadius: '14px', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>📊</span>
                        <h3 style={{ margin: 0, fontSize: '17px', color: '#38bdf8', fontWeight: 700 }}>{activePptViewerModal.title}</h3>
                      </div>
                      <button onClick={() => setActivePptViewerModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '22px', cursor: 'pointer' }}>✕</button>
                    </div>

                    {/* Original Document Presentation Viewer Container */}
                    <div style={{ width: '100%', height: '480px', borderRadius: '10px', overflow: 'hidden', background: '#1e293b', border: '1px solid #334155', position: 'relative' }}>
                      {(() => {
                        const rawUrl = activePptViewerModal.data || '';
                        if (!rawUrl) {
                          return (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: '20px', textAlign: 'center' }}>
                              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                              <h4 style={{ color: '#f8fafc', margin: '0 0 8px 0' }}>{activePptViewerModal.name || 'Module Presentation Deck.pptx'}</h4>
                              <p style={{ fontSize: '13px', maxWidth: '480px' }}>Uploaded PowerPoint presentation file is ready for download and student learning.</p>
                            </div>
                          );
                        }

                        if (rawUrl.startsWith('data:')) {
                          return (
                            <object
                              data={rawUrl}
                              type="application/pdf"
                              style={{ width: '100%', height: '100%', border: 'none' }}
                            >
                              <iframe
                                src={rawUrl}
                                title="Original Document Preview"
                                style={{ width: '100%', height: '100%', border: 'none' }}
                              />
                            </object>
                          );
                        }

                        const fullDocUrl = rawUrl.startsWith('http') ? rawUrl : `${window.location.origin}${rawUrl}`;
                        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullDocUrl)}`;
                        const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fullDocUrl)}&embedded=true`;

                        return (
                          <iframe
                            src={officeViewerUrl}
                            title="Original PowerPoint Presentation Viewer"
                            style={{ width: '100%', height: '100%', border: 'none', background: '#ffffff' }}
                            onError={(e) => {
                              e.target.src = googleViewerUrl;
                            }}
                          />
                        );
                      })()}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Student Original Presentation Reader</span>
                      <button
                        onClick={() => {
                          const pptData = activePptViewerModal.data;
                          const pptName = activePptViewerModal.name;
                          handleDownloadPPT(activeCourse.title, activePptViewerModal.moduleIndex - 1, pptData, pptName);
                          triggerToast(`📥 Successfully downloaded PPT Presentation #${activePptViewerModal.moduleIndex}!`);
                        }}
                        style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        📥 Download Original PPT (.pptx)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          ) : activeTab === 'Exams' ? (
            <div className="db-tab-content-container">
              <div className="tab-header-row">
                <h3>Semester & Skill Assessment Examinations</h3>
              </div>
              <div className="exams-cards-grid">
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', gridColumn: 'span 2' }}>
                  <ShieldCheck size={36} color="#9ca3af" style={{ marginBottom: '10px' }} />
                  <h4>No Examinations Scheduled</h4>
                  <p>Examination timetables and hall tickets will appear here once announced by your department.</p>
                </div>
              </div>
            </div>
          ) : activeTab === 'Certificates' ? (
            <div className="db-tab-content-container">
              <div className="tab-header-row">
                <h3>My Earned Certificates</h3>
              </div>
              <div className="certificates-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {(() => {
                  const issuedList = allCoursesData.filter(c => 
                    c.certificate_issued === 'true' || c.finalQuizPassed || c.progress === 100 || (c.course_unique_code === 'NTEDU0001' && c.midQuizPassed)
                  );
                  
                  // Always include NTEDU0001 if passed or if activeCourse has completed quizzes
                  const certCourses = issuedList.length > 0 ? issuedList : allCoursesData.filter(c => c.course_unique_code === 'NTEDU0001' || c.title?.includes('IOT') || c.name?.includes('IOT'));
                  
                  if (certCourses.length === 0) {
                    return (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', gridColumn: 'span 2' }}>
                        <Award size={36} color="#9ca3af" style={{ marginBottom: '10px' }} />
                        <h4>No Certificates Issued Yet</h4>
                        <p>Complete your enrolled courses & pass the final quizzes to earn verified digital certificates.</p>
                      </div>
                    );
                  }

                  return certCourses.map((c, idx) => {
                    const certData = {
                      studentName: user.fullName || 'Student Name',
                      college: user.college || 'ANNA UNIVERSITY',
                      department: user.department || 'Electronics & Communication Engineering',
                      courseName: 'Embedded System & IOT',
                      courseStream: user.department || 'ECE / CSE / EEE',
                      academicYear: user.year || '2025-2026',
                      venue: 'ANNA UNIVERSITY',
                      startDate: '01/06/2026',
                      endDate: '31/07/2026',
                      issuedDate: new Date().toLocaleDateString('en-GB'),
                      certificateId: `TNSDC-SMG-2026-${c.course_unique_code || 'NTEDU0001'}-${idx + 1}`
                    };

                    return (
                      <div 
                        key={c.id || idx} 
                        style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                              <Award size={26} />
                            </div>
                            <div>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>✓ VERIFIED & ISSUED</span>
                              <h4 style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{c.title || 'IOT Architecture & Embedded Systems'}</h4>
                            </div>
                          </div>
                          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                            Student Development Programme Certificate awarded by Government of Tamil Nadu Skill Development Corporation & The SM Groups.
                          </p>
                          <div style={{ fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px' }}>
                            <div><strong>Issued To:</strong> {certData.studentName}</div>
                            <div><strong>Institution:</strong> {certData.college}</div>
                            <div><strong>Certificate Code:</strong> {certData.certificateId}</div>
                          </div>
                        </div>

                        <button 
                          style={{ width: '100%', background: 'var(--primary-red)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                          onClick={() => setSelectedCertificateModal(certData)}
                        >
                          📜 View & Print Official Certificate
                        </button>
                      </div>
                    );
                  });
                })()}
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
                    <div style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
                      <MessageSquare size={36} color="#9ca3af" style={{ marginBottom: '10px' }} />
                      <p>No new messages or support notifications.</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ marginBottom: '15px' }}>📅 Upcoming Schedule Calendar</h4>
                    <div style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
                      <Calendar size={36} color="#9ca3af" style={{ marginBottom: '10px' }} />
                      <p>No events or exam schedules posted yet.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'Profile' ? (
            <div className="profile-tab-grid">
              <input 
                type="file" 
                id="profile-avatar-file-input" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const updatedPhoto = reader.result;
                    setUser(prev => ({ ...prev, profileImage: updatedPhoto }));
                    setProfileForm(prev => ({ ...prev, profileImage: updatedPhoto }));
                    
                    fetch(`/api/users/profile?email=${encodeURIComponent(user.email.toLowerCase())}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ profileImage: updatedPhoto })
                    }).catch(() => {});
                  };
                  reader.readAsDataURL(file);
                }} 
                style={{ display: 'none' }} 
              />

              {/* ── LEFT COLUMN: Summary & Progress ── */}
              <div className="profile-left-col">
                {/* Summary Card */}
                <div className="profile-card-summary">
                  <div className="profile-avatar-wrap">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="profile-avatar-img" />
                    ) : (
                      <div className="profile-avatar-placeholder">
                        {(user.fullName || 'S').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button 
                      className="profile-camera-btn"
                      type="button"
                      onClick={() => document.getElementById('profile-avatar-file-input').click()}
                      aria-label="Upload profile photo"
                    >
                      <Camera size={16} />
                    </button>
                  </div>

                  <h3 className="profile-summary-name">{user.fullName || 'Student'}</h3>
                  <span className="profile-role-badge">Student Account</span>
                  <span className="profile-summary-email">{user.email}</span>

                  <div className="profile-info-list">
                    <div className="profile-info-item">
                      <div className="profile-info-icon-wrap">
                        <GraduationCap size={18} />
                      </div>
                      <div className="profile-info-text-wrap">
                        <span className="profile-info-primary">{user.college || 'Not Provided'}</span>
                        <span className="profile-info-secondary">{user.department || 'Not Provided'} {user.year ? `(${user.year})` : ''}</span>
                      </div>
                    </div>

                    <div className="profile-info-item">
                      <div className="profile-info-icon-wrap">
                        <Phone size={18} />
                      </div>
                      <div className="profile-info-text-wrap">
                        <span className="profile-info-primary">{user.phone || 'Not Provided'}</span>
                        <span className="profile-info-secondary">Phone Number</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Completion Card */}
                <div className="profile-card-completion">
                  <div className="completion-circle-wrap">
                    {(() => {
                      const hasName = !!user.fullName;
                      const hasAcademic = !!(user.college && user.department && user.year);
                      const hasEmail = !!user.email;
                      const hasPhoto = !!user.profileImage;
                      const percentage = (hasName ? 25 : 0) + (hasAcademic ? 25 : 0) + (hasEmail ? 25 : 0) + (hasPhoto ? 25 : 0);
                      
                      const radius = 30;
                      const circumference = 2 * Math.PI * radius;
                      const offset = circumference - (percentage / 100) * circumference;

                      return (
                        <div style={{ position: 'relative', width: '72px', height: '72px' }}>
                          <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="36" cy="36" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                            <circle cx="36" cy="36" r={radius} fill="transparent" stroke="#4f46e5" strokeWidth="6" 
                              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" 
                              style={{ transition: 'stroke-dashoffset 0.3s ease' }} />
                          </svg>
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                            {percentage}%
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="checklist-wrap">
                    <h4 className="profile-completion-title" style={{ margin: 0 }}>Profile Completion</h4>
                    <div className="checklist-item">
                      <CheckCircle2 size={16} color={user.fullName ? '#10b981' : '#94a3b8'} />
                      <span>Personal Details</span>
                    </div>
                    <div className="checklist-item">
                      <CheckCircle2 size={16} color={(user.college && user.department && user.year) ? '#10b981' : '#94a3b8'} />
                      <span>Academic Info</span>
                    </div>
                    <div className="checklist-item">
                      <CheckCircle2 size={16} color={user.email ? '#10b981' : '#94a3b8'} />
                      <span>Email Verified</span>
                    </div>
                    <div className="checklist-item">
                      <CheckCircle2 size={16} color={user.profileImage ? '#10b981' : '#94a3b8'} />
                      <span>Profile Photo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN: Personal Information Form ── */}
              <div className="profile-card-details">
                <div className="profile-card-details-header">
                  <h3>Personal Information</h3>
                  {!isEditingProfile && (
                    <button 
                      className="profile-btn-edit"
                      type="button"
                      onClick={() => { setIsEditingProfile(true); setProfileForm(user); }}
                    >
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProfile}>
                  <div className="profile-form-grid">
                    {/* Full Name */}
                    <div className="profile-field-group">
                      <label>Full Name</label>
                      <div className="profile-input-wrapper">
                        <User size={16} className="profile-input-icon" />
                        <input 
                          type="text" 
                          name="fullName"
                          className="profile-input"
                          value={isEditingProfile ? (profileForm.fullName || '') : (user.fullName || '')}
                          onChange={handleProfileChange}
                          disabled={!isEditingProfile}
                          required
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="profile-field-group">
                      <label>Email Address</label>
                      <div className="profile-input-wrapper">
                        <Mail size={16} className="profile-input-icon" />
                        <input 
                          type="email" 
                          name="email"
                          className="profile-input"
                          value={isEditingProfile ? (profileForm.email || '') : (user.email || '')}
                          onChange={handleProfileChange}
                          disabled={!isEditingProfile}
                          required
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="profile-field-group">
                      <label>Phone Number</label>
                      <div className="profile-input-wrapper">
                        <Phone size={16} className="profile-input-icon" />
                        <input 
                          type="text" 
                          name="phone"
                          className="profile-input"
                          value={isEditingProfile ? (profileForm.phone || '') : (user.phone || '')}
                          onChange={handleProfileChange}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="profile-field-group">
                      <label>Gender</label>
                      <div className="profile-input-wrapper">
                        <User size={16} className="profile-input-icon" />
                        <select 
                          name="gender"
                          className="profile-input"
                          value={isEditingProfile ? (profileForm.gender || '') : (user.gender || '')}
                          onChange={handleProfileChange}
                          disabled={!isEditingProfile}
                          style={{ appearance: 'none', background: '#fff' }}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: '14px', color: '#94a3b8', pointerEvents: 'none' }} />
                      </div>
                    </div>

                    {/* College */}
                    <div className="profile-field-group">
                      <label>College</label>
                      <div className="profile-input-wrapper">
                        <Landmark size={16} className="profile-input-icon" />
                        <input 
                          type="text" 
                          name="college"
                          className="profile-input"
                          value={isEditingProfile ? (profileForm.college || '') : (user.college || '')}
                          onChange={handleProfileChange}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>

                    {/* Department */}
                    <div className="profile-field-group">
                      <label>Department</label>
                      <div className="profile-input-wrapper">
                        <BookOpen size={16} className="profile-input-icon" />
                        <input 
                          type="text" 
                          name="department"
                          className="profile-input"
                          value={isEditingProfile ? (profileForm.department || '') : (user.department || '')}
                          onChange={handleProfileChange}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>

                    {/* Year */}
                    <div className="profile-field-group">
                      <label>Year</label>
                      <div className="profile-input-wrapper">
                        <Calendar size={16} className="profile-input-icon" />
                        <input 
                          type="text" 
                          name="year"
                          className="profile-input"
                          value={isEditingProfile ? (profileForm.year || '') : (user.year || '')}
                          onChange={handleProfileChange}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>

                    {/* Actions row in edit mode */}
                    {isEditingProfile && (
                      <div className="profile-actions-row">
                        <button type="submit" className="profile-btn-save">
                          <Save size={16} /> Save Changes
                        </button>
                        <button 
                          type="button" 
                          className="profile-btn-cancel"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {/* OFFICIAL CERTIFICATE OF COMPLETION MODAL */}
      {selectedCertificateModal && (
        <div
          onClick={() => setSelectedCertificateModal(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'flex-start',
            zIndex: 2000, padding: '20px 10px',
            boxSizing: 'border-box', overflowY: 'auto',
          }}
        >
          {/* Action Bar */}
          <div
            className="cert-no-print"
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              width: '100%', maxWidth: '980px', marginBottom: '14px', flexShrink: 0,
            }}
          >
            <h4 style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '16px' }}>
              🏛️ Verified Course Certificate
            </h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const el = document.getElementById('printable-certificate');
                  if (!el) return;
                  try {
                    const canvas = await html2canvas(el, {
                      scale: 2,
                      useCORS: true,
                      allowTaint: true,
                      backgroundColor: '#fff',
                      logging: false,
                    });
                    const link = document.createElement('a');
                    link.download = `Certificate_${selectedCertificateModal?.studentName || 'Student'}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                  } catch (err) {
                    console.error('Download failed:', err);
                    window.print();
                  }
                }}
                style={{ background: '#c0392b', color: '#fff', border: 'none', padding: '9px 22px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
              >
                ⬇️ Download Certificate
              </button>
              <button
                onClick={e => { e.stopPropagation(); setSelectedCertificateModal(null); }}
                style={{ background: '#fff', color: '#374151', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Certificate Wrapper */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '980px', maxWidth: '99vw', flexShrink: 0,
              padding: '2px', background: '#fff', borderRadius: '8px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div
              id="printable-certificate"
              style={{
                width: '976px',
                background: '#ffffff',
                border: '6px double #d4af37',
                padding: '30px 48px 24px 48px',
                boxSizing: 'border-box',
                fontFamily: "'Georgia', 'Times New Roman', Times, serif",
                color: '#111',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle Watermark */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.05, pointerEvents: 'none', zIndex: 0 }}>
                <img src={tnGovtEmblem} alt="watermark" style={{ width: '380px', height: '380px', objectFit: 'contain' }} />
              </div>

              {/* Foreground content wrapper */}
              <div style={{ position: 'relative', zIndex: 1 }}>

                {/* ═══ ROW 1: THREE LOGOS (Mathematically Centered) ═══ */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: '14px', width: '100%' }}>
                  {/* Left Column: TNSDC logo & TN Skill Logo */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '20px' }}>
                    <img src={tnsdcLogo} alt="Tamil Nadu Skill Development Corporation" style={{ height: '145px', width: '145px', objectFit: 'contain' }}/>
                    <img src={tnskillLogo} alt="TN Skill" style={{ height: '75px', width: 'auto', objectFit: 'contain' }}/>
                  </div>

                  {/* Center Column: TN Government Emblem */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <img src={tnGovtEmblem} alt="Government of Tamil Nadu" style={{ height: '95px', width: '95px', objectFit: 'contain' }}/>
                  </div>

                  {/* Right Column: SM Groups logo */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <img src={smLogo} alt="SM Groups" style={{ height: '60px', width: 'auto', objectFit: 'contain' }}/>
                  </div>
                </div>

                {/* ═══ GOVERNMENT TITLE ═══ */}
                <div style={{ textAlign: 'center', color: '#c0392b', fontWeight: 900, fontSize: '17px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px', fontFamily: 'Arial, sans-serif' }}>
                  GOVERNMENT OF TAMIL NADU
                </div>
                <div style={{ textAlign: 'center', color: '#c0392b', fontWeight: 800, fontSize: '13.5px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'Arial, sans-serif' }}>
                  TAMIL NADU SKILL DEVELOPMENT CORPORATION
                </div>

                {/* ═══ CERTIFICATE OF COMPLETION TITLE ═══ */}
                <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '50px', letterSpacing: '12px', color: '#1a1a1a', lineHeight: 1.1, marginBottom: '6px', fontFamily: '"Cormorant SC", "Cormorant Garamond", "Garamond", "Georgia", serif', textTransform: 'uppercase' }}>
                  Certificate
                </div>
                <div style={{ textAlign: 'center', color: '#b45309', fontWeight: 700, fontSize: '15px', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '5px', fontFamily: 'Arial, sans-serif' }}>
                  OF COMPLETION
                </div>
                <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', color: '#111', marginBottom: '22px', fontFamily: 'Arial, sans-serif' }}>
                  STUDENT DEVELOPMENT PROGRAMME
                </div>

                {/* ═══ PROFESSIONAL BODY TEXT ═══ */}
                <div style={{ fontSize: '14.5px', color: '#111', lineHeight: '1.7', textAlign: 'justify', marginBottom: '22px' }}>
                  <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>This is to certify that Mr. / Mrs.</span>
                    <span style={{ flex: 1, borderBottom: '1.5px solid #c5a880', fontWeight: 700, textAlign: 'center', paddingBottom: '2px', color: '#1e3a8a', fontSize: '15px' }}>
                      {selectedCertificateModal.studentName}
                    </span>
                  </div>

                  <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>of</span>
                    <span style={{ flex: 1, borderBottom: '1.5px solid #c5a880', fontWeight: 700, textAlign: 'center', paddingBottom: '2px', fontSize: '15px' }}>
                      {selectedCertificateModal.college}
                    </span>
                    <span style={{ whiteSpace: 'nowrap' }}>studying in</span>
                    <span style={{ width: '120px', borderBottom: '1.5px solid #c5a880', fontWeight: 700, textAlign: 'center', paddingBottom: '2px', fontSize: '15px' }}>
                      B.E.
                    </span>
                    <span style={{ whiteSpace: 'nowrap' }}>of</span>
                  </div>

                  <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ flex: 1, borderBottom: '1.5px solid #c5a880', fontWeight: 700, textAlign: 'center', paddingBottom: '2px', fontSize: '15px' }}>
                      {selectedCertificateModal.department}
                    </span>
                    <span style={{ whiteSpace: 'nowrap' }}>has successfully completed the Student Development Programme on</span>
                  </div>

                  <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ flex: 1, borderBottom: '1.5px solid #c5a880', fontWeight: 700, textAlign: 'center', paddingBottom: '2px', color: '#166534', fontSize: '15px' }}>
                      {selectedCertificateModal.courseName}
                    </span>
                    <span style={{ whiteSpace: 'nowrap' }}>conducted by Tamil Nadu Skill Development Corporation (TNSDC)</span>
                  </div>

                  <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ whiteSpace: 'nowrap' }}>in association with The SM Groups at</span>
                    <span style={{ flex: 1, borderBottom: '1.5px solid #c5a880', fontWeight: 700, textAlign: 'center', paddingBottom: '2px', fontSize: '15px' }}>
                      {selectedCertificateModal.venue}
                    </span>
                    <span style={{ whiteSpace: 'nowrap' }}>during the Academic Year</span>
                    <span style={{ width: '140px', borderBottom: '1.5px solid #c5a880', fontWeight: 700, textAlign: 'center', paddingBottom: '2px', fontSize: '15px' }}>
                      {selectedCertificateModal.academicYear}
                    </span>
                    <span>.</span>
                  </div>
                </div>

                {/* ═══ FOOTER ROW: DATES, LOGO, SIGNATURE ═══ */}
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '28px', width: '100%' }}>

                  {/* Left: Certificate Info & Dates */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '14.5px', color: '#334155', fontFamily: "'Georgia', 'Times New Roman', Times, serif" }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{ fontWeight: 600 }}>Training Duration:</span>
                      <span style={{ borderBottom: '1.5px solid #c5a880', fontWeight: 700, color: '#0f172a', padding: '0 6px', fontSize: '14.5px' }}>
                        {selectedCertificateModal.startDate} to {selectedCertificateModal.endDate}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{ fontWeight: 600 }}>Issue Date:</span>
                      <span style={{ borderBottom: '1.5px solid #c5a880', fontWeight: 700, color: '#0f172a', padding: '0 6px', fontSize: '14.5px' }}>
                        {selectedCertificateModal.issuedDate}
                      </span>
                    </div>
                  </div>

                  {/* Center: Empty Space */}
                  <div style={{ textAlign: 'center', width: '85px' }}>
                  </div>

                  {/* Right: Signature area */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '220px' }}>
                    {/* Actual MD Signature */}
                    <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
                      <img src={mdSignature} alt="Managing Director Signature" style={{ height: '55px', width: 'auto', objectFit: 'contain' }} />
                    </div>
                    <div style={{ width: '100%', borderBottom: '1.5px solid #c5a880' }}></div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginTop: '4px', textAlign: 'center' }}>
                      Managing Director, TNSDC
                    </span>
                  </div>
                </div>

                {/* Ineligible CAS note footer */}
                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '14px 0 6px 0' }} />
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textAlign: 'left' }}>
                  *This is Eligible under Career Advancement Scheme
                </div>

              </div>{/* end foreground wrapper */}
            </div>{/* end #printable-certificate */}
          </div>
        </div>
      )}
    </div>
  );
}
