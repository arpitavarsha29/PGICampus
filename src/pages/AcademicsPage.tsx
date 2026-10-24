import React, { useState, useEffect } from 'react';
import { Role, Student } from '../types';
import { canSeeRecord } from '../data/initialData';

interface AcademicsPageProps {
  role: Role;
  students: Student[];
  onOpenAddRecord: () => void;
  onToast: (msg: string) => void;
}

interface WorkspaceMember {
  id: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  institution: string;
  status: string;
  registrationDate: string;
  lastLogin: string;
}

export const AcademicsPage: React.FC<AcademicsPageProps> = ({
  role,
  students,
  onOpenAddRecord,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'academics' | 'members'>('academics');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All records');

  // Members state
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [statusFilter, setStatusFilter] = useState('All statuses');

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    }
  }, [activeTab]);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    setMembersError(null);
    try {
      const res = await fetch('/api/members');
      if (!res.ok) throw new Error('Failed to fetch workspace members');
      const data = await res.json();
      setMembers(data);
    } catch (err: any) {
      setMembersError(err.message || 'Unable to load members');
    } finally {
      setLoadingMembers(false);
    }
  };

  // Filter students by role scope
  let list = students.filter((s) => canSeeRecord(role, s));

  const q = search.toLowerCase();
  list = list.filter((s) =>
    (s.name + s.id + s.class + s.dept).toLowerCase().includes(q)
  );

  if (filter === 'Attendance risk') {
    list = list.filter((s) => s.attendance < 75);
  } else if (filter === 'High performer') {
    list = list.filter((s) => s.score >= 80);
  }

  // Filter members
  let filteredMembers = members.filter((m) =>
    (m.fullName + m.email + m.role + m.department + m.id).toLowerCase().includes(memberSearch.toLowerCase())
  );
  if (roleFilter !== 'All roles') {
    filteredMembers = filteredMembers.filter((m) => m.role === roleFilter);
  }
  if (statusFilter !== 'All statuses') {
    filteredMembers = filteredMembers.filter((m) => m.status === statusFilter);
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((x) => x[0])
      .join('')
      .slice(0, 2);
  };

  return (
    <section id="academicsPage" className="page active">
      <div className="section-heading">
        <div>
          <h2>{activeTab === 'academics' ? 'Academic records' : 'User Management · Workspace Members'}</h2>
          <p>
            {activeTab === 'academics'
              ? 'Attendance, performance and class records within your access scope.'
              : 'Manage registered workspace members, roles, and account statuses.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#EBF4EE', padding: '3px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('academics')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'academics' ? 'var(--primary-forest-green)' : 'transparent',
                color: activeTab === 'academics' ? '#FFF' : 'var(--main-text)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Academic Records
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'members' ? 'var(--primary-forest-green)' : 'transparent',
                color: activeTab === 'members' ? '#FFF' : 'var(--main-text)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              User Management ({members.length})
            </button>
          </div>

          {activeTab === 'academics' && role.edit && (
            <button
              type="button"
              className="primary-btn can-edit"
              onClick={onOpenAddRecord}
            >
              ＋ Add record
            </button>
          )}
        </div>
      </div>

      {activeTab === 'academics' ? (
        <div className="panel">
          <div className="table-tools">
            <input
              id="academicSearch"
              placeholder="Search student or subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              id="academicFilter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All records</option>
              <option>Attendance risk</option>
              <option>High performer</option>
            </select>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Attendance</th>
                  <th>Internal score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {list.length > 0 ? (
                  list.map((s) => {
                    const isRisk = s.attendance < 75;
                    return (
                      <tr key={s.id}>
                        <td>
                          <div className="person-cell">
                            <div className="person-avatar">{getInitials(s.name)}</div>
                            <div>
                              <strong>{s.name}</strong>
                              <div className="muted-cell">{s.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>{s.class}</td>
                        <td>
                          <strong>{s.attendance}%</strong>
                        </td>
                        <td>{s.score}/100</td>
                        <td>
                          <span className={`status ${isRisk ? 'risk' : 'good'}`}>
                            {isRisk ? 'Needs attention' : 'On track'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      No records in your current scope.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-foot">
            PGI SmartCampus Database · <span id="recordCount">{list.length} records in scope</span>
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="table-tools">
            <input
              placeholder="Search member name, email or ID…"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option>All roles</option>
              <option>Student</option>
              <option>Chairman</option>
              <option>Registrar</option>
              <option>Director</option>
              <option>Principal</option>
              <option>Exam Cell</option>
              <option>HOD</option>
              <option>Warden</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All statuses</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          {loadingMembers ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary-text)' }}>
              Loading registered workspace members from Supabase...
            </div>
          ) : membersError ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#B91C1C' }}>
              Error: {membersError}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>User ID</th>
                    <th>Assigned Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((m, idx) => (
                      <tr key={m.id || idx}>
                        <td>#{idx + 1}</td>
                        <td>
                          <div className="person-cell">
                            <div className="person-avatar">{getInitials(m.fullName)}</div>
                            <strong>{m.fullName}</strong>
                          </div>
                        </td>
                        <td>{m.email}</td>
                        <td>
                          <span className="student-chip id-chip">{m.id}</span>
                        </td>
                        <td>
                          <span className="priority medium" style={{ background: '#EBF4EE', color: 'var(--primary-forest-green)' }}>
                            {m.role}
                          </span>
                        </td>
                        <td>{m.department}</td>
                        <td>
                          <span className={`status ${m.status === 'Active' ? 'good' : 'risk'}`}>
                            {m.status}
                          </span>
                        </td>
                        <td>{m.registrationDate}</td>
                        <td>{m.lastLogin}</td>
                        <td>
                          <button
                            type="button"
                            className="outline-btn"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => onToast(`Managing member: ${m.fullName}`)}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="empty-state">
                        No workspace members found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="table-foot">
            Supabase Auth &amp; Profiles Database · <span>{filteredMembers.length} members shown (Total: {members.length})</span>
          </div>
        </div>
      )}
    </section>
  );
};
