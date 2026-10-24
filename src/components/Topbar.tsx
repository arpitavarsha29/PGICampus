import React from 'react';
import { Role, PageId, StudentPageId, Student, PortalMode } from '../types';
import { useCampusClock } from '../utils/useCampusClock';
import { BrandLogo } from './BrandLogo';

interface TopbarProps {
  portalMode: PortalMode;
  role: Role;
  student: Student;
  currentPage: PageId | StudentPageId;
  onToggleMenu: () => void;
  onNotificationClick: () => void;
  onTogglePortalMode: () => void;
  activePhotoId: string;
  onSelectCampusPhoto: (photoId: string) => void;
}

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  academics: 'Academic records',
  notices: 'Notices',
  complaints: 'Complaints',
  hostel: 'Hostel & maintenance',
  events: 'Events',
  placement: 'Placement',
  assistant: 'PGI AI Assistant',
  'student-dashboard': 'Student Dashboard',
  'student-raise': 'Raise a Complaint',
  'student-my-complaints': 'My Complaints',
  'student-notices': 'Campus Notices',
};

export const Topbar: React.FC<TopbarProps> = ({
  portalMode,
  role,
  student,
  currentPage,
  onToggleMenu,
  onNotificationClick,
  onTogglePortalMode,
  activePhotoId,
  onSelectCampusPhoto,
}) => {
  const isStudent = portalMode === 'student';
  const clock = useCampusClock();

  return (
    <header className="topbar">
      <button
        type="button"
        className="menu-btn"
        id="menuBtn"
        onClick={onToggleMenu}
        aria-label="Toggle navigation menu"
      >
        ☰
      </button>

      <div className="crumb" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BrandLogo size={26} showText={false} />
        <span>PGI SmartCampus</span> <span>/</span>{' '}
        {isStudent && (
          <>
            <span style={{ color: 'var(--primary-forest-green)', fontWeight: 700 }}>Student Portal</span> <span>/</span>
          </>
        )}
        <b id="crumbPage">{pageTitles[currentPage] || 'Portal'}</b>
      </div>

      <div className="top-actions">
        {/* Live IST Campus Clock */}
        <div
          className="campus-clock-pill"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FAF7F2',
            border: '1px solid var(--border-color)',
            padding: '4px 10px',
            borderRadius: '7px',
          }}
          title="Indian Standard Time (IST) · Asia/Kolkata"
        >
          <span style={{ fontSize: '11px', color: 'var(--primary-forest-green)' }}>🕒</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary-dark-brown)', whiteSpace: 'nowrap' }}>
            {clock.weekday}, {clock.dateOnly}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>•</span>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'var(--primary-forest-green)',
              whiteSpace: 'nowrap',
            }}
          >
            {clock.formattedTime12} <small style={{ fontSize: '9px', fontWeight: 600 }}>IST</small>
          </span>
        </div>
        {/* College Campus Photo Background Selector */}
        <div
          className="campus-photo-pill"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: '#FAF7F2',
            border: '1px solid var(--border-color)',
            padding: '4px 8px',
            borderRadius: '7px',
          }}
        >
          <span style={{ fontSize: '10px', color: 'var(--secondary-brown)', fontWeight: 700 }}>
            📷 Campus Photo:
          </span>
          <select
            value={activePhotoId}
            onChange={(e) => onSelectCampusPhoto(e.target.value)}
            style={{
              fontSize: '10px',
              padding: '2px 4px',
              borderRadius: '5px',
              border: '1px solid var(--border-color)',
              background: '#fff',
              color: 'var(--main-text)',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
            title="Switch college photograph background view"
          >
            <option value="main">Main Campus (Authentic Aerial Photo)</option>
            <option value="academic">Academic Block</option>
            <option value="library">Central Library</option>
            <option value="labs">Laboratories</option>
            <option value="green">Green Campus Grounds</option>
          </select>
        </div>

        {/* Prominent Portal Switcher Button */}
        <button
          type="button"
          className={`portal-switch-pill ${isStudent ? 'student-mode' : ''}`}
          onClick={onTogglePortalMode}
          title={isStudent ? 'Switch to Management Dashboard' : 'Open Student Portal'}
        >
          <span>{isStudent ? '🏛 Switch to Management' : '🎓 Enter Student Portal'}</span>
          <span className="mode-badge">{isStudent ? 'ADMIN' : 'STUDENT'}</span>
        </button>

        <button
          type="button"
          className="icon-btn"
          title="Notifications"
          id="notificationBtn"
          onClick={onNotificationClick}
        >
          ♧<em></em>
        </button>

        {isStudent ? (
          <>
            <div
              className="avatar"
              id="avatar"
              style={{ background: '#EBF4EE', color: 'var(--primary-forest-green)' }}
            >
              {student.avatar || student.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="user-mini">
              <strong id="userName">{student.name}</strong>
              <small id="userScope">{student.id} · {student.dept}</small>
            </div>
          </>
        ) : (
          <>
            <div className="avatar" id="avatar">
              {role.avatar}
            </div>
            <div className="user-mini">
              <strong id="userName">{role.name}</strong>
              <small id="userScope">{role.scope}</small>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
