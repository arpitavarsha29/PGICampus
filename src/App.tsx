import React, { useState, useEffect } from 'react';
import {
  RoleKey,
  PageId,
  StudentPageId,
  PortalMode,
  Notice,
  Complaint,
  Priority,
  MaintenanceItem,
  Student,
  CampusEvent,
  ModalType,
  ComplaintStatus,
} from './types';
import {
  roles,
  initialNotices,
  initialComplaints,
  initialMaintenance,
  initialStudents,
  initialEvents,
} from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { StudentSidebar } from './components/StudentSidebar';
import { Topbar } from './components/Topbar';
import { Toast } from './components/Toast';
import { Modal } from './components/Modal';
import { ManageComplaintModal } from './components/ManageComplaintModal';
import { DashboardPage } from './pages/DashboardPage';
import { AcademicsPage } from './pages/AcademicsPage';
import { NoticesPage } from './pages/NoticesPage';
import { ComplaintsPage, DashboardComplaintFilter } from './pages/ComplaintsPage';
import { HostelPage } from './pages/HostelPage';
import { EventsPage } from './pages/EventsPage';
import { PlacementPage } from './pages/PlacementPage';
import { AssistantPage } from './pages/AssistantPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { RaiseComplaintPage } from './pages/student/RaiseComplaintPage';
import { MyComplaintsPage } from './pages/student/MyComplaintsPage';
import { StudentNoticesPage } from './pages/student/StudentNoticesPage';
import { supabaseClient, isFrontendSupabaseConfigured } from './utils/supabaseClient';
import { useCampusClock } from './utils/useCampusClock';

const STORAGE_KEY = 'pgi_smartcampus_complaints_v1';

export interface CampusPhoto {
  id: string;
  name: string;
  filename: string;
  url: string;
  jpgUrl: string;
  description: string;
}

export const campusPhotos: CampusPhoto[] = [
  {
    id: 'main',
    name: 'Main Campus Aerial View (Authentic)',
    filename: 'pgi_main_campus_building.jpg',
    url: '/assets/college-photos/pgi_main_campus_building.jpg',
    jpgUrl: '/assets/college-photos/pgi_main_campus_building.jpg',
    description: 'Authentic Campus & Buildings of Prasad Group of Institutions, Jaunpur',
  },
  {
    id: 'academic',
    name: 'Academic Block',
    filename: 'pgi_academic_block.jpg',
    url: '/assets/college-photos/pgi_academic_block.svg',
    jpgUrl: '/assets/college-photos/pgi_academic_block.jpg',
    description: 'PIT Classrooms & Lecture Halls',
  },
  {
    id: 'library',
    name: 'Central Library',
    filename: 'pgi_library_hall.jpg',
    url: '/assets/college-photos/pgi_library_hall.svg',
    jpgUrl: '/assets/college-photos/pgi_library_hall.jpg',
    description: 'Knowledge Resource Centre & Reading Halls',
  },
  {
    id: 'labs',
    name: 'Laboratories',
    filename: 'pgi_laboratories.jpg',
    url: '/assets/college-photos/pgi_laboratories.svg',
    jpgUrl: '/assets/college-photos/pgi_laboratories.jpg',
    description: 'Engineering & Computing Laboratories',
  },
  {
    id: 'green',
    name: 'Green Campus Grounds',
    filename: 'pgi_green_campus.jpg',
    url: '/assets/college-photos/pgi_green_campus.svg',
    jpgUrl: '/assets/college-photos/pgi_green_campus.jpg',
    description: 'Lush Green Lawns & Sports Ground',
  },
];

