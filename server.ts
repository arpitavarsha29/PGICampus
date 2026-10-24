import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini AI client if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const useSupabase = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project'));

const supabase = useSupabase ? createClient(supabaseUrl, supabaseKey) : null;

if (useSupabase) {
  console.log('[PGI SmartCampus Backend] Connected to Supabase PostgreSQL database.');
} else {
  console.log('[PGI SmartCampus Backend] Supabase credentials not found. Operating with local persistent JSON database.');
}

// Persistent DB File Path (Fallback / Local Dev store)
const DB_FILE = path.join(__dirname, 'pgi_db.json');

const initialDatabaseState = {
  notices: [
    {
      id: '1',
      title: 'End-semester examination form deadline',
      body: 'Students must complete the examination form and fee submission before the published deadline. Contact the Exam Cell for support.',
      audience: 'PIT · B.Tech 3rd Year',
      type: 'gold',
      date: 'Today · 10:42 AM',
      author: 'Examination Cell',
    },
    {
      id: '2',
      title: 'Campus innovation showcase registrations',
      body: 'Project teams can register for the upcoming innovation showcase. Submit a project summary and team details.',
      audience: 'All institutions · Students',
      type: '',
      date: 'Yesterday · 04:15 PM',
      author: 'Student Activities',
    },
    {
      id: '3',
      title: 'Hostel maintenance schedule',
      body: 'Routine electrical and plumbing maintenance will be carried out this weekend. Report urgent issues through SmartCampus.',
      audience: 'PIT · Hostel residents',
      type: 'green',
      date: '20 Oct · 01:20 PM',
      author: 'Chief Warden',
    },
  ],
  complaints: [
    {
      id: 'TKT-8841',
      title: 'Exposed live electrical wires near Lecture Hall 4',
      category: 'Electrical',
      priority: 'Critical',
      status: 'In Progress',
      scope: 'PIT · Campus Maintenance',
      studentId: 'PGI24031',
      studentName: 'Aman Verma',
      studentClass: 'B.Tech CSE 3rd Year',
      studentDept: 'CSE',
      studentInst: 'PIT',
      description: 'Loose electrical wiring sparking near corridor ceiling after morning rain. Immediate safety hazard for students.',
      location: 'Block A, 2nd Floor, Near LH-4',
      dateSubmitted: '2026-10-23T08:30:00Z',
      assignedTo: 'Mr. R. K. Sharma (Electrical Team)',
      managementRemarks: 'Electrician dispatched immediately. Power isolated as of 9:00 AM.',
      safetyRisk: true,
      essentialServiceDisrupted: false,
      peopleAffected: 'Campus-wide',
      autoAssessedPriority: 'Critical',
      assessmentReason: 'Immediate danger from live sparks in public academic corridor.',
      assessmentMethod: 'Rule-based Risk Engine',
      deadlineHours: 4,
      isOverdue: false,
      staffConfirmedPriority: true,
    },
    {
      id: 'TKT-8842',
      title: 'Major water pipeline leakage in Boys Hostel Block 2',
      category: 'Water',
      priority: 'High',
      status: 'Assigned',
      scope: 'PIT · Hostel Maintenance',
      studentId: 'PGI24032',
      studentName: 'Rahul Singh',
      studentClass: 'B.Tech ECE 2nd Year',
      studentDept: 'ECE',
      studentInst: 'PIT',
      description: 'Main supply pipe leaking heavily on the ground floor washroom area, water flooding corridor.',
      location: 'Boys Hostel Block 2, Ground Floor',
      dateSubmitted: '2026-10-23T07:15:00Z',
      assignedTo: 'Plumbing Maintenance Dept',
      managementRemarks: 'Valve closed temporarily. Plumber team assigned.',
      safetyRisk: false,
      essentialServiceDisrupted: true,
      peopleAffected: 'Wing / Floor',
      autoAssessedPriority: 'High',
      assessmentReason: 'Essential service disruption and flooding in residential hostel.',
      assessmentMethod: 'Rule-based Risk Engine',
      deadlineHours: 12,
      isOverdue: false,
      staffConfirmedPriority: true,
    },
    {
      id: 'TKT-8843',
      title: 'Intermittent Wi-Fi connectivity in Computer Lab 3',
      category: 'Wi-Fi',
      priority: 'Medium',
      status: 'Submitted',
      scope: 'PIT · IT Support',
      studentId: 'PGI24033',
      studentName: 'Priya Mishra',
      studentClass: 'B.Tech CSE 3rd Year',
      studentDept: 'CSE',
      studentInst: 'PIT',
      description: 'Wi-Fi router frequently disconnects during practical coding sessions.',
      location: 'Computer Lab 3, IT Block',
      dateSubmitted: '2026-10-22T14:20:00Z',
      assignedTo: 'IT Networking Cell',
      managementRemarks: 'Queued for network switch reboot.',
      safetyRisk: false,
      essentialServiceDisrupted: false,
      peopleAffected: 'Room / Class',
      autoAssessedPriority: 'Medium',
      assessmentReason: 'Academic equipment / network fault affecting practical learning.',
      assessmentMethod: 'Rule-based Risk Engine',
      deadlineHours: 24,
      isOverdue: false,
      staffConfirmedPriority: false,
    },
    {
      id: 'TKT-8844',
      title: 'Library reading room lighting repair',
      category: 'Classroom',
      priority: 'Low',
      status: 'Resolved',
      scope: 'PIT · Maintenance',
      studentId: 'PGI24035',
      studentName: 'Neha Gupta',
      studentClass: 'B.Pharm 3rd Year',
      studentDept: 'Pharmacy',
      studentInst: 'PIT Pharmacy',
      description: 'One tube light fixture flickering near reading desk 12.',
      location: 'Central Library, First Floor',
      dateSubmitted: '2026-10-21T11:00:00Z',
      assignedTo: 'Electrician Team B',
      managementRemarks: 'Tube light ballast replaced successfully.',
      feedbackRating: 5,
      feedbackComment: 'Resolved quickly after reporting.',
      safetyRisk: false,
      essentialServiceDisrupted: false,
      peopleAffected: 'Individual',
      autoAssessedPriority: 'Low',
      assessmentReason: 'Minor localized fixture repair.',
      assessmentMethod: 'Rule-based Risk Engine',
      deadlineHours: 48,
      isOverdue: false,
      staffConfirmedPriority: true,
    }
  ],
  maintenance: [
    { id: 'M-101', title: 'Electrical Panel Maintenance', location: 'PIT Block A', reported: '2026-10-22', team: 'Electricians', status: 'In progress' },
    { id: 'M-102', title: 'Water Pump Servicing', location: 'Hostel Complex', reported: '2026-10-21', team: 'Plumbing', status: 'Resolved' },
    { id: 'M-103', title: 'Wi-Fi Access Point Upgrade', location: 'Library Hall', reported: '2026-10-23', team: 'IT Networking', status: 'Open' }
  ],
  students: [
    { name: 'Aman Verma', id: 'PGI24031', class: 'B.Tech CSE 3rd Year', attendance: 92, score: 8.8, dept: 'CSE', inst: 'PIT' },
    { name: 'Rahul Singh', id: 'PGI24032', class: 'B.Tech ECE 2nd Year', attendance: 88, score: 8.2, dept: 'ECE', inst: 'PIT' },
    { name: 'Priya Mishra', id: 'PGI24033', class: 'B.Tech CSE 3rd Year', attendance: 95, score: 9.1, dept: 'CSE', inst: 'PIT' },
    { name: 'Amit Kumar', id: 'PGI24034', class: 'B.Tech ME Final Year', attendance: 84, score: 7.9, dept: 'ME', inst: 'PIT' },
    { name: 'Neha Gupta', id: 'PGI24035', class: 'B.Pharm 3rd Year', attendance: 90, score: 8.6, dept: 'Pharmacy', inst: 'PIT Pharmacy' }
  ],
  events: [
    { id: 'EV-1', day: '28', month: 'OCT', typeTag: 'TECHNICAL', title: 'PGI Annual CodeFest 2026', description: '24-hour coding hackathon with industry mentors from top tech companies.', timeLocation: '09:00 AM · CSE Auditorium', registered: false },
    { id: 'EV-2', day: '05', month: 'NOV', typeTag: 'SPORTS', title: 'Inter-College Cricket Championship', description: 'Annual T20 cricket tournament featuring teams from PIT, PPJ, and regional institutes.', timeLocation: '10:30 AM · Main Sports Ground', registered: true },
    { id: 'EV-3', day: '12', month: 'NOV', typeTag: 'SEMINAR', title: 'AI & Future of Engineering Careers', description: 'Expert guest lecture on emerging tech trends, AI tooling, and campus placements.', timeLocation: '02:00 PM · Central Auditorium', registered: false }
  ]
};

function getDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading DB, resetting to default:', e);
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(initialDatabaseState, null, 2), 'utf-8');
  return initialDatabaseState;
}

function saveDb(db: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function formatNoticeDate(createdAt: string | Date | undefined): string {
  if (!createdAt) return 'Recent';
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return String(createdAt);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  if (isToday) return `Today · ${timeStr}`;
  const dateStr = d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
  });
  return `${dateStr} · ${timeStr}`;
}

const isUuid = (str: any) => Boolean(str && typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

const getStudentIdFromRecord = (c: any) => {
  if (c.internal_notes && typeof c.internal_notes === 'string' && c.internal_notes.includes('STUDENT_ID:')) {
    const match = c.internal_notes.match(/STUDENT_ID:([^\s,;]+)/);
    if (match) return match[1];
  }
  if (c.student_id) return c.student_id;
  if (c.studentId) return c.studentId;
  if (c.student_name === 'Aman Verma') return 'PGI24031';
  if (c.student_name === 'Rahul Singh') return 'PGI24032';
  if (c.student_name === 'Priya Mishra') return 'PGI24033';
  if (c.student_name === 'Amit Kumar') return 'PGI24034';
  if (c.student_name === 'Neha Gupta') return 'PGI24035';
  return 'PGI24031';
};

async function seedBaselineDataToSupabase() {
  if (!useSupabase || !supabase) return;
  try {
    for (const c of initialDatabaseState.complaints) {
      const { data: existing } = await supabase
        .from('complaints')
        .select('ticket_id')
        .eq('ticket_id', c.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from('complaints').insert({
          ticket_id: c.id,
          title: c.title,
          category: c.category,
          priority: c.priority,
          status: c.status,
          scope: c.scope,
          student_id: isUuid(c.studentId) ? c.studentId : null,
          student_name: c.studentName,
          student_class: c.studentClass,
          student_dept: c.studentDept,
          student_inst: c.studentInst,
          internal_notes: `STUDENT_ID:${c.studentId}`,
          description: c.description,
          location: c.location,
          assigned_to: c.assignedTo,
          management_remarks: c.managementRemarks,
          safety_risk: c.safetyRisk,
          essential_service_disrupted: c.essentialServiceDisrupted,
          people_affected: c.peopleAffected,
          auto_assessed_priority: c.autoAssessedPriority,
          assessment_reason: c.assessmentReason,
          assessment_method: c.assessmentMethod,
          deadline_hours: c.deadlineHours,
          is_overdue: c.isOverdue,
          staff_confirmed_priority: c.staffConfirmedPriority,
        });
      }
    }

    for (const n of initialDatabaseState.notices) {
      const { data: existing } = await supabase
        .from('notices')
        .select('id')
        .eq('title', n.title)
        .maybeSingle();

      if (!existing) {
        await supabase.from('notices').insert({
          title: n.title,
          body: n.body,
          audience: n.audience,
          type: n.type,
          author: n.author,
        });
      }
    }
    console.log('[PGI SmartCampus] Baseline complaints and notices verified in Supabase.');
  } catch (err: any) {
    console.error('[PGI SmartCampus] Error verifying baseline in Supabase:', err.message);
  }
}

if (useSupabase) {
  seedBaselineDataToSupabase();
}

// API Routes
app.get('/api/health', async (req, res) => {
  let dbStatus = 'local_json';
  if (useSupabase && supabase) {
    try {
      const { error } = await supabase.from('complaints').select('id', { count: 'exact', head: true });
      dbStatus = error ? 'supabase_error' : 'supabase_connected';
    } catch {
      dbStatus = 'supabase_error';
    }
  }
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    campus: 'Prasad Group of Institutions, Jaunpur',
    database: dbStatus
  });
});

