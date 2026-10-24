import React from 'react';
import { StudentPageId, Student } from '../types';
import { BrandLogo } from './BrandLogo';

interface StudentSidebarProps {
  currentStudent: Student;
  allStudents: Student[];
  onSelectStudent: (studentId: string) => void;
  currentPage: StudentPageId;
  onNavigate: (page: StudentPageId) => void;
  isOpen: boolean;
  onSwitchToManagement: () => void;
  myComplaintsCount: number;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  currentStudent,
  allStudents,
  onSelectStudent,
  currentPage,
  onNavigate,
  isOpen,
  onSwitchToManagement,
  myComplaintsCount,
}) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
      <div className="brand">
        <BrandLogo size={42} showText={true} subText="STUDENT PORTAL" />
      </div>

      <div className="workspace-label">DEMO STUDENT ACCESS</div>
      <label className="select-label" htmlFor="studentSelect">
        Demo Student Account
      </label>
      <select
        id="studentSelect"
        value={currentStudent.id}
        onChange={(e) => onSelectStudent(e.target.value)}
      >
        {allStudents.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} · {s.id} ({s.class})
          </option>
        ))}
      </select>

      <div className="nav-label">STUDENT DESK</div>
      <button
        type="button"
        className={`nav-item ${currentPage === 'student-dashboard' ? 'active' : ''}`}
        onClick={() => onNavigate('student-dashboard')}
      >
        <span>▦</span> Student Dashboard
      </button>

      <div className="nav-label">GRIEVANCES &amp; SERVICES</div>
      <button
        type="button"
        className={`nav-item ${currentPage === 'student-raise' ? 'active' : ''}`}
        onClick={() => onNavigate('student-raise')}
      >
        <span>⚑</span> Raise a Complaint
      </button>

      <button
        type="button"
        className={`nav-item ${currentPage === 'student-my-complaints' ? 'active' : ''}`}
        onClick={() => onNavigate('student-my-complaints')}
      >
        <span>▤</span> My Complaints
        {myComplaintsCount > 0 && <i>{myComplaintsCount}</i>}
      </button>

      <button
        type="button"
        className={`nav-item ${currentPage === 'student-notices' ? 'active' : ''}`}
        onClick={() => onNavigate('student-notices')}
      >
        <span>◉</span> Campus Notices
      </button>

      <div style={{ marginTop: '24px', padding: '0 8px' }}>
        <button
          type="button"
          className="portal-toggle-btn"
          onClick={onSwitchToManagement}
        >
          <span>🏛 Management Portal</span>
          <span>→</span>
        </button>
      </div>

      <div className="sidebar-bottom">
        <div className="secure-icon" style={{ background: '#F4F7EB', color: 'var(--primary-forest-green)' }}>
          🎓
        </div>
        <div>
          <strong>Student Demo Mode</strong>
          <small>Browser-local prototype</small>
        </div>
      </div>
    </aside>
  );
};
