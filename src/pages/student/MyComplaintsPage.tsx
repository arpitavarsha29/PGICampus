import React, { useState } from 'react';
import { Student, Complaint, ComplaintStatus, StudentPageId } from '../../types';
import { isComplaintOverdue, getPriorityWeight } from '../../utils/priorityEvaluator';

interface MyComplaintsPageProps {
  student: Student;
  complaints: Complaint[];
  onUpdateFeedback: (complaintId: string, rating: number, comment: string) => void;
  onNavigate: (page: StudentPageId) => void;
  onToast: (msg: string) => void;
}

const STAGES: ComplaintStatus[] = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

export const MyComplaintsPage: React.FC<MyComplaintsPageProps> = ({
  student,
  complaints,
  onUpdateFeedback,
  onNavigate,
  onToast,
}) => {
  const [tab, setTab] = useState<'active' | 'resolved' | 'all'>('active');
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  // Interactive feedback inputs for resolved complaints
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');

  // Show only this student's complaints
  const allMyComplaints = complaints.filter(
    (c) => c.studentId === student.id || c.studentName === student.name
  );

  const activeCount = allMyComplaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length;
  const resolvedCount = allMyComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const criticalActiveCount = allMyComplaints.filter(
    (c) => c.priority === 'Critical' && c.status !== 'Resolved' && c.status !== 'Closed'
  ).length;

  let myList = allMyComplaints;

  // Filter by tab
  if (tab === 'active') {
    myList = myList.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed');
  } else if (tab === 'resolved') {
    myList = myList.filter((c) => c.status === 'Resolved' || c.status === 'Closed');
  }

  // Filter by status dropdown
  if (filter !== 'All') {
    myList = myList.filter((c) => c.status.toLowerCase() === filter.toLowerCase());
  }

  // Filter by search query
  if (search.trim()) {
    const q = search.toLowerCase();
    myList = myList.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.location && c.location.toLowerCase().includes(q))
    );
  }

  // Strict Actionable Priority Sorting:
  // 1. Critical (0) -> 2. High (1) -> 3. Medium (2) -> 4. Low (3)
  // Overdue tickets pushed higher within tier
  myList.sort((a, b) => {
    // If viewing mixed list, pending issues always above resolved
    const aResolved = a.status === 'Resolved' || a.status === 'Closed';
    const bResolved = b.status === 'Resolved' || b.status === 'Closed';
    if (aResolved !== bResolved) return aResolved ? 1 : -1;

    // Sort by priority weight
    const weightDiff = getPriorityWeight(a.priority) - getPriorityWeight(b.priority);
    if (weightDiff !== 0) return weightDiff;

    // Overdue first
    const aOverdue = isComplaintOverdue(a) ? 1 : 0;
    const bOverdue = isComplaintOverdue(b) ? 1 : 0;
    if (bOverdue !== aOverdue) return bOverdue - aOverdue;

    return 0;
  });

  const getStageIndex = (status: ComplaintStatus): number => {
    switch (status) {
      case 'Submitted':
        return 0;
      case 'Assigned':
        return 1;
      case 'In Progress':
        return 2;
      case 'Resolved':
      case 'Closed':
        return 3;
      default:
        return 0;
    }
  };

  const handleStartFeedback = (complaintId: string) => {
    setActiveFeedbackId(complaintId);
    setFeedbackRating(5);
    setFeedbackComment('');
  };

  const handleSubmitFeedback = (complaintId: string) => {
    if (!feedbackComment.trim()) {
      onToast('Please provide a short feedback comment.');
      return;
    }
    onUpdateFeedback(complaintId, feedbackRating, feedbackComment.trim());
    setActiveFeedbackId(null);
    onToast('Feedback submitted. Thank you for helping us improve!');
  };

  return (
    <div>
      <div className="section-heading">
        <div>
          <h2>My Complaints &amp; Grievances</h2>
          <p>Real-time status tracking, 4-tier urgency monitoring, and management remarks for your tickets.</p>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={() => onNavigate('student-raise')}
        >
          ＋ Raise a Complaint
        </button>
      </div>

      {/* Campus Emergency Notice if student has active Critical Emergency */}
      {criticalActiveCount > 0 && (
        <div className="emergency-helpline-card">
          <div className="emergency-helpline-info">
            <div className="emergency-helpline-icon">🚨</div>
            <div>
              <strong>Active Emergency Ticket in Progress ({criticalActiveCount})</strong>
              <p>Campus emergency protocol activated. For immediate on-site safety or electrical isolation:</p>
            </div>
          </div>
          <div className="emergency-phone-pills">
            <span className="emergency-phone-pill">
              📞 Proctor Desk: <strong>+91 9450X-11200</strong>
            </span>
            <span className="emergency-phone-pill">
              ⚡ Electrician Duty: <strong>+91 9450X-11204</strong>
            </span>
          </div>
        </div>
      )}

      {/* Queue Separation Tabs */}
      <div className="queue-tabs">
        <button
          type="button"
          className={`queue-tab-btn ${tab === 'active' ? 'active' : ''}`}
          onClick={() => setTab('active')}
        >
          <span>Pending Action Queue</span>
          <span className="tab-count">{activeCount}</span>
        </button>
        <button
          type="button"
          className={`queue-tab-btn ${tab === 'resolved' ? 'active' : ''}`}
          onClick={() => setTab('resolved')}
        >
          <span>Resolved &amp; Closed Archive</span>
          <span className="tab-count">{resolvedCount}</span>
        </button>
        <button
          type="button"
          className={`queue-tab-btn ${tab === 'all' ? 'active' : ''}`}
          onClick={() => setTab('all')}
        >
          <span>All Records</span>
          <span className="tab-count">{allMyComplaints.length}</span>
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="panel" style={{ marginBottom: '20px', padding: '14px 18px' }}>
        <div className="table-tools" style={{ marginBottom: 0 }}>
          <input
            placeholder="Search by ticket ID, subject or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All statuses in view</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {myList.length > 0 ? (
        myList.map((c) => {
          const currentStage = getStageIndex(c.status);
          const isResolved = c.status === 'Resolved' || c.status === 'Closed';
          const isOverdue = isComplaintOverdue(c);
          const hasFeedback = !!c.feedbackRating;

          // Card priority background: Unresolved cards get priority tint; Resolved cards are clean white!
          const cardClass = isResolved
            ? 'card-priority-resolved'
            : `card-priority-${c.priority.toLowerCase()}`;

          return (
            <article key={c.id} className={`complaint-card-detailed ${cardClass}`}>
              <div className="complaint-card-header">
                <div className="complaint-header-left">
                  <span className="ticket-tag">{c.id}</span>
                  <span className="category-tag">{c.category}</span>

                  {/* Priority Badge with Exact Colors */}
                  <span className={`priority ${c.priority.toLowerCase()}`}>
                    {c.priority === 'Critical' ? '🚨 CRITICAL' : `${c.priority} Priority`}
                  </span>

                  {/* Urgent Action Pill for Unresolved Critical Issues */}
                  {!isResolved && c.priority === 'Critical' && (
                    <span className="urgent-action-pill">
                      ⚠️ URGENT ACTION REQUIRED
                    </span>
                  )}

                  {/* Overdue Badge */}
                  {isOverdue && (
                    <span className="badge-overdue">
                      ⚠️ OVERDUE SLA
                    </span>
                  )}

                  <span className="complaint-date">Reported: {c.dateSubmitted || 'Recently'}</span>
                </div>

                <div>
                  <span
                    className={`status ${
                      isResolved
                        ? c.status === 'Closed' ? 'closed' : 'resolved'
                        : c.status === 'Assigned'
                        ? 'assigned'
                        : c.status === 'In Progress'
                        ? 'inprogress'
                        : 'submitted'
                    }`}
                  >
                    ● {c.status}
                  </span>
                </div>
              </div>

              <div className="complaint-title-row">
                <h3>{c.title}</h3>
                {c.location && (
                  <div className="complaint-location-tag">
                    <span>📍</span> Location: <strong>{c.location}</strong>
                  </div>
                )}
              </div>

              {c.description && (
                <div className="complaint-desc-text">
                  {c.description}
                </div>
              )}

              {/* Rule-based Assessment Rationale Box */}
              {c.assessmentReason && (
                <div style={{ marginBottom: '12px', fontSize: '11px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span className="rule-assessment-tag">⚙️ Rule-based Assessment</span>
                  <span style={{ color: 'var(--secondary-text)', fontSize: '11px' }}>
                    {c.assessmentReason}
                  </span>
                </div>
              )}

              {/* Photo preview if attached */}
              {c.photoUrl && (
                <div style={{ marginBottom: '14px' }}>
                  <small style={{ color: 'var(--secondary-text)', fontSize: '10px', display: 'block', marginBottom: '4px' }}>
                    Attachment photo:
                  </small>
                  <img
                    src={c.photoUrl}
                    alt="Complaint attachment"
                    style={{
                      maxHeight: '120px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              )}

              {/* 4-Stage Status Tracking Stepper */}
              <div style={{ marginTop: '20px', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--secondary-text)', textTransform: 'uppercase' }}>
                  Live Status Tracker
                </span>
                <div className="status-stepper">
                  <div className="stepper-track">
                    <div
                      className="stepper-progress"
                      style={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%` }}
                    ></div>
                  </div>

                  {STAGES.map((stage, idx) => {
                    const isDone = idx < currentStage;
                    const isCurrent = idx === currentStage;
                    return (
                      <div
                        key={stage}
                        className={`status-step ${isDone ? 'completed' : isCurrent ? 'current' : ''}`}
                      >
                        <div className="step-node">
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div className="step-label">
                          {stage}
                          {stage === 'Assigned' && c.assignedTo && (
                            <div style={{ fontSize: '8px', color: 'var(--secondary-brown)', fontWeight: 600 }}>
                              {c.assignedTo}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Management Remarks */}
              {c.managementRemarks && (
                <div className="remarks-card">
                  <div className="remarks-icon">💬</div>
                  <div className="remarks-content">
                    <strong>Administration / Maintenance Remarks:</strong>
                    <p>{c.managementRemarks}</p>
                    {c.assignedTo && (
                      <small style={{ color: 'var(--secondary-brown)', display: 'block', marginTop: '4px' }}>
                        Handled by: <b>{c.assignedTo}</b>
                      </small>
                    )}
                  </div>
                </div>
              )}

              {/* Post-Resolution Student Feedback Section */}
              {isResolved && (
                <>
                  {hasFeedback ? (
                    <div className="feedback-submitted-box">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-forest-green)' }}>
                          ✓ Your Resolution Feedback Submitted
                        </span>
                        <div className="feedback-stars-display">
                          {'★'.repeat(c.feedbackRating || 5)}
                          {'☆'.repeat(5 - (c.feedbackRating || 5))}
                        </div>
                      </div>
                      <p>"{c.feedbackComment}"</p>
                      {c.feedbackDate && (
                        <small style={{ color: 'var(--primary-forest-green)', fontSize: '9px', display: 'block', marginTop: '4px' }}>
                          Submitted on {c.feedbackDate}
                        </small>
                      )}
                    </div>
                  ) : activeFeedbackId === c.id ? (
                    <div className="feedback-container">
                      <div className="feedback-header">
                        <strong>Rate your satisfaction with this resolution</strong>
                        <button
                          type="button"
                          className="text-btn"
                          style={{ fontSize: '10px' }}
                          onClick={() => setActiveFeedbackId(null)}
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`star-btn ${star <= feedbackRating ? 'active' : ''}`}
                            onClick={() => setFeedbackRating(star)}
                          >
                            ★
                          </button>
                        ))}
                      </div>

                      <div className="feedback-input-row">
                        <input
                          placeholder="Leave feedback on whether the issue was resolved properly..."
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                        />
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() => handleSubmitFeedback(c.id)}
                        >
                          Submit Feedback
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: '14px',
                        background: '#F4F7EB',
                        border: '1px dashed var(--secondary-sage-green)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: 'var(--primary-forest-green)' }}>
                        This issue has been resolved. How was your experience?
                      </span>
                      <button
                        type="button"
                        className="outline-btn"
                        style={{ color: 'var(--primary-forest-green)', borderColor: 'var(--secondary-sage-green)' }}
                        onClick={() => handleStartFeedback(c.id)}
                      >
                        ★ Provide Feedback
                      </button>
                    </div>
                  )}
                </>
              )}
            </article>
          );
        })
      ) : (
        <div className="panel empty-state">
          <h3>No complaints found</h3>
          <p>You have not logged any grievances matching the current filter.</p>
          <button
            type="button"
            className="primary-btn"
            style={{ marginTop: '12px' }}
            onClick={() => onNavigate('student-raise')}
          >
            ＋ Raise a Complaint
          </button>
        </div>
      )}
    </div>
  );
};