app.get('/api/data', async (req, res) => {
  const db = getDb();
  if (useSupabase && supabase) {
    try {
      const [complaintsRes, noticesRes] = await Promise.all([
        supabase.from('complaints').select('*').order('created_at', { ascending: false }),
        supabase.from('notices').select('*').order('created_at', { ascending: false })
      ]);

      let complaints = db.complaints;
      if (complaintsRes.data && complaintsRes.data.length > 0) {
        complaints = complaintsRes.data.map((c: any) => ({
          id: c.ticket_id || c.id,
          title: c.title,
          category: c.category,
          priority: c.priority,
          status: c.status,
          scope: c.scope,
          studentId: getStudentIdFromRecord(c),
          studentName: c.student_name || c.studentName || 'Student',
          studentClass: c.student_class || c.studentClass || 'B.Tech CSE',
          studentDept: c.student_dept || c.studentDept || 'CSE',
          studentInst: c.student_inst || c.studentInst || 'PIT',
          description: c.description || '',
          location: c.location || 'Campus',
          photoUrl: c.photo_url || '',
          dateSubmitted: c.created_at,
          assignedTo: c.assigned_to || 'Unassigned',
          managementRemarks: c.management_remarks || '',
          safetyRisk: Boolean(c.safety_risk),
          essentialServiceDisrupted: Boolean(c.essential_service_disrupted),
          peopleAffected: c.people_affected || 'Room / Class',
          autoAssessedPriority: c.auto_assessed_priority || c.priority,
          assessmentReason: c.assessment_reason || '',
          assessmentMethod: c.assessment_method || 'Rule-based Risk Engine',
          deadlineHours: c.deadline_hours || 24,
          isOverdue: Boolean(c.is_overdue),
          staffConfirmedPriority: Boolean(c.staff_confirmed_priority),
          feedbackRating: c.feedback_rating,
          feedbackComment: c.feedback_comment
        }));
      } else if (complaintsRes.data && complaintsRes.data.length === 0) {
        seedBaselineDataToSupabase();
      }

      let notices = db.notices;
      if (noticesRes.data && noticesRes.data.length > 0) {
        notices = noticesRes.data.map((n: any) => ({
          id: String(n.id),
          title: n.title,
          body: n.body,
          audience: n.audience,
          type: n.type || '',
          date: formatNoticeDate(n.created_at),
          author: n.author
        }));
      } else if (noticesRes.data && noticesRes.data.length === 0) {
        seedBaselineDataToSupabase();
      }

      return res.json({
        ...db,
        complaints,
        notices
      });
    } catch (err: any) {
      console.error('Supabase fetch error on /api/data:', err.message);
      // Fallback to local db if Supabase query fails
    }
  }

  res.json(db);
});

