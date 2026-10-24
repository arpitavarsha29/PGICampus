import React from 'react';
import { Role, Complaint, Priority } from '../types';
import { canSeeRecord } from '../data/initialData';
import { isComplaintOverdue } from '../utils/priorityEvaluator';
import { DashboardComplaintFilter } from './ComplaintsPage';

interface DashboardPageProps {
  role: Role;
  complaints: Complaint[];
  showInstitutions: boolean;
  onViewAllInstitutions: () => void;
  onToast: (msg: string) => void;
  onNavigateToComplaints?: (filter?: DashboardComplaintFilter) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  role,
  complaints,
  showInstitutions,
  onViewAllInstitutions,
  onToast,
  onNavigateToComplaints,
}) => {
  const isCentral = role.kind === 'central';
  const visible = complaints.filter((c) => canSeeRecord(role, c));

  // Compute the 6 required dashboard summaries
  const criticalUnresolved = visible.filter(
    (c) => c.priority === 'Critical' && c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;

  const highPending = visible.filter(
    (c) => c.priority === 'High' && c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;

  const totalPending = visible.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;

  const overdueCount = visible.filter((c) => isComplaintOverdue(c)).length;

  const inProgressCount = visible.filter((c) => c.status === 'In Progress').length;

  const resolvedCount = visible.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  ).length;

  // Filter urgent actionable complaints for Attention list
  const urgentComplaints = visible
    .filter((c) => c.status !== 'Resolved' && c.status !== 'Closed')
    .sort((a, b) => {
      const order: Record<Priority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return order[b.priority] - order[a.priority];
    })
    .slice(0, 4);

  return (
    <section id="dashboardPage" className="page active">
      {/* Critical Emergency Banner on Dashboard if any Critical unresolved tickets exist */}
      {criticalUnresolved > 0 && (
        <div
          style={{
            background: '#FEE2E2',
            border: '1.5px solid #B91C1C',
            borderRadius: '10px',
            padding: '12px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <strong style={{ color: '#B91C1C', fontSize: '13px', display: 'block' }}>
                {criticalUnresolved} CRITICAL SAFETY EMERGENCY REPORTED
              </strong>
              <small style={{ color: '#7F1D1D', fontSize: '11px' }}>
                Immediate responder dispatch required. Exposed electrical or severe safety hazard present.
              </small>
            </div>
          </div>
          <button
            type="button"
            className="primary-btn"
            style={{
              background: '#B91C1C',
              color: '#FFFFFF',
              borderColor: '#991B1B',
              fontSize: '11px',
              fontWeight: 700,
            }}
            onClick={() => onNavigateToComplaints && onNavigateToComplaints('Critical')}
          >
            Review Critical Queue ({criticalUnresolved}) ↗
          </button>
        </div>
      )}

      {/* Primary Institutional Overview Stats */}
      <div className="stats-grid" id="statsGrid">
        <article className="stat-card">
          <div className="stat-top">
            <span>Total students</span>
            <span className="stat-icon blue">♙</span>
          </div>
          <strong>4,286</strong>
          <small>
            <span className="up">↑ 4.8%</span> vs previous term
          </small>
          <div className="spark blue-spark">▁▃▂▅▄▆▅▇</div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Faculty &amp; staff</span>
            <span className="stat-icon purple">♧</span>
          </div>
          <strong>248</strong>
          <small>Across 4 institutions</small>
          <div className="spark purple-spark">▂▄▃▅▃▆▄▇</div>
        </article>

        <article
          className="stat-card"
          style={{ cursor: onNavigateToComplaints ? 'pointer' : 'default' }}
          onClick={() => onNavigateToComplaints && onNavigateToComplaints('Pending')}
          title="Click to view all pending complaints"
        >
          <div className="stat-top">
            <span>Total pending issues</span>
            <span className="stat-icon orange">⚑</span>
          </div>
          <strong id="openStat">{totalPending}</strong>
          <small>
            <span className={criticalUnresolved > 0 ? 'warn' : 'up'}>
              {criticalUnresolved > 0 ? `⚠️ ${criticalUnresolved} critical` : 'Normal campus queue'}
            </span>
          </small>
          <div className="spark orange-spark">▇▅▆▄▅▃▄▂</div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>Attendance average</span>
            <span className="stat-icon green">◷</span>
          </div>
          <strong>86.4%</strong>
          <small>
            <span className="up">↑ 2.1%</span> this month
          </small>
          <div className="spark green-spark">▂▃▄▃▅▄▆▇</div>
        </article>
      </div>

      {/* 6 Dashboard Urgency & Issue Priority Indicators */}
      <div style={{ marginTop: '16px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '13px', color: 'var(--primary-dark-brown)', fontWeight: 800 }}>
              Grievance &amp; Issue Urgency Status
            </h3>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--secondary-text)' }}>
              Click any urgency counter to filter and review actionable campus tickets
            </p>
          </div>
          {onNavigateToComplaints && (
            <button
              type="button"
              className="text-btn"
              onClick={() => onNavigateToComplaints('Pending')}
              style={{ fontSize: '11px' }}
            >
              Open Complaints Workspace ↗
            </button>
          )}
        </div>

        <div className="priority-metrics-strip">
          {/* 1. Critical Unresolved */}
          <div
            className="priority-stat-box critical"
            onClick={() => onNavigateToComplaints && onNavigateToComplaints('Critical')}
            role="button"
            tabIndex={0}
            title="Filter to Critical emergencies"
          >
            <span className="stat-label" style={{ color: '#B91C1C', fontWeight: 700 }}>
              ⚠️ Critical Unresolved
            </span>
            <span className="stat-val" style={{ color: '#B91C1C' }}>
              {criticalUnresolved}
            </span>
            <span className="stat-sub" style={{ color: '#991B1B' }}>
              {criticalUnresolved > 0 ? '🚨 URGENT ACTION REQUIRED' : 'Zero emergencies reported'}
            </span>
          </div>

          {/* 2. High Priority Pending */}
          <div
            className="priority-stat-box high"
            onClick={() => onNavigateToComplaints && onNavigateToComplaints('High')}
            role="button"
            tabIndex={0}
            title="Filter to High priority pending tickets"
          >
            <span className="stat-label" style={{ color: '#C2410C', fontWeight: 700 }}>
              High-Priority Pending
            </span>
            <span className="stat-val" style={{ color: '#C2410C' }}>
              {highPending}
            </span>
            <span className="stat-sub" style={{ color: '#9A3412' }}>
              {highPending > 0 ? 'Priority queue top' : 'No major disruptions'}
            </span>
          </div>

          {/* 3. Total Pending Complaints */}
          <div
            className="priority-stat-box"
            style={{ borderColor: 'var(--secondary-brown)', background: '#FAF7F2' }}
            onClick={() => onNavigateToComplaints && onNavigateToComplaints('Pending')}
            role="button"
            tabIndex={0}
            title="Filter to all pending issues"
          >
            <span className="stat-label" style={{ color: 'var(--primary-dark-brown)', fontWeight: 700 }}>
              Total Pending
            </span>
            <span className="stat-val" style={{ color: 'var(--primary-dark-brown)' }}>
              {totalPending}
            </span>
            <span className="stat-sub" style={{ color: 'var(--secondary-text)' }}>
              Awaiting / In review
            </span>
          </div>

          {/* 4. Overdue SLA Complaints */}
          <div
            className="priority-stat-box overdue"
            onClick={() => onNavigateToComplaints && onNavigateToComplaints('Overdue')}
            role="button"
            tabIndex={0}
            title="Filter to overdue tickets"
          >
            <span className="stat-label" style={{ color: '#991B1B', fontWeight: 700 }}>
              ⏱️ Overdue SLA
            </span>
            <span className="stat-val" style={{ color: '#991B1B' }}>
              {overdueCount}
            </span>
            <span className="stat-sub" style={{ color: '#7F1D1D' }}>
              {overdueCount > 0 ? 'Exceeded deadline target' : 'All within target SLA'}
            </span>
          </div>

          {/* 5. In Progress */}
          <div
            className="priority-stat-box"
            style={{ borderColor: 'var(--primary-forest-green)', background: '#F4F8F5' }}
            onClick={() => onNavigateToComplaints && onNavigateToComplaints('In Progress')}
            role="button"
            tabIndex={0}
            title="Filter to In Progress tickets"
          >
            <span className="stat-label" style={{ color: 'var(--primary-forest-green)', fontWeight: 700 }}>
              In Progress
            </span>
            <span className="stat-val" style={{ color: 'var(--primary-forest-green)' }}>
              {inProgressCount}
            </span>
            <span className="stat-sub" style={{ color: 'var(--secondary-text)' }}>
              Teams dispatched
            </span>
          </div>

          {/* 6. Resolved & Closed */}
          <div
            className="priority-stat-box resolved"
            onClick={() => onNavigateToComplaints && onNavigateToComplaints('Resolved')}
            role="button"
            tabIndex={0}
            title="Filter to Resolved and Closed archive"
          >
            <span className="stat-label" style={{ color: '#166534', fontWeight: 700 }}>
              ✓ Resolved &amp; Closed
            </span>
            <span className="stat-val" style={{ color: '#166534' }}>
              {resolvedCount}
            </span>
            <span className="stat-sub" style={{ color: '#15803D' }}>
              Archived &amp; verified
            </span>
          </div>
        </div>
      </div>

      {(isCentral || showInstitutions) && (
        <>
          <div className="section-heading">
            <div>
              <h2>Institution snapshot</h2>
              <p>Quick comparison across the PGI group</p>
            </div>
            {isCentral && (
              <button
                type="button"
                className="text-btn"
                id="viewAll"
                onClick={onViewAllInstitutions}
              >
                View all institutions ↗
              </button>
            )}
          </div>

          <div className="institution-grid" id="institutionGrid">
            <article className="institution-card">
              <div className="inst-top">
                <div className="inst-logo">PIT</div>
                <span className="status-dot">Active</span>
              </div>
              <h3>Prasad Institute of Technology</h3>
              <p>Engineering &amp; technology</p>
              <div className="inst-metrics">
                <div>
                  <strong>1,842</strong>
                  <small>Students</small>
                </div>
                <div>
                  <strong>91.2%</strong>
                  <small>Attendance</small>
                </div>
                <div>
                  <strong>08</strong>
                  <small>Open issues</small>
                </div>
              </div>
              <div className="progress">
                <span style={{ width: '91.2%' }}></span>
              </div>
            </article>

            <article className="institution-card">
              <div className="inst-top">
                <div className="inst-logo pharm">
                  PIT<span>+</span>
                </div>
                <span className="status-dot">Active</span>
              </div>
              <h3>PIT Pharmacy</h3>
              <p>Pharmacy education</p>
              <div className="inst-metrics">
                <div>
                  <strong>624</strong>
                  <small>Students</small>
                </div>
                <div>
                  <strong>88.6%</strong>
                  <small>Attendance</small>
                </div>
                <div>
                  <strong>05</strong>
                  <small>Open issues</small>
                </div>
              </div>
              <div className="progress">
                <span style={{ width: '88.6%' }}></span>
              </div>
            </article>

            <article className="institution-card">
              <div className="inst-top">
                <div className="inst-logo ppj">PPJ</div>
                <span className="status-dot">Active</span>
              </div>
              <h3>Prasad Polytechnic Jaunpur</h3>
              <p>Diploma &amp; technical education</p>
              <div className="inst-metrics">
                <div>
                  <strong>1,276</strong>
                  <small>Students</small>
                </div>
                <div>
                  <strong>84.9%</strong>
                  <small>Attendance</small>
                </div>
                <div>
                  <strong>14</strong>
                  <small>Open issues</small>
                </div>
              </div>
              <div className="progress">
                <span style={{ width: '84.9%' }}></span>
              </div>
            </article>

            <article className="institution-card">
              <div className="inst-top">
                <div className="inst-logo ppjph">
                  PPJ<span>+</span>
                </div>
                <span className="status-dot">Active</span>
              </div>
              <h3>PPJ Pharmacy</h3>
              <p>Pharmacy education</p>
              <div className="inst-metrics">
                <div>
                  <strong>544</strong>
                  <small>Students</small>
                </div>
                <div>
                  <strong>86.1%</strong>
                  <small>Attendance</small>
                </div>
                <div>
                  <strong>10</strong>
                  <small>Open issues</small>
                </div>
              </div>
              <div className="progress">
                <span style={{ width: '86.1%' }}></span>
              </div>
            </article>
          </div>
        </>
      )}

      <div className="two-col">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Attention required</h2>
              <p>Items that may need follow-up</p>
            </div>
            <button
              type="button"
              className="dots"
              onClick={() => onToast('Attention items are up to date.')}
            >
              •••
            </button>
          </div>
          <div className="attention-list">
            {urgentComplaints.length > 0 ? (
              urgentComplaints.map((c) => {
                const isCrit = c.priority === 'Critical';
                const isOverdue = isComplaintOverdue(c);
                return (
                  <div
                    key={c.id}
                    className="attention-item"
                    style={{
                      cursor: onNavigateToComplaints ? 'pointer' : 'default',
                      background: isCrit ? '#FEF2F2' : '#FFFBF5',
                      borderLeft: isCrit ? '3px solid #B91C1C' : '3px solid #C2410C',
                    }}
                    onClick={() => onNavigateToComplaints && onNavigateToComplaints(c.priority)}
                    title={`Click to review ${c.priority} issue #${c.id}`}
                  >
                    <div className={`attention-icon ${isCrit ? 'red' : 'yellow'}`}>
                      {isCrit ? '⚠️' : '⚡'}
                    </div>
                    <div className="attention-copy">
                      <strong>
                        {isCrit && <span style={{ color: '#B91C1C', marginRight: '4px' }}>[EMERGENCY]</span>}
                        {c.id} · {c.title}
                      </strong>
                      <small>
                        📍 {c.location || c.scope} · {c.category}
                        {isOverdue && <span style={{ color: '#991B1B', fontWeight: 700, marginLeft: '6px' }}>⏱️ Overdue</span>}
                      </small>
                    </div>
                    <span className={`priority ${c.priority.toLowerCase()}`}>
                      {c.priority === 'Critical' && '⚠️ '}
                      {c.priority}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="attention-item">
                <div className="attention-icon green">✓</div>
                <div className="attention-copy">
                  <strong>All campus grievances within target SLA</strong>
                  <small>No critical or high-priority emergencies pending</small>
                </div>
                <span className="priority low">Normal</span>
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Recent activity</h2>
              <p>Latest updates in your permitted scope</p>
            </div>
            <button
              type="button"
              className="dots"
              onClick={() => onToast('Activity log refreshed.')}
            >
              •••
            </button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-avatar a-blue">NT</div>
              <div>
                <strong>New notice published</strong>
                <small>Examination Cell · 10:42 AM</small>
              </div>
              <span className="activity-check">✓</span>
            </div>
            <div className="activity-item">
              <div className="activity-avatar a-purple">CM</div>
              <div>
                <strong>Complaint status updated</strong>
                <small>Facilities team · 10:16 AM</small>
              </div>
              <span className="activity-check">✓</span>
            </div>
            <div className="activity-item">
              <div className="activity-avatar a-green">AT</div>
              <div>
                <strong>Attendance records synced</strong>
                <small>CSE · 09:55 AM</small>
              </div>
              <span className="activity-check">✓</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};