export const App: React.FC = () => {
  // Portal Mode: Management Workspace vs Student Portal
  const [portalMode, setPortalMode] = useState<PortalMode>('management');

  // Management navigation & role
  const [currentRoleKey, setCurrentRoleKey] = useState<RoleKey>('chairman');
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

  // Student navigation & active student
  const [currentStudentId, setCurrentStudentId] = useState<string>('PGI24031');
  const [studentCurrentPage, setStudentCurrentPage] =
    useState<StudentPageId>('student-dashboard');

  // College Photo Background Configuration
  const [activePhotoId, setActivePhotoId] = useState<string>('main');
  const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState<string>(
    '/assets/college-photos/pgi_main_campus_building.jpg'
  );
  // Configurable overlay opacity: 0.70 means 70% white overlay and 30% photo visibility
  const overlayOpacity = 0.70;

  // Live Asia/Kolkata campus clock (updates every 1 second)
  const clock = useCampusClock();

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showInstitutionsGrid, setShowInstitutionsGrid] = useState<boolean>(false);
  const [managingComplaint, setManagingComplaint] = useState<Complaint | null>(null);
  const [complaintInitialFilter, setComplaintInitialFilter] =
    useState<DashboardComplaintFilter>(null);

  // Data states with live API fetching and 20-second polling
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>(initialMaintenance);
  const [students] = useState<Student[]>(initialStudents);
  const [events, setEvents] = useState<CampusEvent[]>(initialEvents);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const refreshData = async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        if (data.complaints && Array.isArray(data.complaints)) {
          setComplaints(data.complaints);
        }
        if (data.notices && Array.isArray(data.notices)) {
          setNotices(data.notices);
        }
        if (data.maintenance && Array.isArray(data.maintenance)) {
          setMaintenance(data.maintenance);
        }
        if (data.events && Array.isArray(data.events)) {
          setEvents(data.events);
        }
        const istTime = new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        setLastUpdated(istTime);
      }
    } catch (err) {
      console.error('Error fetching live data:', err);
    }
  };

  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 20000); // Polling fallback every 20s

    let channel: any = null;
    if (isFrontendSupabaseConfigured && supabaseClient) {
      channel = supabaseClient
        .channel('public-pgi-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'complaints' },
          () => {
            refreshData();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notices' },
          () => {
            refreshData();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeConnected(true);
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setRealtimeConnected(false);
          }
        });
    }

    return () => {
      clearInterval(interval);
      if (channel && supabaseClient) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, []);

  // Modal and Toast
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Detect whether authentic .jpg photo is present, or gracefully use the architectural .svg placeholder
  useEffect(() => {
    const current =
      campusPhotos.find((p) => p.id === activePhotoId) || campusPhotos[0];
    const img = new Image();
    img.src = current.jpgUrl;
    img.onload = () => {
      setResolvedPhotoUrl(current.jpgUrl);
    };
    img.onerror = () => {
      setResolvedPhotoUrl(current.url);
    };
  }, [activePhotoId]);

  // Persist complaints to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    } catch {
      // ignore storage errors
    }
  }, [complaints]);

  const role = roles[currentRoleKey];
  const activeStudent =
    students.find((s) => s.id === currentStudentId) || students[0];
  const currentPhotoObj =
    campusPhotos.find((p) => p.id === activePhotoId) || campusPhotos[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleTogglePortalMode = () => {
    const nextMode = portalMode === 'management' ? 'student' : 'management';
    setPortalMode(nextMode);
    setSidebarOpen(false);
    showToast(
      nextMode === 'student'
        ? `Switched to Student Portal (${activeStudent.name})`
        : `Switched to Management Workspace (${role.name})`
    );
  };

  const handleRoleChange = (key: RoleKey) => {
    setCurrentRoleKey(key);
    setShowInstitutionsGrid(false);
    showToast(`Demo role switched to ${roles[key].name}`);
  };

  const handleStudentChange = (studentId: string) => {
    setCurrentStudentId(studentId);
    const found = students.find((s) => s.id === studentId);
    showToast(`Demo student switched to ${found?.name || studentId}`);
  };

  const handleSelectCampusPhoto = (photoId: string) => {
    setActivePhotoId(photoId);
    const p = campusPhotos.find((item) => item.id === photoId);
    showToast(`Background photo set to ${p?.name || photoId}`);
  };

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    if (page === 'hostel' && !['central', 'hostel'].includes(role.kind)) {
      showToast(
        'Hostel data is restricted to authorized hostel roles and central view roles.'
      );
    }
    if (page === 'placement' && role.kind === 'class') {
      showToast('Showing only class-level demo insights.');
    }
    if (window.innerWidth < 800) {
      setSidebarOpen(false);
    }
  };

  const handleStudentNavigate = (page: StudentPageId) => {
    setStudentCurrentPage(page);
    if (window.innerWidth < 800) {
      setSidebarOpen(false);
    }
  };

  const handleViewAllInstitutions = () => {
    setCurrentPage('dashboard');
    setShowInstitutionsGrid(true);
    showToast('Showing the group-wide institution snapshot.');
  };

  // Status transitions
  const getNextStatus = (current: ComplaintStatus): ComplaintStatus => {
    switch (current) {
      case 'Submitted':
        return 'Assigned';
      case 'Assigned':
        return 'In Progress';
      case 'In Progress':
        return 'Resolved';
      case 'Resolved':
        return 'Submitted';
      case 'Open':
        return 'In Progress';
      default:
        return 'In Progress';
    }
  };

  const handleCycleComplaint = async (id: string) => {
    if (!role.edit) {
      showToast('This role has view-only access.');
      return;
    }
    const currentComp = complaints.find((c) => c.id === id);
    if (!currentComp) return;
    const nextStatus = getNextStatus(currentComp.status);

    // Optimistic UI update
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
    );
    showToast(`${id} updated to ${nextStatus}`);

    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        console.error('Failed to update complaint status on database');
      }
    } catch (err) {
      console.error('Error updating complaint status:', err);
    }
    refreshData();
  };

  // Student raises a complaint
  const handleComplaintSubmitted = (newComp: Complaint) => {
    setComplaints((prev) => [newComp, ...prev]);
    showToast(`Complaint ticket #${newComp.id} generated successfully!`);
    setStudentCurrentPage('student-my-complaints');
    refreshData();
  };

  // Student submits feedback on a resolved complaint
  const handleUpdateFeedback = async (
    complaintId: string,
    rating: number,
    comment: string
  ) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        return {
          ...c,
          feedbackRating: rating,
          feedbackComment: comment,
          feedbackDate: dateStr,
        };
      })
    );
    try {
      await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackRating: rating, feedbackComment: comment }),
      });
    } catch (err) {
      console.error('Error saving feedback to database:', err);
    }
    refreshData();
  };

  // Navigation to complaints with specific filter (from Dashboard cards or emergency banners)
  const handleNavigateToComplaints = (filter?: DashboardComplaintFilter) => {
    setComplaintInitialFilter(filter || null);
    setCurrentPage('complaints');
    if (filter) {
      showToast(`Viewing ${filter} complaints queue`);
    }
  };

  // Management updates a complaint (status, remarks, assignment, priority, staff confirmation)
  const handleSaveManagedComplaint = async (
    complaintId: string,
    updatedData: {
      status: ComplaintStatus;
      assignedTo: string;
      managementRemarks: string;
      priority: Priority;
      staffConfirmedPriority: boolean;
    }
  ) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: updatedData.status,
              assignedTo: updatedData.assignedTo,
              managementRemarks: updatedData.managementRemarks,
              priority: updatedData.priority,
              staffConfirmedPriority: updatedData.staffConfirmedPriority,
            }
          : c
      )
    );
    setManagingComplaint(null);
    showToast(`Ticket #${complaintId} updated (${updatedData.priority} · ${updatedData.status})`);

    try {
      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        console.error('Failed to update managed complaint on database');
      }
    } catch (err) {
      console.error('Error updating managed complaint:', err);
    }
    refreshData();
  };

  const handleUpdateMaintenance = (id: string) => {
    if (!['central', 'hostel', 'institution'].includes(role.kind)) {
      showToast('Not authorized to update maintenance.');
      return;
    }
    setMaintenance((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const nextStatus: MaintenanceItem['status'] =
          m.status === 'Open'
            ? 'In progress'
            : m.status === 'In progress'
            ? 'Resolved'
            : 'Open';
        showToast(`${id} status changed to ${nextStatus}`);
        return { ...m, status: nextStatus };
      })
    );
  };

  const handleToggleRegister = (id: string) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id !== id) return evt;
        const next = !evt.registered;
        showToast(
          next ? 'You are registered.' : 'Registration removed.'
        );
        return { ...evt, registered: next };
      })
    );
  };

  const handleModalSubmit = async (
    type: NonNullable<ModalType>,
    values: Record<string, string>
  ) => {
    if (type === 'notice') {
      if (!role.edit && !['central'].includes(role.kind)) {
        showToast('Your role cannot publish notices.');
        return;
      }
      try {
        const payload = {
          title: values.title || 'Campus Announcement',
          body: values.body || '',
          audience: values.audience || 'All institutions · Students',
          type: '',
          author: role.name || 'Management Office',
        };
        const res = await fetch('/api/notices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.notice) {
            setNotices((prev) => [data.notice, ...prev]);
          }
          showToast('Notice published successfully to campus notice board.');
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to save notice to database');
        }
      } catch (err: any) {
        console.error('Error publishing notice:', err);
        showToast(`Notice publication error: ${err.message}`);
      }
    } else if (type === 'complaint') {
      try {
        const payload = {
          title: values.title || 'Campus Issue',
          category: values.category || 'Classroom',
          priority: (values.priority as Complaint['priority']) || 'High',
          status: 'Submitted',
          scope: `${role.institution || 'PIT'} · ${role.department || 'General'}`,
          studentName: role.name || 'Staff Member',
          studentId: 'FACULTY',
          location: values.location || 'Department premises',
          description: values.description || values.title || 'Reported by staff',
        };
        const res = await fetch('/api/complaints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.complaint) {
            setComplaints((prev) => [data.complaint, ...prev]);
          }
          showToast(`Complaint ticket #${data.complaint?.id || ''} registered successfully.`);
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to register complaint');
        }
      } catch (err: any) {
        console.error('Error creating complaint:', err);
        showToast(`Complaint error: ${err.message}`);
      }
    } else if (type === 'maintenance') {
      const newMnt: MaintenanceItem = {
        id: `MNT-${209 + maintenance.length}`,
        title: values.title || 'Maintenance request',
        location: values.location || 'Campus',
        reported: 'Just now',
        team: values.team || 'Facilities',
        status: 'Open',
      };
      setMaintenance((prev) => [newMnt, ...prev]);
      showToast('Maintenance request logged.');
    } else if (type === 'event') {
      showToast('Event created.');
    } else if (type === 'record') {
      showToast('Official academic records entry saved.');
    }
    setActiveModal(null);
    await refreshData();
  };

  const pageSubtitles: Record<PageId, string> = {
    dashboard: 'A clear view of your institution. Decisions backed by data.',
    academics: 'Academic information is filtered to your permitted scope.',
    notices: 'Official announcements for your authorized audience.',
    complaints: "Monitor issues without exposing other departments' data.",
    hostel: 'Hostel and maintenance operations in your authorized scope.',
    events: 'Activities and opportunities across your permitted audience.',
    placement: 'Skills and career readiness insights.',
    assistant: 'Ask questions about the campus within your role permissions.',
  };

  const getScopeTitle = () => {
    if (currentRoleKey === 'warden') return 'Hostel & maintenance scope';
    return role.scopeTitle;
  };

  const getScopeText = () => {
    if (currentRoleKey === 'warden') {
      return 'You can update hostel and maintenance requests in the assigned hostel only.';
    }
    return role.scopeText;
  };

  const bannerBg = role.kind === 'central' ? '#FAF6F0' : '#F5EFE6';

  // Count active student's complaints
  const myComplaintsCount = complaints.filter(
    (c) => c.studentId === activeStudent.id || c.studentName === activeStudent.name
  ).length;

  return (
    <div className="app-shell">
      {/* 1. Dedicated College Photo Background Layer (30% visibility) */}
      <div
        className="campus-bg-layer"
        style={{
          backgroundImage: `url('${resolvedPhotoUrl}')`,
          opacity: 1 - overlayOpacity,
        }}
        aria-hidden="true"
      />

      {/* 2. 70% White Overlay Layer */}
      <div
        className="campus-overlay-layer"
        style={{ opacity: overlayOpacity }}
        aria-hidden="true"
      />

      {portalMode === 'management' ? (
        <Sidebar
          currentRole={currentRoleKey}
          onRoleChange={handleRoleChange}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          noticeCount={notices.length}
          onSwitchToStudent={handleTogglePortalMode}
        />
      ) : (
        <StudentSidebar
          currentStudent={activeStudent}
          allStudents={students}
          onSelectStudent={handleStudentChange}
          currentPage={studentCurrentPage}
          onNavigate={handleStudentNavigate}
          isOpen={sidebarOpen}
          onSwitchToManagement={handleTogglePortalMode}
          myComplaintsCount={myComplaintsCount}
        />
      )}

      <main className="main">
        <Topbar
          portalMode={portalMode}
          role={role}
          student={activeStudent}
          currentPage={portalMode === 'management' ? currentPage : studentCurrentPage}
          onToggleMenu={() => setSidebarOpen((prev) => !prev)}
          onNotificationClick={() => showToast('You are all caught up in this demo.')}
          onTogglePortalMode={handleTogglePortalMode}
          activePhotoId={activePhotoId}
          onSelectCampusPhoto={handleSelectCampusPhoto}
        />

        <div className="content">
          {/* MANAGEMENT PORTAL VIEW */}
          {portalMode === 'management' && (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">
                    {clock.formattedDateUpper} <span>•</span> {clock.formattedTime12} IST <span>•</span> INSTITUTIONAL OVERVIEW
                  </div>
                  <h1 id="pageTitle">
                    {currentPage === 'dashboard' ? (
                      <>
                        {clock.greeting}, {role.name.split(' · ')[0]} <span>✦</span>
                      </>
                    ) : (
                      currentPage.charAt(0).toUpperCase() + currentPage.slice(1)
                    )}
                  </h1>
                  <p id="pageSub">{pageSubtitles[currentPage]}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="outline-btn"
                    onClick={handleTogglePortalMode}
                    style={{ borderColor: 'var(--secondary-sage-green)', color: 'var(--primary-forest-green)', background: '#FAF7F2' }}
                  >
                    🎓 Open Student Portal
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    id="quickAction"
                    onClick={() => setActiveModal('notice')}
                  >
                    ＋ Create notice
                  </button>
                </div>
              </section>

              <div
                className="scope-banner"
                id="scopeBanner"
                style={{ background: bannerBg }}
              >
                <div className="scope-icon">◈</div>
                <div>
                  <strong id="scopeTitle">{getScopeTitle()}</strong>
                  <p id="scopeText">{getScopeText()}</p>
                </div>
                <span className="scope-badge">VIEW ACCESS</span>
              </div>

              {currentPage === 'dashboard' && (
                <DashboardPage
                  role={role}
                  complaints={complaints}
                  showInstitutions={showInstitutionsGrid}
                  onViewAllInstitutions={handleViewAllInstitutions}
                  onToast={showToast}
                  onNavigateToComplaints={handleNavigateToComplaints}
                />
              )}

              {currentPage === 'academics' && (
                <AcademicsPage
                  role={role}
                  students={students}
                  onOpenAddRecord={() => setActiveModal('record')}
                  onToast={showToast}
                />
              )}

              {currentPage === 'notices' && (
                <NoticesPage
                  role={role}
                  notices={notices}
                  onOpenNewNotice={() => setActiveModal('notice')}
                  onToast={showToast}
                />
              )}

              {currentPage === 'complaints' && (
                <ComplaintsPage
                  role={role}
                  complaints={complaints}
                  onOpenNewComplaint={() => setActiveModal('complaint')}
                  onCycleComplaint={handleCycleComplaint}
                  onManageComplaint={(c) => setManagingComplaint(c)}
                  initialPriorityFilter={complaintInitialFilter}
                />
              )}

              {currentPage === 'hostel' && (
                <HostelPage
                  role={role}
                  maintenance={maintenance}
                  onOpenNewMaintenance={() => setActiveModal('maintenance')}
                  onUpdateMaintenance={handleUpdateMaintenance}
                />
              )}

              {currentPage === 'events' && (
                <EventsPage
                  events={events}
                  onOpenNewEvent={() => setActiveModal('event')}
                  onToggleRegister={handleToggleRegister}
                />
              )}

              {currentPage === 'placement' && <PlacementPage onToast={showToast} />}

              {currentPage === 'assistant' && (
                <AssistantPage
                  role={role}
                  notices={notices}
                  complaints={complaints}
                  students={students}
                />
              )}
            </>
          )}

          {/* STUDENT PORTAL VIEW */}
          {portalMode === 'student' && (
            <>
              {studentCurrentPage === 'student-dashboard' && (
                <StudentDashboardPage
                  student={activeStudent}
                  complaints={complaints}
                  notices={notices}
                  onNavigate={handleStudentNavigate}
                  onToast={showToast}
                />
              )}

              {studentCurrentPage === 'student-raise' && (
                <RaiseComplaintPage
                  student={activeStudent}
                  onComplaintSubmitted={handleComplaintSubmitted}
                  onCancel={() => handleStudentNavigate('student-dashboard')}
                  onToast={showToast}
                />
              )}

              {studentCurrentPage === 'student-my-complaints' && (
                <MyComplaintsPage
                  student={activeStudent}
                  complaints={complaints}
                  onUpdateFeedback={handleUpdateFeedback}
                  onNavigate={handleStudentNavigate}
                  onToast={showToast}
                />
              )}

              {studentCurrentPage === 'student-notices' && (
                <StudentNoticesPage
                  student={activeStudent}
                  notices={notices}
                  onToast={showToast}
                />
              )}
            </>
          )}

          <footer>
            <div>
              © 2026 PGI SmartCampus · Prasad Group of Institutions, Jaunpur
              <span style={{ display: 'block', marginTop: '3px', color: 'var(--secondary-text)' }}>
                Campus View: <strong>{currentPhotoObj.name}</strong> ({currentPhotoObj.description}) · Photo visible at 30% through 70% white overlay
              </span>
            </div>
            <span>
              {realtimeConnected ? '⚡ Supabase Realtime Active' : '🔄 Polling Mode (20s)'} · {clock.formattedTime12} IST{lastUpdated ? ` (Data synced: ${lastUpdated})` : ''}
            </span>
          </footer>
        </div>
      </main>

      <Toast message={toastMessage} />

      {/* Creation Modal */}
      <Modal
        type={activeModal}
        onClose={() => setActiveModal(null)}
        onSubmit={handleModalSubmit}
      />

      {/* Management Complaint Review & Update Modal */}
      {managingComplaint && (
        <ManageComplaintModal
          complaint={managingComplaint}
          onClose={() => setManagingComplaint(null)}
          onSave={handleSaveManagedComplaint}
        />
      )}
    </div>
  );
};

export default App;
