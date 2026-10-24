import React from 'react';
import { RoleKey, PageId } from '../types';

import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  currentRole: RoleKey;
  onRoleChange: (role: RoleKey) => void;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isOpen: boolean;
  onClose: () => void;
  noticeCount: number;
  onSwitchToStudent: () => void;
}

const navItems: { id: PageId; label: string; icon: string; count?: boolean; aiTag?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'academics', label: 'Academic records', icon: '▤' },
  { id: 'notices', label: 'Notices', icon: '◉', count: true },
  { id: 'complaints', label: 'Complaints', icon: '⚑' },
  { id: 'hostel', label: 'Hostel & maintenance', icon: '⌂' },
  { id: 'events', label: 'Events', icon: '◇' },
  { id: 'placement', label: 'Placement', icon: '↗' },
  { id: 'assistant', label: 'PGI AI Assistant', icon: '✳', aiTag: true },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  onRoleChange,
  currentPage,
  onNavigate,
  isOpen,
  noticeCount,
  onSwitchToStudent,
}) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
      <div className="brand">
        <BrandLogo size={42} showText={true} subText="PRASAD GROUP OF INSTITUTIONS" />
      </div>

      <div className="workspace-label">WORKSPACE</div>
      <label className="select-label" htmlFor="roleSelect">Active role</label>
      <select
        id="roleSelect"
        value={currentRole}
        onChange={(e) => onRoleChange(e.target.value as RoleKey)}
      >
        <option value="chairman">Chairman · Central</option>
        <option value="registrar">Registrar · Central</option>
        <option value="cmo">CMO · Central</option>
        <option value="director">Director · PIT</option>
        <option value="principal">Principal · PIT</option>
        <option value="exam">Exam Cell · PIT</option>
        <option value="hod">HOD · PIT / CSE</option>
        <option value="coordinator">Coordinator · CSE-A / 3rd Year</option>
        <option value="warden">Warden · PIT Hostel</option>
      </select>

      <div className="nav-label">OVERVIEW</div>
      <button
        type="button"
        className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
        onClick={() => onNavigate('dashboard')}
      >
        <span>▦</span> Dashboard
      </button>

      <div className="nav-label">CAMPUS SERVICES</div>
      {navItems.slice(1).map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <span>{item.icon}</span>
          {item.label}
          {item.count && <i>{noticeCount}</i>}
          {item.aiTag && <b className="ai-tag">AI</b>}
        </button>
      ))}

      {/* Student Portal Entry Point */}
      <div style={{ marginTop: '20px', padding: '0 4px' }}>
        <button
          type="button"
          className="portal-toggle-btn"
          style={{ background: '#FAF7F2', borderColor: 'var(--border-color)', color: 'var(--primary-forest-green)' }}
          onClick={onSwitchToStudent}
        >
          <span>🎓 Student Portal</span>
          <span>→</span>
        </button>
      </div>

      <div className="sidebar-bottom">
        <div className="secure-icon">✓</div>
        <div>
          <strong>Access protected</strong>
          <small>Role-based demo permissions</small>
        </div>
      </div>
    </aside>
  );
};
