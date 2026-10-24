import React from 'react';
import { Role, Notice } from '../types';

interface NoticesPageProps {
  role: Role;
  notices: Notice[];
  onOpenNewNotice: () => void;
  onToast: (msg: string) => void;
}

export const NoticesPage: React.FC<NoticesPageProps> = ({
  role,
  notices,
  onOpenNewNotice,
  onToast,
}) => {
  const visibleNotices = notices.filter((n) => {
    if (role.kind === 'central') return true;
    if (role.kind === 'hostel') {
      return n.audience.includes('Hostel') || n.audience.includes('All institutions');
    }
    if (role.kind === 'class') {
      return (
        n.audience.includes('CSE-A') ||
        n.audience.includes('CSE Department') ||
        n.audience.includes('All institutions')
      );
    }
    if (role.kind === 'department') {
      return (
        n.audience.includes(role.department || '') ||
        n.audience.includes('All institutions')
      );
    }
    if (role.kind === 'exam') {
      return n.audience.includes('PIT') || n.audience.includes('All institutions');
    }
    return (
      n.audience.includes(role.institution || 'PIT') ||
      n.audience.includes('All institutions')
    );
  });

  return (
    <section id="noticesPage" className="page active">
      <div className="section-heading">
        <div>
          <h2>Notice board</h2>
          <p>Official announcements targeted to relevant audiences.</p>
        </div>
        <button
          type="button"
          className="primary-btn"
          id="newNotice"
          onClick={onOpenNewNotice}
        >
          ＋ Publish notice
        </button>
      </div>

      <div className="notice-grid" id="noticeGrid">
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
                    onClick={() => onToast('Notice opened in demo view')}
                  >
                    Read details ↗
                  </button>
                  {role.edit && (
                    <button
                      type="button"
                      className="text-btn"
                      onClick={() =>
                        onToast(
                          'Demo edit mode: connect persistent storage for saved changes'
                        )
                      }
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="panel empty-state">
            No notices are available in your current scope.
          </div>
        )}
      </div>
    </section>
  );
};
