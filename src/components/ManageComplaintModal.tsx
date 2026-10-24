import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus, Priority } from '../types';
import { isComplaintOverdue, CAMPUS_EMERGENCY_CONTACTS } from '../utils/priorityEvaluator';

interface ManageComplaintModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onSave: (
    complaintId: string,
    updatedData: {
      status: ComplaintStatus;
      assignedTo: string;
      managementRemarks: string;
      priority: Priority;
      staffConfirmedPriority: boolean;
    }
  ) => void;
}

const TEAMS = [
  'Central Helpdesk',
  'Facilities & Maintenance',
  'IT Support & Network',
  'Plumbing & Water',
  'Electrical Team',
  'Academic Affairs',
  'Hostel Warden Office',
  'Transport Cell',
  'General Administration',
];

export const ManageComplaintModal: React.FC<ManageComplaintModalProps> = ({
  complaint,
  onClose,
  onSave,
}) => {
  const [status, setStatus] = useState<ComplaintStatus>('Submitted');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [staffConfirmedPriority, setStaffConfirmedPriority] = useState<boolean>(false);
  const [assignedTo, setAssignedTo] = useState<string>('Facilities & Maintenance');
  const [remarks, setRemarks] = useState<string>('');

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status || 'Submitted');
      setPriority(complaint.priority || 'Medium');
      setStaffConfirmedPriority(Boolean(complaint.staffConfirmedPriority));
      setAssignedTo(complaint.assignedTo || 'Facilities & Maintenance');
      setRemarks(complaint.managementRemarks || '');
    }
  }, [complaint]);

  if (!complaint) return null;

  const isOverdue = isComplaintOverdue(complaint);
  const isResolvedOrClosed = status === 'Resolved' || status === 'Closed';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(complaint.id, {
      status,
      assignedTo,
      managementRemarks: remarks.trim(),
      priority,
      staffConfirmedPriority,
    });
  };

  return (
    <div
      className="modal-backdrop show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" style={{ maxWidth: '640px' }}>
        <div className="modal-head">
          <div>
            <h2>Manage Grievance #{complaint.id}</h2>
            <p>Review risk assessment, set priority, reassign team, and update resolution notes.</p>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="manage-modal-body">
            {/* Critical Emergency Banner if priority is Critical and unresolved */}
            {priority === 'Critical' && !isResolvedOrClosed && (
              <div
                style={{
                  background: '#FEE2E2',
                  border: '1.5px solid #B91C1C',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>⚠️</span>
                    <strong style={{ color: '#B91C1C', fontSize: '13px', fontWeight: 800 }}>
                      CRITICAL EMERGENCY — URGENT ACTION REQUIRED
                    </strong>
                  </div>
                  <span className="urgent-action-pill">URGENT ACTION REQUIRED</span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#7F1D1D' }}>
                  This issue poses an immediate safety risk or campus disruption. Dispatch responders immediately.
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap', fontSize: '11px' }}>
                  <span style={{ color: '#991B1B' }}>
                    🚨 <strong>{CAMPUS_EMERGENCY_CONTACTS[0].dept}:</strong> {CAMPUS_EMERGENCY_CONTACTS[0].phone} ({CAMPUS_EMERGENCY_CONTACTS[0].intercom})
                  </span>
                  <span style={{ color: '#991B1B' }}>
                    ⚡ <strong>{CAMPUS_EMERGENCY_CONTACTS[1].dept}:</strong> {CAMPUS_EMERGENCY_CONTACTS[1].phone} ({CAMPUS_EMERGENCY_CONTACTS[1].intercom})
                  </span>
                  <span style={{ color: '#991B1B' }}>
                    🏥 <strong>{CAMPUS_EMERGENCY_CONTACTS[2].dept}:</strong> {CAMPUS_EMERGENCY_CONTACTS[2].phone} ({CAMPUS_EMERGENCY_CONTACTS[2].intercom})
                  </span>
                </div>
              </div>
            )}

            {/* Overdue Alert */}
            {isOverdue && !isResolvedOrClosed && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #F87171',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: '#991B1B',
                }}
              >
                <span>⏱️</span>
                <span>
                  <strong>SLA TARGET EXCEEDED:</strong> This grievance has surpassed its target SLA deadline ({complaint.deadlineHours || 24}h). Prioritize resolution immediately.
                </span>
              </div>
            )}

            {/* Student & Ticket Details Summary */}
            <div className="complaint-info-summary">
              <div>
                <strong>Student Submitter</strong>
                <span>
                  {complaint.studentName || 'Anonymous Student'} ({complaint.studentId || 'N/A'})
                </span>
                <small style={{ color: 'var(--secondary-text)', fontSize: '10px' }}>
                  {complaint.studentClass || 'Class record'} · {complaint.studentInst || 'PGI'}
                </small>
              </div>

              <div>
                <strong>Location &amp; Category</strong>
                <span>{complaint.category}</span>
                <small style={{ color: 'var(--secondary-text)', fontSize: '10px' }}>
                  📍 {complaint.location || complaint.scope}
                </small>
              </div>

              <div>
                <strong>Subject</strong>
                <span style={{ fontSize: '11px', fontWeight: 600 }}>{complaint.title}</span>
              </div>

              <div>
                <strong>Reported On</strong>
                <span>{complaint.dateSubmitted || 'Recent'}</span>
              </div>
            </div>

            {/* Rule-based Auto-Assessment Rationale Card */}
            <div
              style={{
                background: '#FDFBF7',
                border: '1px solid #E0D8CB',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '11px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="rule-assessment-tag">
                  ⚙️ {complaint.assessmentMethod || 'Rule-based Risk Engine'}
                </span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>Evaluated Priority:</span>
                  <span className={`priority ${complaint.autoAssessedPriority?.toLowerCase() || complaint.priority.toLowerCase()}`}>
                    {(complaint.autoAssessedPriority || complaint.priority) === 'Critical' && '⚠️ '}
                    {complaint.autoAssessedPriority || complaint.priority}
                  </span>
                </div>
              </div>
              <p style={{ margin: 0, color: 'var(--main-text)', fontSize: '11px', lineHeight: 1.4 }}>
                <strong>Assessment Rationale:</strong> {complaint.assessmentReason || 'Standard severity classification.'}
              </p>
              <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '10px', color: 'var(--secondary-text)' }}>
                <span>⚠️ Safety risk: <strong>{complaint.safetyRisk ? 'Yes (Hazard present)' : 'No'}</strong></span>
                <span>⚡ Essential service: <strong>{complaint.essentialServiceDisrupted ? 'Disrupted' : 'Normal'}</strong></span>
                <span>👥 Impact: <strong>{complaint.peopleAffected || 'Single Room'}</strong></span>
                <span>⏱️ SLA: <strong>{complaint.deadlineHours ? `${complaint.deadlineHours}h` : 'Standard'}</strong></span>
              </div>
            </div>

            {/* Description */}
            {complaint.description && (
              <div style={{ fontSize: '11px', background: '#FAF7F2', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid var(--primary-forest-green)' }}>
                <strong style={{ color: 'var(--secondary-brown)', display: 'block', fontSize: '10px', marginBottom: '3px' }}>
                  STUDENT'S DETAILED DESCRIPTION:
                </strong>
                <p style={{ margin: 0, color: 'var(--main-text)', lineHeight: 1.5 }}>{complaint.description}</p>
              </div>
            )}

            {/* Photo preview if present */}
            {complaint.photoUrl && (
              <div>
                <strong style={{ color: 'var(--secondary-text)', fontSize: '10px', display: 'block', marginBottom: '4px' }}>
                  ATTACHED EVIDENCE PHOTO:
                </strong>
                <img
                  src={complaint.photoUrl}
                  alt="Complaint proof"
                  style={{
                    maxHeight: '140px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            {/* Student feedback if resolved */}
            {complaint.feedbackRating && (
              <div className="feedback-submitted-box" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '10px', color: 'var(--primary-forest-green)' }}>STUDENT FEEDBACK RATING:</strong>
                  <span className="feedback-stars-display">
                    {'★'.repeat(complaint.feedbackRating)}
                    {'☆'.repeat(5 - complaint.feedbackRating)}
                  </span>
                </div>
                <p>"{complaint.feedbackComment}"</p>
              </div>
            )}

            {/* Priority and Confirmation Controls */}
            <div
              style={{
                background: '#FAF6F0',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="field" style={{ margin: 0 }}>
                  <label htmlFor="mgt_priority" style={{ fontWeight: 700 }}>
                    Official Complaint Priority *
                  </label>
                  <select
                    id="mgt_priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    style={{ fontWeight: 600 }}
                  >
                    <option value="Critical">🔴 Critical / Emergency (#B91C1C)</option>
                    <option value="High">🟠 High Priority (#C2410C)</option>
                    <option value="Medium">🟡 Medium Priority (#A16207)</option>
                    <option value="Low">🟢 Low Priority (#166534)</option>
                  </select>
                </div>

                <div className="field" style={{ margin: 0 }}>
                  <label htmlFor="mgt_status" style={{ fontWeight: 700 }}>
                    Workflow Status *
                  </label>
                  <select
                    id="mgt_status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                  >
                    <option value="Submitted">Submitted (Awaiting Review)</option>
                    <option value="Assigned">Assigned (Team Dispatched)</option>
                    <option value="In Progress">In Progress (Work Ongoing)</option>
                    <option value="Resolved">Resolved (Completed &amp; Fixed)</option>
                    <option value="Closed">Closed (Archived)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="staff_confirm"
                  checked={staffConfirmedPriority}
                  onChange={(e) => setStaffConfirmedPriority(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-forest-green)' }}
                />
                <label htmlFor="staff_confirm" style={{ margin: 0, fontSize: '11px', cursor: 'pointer', fontWeight: 600, color: 'var(--main-text)' }}>
                  Staff verified &amp; confirmed priority level
                  {complaint.autoAssessedPriority && priority !== complaint.autoAssessedPriority && (
                    <span style={{ color: 'var(--secondary-brown)', fontWeight: 'normal', marginLeft: '4px' }}>
                      (Overrides auto-assessed {complaint.autoAssessedPriority})
                    </span>
                  )}
                </label>
              </div>
            </div>

            {/* Editable Assigned Team */}
            <div className="field">
              <label htmlFor="mgt_team">Assigned Department / Team</label>
              <select
                id="mgt_team"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                {TEAMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Editable Management Remarks */}
            <div className="field">
              <label htmlFor="mgt_remarks">Management Remarks &amp; Resolution Notes *</label>
              <textarea
                id="mgt_remarks"
                rows={3}
                placeholder="Write official notes for the student (e.g. Technician dispatched, parts replaced, verified functioning)..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
              <small style={{ color: 'var(--secondary-text)', fontSize: '9px', marginTop: '3px', display: 'block' }}>
                These remarks will be visible to the student in their "My Complaints" portal.
              </small>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Save &amp; Update Ticket ↗
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


