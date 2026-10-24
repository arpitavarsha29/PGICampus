import { Priority, ComplaintCategory, PeopleAffected, Complaint } from '../types';

export interface EvaluationInput {
  category: ComplaintCategory | string;
  title: string;
  description: string;
  safetyRisk: boolean;
  essentialServiceDisrupted: boolean;
  peopleAffected: PeopleAffected;
}

export interface EvaluationResult {
  priority: Priority;
  reason: string;
  deadlineHours: number;
  deadlineDate: string;
  isEmergency: boolean;
  emergencyNotice?: {
    title: string;
    description: string;
    contactNumber: string;
    contactName: string;
  };
}

// Emergency keywords that indicate immediate hazards to life, physical safety, or catastrophic asset damage
const CRITICAL_KEYWORDS = [
  'fire',
  'spark',
  'sparks',
  'sparking',
  'smoke',
  'smoking',
  'shock',
  'live wire',
  'exposed wire',
  'short circuit',
  'burn',
  'burning',
  'gas leak',
  'chemical',
  'collapse',
  'collapsed',
  'ceiling fall',
  'injury',
  'injured',
  'explosion',
  'electrocution',
  'flood',
  'flooding',
  'sewage overflow',
  'broken glass shard',
  'structural crack',
];

// High priority keywords indicating severe service outage or high sanitation/infrastructure disruption
const HIGH_KEYWORDS = [
  'leak',
  'leakage',
  'water burst',
  'no water',
  'blackout',
  'power cut',
  'ups fail',
  'server down',
  'choked washroom',
  'contaminated',
  'exam blocker',
  'generator',
  'lift stuck',
  'elevator',
  'ac breakdown',
  'water tank',
];

// Medium priority keywords indicating functional disruptions affecting learning or normal operations
const MEDIUM_KEYWORDS = [
  'projector',
  'flicker',
  'flickering',
  'slow internet',
  'wifi drop',
  'wi-fi',
  'microphone',
  'fan noise',
  'fan not working',
  'tube light',
  'switch loose',
  'audio',
  'hdmi',
  'keypad',
  'software error',
  'lab computer',
];

/**
 * Transparent Rule-based Risk Engine
 * Evaluates hazard indicators, impact radius, and essential service criticality
 * to calculate an objective urgency priority without false AI claims.
 */
