import React from 'react';
import { Student, Notice } from '../../types';

interface StudentNoticesPageProps {
  student: Student;
  notices: Notice[];
  onToast: (msg: string) => void;
}

export const StudentNoticesPage: React.FC<StudentNoticesPageProps> = ({
  student,
  notices,
  onToast,
}) => {
  const visibleNotices = notices.filter(
    (n) =>
      n.audience.includes(student.inst) ||
      n.audience.includes(student.dept) ||
      n.audience.includes('All institutions') ||
      n.audience.includes('Students')
  );

  return (
    <div>
      <div className="section-heading">
        <div>
          <h2>Campus Notices &amp; Announcements</h2>
          <p>Official communication targeted to {student.inst} and {student.class}.</p>
        </div>
      </div>

      <div className="notice-grid">
        {visibleNotices.length > 0 ? (
          visibleNotices.map((n) => (
            <article key={n.id} className="notice-card">
              <div className={`notice-icon ${n.type || ''}`}>▤</div>
              <div className="notice-content">
                <div className="notice-meta">
                  {n.author} · {n.date}
                </div>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                <span className="audience">{n.audience}</span>
                <div className="notice-actions">
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => onToast('Notice confirmed in student view.')}
                  >
                    Read details ↗
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="panel empty-state">
            No notices are currently posted for your department.
          </div>
        )}
      </div>
    </div>
  );
};
