import React from 'react';
import { CampusEvent } from '../types';

interface EventsPageProps {
  events: CampusEvent[];
  onOpenNewEvent: () => void;
  onToggleRegister: (id: string) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  events,
  onOpenNewEvent,
  onToggleRegister,
}) => {
  return (
    <section id="eventsPage" className="page active">
      <div className="section-heading">
        <div>
          <h2>Campus events</h2>
          <p>Discover events, manage registration and participation.</p>
        </div>
        <button
          type="button"
          className="primary-btn"
          id="newEvent"
          onClick={onOpenNewEvent}
        >
          ＋ Create event
        </button>
      </div>

      <div className="event-grid">
        {events.map((evt) => (
          <article key={evt.id} className="event-card">
            <div className={`event-date ${evt.badgeClass || ''}`}>
              <b>{evt.day}</b>
              <small>{evt.month}</small>
            </div>
            <div>
              <span className={`event-type ${evt.typeTagClass || ''}`}>
                {evt.typeTag}
              </span>
              <h3>{evt.title}</h3>
              <p>{evt.description}</p>
              <small>{evt.timeLocation}</small>
            </div>
            <button
              type="button"
              className="outline-btn register-btn"
              onClick={() => onToggleRegister(evt.id)}
            >
              {evt.registered ? 'Registered' : 'Register'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};