export function evaluateComplaintPriority(input: EvaluationInput): EvaluationResult {
  const combinedText = `${input.title} ${input.description}`.toLowerCase();

  const hasCriticalKeyword = CRITICAL_KEYWORDS.some((kw) => combinedText.includes(kw));
  const hasHighKeyword = HIGH_KEYWORDS.some((kw) => combinedText.includes(kw));
  const hasMediumKeyword = MEDIUM_KEYWORDS.some((kw) => combinedText.includes(kw));

  let priority: Priority = 'Low';
  let reason = '';
  let deadlineHours = 168; // 7 days default for Low

  // Factor 1: Immediate Safety Risk or Critical Danger Keywords
  if (input.safetyRisk || hasCriticalKeyword) {
    priority = 'Critical';
    deadlineHours = 4;
    if (hasCriticalKeyword) {
      const detected = CRITICAL_KEYWORDS.filter((kw) => combinedText.includes(kw)).join(', ');
      reason = `Rule-based Risk Engine: Detected immediate hazard keywords (${detected}) and personal safety risk. Target response: 4 hours.`;
    } else {
      reason = 'Rule-based Risk Engine: Submitter flagged immediate safety hazard to campus residents. Target response: 4 hours.';
    }
  }
  // Factor 2: High Priority: Essential Service Outage or Wide Impact
  else if (
    input.essentialServiceDisrupted ||
    input.peopleAffected === 'Campus-wide' ||
    input.peopleAffected === 'Wing / Floor' ||
    hasHighKeyword ||
    (input.category === 'Electrical' && input.peopleAffected !== 'Individual') ||
    (input.category === 'Water' && input.peopleAffected !== 'Individual') ||
    (input.category === 'Washroom' && input.peopleAffected !== 'Individual')
  ) {
    priority = 'High';
    deadlineHours = 24;
    if (input.peopleAffected === 'Campus-wide' || input.peopleAffected === 'Wing / Floor') {
      reason = `Rule-based Risk Engine: High impact scope affecting ${input.peopleAffected.toLowerCase()} with disruption to campus routine. Target response: 24 hours.`;
    } else if (input.essentialServiceDisrupted) {
      reason = 'Rule-based Risk Engine: Disruption of essential utility/infrastructure (water, power, or lab facilities). Target response: 24 hours.';
    } else {
      reason = `Rule-based Risk Engine: High-urgency maintenance need detected for ${input.category}. Target response: 24 hours.`;
    }
  }
  // Factor 3: Medium Priority: Academic / Classroom / Connectivity Disruption
  else if (
    hasMediumKeyword ||
    input.category === 'Classroom' ||
    input.category === 'Wi-Fi' ||
    input.category === 'Academic' ||
    input.category === 'Transport' ||
    input.peopleAffected === 'Room / Class'
  ) {
    priority = 'Medium';
    deadlineHours = 48;
    reason = `Rule-based Risk Engine: Equipment or service fault affecting class/group work (${input.category}). Target response: 48 hours.`;
  }
  // Factor 4: Low Priority: Minor / Routine / Cosmetic
  else {
    priority = 'Low';
    deadlineHours = 168; // 7 days
    reason = 'Rule-based Risk Engine: Routine maintenance or minor cosmetic repair; normal campus operations unaffected. Target response: 7 days.';
  }

  // Calculate target resolution date from now
  const targetDate = new Date(Date.now() + deadlineHours * 60 * 60 * 1000);
  const deadlineDate = targetDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isEmergency = priority === 'Critical';

  let emergencyNotice;
  if (isEmergency) {
    emergencyNotice = {
      title: '🚨 CRITICAL SAFETY RISK DETECTED',
      description: 'An emergency condition has been flagged. If there is immediate danger to life or electrical sparks, alert campus security immediately.',
      contactName: 'PGI Campus Proctor & Emergency Dispatch',
      contactNumber: '+91 9450X-11200 / Intercom Ext. 101',
    };
  }

  return {
    priority,
    reason,
    deadlineHours,
    deadlineDate,
    isEmergency,
    emergencyNotice,
  };
}

/**
 * Checks if a complaint is overdue based on status, deadline, or explicit flag
 */
export function isComplaintOverdue(complaint: Complaint): boolean {
  if (complaint.status === 'Resolved' || complaint.status === 'Closed') {
    return false; // Resolved tickets are never overdue
  }

  if (complaint.isOverdue === true) {
    return true;
  }

  if (complaint.deadlineTimestamp) {
    const deadlineTime = new Date(complaint.deadlineTimestamp).getTime();
    if (!isNaN(deadlineTime) && Date.now() > deadlineTime) {
      return true;
    }
  }

  return false;
}

/**
 * Priority weighting for sorting:
 * 0: Critical (highest)
 * 1: High
 * 2: Medium
 * 3: Low (lowest)
 */
export function getPriorityWeight(priority: Priority): number {
  switch (priority) {
    case 'Critical':
      return 0;
    case 'High':
      return 1;
    case 'Medium':
      return 2;
    case 'Low':
      return 3;
    default:
      return 4;
  }
}

/**
 * Campus Emergency Helplines for Quick Access
 */
export const CAMPUS_EMERGENCY_CONTACTS = [
  {
    dept: 'Campus Proctor & Security Desk',
    role: 'Central Emergency & Safety Control',
    phone: '+91 9450X-11200',
    intercom: 'Ext. 101',
    hours: '24x7 Available',
  },
  {
    dept: 'Emergency Electrical & Power Control',
    role: 'Live Wire / Fire / Substation Hazard',
    phone: '+91 9450X-11204',
    intercom: 'Ext. 104',
    hours: '24x7 On-call Duty',
  },
  {
    dept: 'PGI Health & First Aid Center (PIT)',
    role: 'Medical Emergency & Ambulance',
    phone: '+91 9450X-11208',
    intercom: 'Ext. 108',
    hours: '24x7 Staffed',
  },
  {
    dept: 'Hostel Chief Warden Office',
    role: 'Hostel Emergency & Resident Safety',
    phone: '+91 9450X-11210',
    intercom: 'Ext. 110',
    hours: 'Round the Clock',
  },
];
