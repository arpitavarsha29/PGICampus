import React from 'react';
import { Role, MaintenanceItem } from '../types';

interface HostelPageProps {
  role: Role;
  maintenance: MaintenanceItem[];
  onOpenNewMaintenance: () => void;
  onUpdateMaintenance: (id: string) => void;
}

export const HostelPage: React.FC<HostelPageProps> = ({
  role,
  maintenance,
  onOpenNewMaintenance,
  onUpdateMaintenance,
}) => {
  const visibleList = maintenance.filter(
    () =>
      role.kind === 'central' ||
      role.kind === 'hostel' ||
      role.institution === 'PIT'
  );

  const getStatusClass = (status: MaintenanceItem['status']) => {
    if (status === 'Resolved') return 'resolved';
    if (status === 'Open') return 'open';
    return 'progressing';
  };

  return (
    <section id="hostelPage" className="page active">
      <div className="section-heading">
        <div>
          <h2>Hostel &amp; maintenance</h2>
          <p>Facilities, room occupancy and maintenance workflow.</p>
        </div>
        <button
          type="button"
          className="primary-btn"
          id="newMaintenance"
          onClick={onOpenNewMaintenance}
        >
          ＋ Add request
        </button>
      </div>

      <div className="stats-grid compact">
        <article className="stat-card">
          <div className="stat-top">
            <span>Hostel occupancy</span>
            <span className="stat-icon blue">⌂</span>
          </div>
          <strong>82.7%</strong>
          <small>621 of 751 beds occupied</small>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Open requests</span>
            <span className="stat-icon orange">⚑</span>
          </div>
          <strong>24</strong>
          <small>Across permitted hostel scope</small>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Resolved this month</span>
            <span className="stat-icon green">✓</span>
          </div>
          <strong>118</strong>
          <small>Average resolution: 1.8 days</small>
        </article>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Maintenance queue</h2>
            <p>Illustrative requests</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Request</th>
                <th>Location</th>
                <th>Reported</th>
                <th>Assigned team</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="maintenanceRows">
              {visibleList.length > 0 ? (
                visibleList.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.id}</strong>
                      <div>{m.title}</div>
                    </td>
                    <td>{m.location}</td>
                    <td>{m.reported}</td>
                    <td>{m.team}</td>
                    <td>
                      <span className={`status ${getStatusClass(m.status)}`}>
                        {m.status}
                      </span>
                    </td>
                    <td>
                      {role.edit ? (
                        <button
                          type="button"
                          className="text-btn"
                          onClick={() => onUpdateMaintenance(m.id)}
                        >
                          Update ↗
                        </button>
                      ) : (
                        <span className="muted-cell">View only</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No maintenance requests visible in this scope.
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
