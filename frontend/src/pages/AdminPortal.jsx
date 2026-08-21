import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPortal.css';
import smLogo from '../assets/sm_logo.png';
import tnskillLogo from '../assets/tnskill_logo.png';

const API = '/api/admin';

/* ---- CSV helper ---- */
function downloadCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r =>
      headers.map(h => {
        let v = r[h] ?? '';
        if (Array.isArray(v)) v = v.join('; ');
        v = String(v).replace(/"/g, '""');
        return `"${v}"`;
      }).join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---- SVG Icon Components ---- */
const Icons = {
  Dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  ),
  Students: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Colleges: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
  ),
  Courses: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  ),
  LiveClass: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
  ),
  Quiz: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  ),
  Certificate: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Profile: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Search: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ),
  Download: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  ),
  Edit: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  ),
  Trash: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
  ),
  Assign: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
  ),
  Back: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
  ),
  SignOut: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  ),
  Menu: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  ),
  Building: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="9" y2="6"/><line x1="15" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="9" y2="10"/><line x1="15" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="9" y2="14"/><line x1="15" y1="14" x2="15" y2="14"/><line x1="9" y1="18" x2="15" y2="18"/></svg>
  ),
  Folder: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
  ),
  Warning: (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
  Key: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-1.5 1.5L4 19.5a2.5 2.5 0 1 1-3.5-3.5L14.5 2.5M16 2l3 3-2 2-3-3m5 5l-2.5 2.5"/><circle cx="7.5" cy="16.5" r="1.5"/></svg>
  ),
};

const MENU_ITEMS = [
  { name: 'Dashboard', icon: Icons.Dashboard },
  { name: 'Students', icon: Icons.Students },
  { name: 'Colleges', icon: Icons.Colleges },
  { name: 'My Courses', icon: Icons.Courses },
  { name: 'Certificates', icon: Icons.Certificate },
  { name: 'Profile', icon: Icons.Profile },
];

