import React from 'react';
import { Student, Complaint, Notice, StudentPageId } from '../../types';
import { AccessibleHomeScreen } from '../../components/AccessibleHomeScreen';
import { useCampusClock } from '../../utils/useCampusClock';

interface StudentDashboardPageProps {
  student: Student;
  complaints: Complaint[];
  notices: Notice[];
  onNavigate: (page: StudentPageId) => void;
  onSelectComplaintForView?: (id: string) => void;
  onToast: (msg: string) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({
  student,
  complaints,
  notices,
  onNavigate,
  onToast,
}) => {
  const clock = useCampusClock();

  // Filter complaints belonging to this student
  const myComplaints = complaints.filter(
    (c) => c.studentId === student.id || c.studentName === student.name
  );

  const pendingCount = myComplaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Assigned' || c.status === 'In Progress'
  ).length;

  const resolvedCount = myComplaints.filter((c) => c.status === 'Resolved').length;

  // Filter notices for student's institution and class
  const classNotices = notices.filter(
    (n) =>
      n.audience.includes(student.inst) ||
      n.audience.includes(student.dept) ||
      n.audience.includes('All institutions') ||
      n.audience.includes('Students')
  );

  const getInstitutionFullName = (inst: string) => {
    switch (inst) {
      case 'PIT':
        return 'Prasad Institute of Technology (PIT)';
      case 'PIT-Pharmacy':
        return 'PIT College of Pharmacy';
      case 'PPJ':
        return 'Prasad Polytechnic Jaunpur (PPJ)';
      case 'PPJ Pharmacy':
        return 'PPJ Pharmacy College';
      default:
        return 'Prasad Group of Institutions';
    }
  };

  const handleOpenEmergency = () => {
    onToast('🚨 Emergency alert triggered! Campus security & warden notified.');
    onNavigate('student-raise');
  };

  return (
    <div>
      {/* Accessible Home Screen with 5 Large Buttons */}
      <AccessibleHomeScreen
        onNavigate={onNavigate}
        onOpenEmergency={handleOpenEmergency}
        onToast={onToast}
      />

      <div className="student-profile-banner" style={{ marginTop: '30px' }}>
        <div className="student-info-left">
          <div className="student-avatar-lg">
            {student.avatar || student.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}
          </div>
          <div className="student-details">
            <div className="eyebrow" style={{ marginBottom: '4px' }}>
              {clock.formattedDateUpper} <span>•</span> {clock.formattedTime12} IST
            </div>
            <h2>{clock.greeting}, {student.name} ✦</h2>
            <div className="student-badge-row">
              <span className="student-chip id-chip">ID: {student.id}</span>
              <span className="student-chip">{getInstitutionFullName(student.inst)}</span>
              <span className="student-chip">Dept: {student.dept}</span>
              <span className="student-chip">Class: {student.class}</span>
            </div>
          </div>
        </div>
        <div className="student-actions-right">
          <button
            type="button"
            className="student-banner-btn"
            onClick={() => onNavigate('student-raise')}
          >
            ＋ Raise a Complaint
          </button>
          <button
            type="button"
            className="student-banner-btn outline"
            onClick={() => onNavigate('student-my-complaints')}
          >
            My Complaints ({myComplaints.length})
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-top">
            <span>My total complaints</span>
            <span className="stat-icon blue">⚑</span>
          </div>
          <strong>{myComplaints.length}</strong>
          <small>Submitted in this demo session</small>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>In progress / Pending</span>
            <span className="stat-icon orange">◷</span>
          </div>
          <strong>{pendingCount}</strong>
          <small>{pendingCount === 0 ? 'All caught up' : 'Under management review'}</small>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Resolved issues</span>
            <span className="stat-icon green">✓</span>
          </div>
          <strong>{resolvedCount}</strong>
          <small>Completed with remarks</small>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Attendance standing</span>
            <span className="stat-icon purple">▦</span>
          </div>
          <strong>{student.attendance}%</strong>
          <small>
            <span className={student.attendance >= 75 ? 'up' : 'warn'}>
              {student.attendance >= 75 ? '✓ Good standing' : '! Needs improvement'}
            </span>
          </small>
        </article>
      </div>

      {/* Two-col layout for complaints preview and announcements */}
      <div className="two-col">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Recent grievances &amp; complaints</h2>
              <p>Track status and administration remarks</p>
            </div>
            <button
              type="button"
              className="text-btn"
              onClick={() => onNavigate('student-my-complaints')}
            >
              View all ↗
            </button>
          </div>

          {myComplaints.length > 0 ? (
            <div className="attention-list">
              {myComplaints.slice(0, 3).map((c) => {
                const isResolved = c.status === 'Resolved';
                return (
                  <div key={c.id} className="attention-item">
                    <div
                      className={`attention-icon ${
                        isResolved ? 'green' : c.status === 'In Progress' ? 'yellow' : 'blue'
                      }`}
                    >
                      {isResolved ? '✓' : '⚑'}
                    </div>
                    <div className="attention-copy">
                      <strong>
                        {c.id} · {c.title}
                      </strong>
                      <small>
                        {c.category} · {c.location || 'Campus'} · {c.dateSubmitted || 'Recent'}
                      </small>
                      {c.managementRemarks && (
                        <small style={{ color: 'var(--primary-forest-green)', marginTop: '3px' }}>
                          💬 Admin: {c.managementRemarks}
                        </small>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className={`priority ${c.priority.toLowerCase()}`}>
                        {c.priority === 'Critical' && '⚠️ '}
                        {c.priority}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: isResolved ? '#DCFCE7' : c.status === 'In Progress' ? '#FEF3C7' : '#F5EFE6',
                          color: isResolved ? '#166534' : c.status === 'In Progress' ? '#92400E' : 'var(--main-text)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>No complaints submitted yet.</p>
              <button
                type="button"
                className="primary-btn"
                style={{ marginTop: '10px' }}
                onClick={() => onNavigate('student-raise')}
              >
                ＋ Raise your first complaint
              </button>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Notices for your class</h2>
              <p>Targeted announcements from Exam Cell &amp; Department</p>
            </div>
            <button
              type="button"
              className="text-btn"
              onClick={() => onNavigate('student-notices')}
            >
              View board ↗
            </button>
          </div>

          <div className="activity-list">
            {classNotices.slice(0, 3).map((n) => (
              <div key={n.id} className="activity-item">
                <div className="activity-avatar a-blue">NT</div>
                <div>
                  <strong>{n.title}</strong>
                  <small>
                    {n.author} · {n.date} · {n.audience}
                  </small>
                </div>
                <span className="activity-check">✓</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