// Complaints CRUD & Management
app.get('/api/complaints', async (req, res) => {
  const db = getDb();
  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const formatted = data.map((c: any) => ({
          id: c.ticket_id || c.id,
          title: c.title,
          category: c.category,
          priority: c.priority,
          status: c.status,
          scope: c.scope,
          studentId: getStudentIdFromRecord(c),
          studentName: c.student_name || c.studentName || 'Student',
          studentClass: c.student_class || c.studentClass || 'B.Tech CSE',
          studentDept: c.student_dept || c.studentDept || 'CSE',
          studentInst: c.student_inst || c.studentInst || 'PIT',
          description: c.description || '',
          location: c.location || 'Campus',
          photoUrl: c.photo_url || '',
          dateSubmitted: c.created_at,
          assignedTo: c.assigned_to || 'Unassigned',
          managementRemarks: c.management_remarks || '',
          safetyRisk: Boolean(c.safety_risk),
          essentialServiceDisrupted: Boolean(c.essential_service_disrupted),
          peopleAffected: c.people_affected || 'Room / Class',
          autoAssessedPriority: c.auto_assessed_priority || c.priority,
          assessmentReason: c.assessment_reason || '',
          assessmentMethod: c.assessment_method || 'Rule-based Risk Engine',
          deadlineHours: c.deadline_hours || 24,
          isOverdue: Boolean(c.is_overdue),
          staffConfirmedPriority: Boolean(c.staff_confirmed_priority),
          feedbackRating: c.feedback_rating,
          feedbackComment: c.feedback_comment
        }));
        return res.json(formatted);
      }
    } catch (err: any) {
      console.error('Supabase error on GET /api/complaints:', err.message);
    }
  }

  res.json(db.complaints);
});