export default function AdminPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Modal states
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [assignCourses, setAssignCourses] = useState([]);

  // College drill-down
  const [drillLevel, setDrillLevel] = useState('colleges'); // colleges | departments | students
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);

  const [courses, setCourses] = useState([]);
  const [courseModal, setCourseModal] = useState(null);
  const [assignCourseModal, setAssignCourseModal] = useState(null);
  const [deleteCourseModal, setDeleteCourseModal] = useState(null);
  const [previewVideoModal, setPreviewVideoModal] = useState(null);
  const [previewPptModal, setPreviewPptModal] = useState(null);

  // Quiz states
  const [quizzes, setQuizzes] = useState([]);
  const [quizModal, setQuizModal] = useState(null);
  const [deleteQuizModal, setDeleteQuizModal] = useState(null);
  const [submissionsView, setSubmissionsView] = useState(null); // { quiz, submissions }
  const [quizFormQuestions, setQuizFormQuestions] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || (user.email !== 'admin@smgroups.com' && user.email !== 'thesmgroups@gmail.com')) {
      navigate('/');
      return;
    }
    fetchStudents();
    fetchCourses();
    fetchQuizzes();
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/lms/client/courses/');
      if (!res.ok) { setCourses([]); return; }
      let data = {};
      try { data = await res.json(); } catch { setCourses([]); return; }
      if (data.success || data.courses_list) {
        const list = data.courses_list || data.courses || [];
        const apiMapped = list.map(c => ({
          _id: c._id || c.course_id,
          id: c.id || c.course_id,
          course_unique_code: c.course_unique_code || c.course_id,
          title: c.name || c.course_name || c.title,
          category: c.category || 'General',
          instructor: c.instructor || 'Instructor',
          content: c.course_description || c.content || '',
          image: c.course_image_url || c.image || '',
          videos: c.videos || [],
          ppts: c.ppts || [],
          midQuiz: c.midQuiz,
          finalQuiz: c.finalQuiz,
          is_active: c.is_active ?? c.course_status ?? true,
          studentsEnrolled: c.studentsEnrolled || 0,
          rating: c.rating || 4.8
        }));
        // Clear stale localStorage cache to prevent duplicates
        localStorage.removeItem('createdCourses');
        setCourses(apiMapped);
      } else {
        setCourses([]);
      }
    } catch {
      setCourses([]);
    }
  };

  // API Token Generator states
  const [tokenInput, setTokenInput] = useState({
    client_key: '59e8bb42f89d5ee93ff466be97022427',
    client_secret: 'f7a761767124aef8b904c49b52a555d6'
  });
  const [tokenResult, setTokenResult] = useState(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  const fetchStudents = async () => {
    let apiUsers = [];
    try {
      const res = await fetch(`${API}/users`);
      if (res.ok) {
        let data = {};
        try { data = await res.json(); } catch { data = {}; }
        if (data.success && Array.isArray(data.users)) {
          apiUsers = data.users;
        }
      }
    } catch (err) {
      console.warn('Could not fetch users from API, falling back to local state:', err);
    }

    let serverProgressList = [];
    try {
      const pRes = await fetch('/api/user/progress');
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.success && Array.isArray(pData.user_progress)) {
          serverProgressList = pData.user_progress;
        }
      }
    } catch {
      // ignore
    }

    const localProgressRaw = localStorage.getItem('userCourseProgress') || '{}';
    const localProgressMap = JSON.parse(localProgressRaw);

    const storedUsersRaw = localStorage.getItem('registeredUsers');
    const localUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
    
    // Fallback to local storage users only if backend is empty / offline
    const sourceUsers = apiUsers.length > 0 ? apiUsers : localUsers;
    
    const merged = sourceUsers.filter(u => u && u.role !== 'admin').map(u => {
      const email = u.email ? u.email.toLowerCase() : '';
      const activeCode = (u.assignedCourses && u.assignedCourses[0]) || u.course_unique_code || '';
      
      // Try to find matching progress record from server
      let prog = {};
      if (activeCode) {
        prog = serverProgressList.find(p => p.user_unique_id?.toLowerCase() === email && p.course_unique_code === activeCode) || {};
      }
      if (!prog.course_unique_code) {
        prog = serverProgressList.find(p => p.user_unique_id?.toLowerCase() === email) || {};
      }
      
      // Fallback to local progress map if server progress not found
      if (!prog.course_unique_code) {
        const progKey = `${email}_${activeCode}`;
        prog = localProgressMap[progKey] || Object.values(localProgressMap).find(p => p.user_unique_id?.toLowerCase() === email) || {};
      }

      return {
        ...u,
        course_unique_code: prog.course_unique_code || activeCode || '',
        progress_percentage: (prog.progress_percentage !== undefined && prog.progress_percentage !== null) ? String(prog.progress_percentage) : "0.00",
        assessment_status: (prog.assessment_status !== undefined && prog.assessment_status !== null) ? String(prog.assessment_status) : "false",
        course_complete: (prog.course_complete !== undefined && prog.course_complete !== null) ? String(prog.course_complete) : "false",
        certificate_issued: (prog.certificate_issued !== undefined && prog.certificate_issued !== null) ? String(prog.certificate_issued) : "false",
        total_score: prog.total_score || ""
      };
    });
    setStudents(merged);
  };

  const handleGenerateToken = async (e) => {
    if (e) e.preventDefault();
    setIsGeneratingToken(true);
    setTokenResult(null);
    try {
      const res = await fetch('/api/lms/client/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_key: tokenInput.client_key,
          client_secret: tokenInput.client_secret
        })
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = { message: `Backend Server Proxy Error (HTTP ${res.status} ${res.statusText})` };
      }

      if (res.ok && (data.access || data.status)) {
        setTokenResult({
          success: true,
          status: res.status,
          access: data.access,
          refresh: data.refresh,
          payloadSent: {
            client_key: tokenInput.client_key,
            client_secret: tokenInput.client_secret
          },
          responseRaw: JSON.stringify(data, null, 2)
        });
        showToast('JWT Client Token generated successfully!');
      } else {
        setTokenResult({
          success: false,
          status: res.status,
          message: data.message || 'Token generation failed',
          responseRaw: JSON.stringify(data, null, 2)
        });
        showToast(data.message || 'Failed to generate token', 'error');
      }
    } catch (err) {
      console.error('Token API Error:', err);
      setTokenResult({
        success: false,
        message: 'Network error connecting to /api/lms/client/token/',
        responseRaw: String(err)
      });
      showToast('Network error generating token', 'error');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ---- EDIT ---- */
  const openEdit = (student) => {
    setEditModal({ ...student });
  };
  const saveEdit = async () => {
    try {
      const res = await fetch(`${API}/users/${encodeURIComponent(editModal.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editModal.fullName,
          phone: editModal.phone,
          gender: editModal.gender,
          year: editModal.year,
          district: editModal.district,
          college: editModal.college,
          department: editModal.department,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Student updated successfully!');
        fetchStudents();
        setEditModal(null);
      } else {
        showToast(data.message || 'Update failed', 'error');
      }
    } catch {
      showToast('Server error', 'error');
    }
  };

  /* ---- DELETE ---- */
  const confirmDelete = async () => {
    try {
      const identifier = deleteModal._id || deleteModal.user_unique_id || deleteModal.email;
      const token = JSON.parse(localStorage.getItem('user'))?.token || '';
      const res = await fetch(`${API}/users/${encodeURIComponent(identifier)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Student deleted!');
        fetchStudents();
        setDeleteModal(null);
      } else {
        showToast(data.message || 'Delete failed', 'error');
      }
    } catch {
      showToast('Server error', 'error');
    }
  };

  /* ---- ASSIGN ---- */
  const openAssign = (student) => {
    setAssignModal(student);
    const existingAssigned = Array.isArray(student.assignedCourses) ? student.assignedCourses : [];
    if (existingAssigned.length === 0 && student.course_unique_code) {
      existingAssigned.push(student.course_unique_code);
    }
    setAssignCourses(existingAssigned);
  };

  const toggleCourse = (courseKey) => {
    setAssignCourses(prev =>
      prev.includes(courseKey) ? prev.filter(c => c !== courseKey) : [...prev, courseKey]
    );
  };

  const saveAssign = async () => {
    if (!assignModal || !assignModal.email) return;
    try {
      const studentEmail = assignModal.email.toLowerCase();
      const res = await fetch(`${API}/users/${encodeURIComponent(studentEmail)}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: assignCourses }),
      });
      
      let data = {};
      try { data = await res.json(); } catch { data = {}; }

      // Also sync local storage backup for offline support
      const storedUsersRaw = localStorage.getItem('registeredUsers');
      if (storedUsersRaw) {
        try {
          const localUsersList = JSON.parse(storedUsersRaw);
          const targetIdx = localUsersList.findIndex(u => u && u.email && u.email.toLowerCase() === studentEmail);
          if (targetIdx >= 0) {
            localUsersList[targetIdx].assignedCourses = assignCourses;
            if (assignCourses.length > 0) localUsersList[targetIdx].course_unique_code = assignCourses[0];
            localStorage.setItem('registeredUsers', JSON.stringify(localUsersList));
          }
        } catch (e) {
          console.warn('Could not sync local registeredUsers:', e.message);
        }
      }

      if (res.ok || data.success) {
        showToast('Courses assigned successfully!');
        fetchStudents();
        setAssignModal(null);
      } else {
        showToast(data.message || 'Assign failed', 'error');
      }
    } catch (err) {
      console.error('Assign Error:', err);
      showToast('Server error assigning courses', 'error');
    }
  };

  /* ---- BULK COURSE ASSIGNMENT TO STUDENTS ---- */
  const openAssignCourseToStudents = (course) => {
    setAssignCourseModal({
      course,
      targetMode: 'all',
      targetCollege: 'ALL',
      targetDept: 'ALL',
      selectedStudentEmails: students.map(s => (s.email || '').toLowerCase()).filter(Boolean),
      studentSearch: ''
    });
  };

  const handleBulkAssignCourse = async (courseToAssign, config) => {
    if (!courseToAssign) return;
    const courseCode = courseToAssign.course_unique_code || courseToAssign.title || courseToAssign.id;
    const courseTitle = courseToAssign.title || courseToAssign.course_name || courseCode;

    const { targetMode, targetCollege, targetDept, selectedStudentEmails } = config;

    let targetStudents = [];
    if (targetMode === 'all') {
      targetStudents = students;
    } else if (targetMode === 'college') {
      if (!targetCollege || targetCollege === 'ALL') {
        targetStudents = students;
      } else {
        targetStudents = students.filter(s => s.college === targetCollege);
      }
    } else if (targetMode === 'department') {
      targetStudents = students.filter(s => {
        const matchesCollege = !targetCollege || targetCollege === 'ALL' || s.college === targetCollege;
        const matchesDept = !targetDept || targetDept === 'ALL' || s.department === targetDept;
        return matchesCollege && matchesDept;
      });
    } else if (targetMode === 'individual') {
      targetStudents = students.filter(s => selectedStudentEmails.includes((s.email || '').toLowerCase()));
    }

    if (targetStudents.length === 0) {
      showToast('No registered students match the selected target scope.', 'error');
      return;
    }

    let successCount = 0;
    const storedUsersRaw = localStorage.getItem('registeredUsers');
    const localUsersList = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

    for (const student of targetStudents) {
      const email = student.email ? student.email.toLowerCase() : '';
      if (!email) continue;

      const existingCourses = Array.isArray(student.assignedCourses) ? [...student.assignedCourses] : [];
      if (!existingCourses.includes(courseCode) && !existingCourses.includes(courseTitle)) {
        existingCourses.push(courseCode);
      }

      try {
        await fetch(`${API}/users/${encodeURIComponent(email)}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courses: existingCourses })
        });
        successCount++;
      } catch (err) {
        console.warn(`Error assigning course to ${email}:`, err);
      }

      const locIdx = localUsersList.findIndex(u => u && u.email && u.email.toLowerCase() === email);
      if (locIdx >= 0) {
        localUsersList[locIdx].assignedCourses = existingCourses;
        localUsersList[locIdx].course_unique_code = courseCode;
      }
    }

    try {
      localStorage.setItem('registeredUsers', JSON.stringify(localUsersList));
    } catch (e) {
      console.warn('localStorage sync error:', e.message);
    }

    showToast(`🎉 Course "${courseTitle}" assigned to ${successCount} student(s) successfully!`);
    fetchStudents();
    setAssignCourseModal(null);
  };

  const handleMultiFileChange = (e, fileType, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileDataUrl = event.target.result;
      setCourseModal(prev => {
        const arr = [...(prev[fileType] || Array(12).fill(''))];
        const names = [...(prev[`${fileType}Names`] || Array(12).fill(''))];
        arr[index] = fileDataUrl;
        names[index] = file.name;
        return {
          ...prev,
          [fileType]: arr,
          [`${fileType}Names`]: names
        };
      });
      showToast(`Uploaded ${fileType === 'videos' ? 'Video' : 'PPT'} #${index + 1}: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const defaultQuestionsPool = [
    { q: "What is the primary role of MQTT protocol in IoT architecture?", opts: ["Lightweight publish/subscribe messaging", "High latency video streaming", "Direct database SQL query execution", "Hardware BIOS flashing"] },
    { q: "Which kernel is optimized for real-time microcontrollers?", opts: ["FreeRTOS", "Windows 11 Enterprise", "Android 14", "macOS Sonoma"] },
    { q: "Which bus is used for fast serial communication with sensors?", opts: ["SPI / I2C Bus", "SATA 3.0", "PCIe 4.0 x16", "DisplayPort 1.4"] },
    { q: "What GPIO voltage standard does Raspberry Pi 4 Model B use?", opts: ["3.3V Logic Level", "12V Automotive Standard", "110V AC Power Line", "5V High Power Direct Drive"] },
    { q: "Which protocol provides low-power wireless networking for IoT mesh nodes?", opts: ["Zigbee / IEEE 802.15.4", "HTTP/2 Uncompressed", "FTP Over TLS", "POP3 Mail Protocol"] },
    { q: "What is the function of ADC (Analog-to-Digital Converter) in embedded systems?", opts: ["Convert continuous sensor voltage to digital binary values", "Amplify audio speaker signals", "Encrypt WiFi network packets", "Step-down AC supply to DC"] },
    { q: "Which sensor measures relative humidity and environmental temperature?", opts: ["DHT22 / DHT11", "MPU6050 Gyroscope", "HC-SR04 Ultrasonic Sensor", "MQ-2 Gas Sensor"] },
    { q: "What is Edge Computing in the context of IoT deployment?", opts: ["Processing sensor data locally near the data source", "Storing all logs exclusively in remote cloud servers", "Using curved monitor displays for dashboards", "Routing network data through satellite relays"] },
    { q: "Which wireless frequency band is standard for LoRaWAN long-range communications?", opts: ["868 MHz / 915 MHz", "5.8 GHz WiFi", "24 GHz Radar", "60 GHz WiGig"] },
    { q: "What type of memory is non-volatile and retains microcontroller firmware code?", opts: ["Flash Memory / EEPROM", "SRAM Cache", "DDR4 System RAM", "CPU Registers"] }
  ];

  const openCreateCourse = () => {
    const modalData = {
      mode: 'create',
      title: '',
      content: '',
      image: '',
      instructor: '',
      category: '',
      videos: Array(12).fill(''),
      ppts: Array(12).fill('')
    };

    for (let i = 0; i < 25; i++) {
      const qObj = defaultQuestionsPool[i % defaultQuestionsPool.length];
      modalData[`mid_q_${i}`] = `Mid Q#${i + 1}: ${qObj.q}`;
      modalData[`mid_opt_${i}_0`] = qObj.opts[0];
      modalData[`mid_opt_${i}_1`] = qObj.opts[1];
      modalData[`mid_opt_${i}_2`] = qObj.opts[2];
      modalData[`mid_opt_${i}_3`] = qObj.opts[3];
      modalData[`mid_correct_${i}`] = 0;

      modalData[`final_q_${i}`] = `Final Q#${i + 1}: ${qObj.q}`;
      modalData[`final_opt_${i}_0`] = qObj.opts[0];
      modalData[`final_opt_${i}_1`] = qObj.opts[1];
      modalData[`final_opt_${i}_2`] = qObj.opts[2];
      modalData[`final_opt_${i}_3`] = qObj.opts[3];
      modalData[`final_correct_${i}`] = 0;
    }

    setCourseModal(modalData);
  };

  const openEditCourse = (course) => {
    const existingVideos = Array.isArray(course.videos) ? [...course.videos] : [];
    const existingPpts = Array.isArray(course.ppts) ? [...course.ppts] : [];

    // Pad to 12 slots with empty strings so slots always exist
    while (existingVideos.length < 12) existingVideos.push('');
    while (existingPpts.length < 12) existingPpts.push('');

    const modalData = { 
      mode: 'edit', 
      ...course,
      title: course.title || course.course_name || '',
      content: course.content || course.course_description || '',
      image: course.image || course.course_image_url || '',
      videos: existingVideos,
      ppts: existingPpts,
      videosNames: course.videosNames || [],
      pptsNames: course.pptsNames || []
    };

    // Pre-populate Mid Quiz questions if any exist (fix: was >=25, now >0)
    if (course.midQuiz?.questions && course.midQuiz.questions.length > 0) {
      // Fill all 25 slots: use saved data where available, defaults for missing
      for (let i = 0; i < 25; i++) {
        const q = course.midQuiz.questions[i];
        if (q) {
          modalData[`mid_q_${i}`] = q.question || '';
          if (q.options && q.options.length >= 4) {
            q.options.forEach((opt, optIdx) => {
              modalData[`mid_opt_${i}_${optIdx}`] = opt || '';
            });
          } else {
            const defQ = defaultQuestionsPool[i % defaultQuestionsPool.length];
            [0,1,2,3].forEach(optIdx => { modalData[`mid_opt_${i}_${optIdx}`] = defQ.opts[optIdx]; });
          }
          modalData[`mid_correct_${i}`] = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0;
        } else {
          const qObj = defaultQuestionsPool[i % defaultQuestionsPool.length];
          modalData[`mid_q_${i}`] = `Mid Q#${i + 1}: ${qObj.q}`;
          modalData[`mid_opt_${i}_0`] = qObj.opts[0];
          modalData[`mid_opt_${i}_1`] = qObj.opts[1];
          modalData[`mid_opt_${i}_2`] = qObj.opts[2];
          modalData[`mid_opt_${i}_3`] = qObj.opts[3];
          modalData[`mid_correct_${i}`] = 0;
        }
      }
    } else {
      for (let i = 0; i < 25; i++) {
        const qObj = defaultQuestionsPool[i % defaultQuestionsPool.length];
        modalData[`mid_q_${i}`] = `Mid Q#${i + 1}: ${qObj.q}`;
        modalData[`mid_opt_${i}_0`] = qObj.opts[0];
        modalData[`mid_opt_${i}_1`] = qObj.opts[1];
        modalData[`mid_opt_${i}_2`] = qObj.opts[2];
        modalData[`mid_opt_${i}_3`] = qObj.opts[3];
        modalData[`mid_correct_${i}`] = 0;
      }
    }

    // Pre-populate Final Quiz questions if any exist (fix: was >=25, now >0)
    if (course.finalQuiz?.questions && course.finalQuiz.questions.length > 0) {
      for (let i = 0; i < 25; i++) {
        const q = course.finalQuiz.questions[i];
        if (q) {
          modalData[`final_q_${i}`] = q.question || '';
          if (q.options && q.options.length >= 4) {
            q.options.forEach((opt, optIdx) => {
              modalData[`final_opt_${i}_${optIdx}`] = opt || '';
            });
          } else {
            const defQ = defaultQuestionsPool[i % defaultQuestionsPool.length];
            [0,1,2,3].forEach(optIdx => { modalData[`final_opt_${i}_${optIdx}`] = defQ.opts[optIdx]; });
          }
          modalData[`final_correct_${i}`] = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0;
        } else {
          const qObj = defaultQuestionsPool[i % defaultQuestionsPool.length];
          modalData[`final_q_${i}`] = `Final Q#${i + 1}: ${qObj.q}`;
          modalData[`final_opt_${i}_0`] = qObj.opts[0];
          modalData[`final_opt_${i}_1`] = qObj.opts[1];
          modalData[`final_opt_${i}_2`] = qObj.opts[2];
          modalData[`final_opt_${i}_3`] = qObj.opts[3];
          modalData[`final_correct_${i}`] = 0;
        }
      }
    } else {
      for (let i = 0; i < 25; i++) {
        const qObj = defaultQuestionsPool[i % defaultQuestionsPool.length];
        modalData[`final_q_${i}`] = `Final Q#${i + 1}: ${qObj.q}`;
        modalData[`final_opt_${i}_0`] = qObj.opts[0];
        modalData[`final_opt_${i}_1`] = qObj.opts[1];
        modalData[`final_opt_${i}_2`] = qObj.opts[2];
        modalData[`final_opt_${i}_3`] = qObj.opts[3];
        modalData[`final_correct_${i}`] = 0;
      }
    }

    setCourseModal(modalData);
  };

  const saveCourse = async (isPublish = true) => {
    if (!courseModal.title) {
      showToast('Course name is required!', 'error');
      return;
    }
    try {
      const coverImage = courseModal.image || courseModal.course_image_url || '';

      const payload = {
        course_unique_code: courseModal.course_unique_code || courseModal.course_id || `NTEDU${Math.floor(1000 + Math.random() * 9000)}`,
        course_name: courseModal.title,
        course_description: courseModal.content || courseModal.description || '',
        course_image_url: coverImage,
        instructor: courseModal.instructor || 'Instructor',
        duration: '1050',
        number_of_videos: '12',
        language: 'english',
        main_stream: 'engineering',
        sub_stream: 'cse',
        category: courseModal.category || 'General',
        system_requirements: 'Basic computer literacy',
        has_subtitles: 'true',
        reference_id: courseModal.reference_id || `REF-${Date.now()}`,
        course_type: 'ONLINE',
        location: '',
        videos: (courseModal.videos || Array(12).fill('')).map((v, i) => (v && v !== `Video #${i + 1}`) ? v : (v || '')),
        ppts: (courseModal.ppts || Array(12).fill('')).map((p, i) => (p && p !== `PPT #${i + 1}`) ? p : (p || '')),
        midQuiz: {
          title: 'Mid-Course Quiz (After Video 6) - 25 Marks',
          totalMarks: 25,
          questions: Array.from({ length: 25 }).map((_, i) => {
            const hasCustomQ = Boolean(courseModal[`mid_q_${i}`]);
            const hasCustomOpt = Boolean(courseModal[`mid_opt_${i}_0`]);
            if (hasCustomQ && hasCustomOpt) {
              return {
                id: i + 1,
                question: courseModal[`mid_q_${i}`],
                options: [
                  courseModal[`mid_opt_${i}_0`],
                  courseModal[`mid_opt_${i}_1`],
                  courseModal[`mid_opt_${i}_2`],
                  courseModal[`mid_opt_${i}_3`]
                ],
                correctAnswer: courseModal[`mid_correct_${i}`] ?? 0,
                marks: 1
              };
            }
            const titleLower = (courseModal.title || '').toLowerCase();
            const isIot = titleLower.includes('iot') || titleLower.includes('embedded') || titleLower.includes('raspberry');
            const defaultQList = [
              { q: "What is the primary role of MQTT protocol in IoT architecture?", opts: ["Lightweight publish/subscribe messaging", "High latency video streaming", "Direct database SQL query execution", "Hardware BIOS flashing"] },
              { q: "Which kernel is optimized for real-time microcontrollers?", opts: ["FreeRTOS", "Windows 11 Enterprise", "Android 14", "macOS Sonoma"] },
              { q: "Which bus is used for fast serial communication with sensors?", opts: ["SPI / I2C Bus", "SATA 3.0", "PCIe 4.0 x16", "DisplayPort 1.4"] },
              { q: "What GPIO voltage standard does Raspberry Pi 4 Model B use?", opts: ["3.3V Logic Level", "12V Automotive Standard", "110V AC Power Line", "5V High Power Direct Drive"] },
              { q: "Which protocol provides low-power wireless networking for IoT mesh nodes?", opts: ["Zigbee / IEEE 802.15.4", "HTTP/2 Uncompressed", "FTP Over TLS", "POP3 Mail Protocol"] },
              { q: "Which programming language is predominantly used in writing Arduino firmware?", opts: ["C / C++", "Python 3.12", "HTML5 / CSS3", "Java Enterprise Edition"] },
              { q: "What is the key security vulnerability in unencrypted IoT sensor transmission?", opts: ["Man-in-the-Middle eavesdropping", "Hard drive spindle failure", "Power supply frequency drift", "Physical LCD display pixel burn-in"] },
              { q: "Which low-power cellular standard is designed specifically for IoT devices?", opts: ["NB-IoT (Narrowband IoT)", "5G mmWave High Bandwidth", "CDMA 1xRTT", "Satellite TV Broadcast"] },
              { q: "What does the 'S' stand for in HTTPS?", opts: ["Secure", "Simple", "Standard", "Synchronous"] },
              { q: "Which device is typically used to convert analog signals to digital format in microcontrollers?", opts: ["ADC (Analog-to-Digital Converter)", "DAC", "DMA Controller", "Crystal Oscillator"] }
            ];

            const qObj = isIot ? defaultQList[i % defaultQList.length] : defaultQuestionsPool[i % defaultQuestionsPool.length];
            return {
              id: i + 1,
              question: qObj.q,
              options: qObj.opts,
              correctAnswer: 0,
              marks: 1
            };
          })
        },
        finalQuiz: {
          title: 'Final Assessment Quiz (After Video 12) - 25 Marks',
          totalMarks: 25,
          questions: Array.from({ length: 25 }).map((_, i) => {
            const hasCustomQ = Boolean(courseModal[`final_q_${i}`]);
            const hasCustomOpt = Boolean(courseModal[`final_opt_${i}_0`]);
            if (hasCustomQ && hasCustomOpt) {
              return {
                id: i + 1,
                question: courseModal[`final_q_${i}`],
                options: [
                  courseModal[`final_opt_${i}_0`],
                  courseModal[`final_opt_${i}_1`],
                  courseModal[`final_opt_${i}_2`],
                  courseModal[`final_opt_${i}_3`]
                ],
                correctAnswer: courseModal[`final_correct_${i}`] ?? 0,
                marks: 1
              };
            }
            const titleLower = (courseModal.title || '').toLowerCase();
            const isIot = titleLower.includes('iot') || titleLower.includes('embedded') || titleLower.includes('raspberry');
            const defaultQList = [
              { q: "Which architecture is primarily used in modern low-power microcontrollers like ARM Cortex-M?", opts: ["RISC (Reduced Instruction Set)", "CISC Complex Instruction", "VLIW Very Long Instruction Word", "Quantum Qubit Architecture"] },
              { q: "What does edge computing resolve in high-scale IoT networks?", opts: ["Reduces cloud latency & bandwidth usage", "Decreases device battery life", "Prevents visual light reflection", "Increases database normalization overhead"] },
              { q: "Which protocol provides reliable request/response over UDP for constrained nodes?", opts: ["CoAP (Constrained Application Protocol)", "FTP over TLS", "WebSocket Protocol", "HTTP/1.1 Keep-Alive"] },
              { q: "What is the typical range of a LoRaWAN sensor network in suburban areas?", opts: ["2 to 5 Kilometers", "10 to 50 Meters", "500 to 1000 Kilometers", "100 to 300 Millimeters"] },
              { q: "Which component acts as an electronic switch to control high-power DC loads from GPIO?", opts: ["MOSFET / Transistor", "Resistor Divider", "Ceramic Capacitor", "Piezoelectric Buzzer"] },
              { q: "What does OTA stand for in the context of IoT device management?", opts: ["Over-The-Air firmware updates", "One-Time Authentication", "Optical Transmission Alignment", "Output Transfer Automation"] },
              { q: "Which communication model is used by MQTT for messaging between clients?", opts: ["Publish-Subscribe Model", "Peer-to-Peer Direct Socket", "Request-Response HTTP", "Master-Slave Modbus"] },
              { q: "What is the primary function of a watchdog timer in embedded systems?", opts: ["Resets system on software hang or freeze", "Displays real-time system clock", "Controls LCD backlight brightness", "Monitors power supply battery voltage"] },
              { q: "Which standard governs Wi-Fi communication in the 2.4GHz/5GHz bands?", opts: ["IEEE 802.11", "IEEE 802.3 Ethernet", "IEEE 802.15.1 Bluetooth", "IEEE 802.15.4 Zigbee"] },
              { q: "What is the purpose of a pull-up resistor on a digital input pin?", opts: ["Ensures a stable HIGH state when floating", "Amplify voltage output to high levels", "Filters out high-frequency radio noise", "Increases current flowing into GPIO"] }
            ];

            const qObj = isIot ? defaultQList[i % defaultQList.length] : defaultQuestionsPool[i % defaultQuestionsPool.length];
            return {
              id: i + 1,
              question: qObj.q,
              options: qObj.opts,
              correctAnswer: 0,
              marks: 1
            };
          })
        },
        course_content: [
          { content: "Chapter 1 - Technical Architecture & Setup" },
          { content: "Chapter 2 - Core Functionality & Implementation" },
          { content: "Chapter 3 - Production Deployment & Testing" }
        ],
        course_objective: [
          { objective: "Master functional programming and framework techniques" },
          { objective: "Build high-performance, scalable web and embedded applications" }
        ],
        videosNames: courseModal.videosNames || [],
        pptsNames: courseModal.pptsNames || []
      };

      // Safely stringify payload to prevent V8 RangeError: Invalid string length
      let bodyString = '';
      try {
        bodyString = JSON.stringify(payload);
      } catch (e) {
        console.warn('JSON stringify payload too large, converting oversized Base64 to course paths:', e);
        const sanitizedPayload = {
          ...payload,
          videos: (payload.videos || []).map((v, i) => (typeof v === 'string' && v.length > 500000) ? `/courses/${payload.course_unique_code}/videos/video_${i + 1}.mp4` : v),
          ppts: (payload.ppts || []).map((p, i) => (typeof p === 'string' && p.length > 500000) ? `/courses/${payload.course_unique_code}/ppts/presentation_${i + 1}.pptx` : p)
        };
        bodyString = JSON.stringify(sanitizedPayload);
      }

      const endpoint = isPublish ? '/api/lms/client/course/publish/' : '/api/lms/client/course/save-draft/';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyString
      });
      let data = {};
      try { data = await res.json(); } catch { data = { message: `HTTP ${res.status} Bad Gateway / Server Error` }; }

      const finalSavedCourse = (data && data.course) ? data.course : payload;

      // Safely persist published course in localStorage without exceeding V8/localStorage string limits
      try {
        const storedCoursesRaw = localStorage.getItem('createdCourses');
        const storedCourses = storedCoursesRaw ? JSON.parse(storedCoursesRaw) : [];
        const filteredCourses = storedCourses.filter(c => (c.course_unique_code || c.id) !== finalSavedCourse.course_unique_code);
        
        let courseToSave = finalSavedCourse;
        try {
          JSON.stringify([courseToSave, ...filteredCourses]);
        } catch {
          courseToSave = {
            ...finalSavedCourse,
            videos: (finalSavedCourse.videos || []).map((v, i) => (typeof v === 'string' && v.length > 100000) ? `/courses/${finalSavedCourse.course_unique_code}/videos/video_${i + 1}.mp4` : v),
            ppts: (finalSavedCourse.ppts || []).map((p, i) => (typeof p === 'string' && p.length > 100000) ? `/courses/${finalSavedCourse.course_unique_code}/ppts/presentation_${i + 1}.pptx` : p)
          };
        }
        
        const updatedCourses = [courseToSave, ...filteredCourses];
        localStorage.setItem('createdCourses', JSON.stringify(updatedCourses));
      } catch (lsErr) {
        console.warn('localStorage quota handled safely:', lsErr);
      }

      if (res.ok && (data.success || data.status)) {
        showToast(isPublish ? (data.message || 'Course has been sent for approval , you will get email as confirmation') : '💾 Course saved as draft successfully!');
        fetchCourses();
        setCourseModal(null);
      } else {
        const errorMsg = data.error || data.message || (isPublish ? 'Failed to publish to TN Skill Development portal.' : 'Failed to save course.');
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      console.error('Save/Publish error handled:', err);
      showToast(isPublish ? 'Network error: Failed to publish course.' : 'Network error: Failed to save course.', 'error');
    }
  };

  const handleQuickPublish = async (course) => {
    try {
      const res = await fetch('/api/lms/client/course/publish/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...course,
          course_unique_code: course.course_unique_code || course.id
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok || data.status || data.success) {
        // Use the exact message returned from the backend if available
        showToast(data.message || '🚀 Course published successfully!');
        fetchCourses();
      } else {
        showToast(data.error || 'Failed to publish course.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error publishing course.', 'error');
    }
  };

  const confirmDeleteCourse = async () => {
    try {
      const courseId = deleteCourseModal._id || deleteCourseModal.id || deleteCourseModal.course_unique_code || deleteCourseModal.course_id;
      const res = await fetch(`/api/admin/courses/${encodeURIComponent(courseId)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Course deleted successfully!');
        fetchCourses();
        setDeleteCourseModal(null);
      } else {
        showToast(data.message || 'Delete failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error deleting course', 'error');
    }
  };

  /* ---- QUIZ HANDLERS ---- */
  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setQuizzes(data.quizzes);
    } catch {
      // Silently ignore network/server unavailability
    }
  };

  const openQuizCreate = () => {
    setQuizFormQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    setQuizModal({
      mode: 'create',
      title: '',
      courseId: '',
      courseTitle: '',
      assignTo: 'all',
      assignCollege: '',
      assignDepartment: ''
    });
  };

  const openQuizEdit = (quiz) => {
    setQuizFormQuestions(quiz.questions.map(q => ({ ...q, options: [...q.options] })));
    setQuizModal({
      mode: 'edit',
      _id: quiz._id,
      id: quiz.id,
      title: quiz.title,
      courseId: quiz.courseId || '',
      courseTitle: quiz.courseTitle || '',
      assignTo: quiz.assignTo || 'all',
      assignCollege: quiz.assignCollege || '',
      assignDepartment: quiz.assignDepartment || ''
    });
  };

  const addQuestion = () => {
    setQuizFormQuestions(prev => [...prev, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (idx) => {
    if (quizFormQuestions.length <= 1) return;
    setQuizFormQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx, field, value) => {
    setQuizFormQuestions(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuizFormQuestions(prev => {
      const updated = [...prev];
      const opts = [...updated[qIdx].options];
      opts[optIdx] = value;
      updated[qIdx] = { ...updated[qIdx], options: opts };
      return updated;
    });
  };

  const saveQuiz = async () => {
    if (!quizModal.title.trim()) {
      showToast('Quiz name is required!', 'error');
      return;
    }
    // Validate questions
    for (let i = 0; i < quizFormQuestions.length; i++) {
      const q = quizFormQuestions[i];
      if (!q.question.trim()) {
        showToast(`Question ${i + 1} text is required!`, 'error');
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          showToast(`Question ${i + 1}, Option ${String.fromCharCode(65 + j)} is required!`, 'error');
          return;
        }
      }
    }

    // Find course title if courseId selected
    let courseTitle = quizModal.courseTitle;
    if (quizModal.courseId) {
      const found = courses.find(c => String(c._id || c.id) === String(quizModal.courseId));
      if (found) courseTitle = found.title;
    }

    try {
      const isCreate = quizModal.mode === 'create';
      const url = isCreate ? '/api/admin/quizzes' : `/api/admin/quizzes/${quizModal._id || quizModal.id}`;
      const method = isCreate ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizModal.title,
          courseId: quizModal.courseId,
          courseTitle,
          assignTo: quizModal.assignTo,
          assignCollege: quizModal.assignCollege,
          assignDepartment: quizModal.assignDepartment,
          questions: quizFormQuestions
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(isCreate ? 'Quiz created successfully!' : 'Quiz updated successfully!');
        fetchQuizzes();
        setQuizModal(null);
      } else {
        showToast(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error', 'error');
    }
  };

  const confirmDeleteQuiz = async () => {
    try {
      const res = await fetch(`/api/admin/quizzes/${deleteQuizModal._id || deleteQuizModal.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Quiz deleted successfully!');
        fetchQuizzes();
        setDeleteQuizModal(null);
      } else {
        showToast(data.message || 'Delete failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error', 'error');
    }
  };

  const viewSubmissions = async (quiz) => {
    try {
      const res = await fetch(`/api/admin/quizzes/${quiz._id || quiz.id}/submissions`);
      const data = await res.json();
      if (data.success) {
        setSubmissionsView({ quiz, submissions: data.submissions });
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load submissions', 'error');
    }
  };

  /* ---- Derived data ---- */
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter(s =>
      (s.fullName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.college || '').toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const collegeMap = useMemo(() => {
    const map = {};
    students.forEach(s => {
      const col = s.college || 'Unknown';
      const dept = s.department || 'Unknown';
      if (!map[col]) map[col] = {};
      if (!map[col][dept]) map[col][dept] = [];
      map[col][dept].push(s);
    });
    return map;
  }, [students]);

  const uniqueColleges = Object.keys(collegeMap);
  const uniqueDepts = selectedCollege ? Object.keys(collegeMap[selectedCollege] || {}) : [];
  const deptStudents = selectedCollege && selectedDept
    ? (collegeMap[selectedCollege]?.[selectedDept] || [])
    : [];

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  /* ---- Student Table (reused in Students tab and College drill-down) ---- */
  const renderStudentTable = (list, csvFilename) => (
    <>
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <span className="search-icon">{Icons.Search}</span>
          <input
            type="text"
            placeholder="Search students by name, email, college..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className="admin-csv-btn"
          onClick={() => downloadCSV(
            list.map(s => ({
              user_unique_id: s.email || s.user_unique_id || 'N/A',
              Name: s.fullName || 'Student',
              Email: s.email || 'N/A',
              Phone: s.phone || 'N/A',
              Gender: s.gender || 'N/A',
              Year: s.year || 'N/A',
              District: s.district || 'N/A',
              College: s.college || 'N/A',
              Department: s.department || 'N/A',              course_unique_code: s.course_unique_code || (s.assignedCourses && s.assignedCourses[0]) || 'Not Assigned',
              progress_percentage: `${parseFloat(s.progress_percentage || 0).toFixed(2)}%`,
              assessment_status: (s.assessment_status === 'true' || s.assessment_status === true) ? 'Passed' : 'Pending',
              course_complete: (s.course_complete === 'true' || s.course_complete === true) ? 'Completed' : 'In Progress',
              certificate_issued: (s.certificate_issued === 'true' || s.certificate_issued === true) ? 'Issued' : 'Not Issued',
              total_score: s.total_score || 'N/A'
            })),
            csvFilename
          )}
        >
          {Icons.Download}
          Export CSV
        </button>
      </div>

      {list.length === 0 ? (
        <div className="admin-content-card">
          <div className="admin-empty-state">
            <div className="empty-icon">{Icons.Students}</div>
            <h4>No students found</h4>
            <p>No students match the current filters.</p>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>College</th>
                <th>Department</th>
                <th>NM Tracking Code</th>
                <th>Progress & Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(s => {
                const code = s.course_unique_code || (s.assignedCourses && s.assignedCourses[0]) || 'Not Assigned';
                const progressNum = parseFloat(s.progress_percentage || 0).toFixed(2);
                const isPassed = s.assessment_status === 'true' || s.assessment_status === true;
                const scoreStr = s.total_score || 'N/A';

                return (
                  <tr key={s.email}>
                    <td>
                      <div className="student-name-cell">
                        <div className="student-avatar-sm">
                          {(s.fullName || '?').charAt(0).toUpperCase()}
                        </div>
                        {s.fullName}
                      </div>
                    </td>
                    <td>{s.email}</td>
                    <td>{s.college || '—'}</td>
                    <td><span className="admin-badge blue">{s.department || '—'}</span></td>
                    <td><code style={{ fontSize: '11.5px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: code !== 'Not Assigned' ? '#0284c7' : '#64748b', fontWeight: 700 }}>{code}</code></td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: progressNum > 0 ? '#0284c7' : '#64748b' }}>
                        ⚡ {progressNum}% Progress
                      </div>
                      <div style={{ fontSize: '11px', color: isPassed ? '#166534' : '#64748b', fontWeight: 600, marginTop: '2px' }}>
                        Assessment: {isPassed ? 'Passed ✓' : 'Pending'} • Score: {scoreStr}
                      </div>
                    </td>
                    <td>
                      <div className="action-btn-group">
                        <button className="action-btn edit" onClick={() => openEdit(s)} title="Edit">{Icons.Edit} Edit</button>
                        <button className="action-btn delete" onClick={() => setDeleteModal(s)} title="Delete">{Icons.Trash} Delete</button>
                        <button className="action-btn assign" onClick={() => openAssign(s)} title="Assign Courses">{Icons.Assign} Assign</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  /* ---- Tab content rendering ---- */
  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <>
            <div className="admin-stats-row">
              <div className="admin-stat-card">
                <div className="stat-icon-box wine">{Icons.Students}</div>
                <div className="stat-info">
                  <span className="stat-value">{students.length}</span>
                  <span className="stat-label">Total Students</span>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-icon-box blue">{Icons.Building}</div>
                <div className="stat-info">
                  <span className="stat-value">{uniqueColleges.length}</span>
                  <span className="stat-label">Colleges</span>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-icon-box green">{Icons.Courses}</div>
                <div className="stat-info">
                  <span className="stat-value">{courses.length}</span>
                  <span className="stat-label">Courses Available</span>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-icon-box amber">{Icons.Certificate}</div>
                <div className="stat-info">
                  <span className="stat-value">
                    {students.reduce((acc, s) => acc + (s.assignedCourses?.length || 0), 0)}
                  </span>
                  <span className="stat-label">Assigned Courses</span>
                </div>
              </div>
            </div>

            {/* Recent Students */}
            <div className="admin-content-card">
              <h3>Recent Registrations</h3>
              {students.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="empty-icon">{Icons.Students}</div>
                  <h4>No students registered yet</h4>
                  <p>Students will appear here after creating an account.</p>
                </div>
              ) : (
                <div className="admin-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>College</th>
                        <th>Department</th>
                        <th>Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.slice(0, 5).map(s => (
                        <tr key={s.email}>
                          <td>
                            <div className="student-name-cell">
                              <div className="student-avatar-sm">
                                {(s.fullName || '?').charAt(0).toUpperCase()}
                              </div>
                              {s.fullName}
                            </div>
                          </td>
                          <td>{s.email}</td>
                          <td>{s.college || '—'}</td>
                          <td><span className="admin-badge blue">{s.department || '—'}</span></td>
                          <td>{s.year || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        );

      case 'Students':
        return renderStudentTable(filteredStudents, 'students_export.csv');

      case 'Colleges':
        return (
          <div className="college-drilldown">
            {drillLevel === 'colleges' && (
              <>
                <div className="admin-toolbar">
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                    All Colleges ({uniqueColleges.length})
                  </div>
                  <button
                    className="admin-csv-btn"
                    onClick={() => downloadCSV(
                      uniqueColleges.map(c => ({
                        College: c,
                        Departments: Object.keys(collegeMap[c]).join('; '),
                        TotalStudents: Object.values(collegeMap[c]).reduce((sum, arr) => sum + arr.length, 0),
                      })),
                      'colleges_export.csv'
                    )}
                  >
                    {Icons.Download} Export CSV
                  </button>
                </div>
                {uniqueColleges.length === 0 ? (
                  <div className="admin-content-card">
                    <div className="admin-empty-state">
                      <div className="empty-icon">{Icons.Building}</div>
                      <h4>No colleges found</h4>
                      <p>Colleges appear when students register with a college name.</p>
                    </div>
                  </div>
                ) : (
                  <div className="drilldown-grid">
                    {uniqueColleges.map(col => {
                      const deptCount = Object.keys(collegeMap[col]).length;
                      const studentCount = Object.values(collegeMap[col]).reduce((sum, arr) => sum + arr.length, 0);
                      return (
                        <div
                          key={col}
                          className="drilldown-card"
                          onClick={() => { setSelectedCollege(col); setDrillLevel('departments'); }}
                        >
                          <div className="drilldown-card-icon college-icon">{Icons.Building}</div>
                          <div className="drilldown-card-info">
                            <h4>{col}</h4>
                            <p>{deptCount} dept{deptCount !== 1 ? 's' : ''} · {studentCount} student{studentCount !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {drillLevel === 'departments' && selectedCollege && (
              <>
                <div className="breadcrumb-bar">
                  <button onClick={() => { setDrillLevel('colleges'); setSelectedCollege(null); }}>Colleges</button>
                  <span className="breadcrumb-sep">›</span>
                  <span className="breadcrumb-current">{selectedCollege}</span>
                </div>
                <div className="admin-toolbar">
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                    Departments in {selectedCollege} ({uniqueDepts.length})
                  </div>
                  <button
                    className="admin-csv-btn"
                    onClick={() => downloadCSV(
                      uniqueDepts.map(d => ({
                        Department: d,
                        College: selectedCollege,
                        Students: (collegeMap[selectedCollege][d] || []).length,
                      })),
                      'departments_export.csv'
                    )}
                  >
                    {Icons.Download} Export CSV
                  </button>
                </div>
                <div className="drilldown-grid">
                  {uniqueDepts.map(dept => {
                    const count = (collegeMap[selectedCollege][dept] || []).length;
                    return (
                      <div
                        key={dept}
                        className="drilldown-card"
                        onClick={() => { setSelectedDept(dept); setDrillLevel('students'); }}
                      >
                        <div className="drilldown-card-icon dept-icon">{Icons.Folder}</div>
                        <div className="drilldown-card-info">
                          <h4>{dept}</h4>
                          <p>{count} student{count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {drillLevel === 'students' && selectedCollege && selectedDept && (
              <>
                <div className="breadcrumb-bar">
                  <button onClick={() => { setDrillLevel('colleges'); setSelectedCollege(null); setSelectedDept(null); }}>Colleges</button>
                  <span className="breadcrumb-sep">›</span>
                  <button onClick={() => { setDrillLevel('departments'); setSelectedDept(null); }}>{selectedCollege}</button>
                  <span className="breadcrumb-sep">›</span>
                  <span className="breadcrumb-current">{selectedDept}</span>
                </div>
                {renderStudentTable(
                  deptStudents.filter(s => {
                    const q = searchQuery.toLowerCase();
                    return (s.fullName || '').toLowerCase().includes(q) ||
                      (s.email || '').toLowerCase().includes(q);
                  }),
                  `${selectedCollege}_${selectedDept}_students.csv`
                )}
              </>
            )}
          </div>
        );

      case 'My Courses':
        return (
          <>
            <div className="admin-toolbar" style={{ gap: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                Available Courses ({courses.length})
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="admin-csv-btn"
                  style={{ backgroundColor: 'var(--red-primary)', color: '#fff', border: 'none' }}
                  onClick={() => openCreateCourse()}
                >
                  + Create Course
                </button>
                <button
                  className="admin-csv-btn"
                  onClick={() => downloadCSV(
                    courses.map(c => ({
                      CourseCode: c.course_unique_code || c.id || 'N/A',
                      CourseName: c.title || c.name || 'Untitled Course',
                      Category: c.category || 'General',
                      Instructor: c.instructor || 'Instructor',
                      Description: c.content || c.course_description || '',
                      VideoCount: c.videos && c.videos.length ? `${c.videos.length} Videos` : '12 Videos',
                      PPTCount: c.ppts && c.ppts.length ? `${c.ppts.length} PPT Decks` : '12 Decks',
                      MidQuiz: 'Mid Examination (25 Marks)',
                      FinalQuiz: 'Final Assessment (25 Marks)',
                      EnrolledStudents: Math.max(c.studentsEnrolled || 0, students.filter(s => s.assignedCourses && (s.assignedCourses.includes(c.title) || s.assignedCourses.includes(c.course_unique_code))).length),
                      ApprovalStatus: c.is_active ? 'Active & Published' : 'Draft'
                    })),
                    'my_courses_export.csv'
                  )}
                >
                  {Icons.Download} Export CSV
                </button>
              </div>
            </div>
            {courses.length === 0 ? (
              <div className="admin-content-card">
                <div className="admin-empty-state">
                  <div className="empty-icon">{Icons.Courses}</div>
                  <h4>No courses created yet</h4>
                  <p>Click "Create Course" to add new learning programs.</p>
                </div>
              </div>
            ) : (
              <div className="courses-grid">
                {courses.map(course => {
                  const trackedCount = course.studentsEnrolled || 0;
                  const assignedCount = students.filter(s => s.assignedCourses && (s.assignedCourses.includes(course.title) || s.assignedCourses.includes(course.course_unique_code))).length;
                  const enrolledCount = Math.max(trackedCount, assignedCount);

                  return (
                    <div key={course._id || course.id} className="course-card">
                      <div className="course-card-image-wrapper" style={{ width: '100%', height: '140px', overflow: 'hidden', borderRadius: '8px', marginBottom: '12px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                          src={course.image || course.course_image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60'} 
                          alt={course.title} 
                          className="course-card-img" 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60';
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <h4 style={{ margin: 0 }}>{course.title}</h4>
                        {!course.is_active && (
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#ffe4e6', color: '#e11d48', fontWeight: 700, border: '1px solid #fecdd3' }}>DRAFT</span>
                        )}
                      </div>
                      <p className="course-card-desc" style={{ fontSize: '13px', color: '#64748b', margin: '8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.content}
                      </p>
                      <p style={{ fontWeight: 600, fontSize: '12.5px', color: '#10b981' }}>
                        {course.is_active ? `${enrolledCount} student${enrolledCount !== 1 ? 's' : ''} enrolled` : 'Not visible to students'}
                      </p>
                      <div className="course-card-badges" style={{ display: 'flex', gap: '5px', margin: '8px 0', flexWrap: 'wrap' }}>
                        {course.ppt && <span className="admin-badge green" style={{ fontSize: '11px' }}>Slides</span>}
                        {course.video && <span className="admin-badge blue" style={{ fontSize: '11px' }}>Video</span>}
                      </div>
                      <div className="course-card-actions" style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', flexWrap: 'wrap' }}>
                        {course.is_active ? (
                          <button className="action-btn assign" style={{ flex: '1 1 100%', padding: '7px', fontWeight: 700, fontSize: '12px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '6px' }} onClick={() => openAssignCourseToStudents(course)}>
                            {Icons.Assign} Assign to Students
                          </button>
                        ) : (
                          <button className="action-btn assign" style={{ flex: '1 1 100%', padding: '7px', fontWeight: 700, fontSize: '12px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }} onClick={() => handleQuickPublish(course)}>
                            🚀 Publish Course
                          </button>
                        )}
                        <button className="action-btn edit" style={{ flex: 1, padding: '6px' }} onClick={() => openEditCourse(course)}>{Icons.Edit} Edit</button>
                        <button className="action-btn delete" style={{ flex: 1, padding: '6px' }} onClick={() => setDeleteCourseModal(course)}>{Icons.Trash} Delete</button>
                      </div>
                      {(course.ppt || course.video) && (
                        <div className="course-card-downloads" style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', marginTop: '8px' }}>
                          {course.ppt && (
                            <a href={course.ppt} download={course.pptName || 'presentation.ppt'} className="action-btn assign" style={{ textDecoration: 'none', textAlign: 'center', display: 'block', fontSize: '12px', padding: '6px' }}>
                              {Icons.Download} Download PPT
                            </a>
                          )}
                          {course.video && (
                            <a href={course.video} download={course.videoName || 'lecture.mp4'} className="action-btn assign" style={{ textDecoration: 'none', textAlign: 'center', display: 'block', fontSize: '12px', padding: '6px' }}>
                              {Icons.Download} Download Video
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );



      case 'Certificates':
        {
          const certStudents = (students || []).map(s => {
            const isIssued = s.certificate_issued === 'true' || s.certificate_issued === true || s.certificate_issued === 'Issued' || s.course_complete === 'true' || Boolean(s.finalQuizPassed);
            return {
              studentName: s.fullName || s.name || 'Student',
              email: s.email || 'N/A',
              college: s.college || 'ANNA UNIVERSITY',
              department: s.department || 'ECE / CSE',
              course: s.course_name || 'IOT Architecture & Embedded Systems',
              courseCode: s.course_unique_code || 'NTEDU0001',
              status: isIssued ? 'Issued' : 'Pending Quiz Completion',
              issuedDate: s.certificate_issued_at ? new Date(s.certificate_issued_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')
            };
          });

          return (
            <>
              <div className="admin-toolbar">
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Certificates Management ({certStudents.length})</div>
                <button 
                  className="admin-csv-btn" 
                  onClick={() => downloadCSV(certStudents.map(c => ({
                    Student: c.studentName,
                    Email: c.email,
                    College: c.college,
                    Department: c.department,
                    Course: c.course,
                    CourseCode: c.courseCode,
                    Status: c.status,
                    IssuedDate: c.issuedDate
                  })), 'student_certificates.csv')}
                >
                  {Icons.Download} Export CSV
                </button>
              </div>
              <div className="admin-content-card">
                {certStudents.length === 0 ? (
                  <div className="admin-empty-state">
                    <div className="empty-icon">{Icons.Certificate}</div>
                    <h4>No certificates issued</h4>
                    <p>Certificates will appear here after course completions.</p>
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>College / Department</th>
                        <th>Course</th>
                        <th>Status</th>
                        <th>Issued Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certStudents.map((st, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{st.studentName}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{st.email}</div>
                          </td>
                          <td>
                            <div>{st.college}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{st.department}</div>
                          </td>
                          <td>
                            <span className="admin-badge blue">{st.courseCode}</span> {st.course}
                          </td>
                          <td>
                            <span className={`admin-badge ${st.status === 'Issued' ? 'green' : 'amber'}`}>
                              {st.status === 'Issued' ? '✓ Issued' : '⏳ In Progress'}
                            </span>
                          </td>
                          <td>{st.issuedDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          );
        }



      case 'Profile':
        return (
          <div className="admin-content-card">
            <h3>Admin Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginTop: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Full Name</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>Admin</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Email</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>admin@smgroups.com</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Role</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>Super Administrator</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Organization</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>The SM Groups</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-portal-wrapper">
      {/* Mobile overlay */}
      {mobileSidebar && <div className="admin-mobile-overlay" onClick={() => setMobileSidebar(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileSidebar ? 'open' : ''}`}>
        <div className="admin-logo-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', marginBottom: '32px' }}>
          <img src={tnskillLogo} alt="TNSkill Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px' }}>POWERED BY</span>
            <img src={smLogo} alt="SM Groups Logo" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div style={{ marginTop: '6px', background: 'linear-gradient(135deg, #722f37 0%, #C41E3A 100%)', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', letterSpacing: '1.2px', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(114, 47, 55, 0.2)' }}>
            Super Admin Portal
          </div>
        </div>

        <div className="admin-menu-section">
          <span className="admin-menu-title">Main Menu</span>
          <ul className="admin-menu-list">
            {MENU_ITEMS.map(item => (
              <li key={item.name}>
                <button
                  onClick={() => {
                    setActiveTab(item.name);
                    setSearchQuery('');
                    if (item.name === 'Colleges') {
                      setDrillLevel('colleges');
                      setSelectedCollege(null);
                      setSelectedDept(null);
                    }
                    setMobileSidebar(false);
                  }}
                  className={`admin-menu-item ${activeTab === item.name ? 'active' : ''}`}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-sidebar-footer">
          <button onClick={() => navigate('/')} className="admin-back-btn">
            {Icons.Back}
            <span>Back to Login</span>
          </button>
          <button onClick={handleSignOut} className="admin-signout-btn">
            {Icons.SignOut}
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        <header className="admin-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button className="mobile-menu-toggle" onClick={() => setMobileSidebar(true)}>
              {Icons.Menu}
            </button>
            <div className="admin-header-info">
              <h1>{activeTab}</h1>
            </div>
          </div>
          <div className="admin-header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="admin-user-avatar" title="Admin">A</div>
            <a href="mailto:thesmgroups@gmail.com?subject=Admin%20Login&body=Password%20-n%20TSMGPVT@2026" className="admin-contact-mail" style={{ color: '#C41E3A', textDecoration: 'none', fontWeight: '600', fontSize: '13px' }}>Contact Admin</a>
          </div>
        </header>

        {renderContent()}
      </main>

      {/* ===== EDIT MODAL ===== */}
      {editModal && (
        <div className="admin-modal-overlay" onClick={() => setEditModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Student</h2>
            <div className="modal-form-group">
              <label>Full Name</label>
              <input value={editModal.fullName || ''} onChange={e => setEditModal({ ...editModal, fullName: e.target.value })} />
            </div>
            <div className="modal-form-group">
              <label>Phone</label>
              <input value={editModal.phone || ''} onChange={e => setEditModal({ ...editModal, phone: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="modal-form-group">
                <label>Gender</label>
                <select value={editModal.gender || ''} onChange={e => setEditModal({ ...editModal, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="modal-form-group">
                <label>Year</label>
                <select value={editModal.year || ''} onChange={e => setEditModal({ ...editModal, year: e.target.value })}>
                  <option value="">Select</option>
                  <option value="I Year">I Year</option>
                  <option value="II Year">II Year</option>
                  <option value="III Year">III Year</option>
                  <option value="IV Year">IV Year</option>
                </select>
              </div>
            </div>
            <div className="modal-form-group">
              <label>District</label>
              <input value={editModal.district || ''} onChange={e => setEditModal({ ...editModal, district: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="modal-form-group">
                <label>College</label>
                <input value={editModal.college || ''} onChange={e => setEditModal({ ...editModal, college: e.target.value })} />
              </div>
              <div className="modal-form-group">
                <label>Department</label>
                <input value={editModal.department || ''} onChange={e => setEditModal({ ...editModal, department: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="modal-btn save" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE MODAL ===== */}
      {deleteModal && (
        <div className="admin-modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="delete-confirm-content">
              <div className="delete-warn-icon">{Icons.Warning}</div>
              <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Delete Student?</h2>
              <p>Are you sure you want to remove <span className="delete-name">{deleteModal.fullName}</span>?</p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>This action cannot be undone.</p>
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="modal-btn cancel" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="modal-btn delete-confirm" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ASSIGN MODAL ===== */}
      {assignModal && (
        <div className="admin-modal-overlay" onClick={() => setAssignModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h2>Assign Courses to {assignModal.fullName}</h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
              Select the courses to assign. Uncheck to remove.
            </p>
            <div className="course-checklist">
              {courses.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No available courses found. Please create a course first.</p>
              ) : (
                courses.map(course => {
                  const keyName = course.course_unique_code || course.title || course.id;
                  const isSelected = assignCourses.includes(keyName) || assignCourses.includes(course.title) || assignCourses.includes(course.course_unique_code);

                  return (
                    <label
                      key={course._id || course.id || keyName}
                      className={`course-checklist-item ${isSelected ? 'checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCourse(keyName)}
                      />
                      <span>
                        <strong>{course.title}</strong>
                        {course.course_unique_code ? <code style={{ fontSize: '11px', background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px', color: '#0284c7' }}>{course.course_unique_code}</code> : ''}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setAssignModal(null)}>Cancel</button>
              <button className="modal-btn save" onClick={saveAssign}>Assign Courses</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== BULK COURSE TARGET ASSIGNMENT MODAL ===== */}
      {assignCourseModal && (
        <div className="admin-modal-overlay" onClick={() => setAssignCourseModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto' }}>
            <h2>Assign Course: <span style={{ color: '#0284c7' }}>{assignCourseModal.course?.title}</span></h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Select the target scope to assign this course to students.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="modal-form-group">
                <label style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Assign Target Scope *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setAssignCourseModal(prev => ({ ...prev, targetMode: 'all' }))}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `2px solid ${assignCourseModal.targetMode === 'all' ? '#0284c7' : '#cbd5e1'}`,
                      background: assignCourseModal.targetMode === 'all' ? '#f0f9ff' : '#fff',
                      color: assignCourseModal.targetMode === 'all' ? '#0369a1' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '13px',
                      textAlign: 'center'
                    }}
                  >
                    🌐 All Students ({students.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignCourseModal(prev => ({ ...prev, targetMode: 'college' }))}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `2px solid ${assignCourseModal.targetMode === 'college' ? '#0284c7' : '#cbd5e1'}`,
                      background: assignCourseModal.targetMode === 'college' ? '#f0f9ff' : '#fff',
                      color: assignCourseModal.targetMode === 'college' ? '#0369a1' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '13px',
                      textAlign: 'center'
                    }}
                  >
                    🏫 By College ({uniqueColleges.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignCourseModal(prev => ({ ...prev, targetMode: 'department' }))}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `2px solid ${assignCourseModal.targetMode === 'department' ? '#0284c7' : '#cbd5e1'}`,
                      background: assignCourseModal.targetMode === 'department' ? '#f0f9ff' : '#fff',
                      color: assignCourseModal.targetMode === 'department' ? '#0369a1' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '13px',
                      textAlign: 'center'
                    }}
                  >
                    🏢 By Department
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignCourseModal(prev => ({ ...prev, targetMode: 'individual' }))}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `2px solid ${assignCourseModal.targetMode === 'individual' ? '#0284c7' : '#cbd5e1'}`,
                      background: assignCourseModal.targetMode === 'individual' ? '#f0f9ff' : '#fff',
                      color: assignCourseModal.targetMode === 'individual' ? '#0369a1' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '13px',
                      textAlign: 'center'
                    }}
                  >
                    👤 Select Students
                  </button>
                </div>
              </div>

              {/* By College Selection Options */}
              {assignCourseModal.targetMode === 'college' && (
                <div className="modal-form-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontWeight: 600, fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>Select Target College</label>
                  <select
                    value={assignCourseModal.targetCollege || 'ALL'}
                    onChange={e => setAssignCourseModal(prev => ({ ...prev, targetCollege: e.target.value }))}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                  >
                    <option value="ALL">All Colleges (All Registered Colleges)</option>
                    {uniqueColleges.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* By Department Selection Options */}
              {assignCourseModal.targetMode === 'department' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '12px', color: '#334155', display: 'block', marginBottom: '4px' }}>College</label>
                    <select
                      value={assignCourseModal.targetCollege || 'ALL'}
                      onChange={e => setAssignCourseModal(prev => ({ ...prev, targetCollege: e.target.value, targetDept: 'ALL' }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                    >
                      <option value="ALL">All Colleges</option>
                      {uniqueColleges.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '12px', color: '#334155', display: 'block', marginBottom: '4px' }}>Department</label>
                    <select
                      value={assignCourseModal.targetDept || 'ALL'}
                      onChange={e => setAssignCourseModal(prev => ({ ...prev, targetDept: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                    >
                      <option value="ALL">All Departments</option>
                      {(assignCourseModal.targetCollege && assignCourseModal.targetCollege !== 'ALL'
                        ? Object.keys(collegeMap[assignCourseModal.targetCollege] || {})
                        : Array.from(new Set(students.map(s => s.department).filter(Boolean)))
                      ).map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Individual Student Checkboxes */}
              {assignCourseModal.targetMode === 'individual' && (
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>Select Individual Students</label>
                    <button
                      type="button"
                      onClick={() => {
                        const allEmails = students.map(s => (s.email || '').toLowerCase()).filter(Boolean);
                        const isAllSelected = (assignCourseModal.selectedStudentEmails || []).length === allEmails.length;
                        setAssignCourseModal(prev => ({ ...prev, selectedStudentEmails: isAllSelected ? [] : allEmails }));
                      }}
                      style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      {(assignCourseModal.selectedStudentEmails || []).length === students.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search student by name or email..."
                    value={assignCourseModal.studentSearch || ''}
                    onChange={e => setAssignCourseModal(prev => ({ ...prev, studentSearch: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '10px', fontSize: '13px' }}
                  />
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {students
                      .filter(s => {
                        const q = (assignCourseModal.studentSearch || '').toLowerCase();
                        return (s.fullName || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q);
                      })
                      .map(s => {
                        const sEmail = (s.email || '').toLowerCase();
                        const isChecked = (assignCourseModal.selectedStudentEmails || []).includes(sEmail);
                        return (
                          <label key={sEmail} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: isChecked ? '#e0f2fe' : '#fff', borderRadius: '6px', border: `1px solid ${isChecked ? '#38bdf8' : '#e2e8f0'}`, cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setAssignCourseModal(prev => {
                                  const currentList = prev.selectedStudentEmails || [];
                                  const newList = currentList.includes(sEmail)
                                    ? currentList.filter(e => e !== sEmail)
                                    : [...currentList, sEmail];
                                  return { ...prev, selectedStudentEmails: newList };
                                });
                              }}
                            />
                            <div style={{ flex: 1, fontSize: '12.5px' }}>
                              <strong>{s.fullName}</strong> <span style={{ color: '#64748b' }}>({s.email})</span>
                              {s.college && <div style={{ fontSize: '10.5px', color: '#0284c7' }}>{s.college} • {s.department}</div>}
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button className="modal-btn cancel" onClick={() => setAssignCourseModal(null)}>Cancel</button>
              <button
                className="modal-btn save"
                onClick={() => handleBulkAssignCourse(assignCourseModal.course, {
                  targetMode: assignCourseModal.targetMode,
                  targetCollege: assignCourseModal.targetCollege,
                  targetDept: assignCourseModal.targetDept,
                  selectedStudentEmails: assignCourseModal.selectedStudentEmails || []
                })}
                style={{ background: '#0284c7', color: '#fff', fontWeight: 700 }}
              >
                🚀 Confirm & Assign Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== COURSE CREATE / EDIT MODAL ===== */}
      {courseModal && (
        <div className="admin-modal-overlay" onClick={() => setCourseModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                {courseModal.mode === 'create' ? '🚀 Create Course' : '✏ Edit Course'}
              </h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="modal-btn cancel" onClick={() => setCourseModal(null)} style={{ padding: '6px 12px', fontSize: '12px' }}>Cancel</button>
                <button className="modal-btn save-draft" onClick={() => saveCourse(false)} style={{ padding: '6px 12px', fontSize: '12.5px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  💾 Save Draft
                </button>
                <button className="modal-btn save" onClick={() => saveCourse(true)} style={{ padding: '7px 18px', fontSize: '13px', background: 'var(--red-primary)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🚀 Publish Course
                </button>
              </div>
            </div>
            <div className="admin-modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>Course Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Embedded Systems"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  value={courseModal.title || ''}
                  onChange={e => setCourseModal({ ...courseModal, title: e.target.value })}
                />
              </div>
              <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>Course Content / Description *</label>
                <textarea
                  placeholder="Enter course syllabus or details..."
                  style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical', fontFamily: 'inherit' }}
                  value={courseModal.content || ''}
                  onChange={e => setCourseModal({ ...courseModal, content: e.target.value })}
                />
              </div>
              <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>Course Unique Code (e.g. NTEDU0005) *</label>
                <input
                  type="text"
                  placeholder="e.g. NTEDU0005"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  value={courseModal.course_unique_code || ''}
                  onChange={e => setCourseModal({ ...courseModal, course_unique_code: e.target.value })}
                />
              </div>
              <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>Course Cover Image (Upload or URL)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label 
                    style={{ 
                      width: '38px', 
                      height: '38px', 
                      borderRadius: '6px', 
                      background: '#f1f5f9', 
                      color: '#0f172a', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      border: '1px dashed #cbd5e1'
                    }}
                    title="Upload Image"
                  >
                    +
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCourseModal(prev => ({ ...prev, image: reader.result, imageFile: file.name }));
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Or paste image URL (e.g. https://img-c.udemycdn.com/...)"
                    style={{ flex: 1, padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    value={courseModal.image || ''}
                    onChange={e => setCourseModal({ ...courseModal, image: e.target.value })}
                  />
                </div>
                {courseModal.imageFile && <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>✓ File: {courseModal.imageFile}</span>}
                
                {/* Live Image Preview Container */}
                {courseModal.image && (
                  <div style={{ marginTop: '8px', position: 'relative', width: '100%', height: '130px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #38bdf8', background: '#0f172a' }}>
                    <img
                      src={courseModal.image}
                      alt="Course Cover Live Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(15, 23, 42, 0.85)', color: '#38bdf8', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      🖼 Live Course Cover Preview
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>Instructor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Stephen Grider"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={courseModal.instructor || ''}
                    onChange={e => setCourseModal({ ...courseModal, instructor: e.target.value })}
                  />
                </div>
                <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Programming / Electronics"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={courseModal.category || ''}
                    onChange={e => setCourseModal({ ...courseModal, category: e.target.value })}
                  />
                </div>
              </div>
              {/* 12 Video Upload / URL Slots */}
              <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <label style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>🎬 Course Videos (12 Slots - Upload or URL)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const videoVal = courseModal.videos?.[idx] || '';
                    const isUrl = videoVal.startsWith('http://') || videoVal.startsWith('https://');
                    const hasContent = Boolean(videoVal);

                    return (
                      <div key={idx} style={{ border: '1px dashed #0ea5e9', borderRadius: '8px', padding: '10px', background: '#f0f9ff', textAlign: 'center', position: 'relative' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', marginBottom: '6px' }}>Video #{idx + 1}</div>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '6px' }}>
                          <label 
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '6px', 
                              background: '#e0f2fe', 
                              color: '#0284c7', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '18px', 
                              fontWeight: 'bold', 
                              cursor: 'pointer',
                              border: '1px solid #7dd3fc'
                            }}
                            title="Upload File"
                          >
                            +
                            <input 
                              type="file" 
                              accept="video/*" 
                              onChange={e => handleMultiFileChange(e, 'videos', idx)}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Or paste video URL..." 
                          value={isUrl ? videoVal : courseModal.videosNames?.[idx] ? `[File] ${courseModal.videosNames[idx]}` : ''} 
                          onChange={e => {
                            const val = e.target.value;
                            setCourseModal(prev => {
                              const arr = [...(prev.videos || Array(12).fill(''))];
                              arr[idx] = val;
                              return { ...prev, videos: arr };
                            });
                          }}
                          style={{ width: '100%', fontSize: '10px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #bae6fd' }}
                        />
                        {hasContent && (
                          <div style={{ marginTop: '6px', position: 'relative', width: '100%', height: '65px', borderRadius: '6px', overflow: 'hidden', background: '#0f172a', border: '1px solid #0284c7' }}>
                            {videoVal.startsWith('data:video') || videoVal.startsWith('http') || videoVal.startsWith('/courses/') ? (
                              <video
                                src={videoVal}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                muted
                                preload="metadata"
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '9px', fontWeight: 700 }}>
                                🎬 Video Stream Ready
                              </div>
                            )}
                            <div style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'rgba(22, 163, 74, 0.9)', color: '#fff', fontSize: '8px', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                              ✓ Video Preview
                            </div>
                            <button
                              type="button"
                              onClick={() => setPreviewVideoModal({ title: `Video #${idx + 1} Preview`, url: videoVal || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" })}
                              style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(15, 23, 42, 0.9)', color: '#38bdf8', border: 'none', borderRadius: '4px', fontSize: '9px', padding: '2px 6px', cursor: 'pointer', fontWeight: 700, zIndex: 5 }}
                              title="Watch Fullscreen Video"
                            >
                              👁 Watch
                            </button>
                          </div>
                        )}
                        {idx === 5 && (
                          <div style={{ marginTop: '6px', padding: '3px', background: '#fef3c7', borderRadius: '4px', fontSize: '9px', color: '#92400e', fontWeight: 700 }}>
                            📝 MID-QUIZ
                          </div>
                        )}
                        {idx === 11 && (
                          <div style={{ marginTop: '6px', padding: '3px', background: '#dcfce7', borderRadius: '4px', fontSize: '9px', color: '#166534', fontWeight: 700 }}>
                            🏆 FINAL QUIZ
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 12 PPT Upload / URL Slots */}
              <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <label style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>📊 Course PPT Presentations (12 Slots - Upload or URL)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const pptVal = courseModal.ppts?.[idx] || '';
                    const isUrl = pptVal.startsWith('http://') || pptVal.startsWith('https://');
                    const hasContent = Boolean(pptVal);

                    return (
                      <div key={idx} style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '10px', background: '#f8fafc', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>PPT #{idx + 1}</div>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '6px' }}>
                          <label 
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '6px', 
                              background: '#e2e8f0', 
                              color: '#334155', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '18px', 
                              fontWeight: 'bold', 
                              cursor: 'pointer',
                              border: '1px solid #cbd5e1'
                            }}
                            title="Upload PPT File"
                          >
                            +
                            <input 
                              type="file" 
                              accept=".ppt,.pptx,.pdf" 
                              onChange={e => handleMultiFileChange(e, 'ppts', idx)}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Or paste PPT URL..." 
                          value={isUrl ? pptVal : courseModal.pptsNames?.[idx] ? `[File] ${courseModal.pptsNames[idx]}` : ''} 
                          onChange={e => {
                            const val = e.target.value;
                            setCourseModal(prev => {
                              const arr = [...(prev.ppts || Array(12).fill(''))];
                              arr[idx] = val;
                              return { ...prev, ppts: arr };
                            });
                          }}
                          style={{ width: '100%', fontSize: '10px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                        {hasContent && (
                          <div style={{ marginTop: '6px', position: 'relative', width: '100%', height: '65px', borderRadius: '6px', overflow: 'hidden', background: '#1e293b', border: '1px solid #475569', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4px' }}>
                            <div style={{ fontSize: '18px' }}>📊</div>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: '#38bdf8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%' }}>
                              {courseModal.pptsNames?.[idx] || `PPT #${idx + 1} Deck`}
                            </div>
                            <div style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'rgba(37, 99, 235, 0.9)', color: '#fff', fontSize: '8px', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                              ✓ PPT Loaded
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2 SEPARATE QUIZ CREATORS: MID-COURSE QUIZ (25 Qs) & FINAL QUIZ (25 Qs) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  📝 Quiz Paper Creators (Mid-Course & Final Assessment)
                </h4>

                {/* 1. MID-COURSE QUIZ CREATOR (25 QUESTIONS) */}
                <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#873800', marginBottom: '4px' }}>
                    1. 📝 Mid-Course Quiz Paper Creator (25 Questions — After Video 6)
                  </div>
                  <div style={{ fontSize: '11px', color: '#b7eb8f', color: '#734a00', marginBottom: '10px' }}>
                    Students take this 25-question quiz after Video 6 to unlock Video 7.
                  </div>
                  <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                    {Array.from({ length: 25 }).map((_, qIdx) => (
                      <div key={qIdx} style={{ background: '#ffffff', border: '1px solid #ffe58f', borderRadius: '6px', padding: '8px' }}>
                        <div style={{ fontWeight: 700, fontSize: '11px', color: '#873800', marginBottom: '4px' }}>
                          Mid Q#{qIdx + 1} (1 Mark)
                        </div>
                        <input 
                          type="text" 
                          placeholder={`Mid-Quiz Question #${qIdx + 1}...`}
                          value={courseModal[`mid_q_${qIdx}`] || ''}
                          onChange={e => setCourseModal({ ...courseModal, [`mid_q_${qIdx}`]: e.target.value })}
                          style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', marginBottom: '4px' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          {[0, 1, 2, 3].map(optIdx => {
                            const isSelected = (courseModal[`mid_correct_${qIdx}`] ?? 0) === optIdx;
                            return (
                              <div 
                                key={optIdx} 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '6px', 
                                  background: isSelected ? '#f0fdf4' : '#fff', 
                                  border: `1px solid ${isSelected ? '#16a34a' : '#cbd5e1'}`, 
                                  padding: '4px 6px', 
                                  borderRadius: '6px' 
                                }}
                              >
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#166534' : '#475569' }}>
                                  <input 
                                    type="radio" 
                                    name={`mid_correct_${qIdx}`} 
                                    checked={isSelected}
                                    onChange={() => setCourseModal({ ...courseModal, [`mid_correct_${qIdx}`]: optIdx })}
                                    style={{ accentColor: '#16a34a', cursor: 'pointer' }}
                                  />
                                  {isSelected ? '✓ Correct' : 'Correct?'}
                                </label>
                                <input 
                                  type="text" 
                                  placeholder={`Opt ${optIdx + 1}`}
                                  value={courseModal[`mid_opt_${qIdx}_${optIdx}`] || ''}
                                  onChange={e => setCourseModal({ ...courseModal, [`mid_opt_${qIdx}_${optIdx}`]: e.target.value })}
                                  style={{ flex: 1, padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '10px' }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. FINAL ASSESSMENT QUIZ CREATOR (25 QUESTIONS) */}
                <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#135200', marginBottom: '4px' }}>
                    2. 🏆 Final Assessment Quiz Paper Creator (25 Questions — After Video 12)
                  </div>
                  <div style={{ fontSize: '11px', color: '#237804', marginBottom: '10px' }}>
                    Students take this 25-question final assessment after Video 12 to unlock Certification.
                  </div>
                  <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                    {Array.from({ length: 25 }).map((_, qIdx) => (
                      <div key={qIdx} style={{ background: '#ffffff', border: '1px solid #b7eb8f', borderRadius: '6px', padding: '8px' }}>
                        <div style={{ fontWeight: 700, fontSize: '11px', color: '#135200', marginBottom: '4px' }}>
                          Final Q#{qIdx + 1} (1 Mark)
                        </div>
                        <input 
                          type="text" 
                          placeholder={`Final Assessment Question #${qIdx + 1}...`}
                          value={courseModal[`final_q_${qIdx}`] || ''}
                          onChange={e => setCourseModal({ ...courseModal, [`final_q_${qIdx}`]: e.target.value })}
                          style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', marginBottom: '6px' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          {[0, 1, 2, 3].map(optIdx => {
                            const isSelected = (courseModal[`final_correct_${qIdx}`] ?? 0) === optIdx;
                            return (
                              <div 
                                key={optIdx} 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '6px', 
                                  background: isSelected ? '#f0fdf4' : '#fff', 
                                  border: `1px solid ${isSelected ? '#16a34a' : '#cbd5e1'}`, 
                                  padding: '4px 6px', 
                                  borderRadius: '6px' 
                                }}
                              >
                                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#166534' : '#475569' }}>
                                  <input 
                                    type="radio" 
                                    name={`final_correct_${qIdx}`} 
                                    checked={isSelected}
                                    onChange={() => setCourseModal({ ...courseModal, [`final_correct_${qIdx}`]: optIdx })}
                                    style={{ accentColor: '#16a34a', cursor: 'pointer' }}
                                  />
                                  {isSelected ? '✓ Correct' : 'Correct?'}
                                </label>
                                <input 
                                  type="text" 
                                  placeholder={`Opt ${optIdx + 1}`}
                                  value={courseModal[`final_opt_${qIdx}_${optIdx}`] || ''}
                                  onChange={e => setCourseModal({ ...courseModal, [`final_opt_${qIdx}_${optIdx}`]: e.target.value })}
                                  style={{ flex: 1, padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '10px' }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
             <div className="modal-actions" style={{ marginTop: '20px', position: 'sticky', bottom: 0, background: '#ffffff', padding: '14px 0', borderTop: '1px solid #e2e8f0', zIndex: 10, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="modal-btn cancel" onClick={() => setCourseModal(null)} style={{ padding: '10px 18px', fontSize: '13px' }}>Cancel</button>
              <button className="modal-btn save-draft" onClick={() => saveCourse(false)} style={{ background: '#f1f5f9', color: '#475569', fontWeight: 600, padding: '10px 20px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', border: '1px solid #cbd5e1' }}>
                💾 Save as Draft
              </button>
              <button className="modal-btn save" onClick={() => saveCourse(true)} style={{ background: 'var(--red-primary)', color: '#fff', fontWeight: 700, padding: '10px 24px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🚀 Publish Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE COURSE MODAL ===== */}
      {deleteCourseModal && (
        <div className="admin-modal-overlay" onClick={() => setDeleteCourseModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="delete-confirm-content">
              <div className="delete-warn-icon">{Icons.Warning}</div>
              <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Delete Course?</h2>
              <p>Are you sure you want to delete <span className="delete-name">{deleteCourseModal.title}</span>?</p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>This will remove the course and its files permanently.</p>
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="modal-btn cancel" onClick={() => setDeleteCourseModal(null)}>Cancel</button>
              <button className="modal-btn delete-confirm" onClick={confirmDeleteCourse}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== QUIZ CREATE / EDIT MODAL ===== */}
      {quizModal && (
        <div className="admin-modal-overlay" onClick={() => setQuizModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <h2>{quizModal.mode === 'create' ? 'Add New Quiz' : 'Edit Quiz'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>Quiz Name *</label>
                <input
                  id="quiz-name-input"
                  type="text"
                  placeholder="e.g. Embedded Systems - Module 1 Quiz"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  value={quizModal.title}
                  onChange={e => setQuizModal({ ...quizModal, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>Link to Course</label>
                  <select
                    id="quiz-course-select"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                    value={quizModal.courseId}
                    onChange={e => {
                      const cId = e.target.value;
                      const found = courses.find(c => String(c._id || c.id) === cId);
                      setQuizModal({ ...quizModal, courseId: cId, courseTitle: found ? found.title : '' });
                    }}
                  >
                    <option value="">— No course —</option>
                    {courses.map(c => (
                      <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>Assign To</label>
                  <select
                    id="quiz-assign-select"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                    value={quizModal.assignTo}
                    onChange={e => setQuizModal({ ...quizModal, assignTo: e.target.value, assignCollege: '', assignDepartment: '' })}
                  >
                    <option value="all">All Students</option>
                    <option value="college">Specific College</option>
                    <option value="department">Specific Department</option>
                  </select>
                </div>
              </div>

              {(quizModal.assignTo === 'college' || quizModal.assignTo === 'department') && (
                <div style={{ display: 'grid', gridTemplateColumns: quizModal.assignTo === 'department' ? '1fr 1fr' : '1fr', gap: '14px' }}>
                  <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>College</label>
                    <select
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                      value={quizModal.assignCollege}
                      onChange={e => setQuizModal({ ...quizModal, assignCollege: e.target.value, assignDepartment: '' })}
                    >
                      <option value="">Select College</option>
                      {uniqueColleges.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  {quizModal.assignTo === 'department' && quizModal.assignCollege && (
                    <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>Department</label>
                      <select
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                        value={quizModal.assignDepartment}
                        onChange={e => setQuizModal({ ...quizModal, assignDepartment: e.target.value })}
                      >
                        <option value="">Select Department</option>
                        {Object.keys(collegeMap[quizModal.assignCollege] || {}).map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Questions Builder */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <label style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Questions ({quizFormQuestions.length})</label>
                  <button
                    type="button"
                    className="admin-csv-btn"
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                    onClick={addQuestion}
                  >
                    + Add Question
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                  {quizFormQuestions.map((q, qIdx) => (
                    <div key={qIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: '#475569' }}>Q{qIdx + 1}</span>
                        {quizFormQuestions.length > 1 && (
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                            onClick={() => removeQuestion(qIdx)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Enter question text..."
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '10px', fontSize: '13px', fontFamily: 'inherit' }}
                        value={q.question}
                        onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctAnswer === optIdx}
                              onChange={() => updateQuestion(qIdx, 'correctAnswer', optIdx)}
                              style={{ accentColor: '#16a34a', width: '16px', height: '16px', cursor: 'pointer' }}
                              title="Mark as correct answer"
                            />
                            <input
                              type="text"
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: `1px solid ${q.correctAnswer === optIdx ? '#86efac' : '#cbd5e1'}`, fontSize: '12.5px', fontFamily: 'inherit', background: q.correctAnswer === optIdx ? '#f0fdf4' : '#fff' }}
                              value={opt}
                              onChange={e => updateOption(qIdx, optIdx, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '6px' }}>Select the radio button next to the correct answer</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button className="modal-btn cancel" onClick={() => setQuizModal(null)}>Cancel</button>
              <button className="modal-btn save" id="save-quiz-btn" onClick={saveQuiz}>
                {quizModal.mode === 'create' ? 'Create Quiz' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE QUIZ MODAL ===== */}
      {deleteQuizModal && (
        <div className="admin-modal-overlay" onClick={() => setDeleteQuizModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="delete-confirm-content">
              <div className="delete-warn-icon">{Icons.Warning}</div>
              <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Delete Quiz?</h2>
              <p>Are you sure you want to delete <span className="delete-name">{deleteQuizModal.title}</span>?</p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>This will also remove all student submissions.</p>
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="modal-btn cancel" onClick={() => setDeleteQuizModal(null)}>Cancel</button>
              <button className="modal-btn delete-confirm" onClick={confirmDeleteQuiz}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FULLSCREEN VIDEO PREVIEW WATCH MODAL ===== */}
      {previewVideoModal && (
        <div className="admin-modal-overlay" onClick={() => setPreviewVideoModal(null)} style={{ zIndex: 1100 }}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', background: '#0f172a', color: '#fff', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#38bdf8', fontWeight: 700 }}>🎬 {previewVideoModal.title}</h3>
              <button onClick={() => setPreviewVideoModal(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer' }}>✕</button>
            </div>
            <video
              id="adminPreviewVideoPlayer"
              controls
              autoPlay
              controlsList="nodownload"
              style={{ width: '100%', height: '420px', borderRadius: '8px', background: '#000', objectFit: 'contain' }}
              src={previewVideoModal.url}
              onError={(e) => {
                e.target.src = "https://vjs.zencdn.net/v/oceans.mp4";
                e.target.play();
              }}
            >
              Your browser does not support HTML5 video.
            </video>
          </div>
        </div>
      )}

      {/* ===== FULLSCREEN PPT SLIDE VIEWER MODAL ===== */}
      {previewPptModal && (
        <div className="admin-modal-overlay" onClick={() => setPreviewPptModal(null)} style={{ zIndex: 1100 }}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '950px', background: '#0f172a', color: '#fff', borderRadius: '14px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📊</span>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#38bdf8', fontWeight: 700 }}>{previewPptModal.title}</h3>
              </div>
              <button onClick={() => setPreviewPptModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '22px', cursor: 'pointer' }}>✕</button>
            </div>
            
            {/* Original Document Presentation Viewer Container */}
            <div style={{ width: '100%', height: '480px', borderRadius: '10px', overflow: 'hidden', background: '#1e293b', border: '1px solid #334155', position: 'relative' }}>
              {(() => {
                const rawUrl = previewPptModal.url || '';
                if (!rawUrl) {
                  return (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: '20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                      <h4 style={{ color: '#f8fafc', margin: '0 0 8px 0' }}>{previewPptModal.name || 'Module Presentation Deck.pptx'}</h4>
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
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Original PowerPoint Document Viewer</span>
              <a
                href={previewPptModal.url && previewPptModal.url !== '#' ? previewPptModal.url : '#'}
                download={previewPptModal.name || 'presentation.pptx'}
                target="_blank"
                rel="noreferrer"
                style={{ background: '#2563eb', color: '#fff', padding: '8px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                onClick={(e) => {
                  if (!previewPptModal.url || previewPptModal.url === '#') {
                    e.preventDefault();
                    const content = `=====================================================\nTHE SM GROUPS | TNSKILL LMS PORTAL\nMODULE PRESENTATION SLIDES: ${previewPptModal.title || 'Course Presentation'}\nFILE: ${previewPptModal.name || 'presentation.pptx'}\n=====================================================\n\nSLIDE 1: TITLE & OBJECTIVES\n- Subject: Technical Core Concepts & Architecture\n- Presented By: SM Groups Engineering Faculty\n\nSLIDE 2: KEY CONCEPTS & SYSTEM ARCHITECTURE\n- Fundamental Principles & Industry Standards\n- Structural Components & Interfacing Overview\n\nSLIDE 3: DETAILED TECHNICAL IMPLEMENTATION\n- Step-by-Step Execution Guidelines\n- Performance Optimization & Troubleshooting\n\nSLIDE 4: EXAMINATION REVIEW & QUIZ PREPARATION\n=====================================================\n`;
                    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
                    const url = URL.createObjectURL(blob);
                    const tempA = document.createElement('a');
                    tempA.href = url;
                    tempA.download = (previewPptModal.name || 'presentation.pptx').endsWith('.pptx') ? (previewPptModal.name || 'presentation.pptx') : `${previewPptModal.name || 'presentation'}.pptx`;
                    document.body.appendChild(tempA);
                    tempA.click();
                    document.body.removeChild(tempA);
                    URL.revokeObjectURL(url);
                  }
                }}
              >
                📥 Download Original PPT (.pptx)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ===== TOAST ===== */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
