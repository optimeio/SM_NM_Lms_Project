import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPortal.css';

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
};

const MENU_ITEMS = [
  { name: 'Dashboard', icon: Icons.Dashboard },
  { name: 'Students', icon: Icons.Students },
  { name: 'Colleges', icon: Icons.Colleges },
  { name: 'My Courses', icon: Icons.Courses },
  { name: 'Live Classes', icon: Icons.LiveClass },
  { name: 'Assignments / Quiz', icon: Icons.Quiz },
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
  const [deleteCourseModal, setDeleteCourseModal] = useState(null);

  // Quiz states
  const [quizzes, setQuizzes] = useState([]);
  const [quizModal, setQuizModal] = useState(null);
  const [deleteQuizModal, setDeleteQuizModal] = useState(null);
  const [submissionsView, setSubmissionsView] = useState(null); // { quiz, submissions }
  const [quizFormQuestions, setQuizFormQuestions] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || (user.email !== 'admin@smgroups.com' && user.email !== 'thesmgroups@gmail.com')) {
      navigate('/login');
      return;
    }
    fetchStudents();
    fetchCourses();
    fetchQuizzes();
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Failed to fetch courses', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API}/users`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
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
      const res = await fetch(`${API}/users/${encodeURIComponent(deleteModal.email)}`, {
        method: 'DELETE',
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
    setAssignCourses(student.assignedCourses || []);
  };
  const toggleCourse = (course) => {
    setAssignCourses(prev =>
      prev.includes(course) ? prev.filter(c => c !== course) : [...prev, course]
    );
  };
  const saveAssign = async () => {
    try {
      const res = await fetch(`${API}/users/${encodeURIComponent(assignModal.email)}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: assignCourses }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Courses assigned!');
        fetchStudents();
        setAssignModal(null);
      } else {
        showToast(data.message || 'Assign failed', 'error');
      }
    } catch {
      showToast('Server error', 'error');
    }
  };

  /* ---- COURSE HANDLERS ---- */
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCourseModal(prev => ({
        ...prev,
        [fieldName]: reader.result,
        [fieldName + 'File']: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const saveCourse = async () => {
    if (!courseModal.title || !courseModal.content) {
      showToast('Title and content are required!', 'error');
      return;
    }
    try {
      const isCreate = courseModal.mode === 'create';
      const url = isCreate ? '/api/admin/courses' : `/api/admin/courses/${courseModal._id || courseModal.id}`;
      const method = isCreate ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseModal)
      });
      const data = await res.json();
      if (data.success) {
        showToast(isCreate ? 'Course created successfully!' : 'Course updated successfully!');
        fetchCourses();
        setCourseModal(null);
      } else {
        showToast(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error', 'error');
    }
  };

  const confirmDeleteCourse = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${deleteCourseModal._id || deleteCourseModal.id}`, {
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
      showToast('Server error', 'error');
    }
  };

  /* ---- QUIZ HANDLERS ---- */
  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes');
      const data = await res.json();
      if (data.success) setQuizzes(data.quizzes);
    } catch (err) {
      console.error('Failed to fetch quizzes', err);
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
    navigate('/login');
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
              Name: s.fullName,
              Email: s.email,
              Phone: s.phone,
              Gender: s.gender,
              Year: s.year,
              District: s.district,
              College: s.college,
              Department: s.department,
              AssignedCourses: (s.assignedCourses || []).join('; '),
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
                <th>Year</th>
                <th>Courses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(s => (
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
                  <td>
                    {(s.assignedCourses && s.assignedCourses.length > 0)
                      ? <span className="admin-badge green">{s.assignedCourses.length} course{s.assignedCourses.length > 1 ? 's' : ''}</span>
                      : <span style={{ color: '#94a3b8', fontSize: '12px' }}>None</span>
                    }
                  </td>
                  <td>
                    <div className="action-btn-group">
                      <button className="action-btn edit" onClick={() => openEdit(s)} title="Edit">{Icons.Edit} Edit</button>
                      <button className="action-btn delete" onClick={() => setDeleteModal(s)} title="Delete">{Icons.Trash} Delete</button>
                      <button className="action-btn assign" onClick={() => openAssign(s)} title="Assign Courses">{Icons.Assign} Assign</button>
                    </div>
                  </td>
                </tr>
              ))}
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
                  onClick={() => setCourseModal({ mode: 'create', title: '', content: '', image: '', imageFile: '', ppt: '', pptFile: '', video: '', videoFile: '' })}
                >
                  + Create Course
                </button>
                <button
                  className="admin-csv-btn"
                  onClick={() => downloadCSV(
                    courses.map(c => ({
                      CourseName: c.title,
                      Content: c.content,
                      HasImage: c.image ? 'Yes' : 'No',
                      HasPPT: c.ppt ? 'Yes' : 'No',
                      HasVideo: c.video ? 'Yes' : 'No',
                      AssignedStudents: students.filter(s => (s.assignedCourses || []).includes(c.title)).length,
                    })),
                    'courses_export.csv'
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
                  const count = students.filter(s => (s.assignedCourses || []).includes(course.title)).length;
                  return (
                    <div key={course._id || course.id} className="course-card">
                      {course.image ? (
                        <div className="course-card-image-wrapper" style={{ width: '100%', height: '140px', overflow: 'hidden', borderRadius: '8px', marginBottom: '12px' }}>
                          <img src={course.image} alt={course.title} className="course-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div className="course-card-icon">{Icons.Courses}</div>
                      )}
                      <h4>{course.title}</h4>
                      <p className="course-card-desc" style={{ fontSize: '13px', color: '#64748b', margin: '8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.content}
                      </p>
                      <p style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--red-primary)' }}>
                        {count} student{count !== 1 ? 's' : ''} enrolled
                      </p>
                      <div className="course-card-badges" style={{ display: 'flex', gap: '5px', margin: '8px 0', flexWrap: 'wrap' }}>
                        {course.ppt && <span className="admin-badge green" style={{ fontSize: '11px' }}>Slides</span>}
                        {course.video && <span className="admin-badge blue" style={{ fontSize: '11px' }}>Video</span>}
                      </div>
                      <div className="course-card-actions" style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <button className="action-btn edit" style={{ flex: 1, padding: '6px' }} onClick={() => setCourseModal({ mode: 'edit', ...course })}>{Icons.Edit} Edit</button>
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

      case 'Live Classes':
        return (
          <>
            <div className="admin-toolbar">
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Live Classes</div>
              <button className="admin-csv-btn" onClick={() => downloadCSV([{ Status: 'No live classes scheduled' }], 'live_classes.csv')}>
                {Icons.Download} Export CSV
              </button>
            </div>
            <div className="admin-content-card">
              <div className="admin-empty-state">
                <div className="empty-icon">{Icons.LiveClass}</div>
                <h4>No live classes scheduled</h4>
                <p>Schedule live sessions for your students from here.</p>
              </div>
            </div>
          </>
        );

      case 'Assignments / Quiz':
        // Submissions detail view
        if (submissionsView) {
          const { quiz: svQuiz, submissions: svSubs } = submissionsView;
          return (
            <>
              <div className="breadcrumb-bar">
                <button onClick={() => setSubmissionsView(null)}>Quizzes</button>
                <span className="breadcrumb-sep">›</span>
                <span className="breadcrumb-current">{svQuiz.title} — Submissions</span>
              </div>
              <div className="admin-toolbar">
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  {svSubs.length} Submission{svSubs.length !== 1 ? 's' : ''}
                </div>
                <button
                  className="admin-csv-btn"
                  onClick={() => downloadCSV(
                    svSubs.map(s => ({
                      Student: s.studentEmail,
                      Score: s.score,
                      Total: s.totalQuestions,
                      Percentage: Math.round((s.score / s.totalQuestions) * 100) + '%',
                      SubmittedAt: s.submittedAt ? new Date(s.submittedAt).toLocaleString() : ''
                    })),
                    `${svQuiz.title}_submissions.csv`
                  )}
                >
                  {Icons.Download} Export CSV
                </button>
              </div>
              {svSubs.length === 0 ? (
                <div className="admin-content-card">
                  <div className="admin-empty-state">
                    <div className="empty-icon">{Icons.Quiz}</div>
                    <h4>No submissions yet</h4>
                    <p>Students haven't submitted this quiz yet.</p>
                  </div>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Student Email</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {svSubs.map((sub, idx) => {
                        const pct = Math.round((sub.score / sub.totalQuestions) * 100);
                        const badgeClass = pct >= 70 ? 'green' : pct >= 40 ? 'blue' : 'wine';
                        return (
                          <tr key={idx}>
                            <td>{sub.studentEmail}</td>
                            <td><strong>{sub.score}</strong> / {sub.totalQuestions}</td>
                            <td><span className={`admin-badge ${badgeClass}`}>{pct}%</span></td>
                            <td>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          );
        }

        // Quiz list view
        return (
          <>
            <div className="admin-toolbar" style={{ gap: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                Quizzes ({quizzes.length})
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="admin-csv-btn"
                  id="add-quiz-btn"
                  style={{ backgroundColor: 'var(--red-primary)', color: '#fff', border: 'none' }}
                  onClick={openQuizCreate}
                >
                  + Add Quiz
                </button>
                <button
                  className="admin-csv-btn"
                  onClick={() => downloadCSV(
                    quizzes.map(q => ({
                      QuizName: q.title,
                      Course: q.courseTitle || '—',
                      AssignedTo: q.assignTo === 'all' ? 'All Students' : q.assignTo === 'college' ? q.assignCollege : `${q.assignCollege} / ${q.assignDepartment}`,
                      Questions: q.questions?.length || 0
                    })),
                    'quizzes_export.csv'
                  )}
                >
                  {Icons.Download} Export CSV
                </button>
              </div>
            </div>
            {quizzes.length === 0 ? (
              <div className="admin-content-card">
                <div className="admin-empty-state">
                  <div className="empty-icon">{Icons.Quiz}</div>
                  <h4>No quizzes yet</h4>
                  <p>Click "Add Quiz" to create MCQ quizzes for enrolled students.</p>
                </div>
              </div>
            ) : (
              <div className="courses-grid">
                {quizzes.map(quiz => {
                  const qCount = quiz.questions?.length || 0;
                  const assignLabel = quiz.assignTo === 'all' ? 'All Students' : quiz.assignTo === 'college' ? quiz.assignCollege : `${quiz.assignCollege} / ${quiz.assignDepartment}`;
                  return (
                    <div key={quiz._id || quiz.id} className="course-card">
                      <div className="course-card-icon" style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#2563eb' }}>{Icons.Quiz}</div>
                      <h4>{quiz.title}</h4>
                      {quiz.courseTitle && <p style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, marginBottom: '4px' }}>📚 {quiz.courseTitle}</p>}
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{qCount} question{qCount !== 1 ? 's' : ''}</p>
                      <div style={{ display: 'flex', gap: '5px', margin: '8px 0', flexWrap: 'wrap' }}>
                        <span className="admin-badge green" style={{ fontSize: '11px' }}>{assignLabel}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', flexWrap: 'wrap' }}>
                        <button className="action-btn edit" style={{ flex: 1, padding: '6px' }} onClick={() => openQuizEdit(quiz)}>{Icons.Edit} Edit</button>
                        <button className="action-btn delete" style={{ flex: 1, padding: '6px' }} onClick={() => setDeleteQuizModal(quiz)}>{Icons.Trash} Delete</button>
                        <button className="action-btn assign" style={{ flex: '1 1 100%', padding: '6px' }} onClick={() => viewSubmissions(quiz)}>{Icons.Students} View Submissions</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );

      case 'Certificates':
        return (
          <>
            <div className="admin-toolbar">
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Certificates</div>
              <button className="admin-csv-btn" onClick={() => downloadCSV([{ Status: 'No certificates issued' }], 'certificates.csv')}>
                {Icons.Download} Export CSV
              </button>
            </div>
            <div className="admin-content-card">
              <div className="admin-empty-state">
                <div className="empty-icon">{Icons.Certificate}</div>
                <h4>No certificates issued</h4>
                <p>Certificates will appear here after course completions.</p>
              </div>
            </div>
          </>
        );

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
        <div className="admin-logo-area">
          <div className="admin-logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="admin-logo-text">
            <h2>SM GROUPS</h2>
            <p>admin portal</p>
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
          <button onClick={() => navigate('/login')} className="admin-back-btn">
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
              <h1>Admin Portal</h1>
              <p>Manage students, courses, and institution data</p>
            </div>
          </div>
            <div className="admin-user-avatar" title="Admin">A</div>
            <a href="mailto:thesmgroups@gmail.com?subject=Admin%20Login&body=Password%20-n%20TSMGPVT@2026" className="admin-contact-mail" style={{ marginLeft: '16px', color: '#C41E3A', textDecoration: 'none', fontWeight: '600' }}>Contact Admin</a>
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
              {courses.map(course => (
                <label
                  key={course._id || course.id}
                  className={`course-checklist-item ${assignCourses.includes(course.title) ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={assignCourses.includes(course.title)}
                    onChange={() => toggleCourse(course.title)}
                  />
                  <span>{course.title}</span>
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setAssignModal(null)}>Cancel</button>
              <button className="modal-btn save" onClick={saveAssign}>Assign Courses</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== COURSE CREATE / EDIT MODAL ===== */}
      {courseModal && (
        <div className="admin-modal-overlay" onClick={() => setCourseModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2>{courseModal.mode === 'create' ? 'Create New Course' : 'Edit Course'}</h2>
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
                <label style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>Course Image (Upload)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileChange(e, 'image')}
                />
                {courseModal.imageFile && <span style={{ fontSize: '12px', color: '#64748b' }}>Selected: {courseModal.imageFile}</span>}
              </div>
              <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>PPT Presentation (Upload)</label>
                <input
                  type="file"
                  accept=".ppt,.pptx"
                  onChange={e => handleFileChange(e, 'ppt')}
                />
                {courseModal.pptFile && <span style={{ fontSize: '12px', color: '#64748b' }}>Selected: {courseModal.pptFile}</span>}
              </div>
              <div className="modal-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, fontSize: '13px', color: '#475569' }}>Video File (Upload)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={e => handleFileChange(e, 'video')}
                />
                {courseModal.videoFile && <span style={{ fontSize: '12px', color: '#64748b' }}>Selected: {courseModal.videoFile}</span>}
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button className="modal-btn cancel" onClick={() => setCourseModal(null)}>Cancel</button>
              <button className="modal-btn save" onClick={saveCourse}>
                {courseModal.mode === 'create' ? 'Create' : 'Save Changes'}
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

      {/* ===== TOAST ===== */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
