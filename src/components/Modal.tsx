import React, { useState, useEffect } from 'react';
import { ModalType } from '../types';

interface ModalProps {
  type: ModalType;
  onClose: () => void;
  onSubmit: (type: NonNullable<ModalType>, values: Record<string, string>) => void;
}

export const Modal: React.FC<ModalProps> = ({ type, onClose, onSubmit }) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!type) {
      setFormValues({});
      return;
    }

    if (type === 'notice') {
      setFormValues({
        title: '',
        body: '',
        audience: 'All institutions · Students',
      });
    } else if (type === 'complaint') {
      setFormValues({
        title: '',
        category: 'Infrastructure',
        priority: 'High',
      });
    } else if (type === 'maintenance') {
      setFormValues({
        title: '',
        location: '',
        team: 'Facilities',
      });
    } else if (type === 'event') {
      setFormValues({
        title: '',
        body: '',
        audience: 'All institutions',
      });
    } else if (type === 'record') {
      setFormValues({
        title: '',
        body: '',
      });
    }
  }, [type]);

  if (!type) return null;

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(type, formValues);
  };

  return (
    <div
      className="modal-backdrop show"
      id="modalBackdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <div>
            <h2 id="modalTitle">
              {type === 'notice' && 'Publish a notice'}
              {type === 'complaint' && 'Create complaint'}
              {type === 'maintenance' && 'Add maintenance request'}
              {type === 'event' && 'Create campus event'}
              {type === 'record' && 'Add academic record'}
            </h2>
            <p id="modalSubtitle">
              {type === 'notice' &&
                'Choose the audience carefully. Notices are published directly to the campus notice board.'}
              {type === 'complaint' && 'Create a trackable campus service request.'}
              {type === 'maintenance' && 'Log a facilities or hostel issue.'}
              {type === 'event' && 'Add a new event to the campus calendar.'}
              {type === 'record' && 'Official campus academic record entry.'}
            </p>
          </div>
          <button
            type="button"
            id="closeModal"
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form id="modalForm" onSubmit={handleSubmit}>
          <div id="modalFields">
            {type === 'notice' && (
              <>
                <div className="field">
                  <label htmlFor="f_title">Notice title</label>
                  <input
                    id="f_title"
                    type="text"
                    placeholder="e.g. Internal assessment schedule"
                    required
                    value={formValues.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="f_body">Message</label>
                  <textarea
                    id="f_body"
                    placeholder="Write the key details…"
                    required
                    value={formValues.body || ''}
                    onChange={(e) => handleChange('body', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="f_audience">Target audience</label>
                  <select
                    id="f_audience"
                    value={formValues.audience || 'All institutions · Students'}
                    onChange={(e) => handleChange('audience', e.target.value)}
                  >
                    <option>All institutions · Students</option>
                    <option>PIT · B.Tech 3rd Year</option>
                    <option>PIT · CSE Department</option>
                    <option>PIT · Hostel residents</option>
                    <option>PIT-Pharmacy</option>
                    <option>PPJ</option>
                    <option>PPJ Pharmacy</option>
                  </select>
                </div>
              </>
            )}

            {type === 'complaint' && (
              <>
                <div className="field">
                  <label htmlFor="f_title">Issue summary</label>
                  <input
                    id="f_title"
                    type="text"
                    placeholder="e.g. Classroom projector issue"
                    required
                    value={formValues.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="f_category">Category</label>
                  <select
                    id="f_category"
                    value={formValues.category || 'Infrastructure'}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    <option>Infrastructure</option>
                    <option>IT Support</option>
                    <option>Hostel</option>
                    <option>Maintenance</option>
                    <option>Academic</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="f_priority">Priority</label>
                  <select
                    id="f_priority"
                    value={formValues.priority || 'High'}
                    onChange={(e) => handleChange('priority', e.target.value)}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </>
            )}

            {type === 'maintenance' && (
              <>
                <div className="field">
                  <label htmlFor="f_title">Request title</label>
                  <input
                    id="f_title"
                    type="text"
                    placeholder="e.g. Repair fan in room"
                    required
                    value={formValues.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="f_location">Location</label>
                  <input
                    id="f_location"
                    type="text"
                    placeholder="Building / block / room"
                    required
                    value={formValues.location || ''}
                    onChange={(e) => handleChange('location', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="f_team">Assigned team</label>
                  <select
                    id="f_team"
                    value={formValues.team || 'Facilities'}
                    onChange={(e) => handleChange('team', e.target.value)}
                  >
                    <option>Facilities</option>
                    <option>Electrical</option>
                    <option>Plumbing</option>
                    <option>IT Support</option>
                  </select>
                </div>
              </>
            )}

            {type === 'event' && (
              <>
                <div className="field">
                  <label htmlFor="f_title">Event name</label>
                  <input
                    id="f_title"
                    type="text"
                    placeholder="Event title"
                    required
                    value={formValues.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="f_body">Description</label>
                  <textarea
                    id="f_body"
                    placeholder="What is the event about?"
                    required
                    value={formValues.body || ''}
                    onChange={(e) => handleChange('body', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="f_audience">Audience</label>
                  <select
                    id="f_audience"
                    value={formValues.audience || 'All institutions'}
                    onChange={(e) => handleChange('audience', e.target.value)}
                  >
                    <option>All institutions</option>
                    <option>PIT</option>
                    <option>PIT-Pharmacy</option>
                    <option>PPJ</option>
                    <option>PPJ Pharmacy</option>
                  </select>
                </div>
              </>
            )}

            {type === 'record' && (
              <>
                <div className="field">
                  <label htmlFor="f_title">Student name</label>
                  <input
                    id="f_title"
                    type="text"
                    placeholder="Student name"
                    required
                    value={formValues.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="f_body">Class / department</label>
                  <input
                    id="f_body"
                    type="text"
                    placeholder="Class and department"
                    required
                    value={formValues.body || ''}
                    onChange={(e) => handleChange('body', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="outline-btn"
              id="cancelModal"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="primary-btn" id="modalSubmit">
              {type === 'notice' && 'Publish notice'}
              {type === 'complaint' && 'Create ticket'}
              {type === 'maintenance' && 'Add request'}
              {type === 'event' && 'Create event'}
              {type === 'record' && 'Save record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
