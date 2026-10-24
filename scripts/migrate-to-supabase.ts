import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const DB_FILE = path.join(rootDir, 'pgi_db.json');

async function migrateData() {
  console.log('--- PGI SmartCampus Supabase Migration Tool ---');

  if (!fs.existsSync(DB_FILE)) {
    console.log('No local pgi_db.json found to migrate.');
    return;
  }

  // 1. Safe Backup of JSON File
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(rootDir, `pgi_db_backup_${timestamp}.json`);
  fs.copyFileSync(DB_FILE, backupFile);
  console.log(`[Backup Success] Local database backed up to: ${path.basename(backupFile)}`);

  const rawData = fs.readFileSync(DB_FILE, 'utf-8');
  const db = JSON.parse(rawData);

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    console.log('\n[Notice]: Supabase credentials (SUPABASE_URL / SUPABASE_KEY) are not configured in .env.');
    console.log('Migration backup is complete and saved. Configure .env when ready to push data to Supabase.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Connected to Supabase. Importing records...');

  // Import complaints
  if (db.complaints && db.complaints.length > 0) {
    for (const c of db.complaints) {
      const { error } = await supabase.from('complaints').upsert({
        ticket_id: c.id,
        title: c.title,
        category: c.category,
        priority: c.priority,
        status: c.status,
        scope: c.scope,
        student_name: c.studentName,
        student_class: c.studentClass,
        student_dept: c.studentDept,
        student_inst: c.studentInst,
        description: c.description,
        location: c.location,
        photo_url: c.photoUrl,
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
        staff_confirmed_priority: c.staffConfirmedPriority
      }, { onConflict: 'ticket_id' });

      if (error) {
        console.error(`Error importing complaint ${c.id}:`, error.message);
      } else {
        console.log(`Successfully imported complaint: ${c.id}`);
      }
    }
  }

  // Import notices
  if (db.notices && db.notices.length > 0) {
    for (const n of db.notices) {
      await supabase.from('notices').upsert({
        title: n.title,
        body: n.body,
        audience: n.audience,
        type: n.type,
        author: n.author
      }, { onConflict: 'id' });
    }
    console.log('Notices import completed.');
  }

  console.log('\nMigration process completed successfully.');
}

migrateData().catch(err => {
  console.error('Migration failed:', err);
});
