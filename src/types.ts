export type RoleKey =
  | 'chairman'
  | 'registrar'
  | 'cmo'
  | 'director'
  | 'principal'
  | 'exam'
  | 'hod'
  | 'coordinator'
  | 'warden';

export interface Role {
  name: string;
  scope: string;
  scopeTitle: string;
  scopeText: string;
  avatar: string;
  kind: 'central' | 'institution' | 'exam' | 'department' | 'class' | 'hostel';
  institution?: string;
  department?: string;
  edit: boolean;
}

export type PortalMode = 'management' | 'student';

export type PageId =
  | 'dashboard'
  | 'academics'
  | 'notices'
  | 'complaints'
  | 'hostel'
  | 'events'
  | 'placement'
  | 'assistant';

export type StudentPageId =
  | 'student-dashboard'
  | 'student-raise'
  | 'student-my-complaints'
  | 'student-notices';

export interface Notice {
  id: number | string;
  title: string;
  body: string;
  audience: string;
  type: string; // 'gold' | 'green' | ''
  date: string;
  author: string;
}

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type ComplaintStatus = 'Submitted' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed' | 'Open';

export type PeopleAffected = 'Individual' | 'Room / Class' | 'Wing / Floor' | 'Campus-wide';

export type ComplaintCategory =
  | 'Classroom'
  | 'Electrical'
  | 'Water'
  | 'Washroom'
  | 'Hostel'
  | 'Wi-Fi'
  | 'Transport'
  | 'Academic'
  | 'Faculty'
  | 'Other'
  | 'Infrastructure'
  | 'IT Support'
  | 'Maintenance';

export interface Complaint {
  id: string;
  title: string;
  category: ComplaintCategory | string;
  priority: Priority;
  status: ComplaintStatus;
  scope: string;
  // Student Portal linked metadata
  studentId?: string;
  studentName?: string;
  studentClass?: string;
  studentDept?: string;
  studentInst?: string;
  description?: string;
  location?: string;
  photoUrl?: string;
  dateSubmitted?: string;
  assignedTo?: string;
  managementRemarks?: string;
  feedbackRating?: number; // 1-5
  feedbackComment?: string;
  feedbackDate?: string;
  // Urgency & Emergency Risk Assessment
  autoAssessedPriority?: Priority;
  assessmentReason?: string;
  assessmentMethod?: 'Rule-based Risk Engine';
  safetyRisk?: boolean;
  essentialServiceDisrupted?: boolean;
  peopleAffected?: PeopleAffected;
  deadlineHours?: number; // Target SLA in hours (e.g. 4 for Critical, 24 for High)
  deadlineTimestamp?: string; // Target completion time
  isOverdue?: boolean; // Calculated or simulated overdue state
  staffConfirmedPriority?: boolean; // Whether staff reviewed/confirmed priority
  closedDate?: string;
}

export interface MaintenanceItem {
  id: string;
  title: string;
  location: string;
  reported: string;
  team: string;
  status: 'Open' | 'In progress' | 'Resolved';
}

export interface Student {
  name: string;
  id: string;
  class: string;
  attendance: number;
  score: number;
  dept: string;
  inst: string;
  avatar?: string;
}

export interface CampusEvent {
  id: string;
  day: string;
  month: string;
  badgeClass?: string;
  typeTag: string;
  typeTagClass?: string;
  title: string;
  description: string;
  timeLocation: string;
  registered?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

export type ModalType = 'notice' | 'complaint' | 'maintenance' | 'event' | 'record' | null;
