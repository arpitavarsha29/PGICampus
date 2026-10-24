import React, { useState, useMemo } from 'react';
import { Student, Complaint, ComplaintCategory, Priority, PeopleAffected } from '../../types';
import { evaluateComplaintPriority } from '../../utils/priorityEvaluator';

interface RaiseComplaintPageProps {
  student: Student;
  onComplaintSubmitted: (complaint: Complaint) => void;
  onCancel: () => void;
  onToast: (msg: string) => void;
}

const CATEGORIES: ComplaintCategory[] = [
  'Classroom',
  'Electrical',
  'Water',
  'Washroom',
  'Hostel',
  'Wi-Fi',
  'Transport',
  'Academic',
  'Faculty',
  'Other',
];

const SAMPLE_PHOTOS = [
  { label: 'Projector Fault', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80' },
  { label: 'Tap Leakage', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80' },
  { label: 'Broken Desk', url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80' },
  { label: 'Wi-Fi Signal', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80' },
];

export const RaiseComplaintPage: React.FC<RaiseComplaintPageProps> = ({
  student,
  onComplaintSubmitted,
  onCancel,
  onToast,
}) => {
  const [category, setCategory] = useState<ComplaintCategory>('Classroom');
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');
  const [safetyRisk, setSafetyRisk] = useState(false);
  const [essentialServiceDisrupted, setEssentialServiceDisrupted] = useState(false);
  const [peopleAffected, setPeopleAffected] = useState<PeopleAffected>('Room / Class');
  const [priorityOverride, setPriorityOverride] = useState<Priority | null>(null);
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Real-time deterministic risk evaluation
  const evaluation = useMemo(() => {
    return evaluateComplaintPriority({
      category,
      title: subject,
      description,
      safetyRisk,
      essentialServiceDisrupted,
      peopleAffected,
    });
  }, [category, subject, description, safetyRisk, essentialServiceDisrupted, peopleAffected]);

  // Priority to use: user manual override or auto-assessed
  const activePriority: Priority = priorityOverride ?? evaluation.priority;

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onToast('Image size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          onToast('Photo attached successfully.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSamplePhoto = (url: string) => {
    setPhotoUrl(url);
    onToast('Sample campus photo attached.');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!subject.trim()) newErrors.subject = 'Subject is required.';
    if (!location.trim()) newErrors.location = 'Location is required (e.g. Block, Room, Floor).';
    if (!description.trim()) newErrors.description = 'Please provide details about the problem.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      onToast('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: subject.trim(),
        category,
        priority: activePriority,
        studentId: student.id,
        studentName: student.name,
        studentClass: student.class,
        studentDept: student.dept,
        studentInst: student.inst,
        description: description.trim(),
        location: location.trim(),
        photoUrl: photoUrl || '',
        safetyRisk,
        essentialServiceDisrupted,
        peopleAffected,
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save complaint to database.');
      }

      const data = await res.json();
      if (data.success && data.complaint) {
        onComplaintSubmitted(data.complaint);
        onToast(`Complaint ticket #${data.complaint.id} saved to database successfully!`);
      } else {
        throw new Error('Server returned unsuccessful response.');
      }
    } catch (err: any) {
      console.error('Complaint submission error:', err);
      onToast(`Error: ${err.message || 'Unable to save complaint to database.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="section-heading">
        <div>
          <h2>Raise a Campus Complaint</h2>
          <p>Submit grievance or maintenance issues directly to college authorities.</p>
        </div>
        <button type="button" className="outline-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <div className="panel" style={{ maxWidth: '820px' }}>
        <form onSubmit={handleSubmit}>
          {/* Linked Student Verification Bar */}
          <div
            style={{
              background: '#FAF7F2',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <span style={{ fontSize: '10px', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 700 }}>
                Submitting as
              </span>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-dark-brown)' }}>
                {student.name} ({student.id})
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="category-tag">{student.inst}</span>
              <span className="category-tag">{student.dept}</span>
              <span className="category-tag">{student.class}</span>
            </div>
          </div>

          {/* Category selection */}
          <div className="field">
            <label>Complaint Category *</label>
            <div className="category-grid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-chip ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Subject / Title */}
          <div className="field">
            <label htmlFor="comp_subject">Subject / Issue Title *</label>
            <input
              id="comp_subject"
              type="text"
              placeholder="e.g. Projector HDMI port not working in CSE Lab"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
              }}
              style={errors.subject ? { borderColor: '#ef4444' } : {}}
            />
            {errors.subject && (
              <small style={{ color: '#ef4444', fontSize: '10px', marginTop: '4px', display: 'block' }}>
                {errors.subject}
              </small>
            )}
          </div>

          {/* Location & Impact Scope */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px' }}>
            <div className="field">
              <label htmlFor="comp_location">Specific Location *</label>
              <input
                id="comp_location"
                type="text"
                placeholder="e.g. Block B · Floor 2 · Lab 204 or Hostel A Room 12"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
                }}
                style={errors.location ? { borderColor: '#ef4444' } : {}}
              />
              {errors.location && (
                <small style={{ color: '#ef4444', fontSize: '10px', marginTop: '4px', display: 'block' }}>
                  {errors.location}
                </small>
              )}
            </div>

            <div className="field">
              <label htmlFor="comp_people">Impact Scope</label>
              <select
                id="comp_people"
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(e.target.value as PeopleAffected)}
              >
                <option value="Individual">Individual (Only me)</option>
                <option value="Room / Class">Room / Class (30-60 students)</option>
                <option value="Wing / Floor">Wing / Floor (Hostel / Lab Wing)</option>
                <option value="Campus-wide">Campus-wide (Entire college)</option>
              </select>
            </div>
          </div>

          {/* Safety & Essential Utility Risk Factors */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              background: '#FAF7F2',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '16px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', margin: 0 }}>
              <input
                type="checkbox"
                checked={safetyRisk}
                onChange={(e) => setSafetyRisk(e.target.checked)}
                style={{ marginTop: '2px', accentColor: '#B91C1C' }}
              />
              <div>
                <strong style={{ fontSize: '11px', color: '#B91C1C', display: 'block' }}>
                  ⚠️ Immediate Safety / Fire Risk?
                </strong>
                <small style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>
                  Active sparks, exposed wire, smoke, gas, collapsing element, personal injury danger.
                </small>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', margin: 0 }}>
              <input
                type="checkbox"
                checked={essentialServiceDisrupted}
                onChange={(e) => setEssentialServiceDisrupted(e.target.checked)}
                style={{ marginTop: '2px', accentColor: '#C2410C' }}
              />
              <div>
                <strong style={{ fontSize: '11px', color: '#C2410C', display: 'block' }}>
                  ⚡ Essential Service Outage?
                </strong>
                <small style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>
                  Drinking water line, main power feeder, central exam server, or sanitized washroom.
                </small>
              </div>
            </label>
          </div>

          {/* Detailed description */}
          <div className="field">
            <label htmlFor="comp_desc">Detailed Description *</label>
            <textarea
              id="comp_desc"
              rows={4}
              placeholder="Describe the issue in detail. If there are sparks, leaks, or safety hazards, please state exactly where they are..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              style={errors.description ? { borderColor: '#ef4444' } : {}}
            />
            {errors.description && (
              <small style={{ color: '#ef4444', fontSize: '10px', marginTop: '4px', display: 'block' }}>
                {errors.description}
              </small>
            )}
          </div>

          {/* Real-time Rule-based Auto-Assessment Preview Box */}
          <div className={`risk-assessment-preview-card ${evaluation.priority.toLowerCase()}`}>
            <div className="risk-header-row">
              <span className="risk-engine-badge">
                ⚙️ Rule-based Auto-Assessment
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`priority ${evaluation.priority.toLowerCase()}`}>
                  {evaluation.priority === 'Critical' ? '🚨 CRITICAL / EMERGENCY' : `${evaluation.priority} Priority`}
                </span>
                {priorityOverride && (
                  <button
                    type="button"
                    className="text-btn"
                    style={{ fontSize: '9px', textDecoration: 'underline' }}
                    onClick={() => setPriorityOverride(null)}
                  >
                    Reset to auto
                  </button>
                )}
              </div>
            </div>

            <p className="risk-reason-text">
              {evaluation.reason}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '6px' }}>
              <span className="risk-sla-tag">
                ⏱️ Target Resolution SLA: <strong>Within {evaluation.deadlineHours} hours</strong> ({evaluation.deadlineDate})
              </span>

              {/* Optional manual override toggle */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px' }}>
                <label htmlFor="priority_override_select" style={{ fontSize: '10px', color: 'var(--secondary-text)', margin: 0 }}>
                  Adjust priority:
                </label>
                <select
                  id="priority_override_select"
                  value={activePriority}
                  onChange={(e) => setPriorityOverride(e.target.value as Priority)}
                  style={{ padding: '3px 6px', fontSize: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                >
                  <option value="Critical">Critical (Emergency)</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Critical Emergency Helpline Trigger */}
            {evaluation.isEmergency && evaluation.emergencyNotice && (
              <div
                style={{
                  marginTop: '12px',
                  background: '#B91C1C',
                  color: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <strong style={{ fontSize: '11px', display: 'block', letterSpacing: '0.3px' }}>
                    {evaluation.emergencyNotice.title}
                  </strong>
                  <span style={{ fontSize: '10px', opacity: 0.95 }}>
                    {evaluation.emergencyNotice.description}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                    📞 {evaluation.emergencyNotice.contactName}: <strong>{evaluation.emergencyNotice.contactNumber}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Optional photo attachment */}
          <div className="field">
            <label>Optional Photo Attachment</label>
            <div className="photo-upload-area" onClick={() => document.getElementById('comp_file_input')?.click()}>
              <input
                id="comp_file_input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <div className="photo-upload-icon">📷</div>
              <div className="photo-upload-text">Click to upload photo from your device</div>
              <div className="photo-upload-hint">PNG, JPG, or WEBP up to 5MB</div>
            </div>

            {/* Quick demo presets */}
            <div style={{ marginTop: '8px' }}>
              <small style={{ color: 'var(--secondary-text)', fontSize: '10px' }}>Or select a sample campus photo for quick demo:</small>
              <div className="sample-photo-picker">
                {SAMPLE_PHOTOS.map((sp) => (
                  <button
                    key={sp.label}
                    type="button"
                    className="sample-photo-btn"
                    onClick={() => handleSelectSamplePhoto(sp.url)}
                  >
                    + {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {photoUrl && (
              <div className="photo-preview-box">
                <img src={photoUrl} alt="Complaint preview" className="photo-preview-img" />
                <button
                  type="button"
                  className="photo-remove-btn"
                  title="Remove attachment"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoUrl(null);
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="modal-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="outline-btn" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? 'Saving to Database...' : 'Submit Complaint Ticket →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