app.post('/api/complaints', async (req, res) => {
  const body = req.body;
  
  let priority = body.priority || 'Medium';
  let autoAssessedPriority = 'Medium';
  let assessmentReason = 'Standard priority based on category and description.';
  const desc = (body.description || '').toLowerCase();
  const category = body.category || 'Other';
  const safetyRisk = body.safetyRisk || desc.includes('fire') || desc.includes('spark') || desc.includes('electric') || desc.includes('live wire') || desc.includes('danger') || desc.includes('smoke');
  const essentialServiceDisrupted = body.essentialServiceDisrupted || desc.includes('flood') || desc.includes('pipeline') || desc.includes('water leak') || desc.includes('power outage');

  if (safetyRisk) {
    autoAssessedPriority = 'Critical';
    priority = 'Critical';
    assessmentReason = 'Immediate safety hazard detected (fire, electrical sparks, or live wires).';
  } else if (essentialServiceDisrupted || category === 'Electrical' || category === 'Water') {
    autoAssessedPriority = 'High';
    priority = 'High';
    assessmentReason = 'Essential campus utility disruption (water/electrical service failure).';
  } else if (category === 'Wi-Fi' || category === 'Classroom' || category === 'Hostel') {
    autoAssessedPriority = 'Medium';
    priority = 'Medium';
    assessmentReason = 'Facility or service fault affecting normal academic work.';
  } else {
    autoAssessedPriority = 'Low';
    priority = 'Low';
    assessmentReason = 'Minor repair or non-urgent request.';
  }

  const newId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  const deadlineHours = priority === 'Critical' ? 4 : priority === 'High' ? 12 : priority === 'Medium' ? 24 : 48;

  const newComplaint = {
    id: newId,
    title: body.title || 'Untitled Complaint',
    category,
    priority,
    status: 'Submitted',
    scope: body.studentInst ? `${body.studentInst} · Maintenance` : (body.scope || 'PIT · Maintenance'),
    studentId: body.studentId || 'PGI24031',
    studentName: body.studentName || 'Student',
    studentClass: body.studentClass || 'B.Tech CSE',
    studentDept: body.studentDept || 'CSE',
    studentInst: body.studentInst || 'PIT',
    description: body.description || '',
    location: body.location || 'Campus',
    photoUrl: body.photoUrl || '',
    dateSubmitted: new Date().toISOString(),
    assignedTo: 'Unassigned',
    managementRemarks: 'Awaiting review by maintenance desk.',
    safetyRisk: Boolean(safetyRisk),
    essentialServiceDisrupted: Boolean(essentialServiceDisrupted),
    peopleAffected: body.peopleAffected || 'Room / Class',
    autoAssessedPriority,
    assessmentReason,
    assessmentMethod: 'Rule-based Risk Engine',
    deadlineHours,
    isOverdue: false,
    staffConfirmedPriority: false
  };

  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase.from('complaints').insert({
        ticket_id: newComplaint.id,
        title: newComplaint.title,
        category: newComplaint.category,
        priority: newComplaint.priority,
        status: newComplaint.status,
        scope: newComplaint.scope,
        student_id: isUuid(newComplaint.studentId) ? newComplaint.studentId : null,
        student_name: newComplaint.studentName,
        student_class: newComplaint.studentClass,
        student_dept: newComplaint.studentDept,
        student_inst: newComplaint.studentInst,
        internal_notes: `STUDENT_ID:${newComplaint.studentId}`,
        description: newComplaint.description,
        location: newComplaint.location,
        photo_url: newComplaint.photoUrl,
        assigned_to: newComplaint.assignedTo,
        management_remarks: newComplaint.managementRemarks,
        safety_risk: newComplaint.safetyRisk,
        essential_service_disrupted: newComplaint.essentialServiceDisrupted,
        people_affected: newComplaint.peopleAffected,
        auto_assessed_priority: newComplaint.autoAssessedPriority,
        assessment_reason: newComplaint.assessmentReason,
        assessment_method: newComplaint.assessmentMethod,
        deadline_hours: newComplaint.deadlineHours,
        is_overdue: newComplaint.isOverdue,
        staff_confirmed_priority: newComplaint.staffConfirmedPriority
      }).select().single();

      if (error) {
        console.error('Supabase error on POST /api/complaints:', error.message);
        return res.status(500).json({ success: false, error: error.message });
      }

      if (data) {
        newComplaint.id = data.ticket_id || data.id || newComplaint.id;
        newComplaint.dateSubmitted = data.created_at || newComplaint.dateSubmitted;
      }

      // Also persist to local cache for resilient operation
      const db = getDb();
      db.complaints.unshift(newComplaint);
      saveDb(db);

      return res.json({ success: true, complaint: newComplaint });
    } catch (err: any) {
      console.error('Supabase exception on POST /api/complaints:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  const db = getDb();
  db.complaints.unshift(newComplaint);
  saveDb(db);
  res.json({ success: true, complaint: newComplaint });
});

app.patch('/api/complaints/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  if (useSupabase && supabase) {
    try {
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.assignedTo) dbUpdates.assigned_to = updates.assignedTo;
      if (updates.managementRemarks) dbUpdates.management_remarks = updates.managementRemarks;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.staffConfirmedPriority !== undefined) dbUpdates.staff_confirmed_priority = updates.staffConfirmedPriority;
      if (updates.feedbackRating) dbUpdates.feedback_rating = updates.feedbackRating;
      if (updates.feedbackComment) dbUpdates.feedback_comment = updates.feedbackComment;

      let { data, error } = await supabase
        .from('complaints')
        .update(dbUpdates)
        .eq('ticket_id', id)
        .select()
        .single();

      if (error) {
        const { data: dataId, error: errorId } = await supabase
          .from('complaints')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single();
        if (!errorId && dataId) {
          data = dataId;
          error = null;
        }
      }

      if (!error && data) {
        const updatedComplaint = {
          id: data.ticket_id || data.id,
          title: data.title,
          category: data.category,
          priority: data.priority,
          status: data.status,
          scope: data.scope,
          studentId: getStudentIdFromRecord(data),
          studentName: data.student_name,
          studentClass: data.student_class,
          studentDept: data.student_dept,
          studentInst: data.student_inst,
          description: data.description,
          location: data.location,
          photoUrl: data.photo_url,
          dateSubmitted: data.created_at,
          assignedTo: data.assigned_to,
          managementRemarks: data.management_remarks,
          safetyRisk: Boolean(data.safety_risk),
          essentialServiceDisrupted: Boolean(data.essential_service_disrupted),
          peopleAffected: data.people_affected,
          autoAssessedPriority: data.auto_assessed_priority,
          assessmentReason: data.assessment_reason,
          assessmentMethod: data.assessment_method,
          deadlineHours: data.deadline_hours,
          isOverdue: Boolean(data.is_overdue),
          staffConfirmedPriority: Boolean(data.staff_confirmed_priority),
          feedbackRating: data.feedback_rating,
          feedbackComment: data.feedback_comment
        };

        const db = getDb();
        const idx = db.complaints.findIndex((c: any) => c.id === id);
        if (idx !== -1) {
          db.complaints[idx] = { ...db.complaints[idx], ...updates };
          saveDb(db);
        }

        return res.json({ success: true, complaint: updatedComplaint });
      } else if (error) {
        console.error('Supabase patch error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
      }
    } catch (err: any) {
      console.error('Supabase error on PATCH /api/complaints/:id:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  const db = getDb();
  const idx = db.complaints.findIndex((c: any) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Complaint ticket not found' });
  }

  db.complaints[idx] = {
    ...db.complaints[idx],
    ...updates
  };

  saveDb(db);
  res.json({ success: true, complaint: db.complaints[idx] });
});

// Notices CRUD
app.post('/api/notices', async (req, res) => {
  const body = req.body;
  const newNotice = {
    id: String(Date.now()),
    title: body.title || 'New Campus Notice',
    body: body.body || '',
    audience: body.audience || 'All institutions · Students',
    type: body.type || '',
    date: 'Today · ' + new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    author: body.author || 'Management Office'
  };

  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase.from('notices').insert({
        title: newNotice.title,
        body: newNotice.body,
        audience: newNotice.audience,
        type: newNotice.type,
        author: newNotice.author
      }).select().single();

      if (error) {
        console.error('Supabase error on POST /api/notices:', error.message);
        return res.status(500).json({ success: false, error: error.message });
      }

      if (data) {
        newNotice.id = String(data.id);
        newNotice.date = formatNoticeDate(data.created_at);
      }

      const db = getDb();
      db.notices.unshift(newNotice);
      saveDb(db);
      return res.json({ success: true, notice: newNotice });
    } catch (err: any) {
      console.error('Supabase error on POST /api/notices:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  const db = getDb();
  db.notices.unshift(newNotice);
  saveDb(db);
  res.json({ success: true, notice: newNotice });
});


// Workspace Members Endpoint for Admin User Management
app.get('/api/members', async (req, res) => {
  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const members = data.map((p: any) => ({
          id: p.id,
          fullName: p.full_name || 'User',
          email: p.email || `${p.full_name ? p.full_name.toLowerCase().replace(/\s+/g, '.') : 'user'}@pgi.edu.in`,
          role: p.role || 'Student',
          department: p.department || 'CSE',
          institution: p.institution || 'PIT',
          status: 'Active',
          registrationDate: p.created_at ? new Date(p.created_at).toLocaleDateString() : '2026-10-01',
          lastLogin: 'Recent'
        }));
        return res.json(members);
      }
    } catch (err: any) {
      console.error('Error fetching members from Supabase:', err.message);
    }
  }

  const db = getDb();
  const members = (db.students || []).map((s: any) => ({
    id: s.id,
    fullName: s.name,
    email: `${s.name.toLowerCase().replace(/\s+/g, '.')}@pgi.edu.in`,
    role: 'Student',
    department: s.dept || 'CSE',
    institution: s.inst || 'PIT',
    status: 'Active',
    registrationDate: '2026-08-15',
    lastLogin: 'Today, 10:30 AM'
  }));
  res.json(members);
});

