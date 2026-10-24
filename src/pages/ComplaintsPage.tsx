import React, { useState, useEffect } from 'react';
import { Role, Complaint, Priority } from '../types';
import { canSeeRecord } from '../data/initialData';
import { isComplaintOverdue, getPriorityWeight, CAMPUS_EMERGENCY_CONTACTS } from '../utils/priorityEvaluator';

export type DashboardComplaintFilter = Priority | 'Overdue' | 'In Progress' | 'Resolved' | 'Pending' | null;

interface ComplaintsPageProps {
  role: Role;
  complaints: Complaint[];
  onOpenNewComplaint: () => void;
  onCycleComplaint: (id: string) => void;
  onManageComplaint: (complaint: Complaint) => void;
  initialPriorityFilter?: DashboardComplaintFilter;
}

export const ComplaintsPage: React.FC<ComplaintsPageProps> = ({
  role,
  complaints,
  onOpenNewComplaint,
  onCycleComplaint,
  onManageComplaint,
  initialPriorityFilter,
}) => {
  const [tab, setTab] = useState<'actionable' | 'resolved' | 'all'>('actionable');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  useEffect(() => {
    if (!initialPriorityFilter) return;
    if (initialPriorityFilter === 'Overdue') {
      setTab('actionable');
      setShowOverdueOnly(true);
      setPriorityFilter('All');
      setStatusFilter('All');
    } else if (initialPriorityFilter === 'In Progress') {
      setTab('actionable');
      setStatusFilter('In Progress');
      setShowOverdueOnly(false);
      setPriorityFilter('All');
    } else if (initialPriorityFilter === 'Resolved') {
      setTab('resolved');
      setStatusFilter('Resolved');
      setShowOverdueOnly(false);
      setPriorityFilter('All');
    } else if (initialPriorityFilter === 'Pending') {
      setTab('actionable');
      setStatusFilter('All');
      setPriorityFilter('All');
      setShowOverdueOnly(false);
    } else if (['Critical', 'High', 'Medium', 'Low'].includes(initialPriorityFilter)) {
      setTab('actionable');
      setPriorityFilter(initialPriorityFilter);
      setStatusFilter('All');
      setShowOverdueOnly(false);
    }
  }, [initialPriorityFilter]);

  const visibleComplaints = complaints.filter((c) => canSeeRecord(role, c));

  // Compute metrics across visible complaints
  const criticalUnresolved = visibleComplaints.filter(
    (c) => c.priority === 'Critical' && c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;

  const highUnresolved = visibleComplaints.filter(
    (c) => c.priority === 'High' && c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;

  const mediumUnresolved = visibleComplaints.filter(
    (c) => c.priority === 'Medium' && c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;

  const lowUnresolved = visibleComplaints.filter(
    (c) => c.priority === 'Low' && c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;

  const overdueCount = visibleComplaints.filter((c) => isComplaintOverdue(c)).length;

  const resolvedCount = visibleComplaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  ).length;

  const totalPending = visibleComplaints.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;

  // Filter list
  let list = [...visibleComplaints];

  // 1. Tab separation
  if (tab === 'actionable') {
    list = list.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed');
  } else if (tab === 'resolved') {
    list = list.filter((c) => c.status === 'Resolved' || c.status === 'Closed');
  }

  // 2. Priority Filter
  if (priorityFilter !== 'All' && priorityFilter !== 'Overdue') {
    list = list.filter((c) => c.priority.toLowerCase() === priorityFilter.toLowerCase());
  }

  // 3. Overdue Filter
  if (showOverdueOnly) {
    list = list.filter((c) => isComplaintOverdue(c));
  }

  // 4. Status Filter
  if (statusFilter !== 'All') {
    list = list.filter((c) => c.status.toLowerCase() === statusFilter.toLowerCase());
  }

  // 5. Search
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter((c) =>
      (
        c.id +
        c.title +
        c.category +
        c.scope +
        (c.studentName || '') +
        (c.studentId || '') +
        (c.location || '') +
        (c.studentClass || '') +
        (c.assessmentReason || '')
      )
        .toLowerCase()
        .includes(q)
    );
  }

  // 6. Strict Sorting by Actionable Urgency:
  // Critical (0) -> High (1) -> Medium (2) -> Low (3)
  // Sub-sorted by Overdue -> Earliest Deadline / Wait Time
  list.sort((a, b) => {
    const aResolved = a.status === 'Resolved' || a.status === 'Closed';
    const bResolved = b.status === 'Resolved' || b.status === 'Closed';
    if (aResolved !== bResolved) return aResolved ? 1 : -1;

    // Sort by priority tier weight
    const weightA = getPriorityWeight(a.priority);
    const weightB = getPriorityWeight(b.priority);
    if (weightA !== weightB) return weightA - weightB;

    // Overdue items come first within same priority
    const overdueA = isComplaintOverdue(a) ? 1 : 0;
    const overdueB = isComplaintOverdue(b) ? 1 : 0;
    if (overdueB !== overdueA) return overdueB - overdueA;

    return 0;
  });

  const getStatusClass = (status: Complaint['status']) => {
    switch (status) {
      case 'Resolved':
        return 'resolved';
      case 'Closed':
        return 'closed';
      case 'In Progress':
        return 'inprogress';
      case 'Assigned':
        return 'assigned';
      case 'Submitted':
        return 'submitted';
      case 'Open':
        return 'open';
      default:
        return 'progressing';
    }
  };

  const handleStatBoxClick = (type: 'Critical' | 'High' | 'Medium' | 'Low' | 'Overdue' | 'Resolved' | 'All') => {
    if (type === 'All') {
      setTab('actionable');
      setPriorityFilter('All');
      setShowOverdueOnly(false);
    } else if (type === 'Overdue') {
      setTab('actionable');
      setShowOverdueOnly(true);
      setPriorityFilter('All');
    } else if (type === 'Resolved') {
      setTab('resolved');
      setPriorityFilter('All');
      setShowOverdueOnly(false);
    } else {
      setTab('actionable');
      setPriorityFilter(type);
      setShowOverdueOnly(false);
    }
  };

  return (
    <section id="complaintsPage" className="page active">
      <div className="section-heading">
        <div>
          <h2>Campus Complaints &amp; Emergency Queue</h2>
          <p>
            4-tier priority triage, automatic risk assessment, and live resolution SLA tracking across Prasad Group of Institutions.
          </p>
        </div>
        <button
          type="button"
          className="primary-btn"
          id="newComplaint"
          onClick={onOpenNewComplaint}
        >
          ＋ New complaint
        </button>
      </div>

      {/* Summary Counters Strip with Click-to-Filter */}
      <div className="priority-metrics-strip">
        <div
          className={`priority-stat-box box-critical ${priorityFilter === 'Critical' && !showOverdueOnly ? 'active' : ''}`}
          onClick={() => handleStatBoxClick('Critical')}
          title="Click to view Critical Emergency tickets"
        >
          <div className="box-label">
            <span>Critical Emergency</span>
            <span style={{ color: '#B91C1C' }}>🚨</span>
          </div>
          <div className="box-value" style={{ color: '#B91C1C' }}>
            {criticalUnresolved}
          </div>
          <div className="box-sub">4h SLA response</div>
        </div>

        <div
          className={`priority-stat-box box-high ${priorityFilter === 'High' && !showOverdueOnly ? 'active' : ''}`}
          onClick={() => handleStatBoxClick('High')}
          title="Click to view High Priority tickets"
        >
          <div className="box-label">
            <span>High Priority</span>
            <span style={{ color: '#C2410C' }}>⚡</span>
          </div>
          <div className="box-value" style={{ color: '#C2410C' }}>
            {highUnresolved}
          </div>
          <div className="box-sub">24h SLA target</div>
        </div>

        <div
          className={`priority-stat-box box-medium ${priorityFilter === 'Medium' && !showOverdueOnly ? 'active' : ''}`}
          onClick={() => handleStatBoxClick('Medium')}
          title="Click to view Medium Priority tickets"
        >
          <div className="box-label">
            <span>Medium</span>
            <span style={{ color: '#A16207' }}>◔</span>
          </div>
          <div className="box-value" style={{ color: '#A16207' }}>
            {mediumUnresolved}
          </div>
          <div className="box-sub">48h SLA target</div>
        </div>

        <div
          className={`priority-stat-box box-low ${priorityFilter === 'Low' && !showOverdueOnly ? 'active' : ''}`}
          onClick={() => handleStatBoxClick('Low')}
          title="Click to view Low Priority tickets"
        >
          <div className="box-label">
            <span>Low / Routine</span>
            <span style={{ color: '#166534' }}>✓</span>
          </div>
          <div className="box-value" style={{ color: '#166534' }}>
            {lowUnresolved}
          </div>
          <div className="box-sub">7 days SLA target</div>
        </div>

        <div
          className={`priority-stat-box box-overdue ${showOverdueOnly ? 'active' : ''}`}
          onClick={() => handleStatBoxClick('Overdue')}
          title="Click to view Overdue SLA tickets"
        >
          <div className="box-label">
            <span>Overdue SLA</span>
            <span style={{ color: '#991B1B' }}>⚠️</span>
          </div>
          <div className="box-value" style={{ color: '#991B1B' }}>
            {overdueCount}
          </div>
          <div className="box-sub">Past target deadline</div>
        </div>

        <div
          className={`priority-stat-box box-resolved ${tab === 'resolved' ? 'active' : ''}`}
          onClick={() => handleStatBoxClick('Resolved')}
          title="Click to view Resolved & Closed Archive"
        >
          <div className="box-label">
            <span>Resolved</span>
            <span style={{ color: '#2E6B45' }}>★</span>
          </div>
          <div className="box-value" style={{ color: '#2E6B45' }}>
            {resolvedCount}
          </div>
          <div className="box-sub">Total completed</div>
        </div>
      </div>

      {/* Campus Emergency Hotlines Bar */}
      {criticalUnresolved > 0 && (
        <div className="emergency-helpline-card">
          <div className="emergency-helpline-info">
            <div className="emergency-helpline-icon">🚨</div>
            <div>
              <strong>Active Campus Emergency Incident ({criticalUnresolved} Critical Issues Pending)</strong>
              <p>Direct lines for emergency security, high-voltage isolation, or ambulance assistance:</p>
            </div>
          </div>
          <div className="emergency-phone-pills">
            {CAMPUS_EMERGENCY_CONTACTS.map((c) => (
              <span key={c.dept} className="emergency-phone-pill" title={`${c.dept} (${c.role})`}>
                📞 {c.role}: <strong>{c.phone}</strong> ({c.intercom})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="panel">
        {/* Queue Separation Tabs */}
        <div className="queue-tabs">
          <button
            type="button"
            className={`queue-tab-btn ${tab === 'actionable' && !showOverdueOnly && priorityFilter === 'All' ? 'active' : ''}`}
            onClick={() => {
              setTab('actionable');
              setShowOverdueOnly(false);
              setPriorityFilter('All');
            }}
          >
            <span>Actionable Pending Queue</span>
            <span className="tab-count">{totalPending}</span>
          </button>

          <button
            type="button"
            className={`queue-tab-btn ${tab === 'resolved' ? 'active' : ''}`}
            onClick={() => {
              setTab('resolved');
              setShowOverdueOnly(false);
              setPriorityFilter('All');
            }}
          >
            <span>Resolved &amp; Closed Archive</span>
            <span className="tab-count">{resolvedCount}</span>
          </button>

          <button
            type="button"
            className={`queue-tab-btn ${tab === 'all' ? 'active' : ''}`}
            onClick={() => {
              setTab('all');
              setShowOverdueOnly(false);
              setPriorityFilter('All');
            }}
          >
            <span>All Group Records</span>
            <span className="tab-count">{visibleComplaints.length}</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="table-tools">
          <input
            id="complaintSearch"
            placeholder="Search tickets, student name, roll number, location, or issue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            id="priorityFilterSelect"
            value={showOverdueOnly ? 'Overdue' : priorityFilter}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'Overdue') {
                setShowOverdueOnly(true);
                setPriorityFilter('All');
              } else {
                setShowOverdueOnly(false);
                setPriorityFilter(val);
              }
            }}
          >
            <option value="All">All Priorities</option>
            <option value="Critical">🚨 Critical / Emergency</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
            <option value="Overdue">⚠️ Overdue SLA Only</option>
          </select>

          <select
            id="complaintFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted (New)</option>
            <option value="Assigned">Assigned (Team on-call)</option>
            <option value="In Progress">In Progress (Active)</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {(priorityFilter !== 'All' || showOverdueOnly || statusFilter !== 'All' || search) && (
            <button
              type="button"
              className="text-btn"
              style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
              onClick={() => {
                setPriorityFilter('All');
                setShowOverdueOnly(false);
                setStatusFilter('All');
                setSearch('');
              }}
            >
              Reset filters ✕
            </button>
          )}
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ticket &amp; SLA</th>
                <th>Student / Submitter</th>
                <th>Issue &amp; Location</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="complaintRows">
              {list.length > 0 ? (
                list.map((c) => {
                  const isResolved = c.status === 'Resolved' || c.status === 'Closed';
                  const isOverdue = isComplaintOverdue(c);

                  // Row background class: Unresolved rows get pale priority background; Resolved rows are clean white!
                  const rowClass = isResolved
                    ? `row-priority-${c.status.toLowerCase()}`
                    : `row-priority-${c.priority.toLowerCase()}`;

                  return (
                    <tr key={c.id} className={rowClass}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong>{c.id}</strong>
                          {isOverdue && (
                            <span className="badge-overdue" title="Resolution deadline passed">
                              ⚠️ OVERDUE
                            </span>
                          )}
                        </div>
                        <div className="muted-cell" style={{ fontSize: '9px', marginTop: '2px' }}>
                          {c.dateSubmitted || 'Logged'}
                        </div>
                        {c.deadlineHours && !isResolved && (
                          <div style={{ fontSize: '9px', color: 'var(--secondary-text)', marginTop: '2px' }}>
                            SLA: {c.deadlineHours}h target
                          </div>
                        )}
                      </td>

                      <td>
                        {c.studentName ? (
                          <div>
                            <strong>{c.studentName}</strong>
                            <div className="muted-cell" style={{ fontSize: '9px' }}>
                              {c.studentId} · {c.studentClass || c.scope}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <strong>Staff / General</strong>
                            <div className="muted-cell" style={{ fontSize: '9px' }}>
                              {c.scope}
                            </div>
                          </div>
                        )}
                      </td>

                      <td style={{ maxWidth: '280px', whiteSpace: 'normal' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <strong style={{ color: 'var(--primary-dark-brown)' }}>{c.title}</strong>
                          {!isResolved && c.priority === 'Critical' && (
                            <span className="urgent-action-pill">
                              ⚠️ URGENT
                            </span>
                          )}
                        </div>

                        <div className="muted-cell" style={{ fontSize: '10px', marginTop: '3px' }}>
                          📍 {c.location || c.scope}
                        </div>

                        {c.assessmentReason && (
                          <div style={{ fontSize: '9px', color: 'var(--secondary-text)', marginTop: '3px', background: 'rgba(255,255,255,0.7)', padding: '2px 5px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                            <span style={{ fontWeight: 700, color: 'var(--secondary-brown)' }}>⚙️ Rule-based: </span>
                            {c.assessmentReason.replace('Rule-based Risk Engine: ', '')}
                          </div>
                        )}

                        {c.managementRemarks && (
                          <div style={{ fontSize: '9px', color: 'var(--primary-forest-green)', marginTop: '3px', fontWeight: 600 }}>
                            💬 {c.managementRemarks.slice(0, 70)}...
                          </div>
                        )}
                      </td>

                      <td>
                        <span className="category-tag">{c.category}</span>
                      </td>

                      <td>
                        <span className={`priority ${c.priority.toLowerCase()}`}>
                          {c.priority === 'Critical' ? '🚨 CRITICAL' : c.priority}
                        </span>
                        {c.staffConfirmedPriority && (
                          <div style={{ fontSize: '8px', color: 'var(--secondary-text)', marginTop: '3px' }}>
                            ✓ Staff confirmed
                          </div>
                        )}
                      </td>

                      <td>
                        <span className={`status ${getStatusClass(c.status)}`}>
                          ● {c.status}
                        </span>
                        {c.assignedTo && (
                          <div className="muted-cell" style={{ fontSize: '9px', marginTop: '3px' }}>
                            {c.assignedTo.split('(')[0]}
                          </div>
                        )}
                      </td>

                      <td>
                        {role.edit ? (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="primary-btn"
                              style={{ padding: '6px 9px', fontSize: '10px', whiteSpace: 'nowrap' }}
                              onClick={() => onManageComplaint(c)}
                              title="Review ticket, update priority, reassign team, record remarks"
                            >
                              Manage ↗
                            </button>
                            {!isResolved && (
                              <button
                                type="button"
                                className="text-btn"
                                style={{ fontSize: '10px', whiteSpace: 'nowrap' }}
                                onClick={() => onCycleComplaint(c.id)}
                                title="Advance status workflow"
                              >
                                Next ↻
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="muted-cell">View only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No complaints matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
