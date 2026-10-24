-- ============================================================================
-- PGI SmartCampus Database Schema Migration for Supabase PostgreSQL
-- ============================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. User Profiles Table (Linked to Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null default 'Student', -- Student, Chairman, Registrar, CMO, Director, Principal, Exam Cell, HOD, Coordinator, Warden, Admin
  institution text default 'PIT', -- PIT, PIT Pharmacy, PPJ, PPJ Pharmacy
  department text default 'CSE',
  class_name text default 'B.Tech CSE 3rd Year',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Complaints Table
create table if not exists public.complaints (
  id uuid default uuid_generate_v4() primary key,
  ticket_id text unique not null, -- e.g., TKT-8841 or PGI-EMG-1021
  title text not null,
  category text not null, -- Electrical, Water, Wi-Fi, Classroom, Hostel, Sanitation, Other
  priority text not null default 'Medium', -- Critical, High, Medium, Low
  status text not null default 'Submitted', -- Submitted, Assigned, In Progress, Resolved, Closed
  scope text default 'PIT · Maintenance',
  student_id uuid references public.profiles(id) on delete set null,
  student_name text not null,
  student_class text,
  student_dept text,
  student_inst text,
  description text not null,
  location text not null,
  photo_url text,
  assigned_to text default 'Unassigned',
  management_remarks text default 'Awaiting review by maintenance desk.',
  internal_notes text, -- Staff-only notes (students must not see this)
  safety_risk boolean default false,
  essential_service_disrupted boolean default false,
  people_affected text default 'Room / Class',
  auto_assessed_priority text default 'Medium',
  assessment_reason text,
  assessment_method text default 'Rule-based Risk Engine',
  deadline_hours integer default 24,
  is_overdue boolean default false,
  staff_confirmed_priority boolean default false,
  feedback_rating integer,
  feedback_comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Complaint Status History / Audit Trail
create table if not exists public.complaint_status_history (
  id uuid default uuid_generate_v4() primary key,
  complaint_id uuid references public.complaints(id) on delete cascade not null,
  status text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  remarks text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Notices Table
create table if not exists public.notices (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  body text not null,
  audience text default 'All institutions',
  type text default '',
  author text default 'Management Office',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Notifications Table
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Audit Logs Table
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_complaints_student_id on public.complaints(student_id);
create index if not exists idx_complaints_priority on public.complaints(priority);
create index if not exists idx_complaints_status on public.complaints(status);
create index if not exists idx_complaints_ticket_id on public.complaints(ticket_id);
create index if not exists idx_status_history_complaint_id on public.complaint_status_history(complaint_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_status_history enable row level security;
alter table public.notices enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles Policies
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Complaints Policies
-- Students can view only their own complaints. Staff can view all complaints.
drop policy if exists "Students view own complaints or staff view all" on public.complaints;
create policy "Students view own complaints or staff view all" on public.complaints
  for select using (
    auth.uid() = student_id 
    or 
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('Chairman', 'Registrar', 'CMO', 'Director', 'Principal', 'Exam Cell', 'HOD', 'Coordinator', 'Warden', 'Admin')
    )
  );

-- Students can insert their own complaints
drop policy if exists "Students can insert complaints" on public.complaints;
create policy "Students can insert complaints" on public.complaints
  for insert withCheck (auth.uid() = student_id);

-- Staff can update complaints (assignment, status, remarks, internal notes)
drop policy if exists "Staff can update complaints" on public.complaints;
create policy "Staff can update complaints" on public.complaints
  for update using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('Chairman', 'Registrar', 'CMO', 'Director', 'Principal', 'Exam Cell', 'HOD', 'Coordinator', 'Warden', 'Admin')
    )
  );

-- Notices Policies (Everyone can read, staff can insert)
drop policy if exists "Notices are viewable by everyone" on public.notices;
create policy "Notices are viewable by everyone" on public.notices for select using (true);

drop policy if exists "Staff can create notices" on public.notices;
create policy "Staff can create notices" on public.notices
  for insert withCheck (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('Chairman', 'Registrar', 'CMO', 'Director', 'Principal', 'Exam Cell', 'HOD', 'Coordinator', 'Warden', 'Admin')
    )
  );

-- Notifications Policies
drop policy if exists "Users view own notifications" on public.notifications;
create policy "Users view own notifications" on public.notifications for select using (auth.uid() = user_id);