// Real Educational News Provider Endpoint
app.get('/api/news', async (req, res) => {
  const newsItems = [
    {
      id: 'n-1',
      title: 'National Education Policy (NEP) Implementation Update for Higher Education Institutions',
      summary: 'University Grants Commission (UGC) issues guidelines for multidisciplinary undergraduate curriculum and credit transfer frameworks across Indian campuses.',
      source: 'UGC Official News',
      time: 'Today · 09:30 AM',
      url: 'https://www.ugc.ac.in',
      category: 'Government Announcements'
    },
    {
      id: 'n-2',
      title: 'AI & Emerging Tech Integration in Engineering Curricula',
      summary: 'All India Council for Technical Education (AICTE) emphasizes practical AI labs and cloud tooling for undergraduate technical students.',
      source: 'AICTE Press Bureau',
      time: 'Yesterday · 03:15 PM',
      url: 'https://www.aicte-india.org',
      category: 'Technology and AI'
    },
    {
      id: 'n-3',
      title: 'Uttar Pradesh State Higher Education Scholarship Portal Open for 2026-27',
      summary: 'Eligible students across Jaunpur and affiliated colleges can submit scholarship and fee reimbursement applications before the closing date.',
      source: 'UP Scholarship Govt Portal',
      time: '22 Oct · 11:00 AM',
      url: 'https://scholarship.up.gov.in',
      category: 'Higher Education'
    },
    {
      id: 'n-4',
      title: 'National Campus Innovation & Startup Hackathon 2026 Announced',
      summary: 'Ministry of Education invites tech project proposals from engineering institutions to solve real-world civic and agricultural challenges.',
      source: 'Ministry of Education India',
      time: '21 Oct · 02:45 PM',
      url: 'https://www.education.gov.in',
      category: 'Education'
    }
  ];
  res.json(newsItems);
});

// Gemini AI Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!geminiApiKey) {
      return res.json({
        reply: `[PGI Campus AI Notice]: Gemini API key is not configured on this server environment. Please configure GEMINI_API_KEY.`
      });
    }

    const chatModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const systemInstruction = `You are PGI Campus AI, the official intelligent assistant for Prasad Group of Institutions (PGI), Jaunpur.`;

    const chat = ai.chats.create({
      model: chatModel,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const response = await chat.sendMessage({ message });
    const replyText = response.text || 'I am sorry, I could not generate a response at this moment.';

    res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Gemini AI API Error:', error);
    res.status(500).json({
      reply: `[PGI Campus AI Error]: Unable to reach Gemini AI service at the moment (${error.message || 'API error'}).`
    });
  }
});

// Vite Middleware Integration for Development
async function startServer() {
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`PGI SmartCampus server running on http://localhost:${PORT}`);
  });
}

startServer();
