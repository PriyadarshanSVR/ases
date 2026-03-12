export type RiskLevel = 'high' | 'medium' | 'low';

export interface RiskFactor {
  icon: 'critical' | 'warning' | 'info';
  title: string;
  desc: string;
  tag?: 'critical' | 'warning' | 'info';
  tagLabel?: string;
}

export interface Intervention {
  title: string;
  desc: string;
  priority: 'urgent' | 'recommended' | 'optional';
}

export interface TimelineEvent {
  time: string;
  status: 'done' | 'pending' | 'blocked';
  text: string;
}

export interface Patient {
  id: number;
  name: string;
  nhs: string;
  age: number;
  sex: 'M' | 'F';
  bed: string;
  los: number;
  drd: 'Set' | 'Predicted';
  drdDate: string;
  risk: RiskLevel;
  pathway: number;
  forecast: string;
  forecastConf: string;
  diagnosis: string;
  consultant: string;
  riskFactors: RiskFactor[];
  interventions: Intervention[];
  timeline: TimelineEvent[];
}

export const patients: Patient[] = [
  {
    id: 1, name: "Margaret Thompson", nhs: "943 221 8847", age: 82, sex: "F", bed: "7A-01",
    los: 9, drd: "Set", drdDate: "2026-03-08", risk: "high", pathway: 1,
    forecast: "14 Mar", forecastConf: "62%",
    diagnosis: "Community-acquired pneumonia, COPD exacerbation",
    consultant: "Dr R. Patel",
    riskFactors: [
      { icon: "critical", title: "Discharge summary not started", desc: "Dr F. Ahmed (FY1) is on night shift rotation starting tomorrow. No summary drafted. Typical FY1 summary turnaround is 4.2 hours when written reactively.", tag: "critical", tagLabel: "Bottleneck" },
      { icon: "critical", title: "Pharmacy understaffed today", desc: "2 of 5 ward pharmacists on sick leave. Current TTO queue: 14 patients. Estimated wait: 6+ hours. TTOs for this patient not yet prescribed.", tag: "critical", tagLabel: "Capacity" },
      { icon: "warning", title: "Care home bed availability limited", desc: "Patient requires Pathway 1 (step-down). Only 2 beds available across 6 local care homes contacted. Placement unlikely before Thursday.", tag: "warning", tagLabel: "External" },
      { icon: "info", title: "Family not yet informed of discharge plan", desc: "Daughter (primary carer contact) last spoke to ward on 6 Mar. No updated EDD communicated." }
    ],
    interventions: [
      { title: "Assign discharge summary to Dr B. Lewis (FY2)", desc: "Dr Lewis is on day shift today and tomorrow. Capacity to complete by 17:00.", priority: "urgent" },
      { title: "Escalate TTO to pharmacy lead", desc: "Flag as priority dispensing. Pre-prescribe TTOs now to enter queue ahead of ward round backlog.", priority: "urgent" },
      { title: "Contact care transfer hub re: Pathway 1 beds", desc: "Request broadened search radius to include neighbouring borough care homes.", priority: "recommended" },
      { title: "Call daughter (Mrs K. Thompson)", desc: "Inform of estimated discharge date and care home placement status.", priority: "recommended" }
    ],
    timeline: [
      { time: "Day 1", status: "done", text: "Admitted via A&E with acute SOB" },
      { time: "Day 3", status: "done", text: "IV antibiotics stepped down to oral" },
      { time: "Day 6", status: "done", text: "Medically fit declared by Dr Patel" },
      { time: "Day 8", status: "done", text: "DRD set: 8 Mar. OT assessment completed" },
      { time: "Day 9", status: "blocked", text: "Today: Awaiting summary, TTOs, placement" },
      { time: "Day 11", status: "pending", text: "AI forecast: likely discharge 14 Mar" }
    ]
  },
  {
    id: 2, name: "James Okonkwo", nhs: "487 339 2105", age: 74, sex: "M", bed: "7A-03",
    los: 12, drd: "Set", drdDate: "2026-03-06", risk: "high", pathway: 2,
    forecast: "15 Mar", forecastConf: "55%",
    diagnosis: "Heart failure exacerbation, Type 2 diabetes",
    consultant: "Dr L. Chen",
    riskFactors: [
      { icon: "critical", title: "Nursing home placement blocked", desc: "Requires Pathway 2 (rehab + nursing). 0 nursing home beds with cardiac monitoring capability available within 15-mile radius. Waitlist position: 4th.", tag: "critical", tagLabel: "Capacity" },
      { icon: "critical", title: "Social worker assessment overdue", desc: "Referral sent Day 8. Social worker visit not yet scheduled. Care transfer hub backlog: 72 hours.", tag: "critical", tagLabel: "Bottleneck" },
      { icon: "warning", title: "Complex medication regime", desc: "12 medications including warfarin dose titration. TTO preparation estimated at 90+ minutes. Requires pharmacist counselling session." }
    ],
    interventions: [
      { title: "Escalate to care transfer hub manager", desc: "Request priority assessment given 6 days past DRD. Invoke local authority 48-hour response commitment.", priority: "urgent" },
      { title: "Pre-prescribe TTOs for pharmacy queue", desc: "Warfarin bridge plan and 12-med list can be prescribed now, saving 3+ hours on discharge day.", priority: "urgent" },
      { title: "Arrange pharmacist counselling slot", desc: "Book 30-min session for Wed/Thu to avoid day-of-discharge delays.", priority: "recommended" }
    ],
    timeline: [
      { time: "Day 1", status: "done", text: "Admitted with acute decompensated HF" },
      { time: "Day 5", status: "done", text: "Diuresis complete, weight target achieved" },
      { time: "Day 6", status: "done", text: "DRD set: 6 Mar" },
      { time: "Day 8", status: "done", text: "Social work referral sent" },
      { time: "Day 12", status: "blocked", text: "Today: 4 days past DRD. No placement." }
    ]
  },
  {
    id: 3, name: "Patricia Williams", nhs: "612 884 5590", age: 68, sex: "F", bed: "7A-05",
    los: 7, drd: "Set", drdDate: "2026-03-09", risk: "high", pathway: 0,
    forecast: "11 Mar", forecastConf: "78%",
    diagnosis: "Elective knee replacement (post-op day 5)",
    consultant: "Mr A. Shah",
    riskFactors: [
      { icon: "critical", title: "Transport not booked", desc: "Patient requires wheelchair-accessible transport. Hospital transport fully booked for 11 Mar. No private transport arranged. Lives alone.", tag: "critical", tagLabel: "Bottleneck" },
      { icon: "warning", title: "Home equipment not delivered", desc: "Raised toilet seat and grab rails ordered Day 5. Delivery confirmed for 12 Mar — one day after forecast discharge.", tag: "warning", tagLabel: "Logistics" }
    ],
    interventions: [
      { title: "Book transport for 11 Mar (AM slot)", desc: "Try external provider (Patient Transport Solutions). Hospital transport waitlist position: 7th.", priority: "urgent" },
      { title: "Expedite equipment delivery to 10 Mar", desc: "Contact community OT equipment store. Flag as urgent to avoid bed-day loss.", priority: "urgent" },
      { title: "Confirm home readiness with patient", desc: "Heating on, food available, neighbour aware of return date.", priority: "optional" }
    ],
    timeline: [
      { time: "Day 1", status: "done", text: "Admitted for elective L knee replacement" },
      { time: "Day 2", status: "done", text: "Surgery completed. Physio commenced." },
      { time: "Day 5", status: "done", text: "DRD set: 9 Mar. Mobilising with frame." },
      { time: "Day 7", status: "pending", text: "Today: Awaiting transport + equipment" }
    ]
  },
  {
    id: 4, name: "Robert Singh", nhs: "773 156 4423", age: 58, sex: "M", bed: "7A-07",
    los: 5, drd: "Set", drdDate: "2026-03-10", risk: "high", pathway: 0,
    forecast: "11 Mar", forecastConf: "71%",
    diagnosis: "Acute pancreatitis (resolving), alcohol use disorder",
    consultant: "Dr R. Patel",
    riskFactors: [
      { icon: "critical", title: "Consultant review not yet completed today", desc: "Dr Patel's ward round running 2 hours late (emergency on Ward 6B). Discharge decision cannot be confirmed until review.", tag: "critical", tagLabel: "Bottleneck" },
      { icon: "warning", title: "Community alcohol service referral pending", desc: "Referral sent Day 3. Acknowledgement received but appointment not yet allocated. Required before safe discharge.", tag: "warning", tagLabel: "External" },
      { icon: "info", title: "Discharge summary partially drafted", desc: "60% complete. Medication reconciliation section outstanding — awaiting final consultant review." }
    ],
    interventions: [
      { title: "Request registrar to confirm discharge", desc: "Dr M. Hussain (SpR) can authorise if Dr Patel delegates. Saves 2+ hours.", priority: "urgent" },
      { title: "Chase alcohol service appointment", desc: "Call community substance misuse team. Patient willing to engage — appointment accelerates discharge.", priority: "recommended" },
      { title: "Complete discharge summary medication section", desc: "Pharmacist can reconcile medications now; doctor adds clinical narrative after.", priority: "recommended" }
    ],
    timeline: [
      { time: "Day 1", status: "done", text: "Admitted with epigastric pain, raised lipase" },
      { time: "Day 3", status: "done", text: "Pain controlled, tolerating oral diet" },
      { time: "Day 4", status: "done", text: "Medically fit. DRD set: 10 Mar" },
      { time: "Day 5", status: "pending", text: "Today: Awaiting consultant review" }
    ]
  },
  {
    id: 5, name: "Dorothy Evans", nhs: "255 017 8831", age: 91, sex: "F", bed: "7A-02",
    los: 14, drd: "Set", drdDate: "2026-03-04", risk: "medium", pathway: 3,
    forecast: "16 Mar", forecastConf: "45%",
    diagnosis: "Fall with NOF fracture (post ORIF), dementia",
    consultant: "Mr A. Shah",
    riskFactors: [
      { icon: "warning", title: "Permanent care home placement in progress", desc: "Pathway 3. Family choosing between 2 shortlisted homes. Visit scheduled for 12 Mar.", tag: "warning", tagLabel: "Patient choice" },
      { icon: "info", title: "Capacity of Medicines Management adequate", desc: "TTOs can be prepared within standard 4-hour window. No pharmacy bottleneck." }
    ],
    interventions: [
      { title: "Facilitate family care home visit", desc: "Offer virtual tour option to accelerate decision. Social worker to attend.", priority: "recommended" },
      { title: "Pre-prepare discharge documentation", desc: "Summary and TTOs can be completed now — ready to execute on placement confirmation.", priority: "optional" }
    ],
    timeline: [
      { time: "Day 1", status: "done", text: "Admitted following mechanical fall at home" },
      { time: "Day 2", status: "done", text: "ORIF completed" },
      { time: "Day 7", status: "done", text: "DRD set: 4 Mar. Mobilising with physio." },
      { time: "Day 14", status: "pending", text: "Today: 6 days past DRD. Awaiting placement." }
    ]
  },
  {
    id: 6, name: "Ahmed Hassan", nhs: "891 445 2267", age: 45, sex: "M", bed: "7A-08",
    los: 3, drd: "Predicted", drdDate: "", risk: "medium", pathway: 0,
    forecast: "12 Mar", forecastConf: "84%",
    diagnosis: "Cellulitis (right lower leg), Type 2 diabetes",
    consultant: "Dr L. Chen",
    riskFactors: [
      { icon: "warning", title: "IV-to-oral antibiotic switch pending", desc: "Likely tomorrow based on CRP trajectory (falling: 142 → 87 → 54). Switch triggers discharge pathway.", tag: "warning", tagLabel: "Clinical" },
      { icon: "info", title: "District nurse follow-up required", desc: "Wound packing changes needed post-discharge. DN team has 48h booking lead time." }
    ],
    interventions: [
      { title: "Pre-book district nurse for 12 or 13 Mar", desc: "Submit referral now to meet 48h lead time. Prevents discharge-day delay.", priority: "recommended" },
      { title: "Pre-prescribe oral antibiotics", desc: "Flucloxacillin 500mg QDS — can be added to TTO now pending consultant confirmation.", priority: "optional" }
    ],
    timeline: [
      { time: "Day 1", status: "done", text: "Admitted with spreading cellulitis" },
      { time: "Day 3", status: "pending", text: "Today: CRP improving. AI predicts discharge 12 Mar" }
    ]
  },
  {
    id: 7, name: "Susan Clarke", nhs: "334 778 9910", age: 77, sex: "F", bed: "7A-04",
    los: 6, drd: "Set", drdDate: "2026-03-10", risk: "medium", pathway: 1,
    forecast: "12 Mar", forecastConf: "68%",
    diagnosis: "UTI with delirium (resolving), underlying vascular dementia",
    consultant: "Dr R. Patel",
    riskFactors: [
      { icon: "warning", title: "Short-term care bed search in progress", desc: "Pathway 1. Care transfer hub has identified 3 potential beds. Awaiting provider response (24h SLA).", tag: "warning", tagLabel: "External" },
      { icon: "info", title: "Delirium screening score improving", desc: "4AT score: 4 → 2 → 1 over last 72 hours. Cognitively near baseline per family." }
    ],
    interventions: [
      { title: "Chase care home providers (3 pending)", desc: "Follow up on 24h SLA. Escalate if no response by 14:00.", priority: "recommended" },
      { title: "Prepare TTOs and summary", desc: "Clinically stable. Documentation can be completed today.", priority: "optional" }
    ],
    timeline: [
      { time: "Day 1", status: "done", text: "Admitted with confusion, positive urine culture" },
      { time: "Day 4", status: "done", text: "Delirium resolving. DRD set: 10 Mar" },
      { time: "Day 6", status: "pending", text: "Today: Awaiting care bed placement" }
    ]
  },
  {
    id: 8, name: "Michael Brown", nhs: "567 203 1148", age: 52, sex: "M", bed: "7A-09",
    los: 2, drd: "Predicted", drdDate: "", risk: "low", pathway: 0,
    forecast: "11 Mar", forecastConf: "91%",
    diagnosis: "Chest pain (troponin negative x2), anxiety disorder",
    consultant: "Dr L. Chen",
    riskFactors: [
      { icon: "info", title: "Awaiting final troponin at 18:00", desc: "If negative, discharge protocol auto-triggers. GP follow-up letter template pre-loaded." }
    ],
    interventions: [
      { title: "Pre-prepare discharge pack", desc: "Chest pain advice leaflet, GP letter, and outpatient cardiology referral can be readied now.", priority: "optional" }
    ],
    timeline: [
      { time: "Day 1", status: "done", text: "Admitted with central chest pain via A&E" },
      { time: "Day 2", status: "pending", text: "Today: Awaiting 18:00 troponin. Discharge likely." }
    ]
  },
  {
    id: 9, name: "Elizabeth Kowalski", nhs: "128 664 3357", age: 63, sex: "F", bed: "7A-06",
    los: 4, drd: "Set", drdDate: "2026-03-10", risk: "low", pathway: 0,
    forecast: "10 Mar", forecastConf: "88%",
    diagnosis: "Asthma exacerbation (resolving)",
    consultant: "Dr R. Patel",
    riskFactors: [
      { icon: "info", title: "All discharge tasks on track", desc: "Summary written. TTOs prescribed and in pharmacy queue (position 3). Transport booked for 14:00. Husband collecting." }
    ],
    interventions: [
      { title: "Monitor TTO queue position", desc: "Currently position 3. Expected ready by 12:30. No action needed unless delayed past 13:00.", priority: "optional" }
    ],
    timeline: [
      { time: "Day 1", status: "done", text: "Admitted with acute wheeze, SpO2 88%" },
      { time: "Day 3", status: "done", text: "Weaned to inhalers. DRD set: 10 Mar" },
      { time: "Day 4", status: "done", text: "Today: On track for 14:00 discharge" }
    ]
  },
  {
    id: 10, name: "George Taylor", nhs: "445 891 7723", age: 70, sex: "M", bed: "7A-10",
    los: 3, drd: "Predicted", drdDate: "", risk: "low", pathway: 0,
    forecast: "11 Mar", forecastConf: "86%",
    diagnosis: "COPD exacerbation (mild), community-acquired pneumonia",
    consultant: "Dr R. Patel",
    riskFactors: [
      { icon: "info", title: "Clinically improving — discharge tomorrow likely", desc: "CRP 28 (from 95). Saturations 94% on room air. Oral antibiotics tolerated. Wife confirmed home support available." }
    ],
    interventions: [
      { title: "Prepare TTOs and discharge summary tomorrow AM", desc: "Schedule for morning ward round. Patient can be discharged by noon if bloods stable.", priority: "optional" }
    ],
    timeline: [
      { time: "Day 1", status: "done", text: "Admitted with productive cough, CRP 95" },
      { time: "Day 3", status: "pending", text: "Today: Improving. AI predicts discharge 11 Mar" }
    ]
  }
];

// ─── Ward Patient Generator ───────────────────────────────────────────────────

function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0x100000000; };
}

const FIRST_NAMES = ['James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','David','Barbara','Richard','Susan','Joseph','Dorothy','Thomas','Jessica','Charles','Sarah','Christopher','Karen','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley','Steven','Emily','Paul','Donna','Andrew','Carol','Kenneth','Ruth','Joshua','Sharon','Kevin','Michelle','Brian','Laura','George','Sarah','Timothy','Kimberly','Ronald','Deborah'];
const LAST_NAMES  = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Moore','Young','Allen','King','Wright','Scott','Torres','Hill','Adams','Baker','Nelson','Carter','Mitchell','Perez','Roberts','Turner','Phillips','Campbell','Parker','Evans','Edwards','Collins','Stewart','Morris','Morgan','Reed','Cook','Bell','Bailey','Cooper','Richardson','Cox','Ward'];
const CONSULTANTS = ['Dr R. Patel','Dr S. Ahmed','Dr L. Chen','Dr M. Okafor','Dr F. Walsh','Dr A. Singh','Dr C. Nkosi','Dr H. Brennan','Dr T. Yamamoto','Dr E. Kowalski'];

const DIAGNOSES: Record<string, string[]> = {
  Medical:              ['Community-acquired pneumonia','Heart failure exacerbation','Acute kidney injury','Pulmonary embolism','Diabetic ketoacidosis','Sepsis — urinary source','COPD exacerbation','Hypertensive crisis','Anaemia — iron deficiency','Cellulitis, left leg'],
  Surgical:             ['Laparoscopic appendicectomy','Open cholecystectomy','Inguinal hernia repair','Bowel obstruction','Perforated diverticulitis','Colorectal resection','Mastectomy — breast cancer','Thyroidectomy','AAA repair — elective','Pilonidal abscess drainage'],
  Cardiology:           ['NSTEMI — medically managed','Atrial fibrillation — rate control','Heart failure — decompensated','Complete heart block — pacemaker','Hypertrophic cardiomyopathy','Pericarditis','Aortic stenosis — TAVI planned','Ventricular tachycardia','Cardiac tamponade — drained','Pulmonary hypertension'],
  Gastroenterology:     ['Upper GI bleed — peptic ulcer','Crohn\'s disease flare','Ulcerative colitis — acute severe','Acute pancreatitis','Liver cirrhosis — decompensated','Oesophageal stricture — dilatation','Coeliac disease — newly diagnosed','Hepatitis B — acute','Ischaemic colitis','Barrett\'s oesophagus surveillance'],
  AMU:                  ['Acute confusion — UTI','Syncope — vasovagal','Chest pain — query ACS','Shortness of breath — PE excluded','Hypoglycaemia — insulin error','Fall with head injury — no bleed','Acute back pain — cauda equina excluded','Dizziness — labyrinthitis','Epistaxis — uncontrolled','Rash — query meningitis'],
  'Elective Specialty': ['Total knee replacement','Total hip replacement','Spinal decompression','Cataract surgery','Varicose vein stripping','Tonsillectomy','Laparoscopic fundoplication','Carpal tunnel release','Arthroscopic meniscectomy','Rhinoplasty — functional'],
  'Non-Elective Specialty': ['Acute stroke — ischaemic','Seizure — new onset epilepsy','Subarachnoid haemorrhage','Subdural haematoma','Meningitis — bacterial','Guillain-Barré syndrome','Multiple sclerosis relapse','Transient ischaemic attack','Parkinson\'s disease — falls','Peripheral neuropathy'],
  DCC:                  ['Post-cardiac arrest — ROSC achieved','Respiratory failure — ventilated','Septic shock — multi-organ support','Major trauma — polytrauma','Post-operative HDU — cardiac surgery','Acute liver failure','DKA — severe, ICU-level care','Intracranial haemorrhage — ITU','Burns — >20% TBSA','Anaphylaxis — refractory'],
  GPAU:                 ['Acute abdominal pain — query appendicitis','Fever of unknown origin','Acute confusion — dementia background','Shortness of breath — query pneumonia','Palpitations — query arrhythmia','Haematuria — query bladder cancer','Chest pain — atypical','Nausea and vomiting — uncontrolled','Haemoptysis — query TB','Leg swelling — bilateral'],
};

const RISK_FACTOR_POOL: RiskFactor[] = [
  { icon:'critical', title:'Discharge summary not started',      desc:'Responsible FY1 on annual leave. No cover allocated. Pharmacist cannot process TTOs until summary drafted.', tag:'critical', tagLabel:'BOTTLENECK' },
  { icon:'critical', title:'Social care assessment outstanding', desc:'Patient requires full care package. SALT assessment pending. Community team referral not yet submitted.', tag:'critical', tagLabel:'BOTTLENECK' },
  { icon:'critical', title:'Consultant sign-off pending',        desc:'Registrar has not obtained consultant agreement to discharge. Ward round not until tomorrow AM.', tag:'critical', tagLabel:'BOTTLENECK' },
  { icon:'warning',  title:'Pharmacy TTO queue backlog',         desc:'Current TTO queue: 12 patients. Estimated wait 5+ hours. Medication counselling also required for this patient.', tag:'warning', tagLabel:'CAPACITY' },
  { icon:'warning',  title:'Transport not yet arranged',         desc:'Patient requires non-emergency patient transport. Booking not confirmed. Estimated 3–4 hour lead time.', tag:'warning', tagLabel:'EXTERNAL' },
  { icon:'warning',  title:'Family not informed of discharge',   desc:'Next of kin not contacted. Patient requested family collect them. No confirmation received.', tag:'warning', tagLabel:'EXTERNAL' },
  { icon:'warning',  title:'Care home bed availability limited', desc:'Pathway 1 placement required. Only 1 bed available locally. Placement coordinator contacted.', tag:'warning', tagLabel:'EXTERNAL' },
  { icon:'info',     title:'Discharge summary partially drafted',desc:'75% complete. Medication reconciliation section outstanding. Awaiting final investigation results.', tag:'info', tagLabel:'IN PROGRESS' },
  { icon:'info',     title:'Outpatient follow-up not booked',    desc:'Requires clinic appointment within 2 weeks. Referral sent but slot not yet confirmed.', tag:'info', tagLabel:'IN PROGRESS' },
  { icon:'info',     title:'Equipment order placed',             desc:'Zimmer frame and raised toilet seat ordered. Estimated delivery tomorrow. Discharge contingent on receipt.', tag:'info', tagLabel:'IN PROGRESS' },
];

const INTERVENTION_POOL: Intervention[] = [
  { title:'Complete discharge summary today',          desc:'Assign to Dr B. Lewis (FY2) who is on day shift. Consultant to review before 5 PM.',                       priority:'urgent' },
  { title:'Chase pharmacy for TTOs',                   desc:'Escalate to ward pharmacist. Request fast-track if discharge planned before 3 PM.',                        priority:'urgent' },
  { title:'Submit social care referral',               desc:'Contact integrated discharge team. Complete CHC checklist. Allow 48 h for assessment.',                    priority:'urgent' },
  { title:'Book patient transport',                    desc:'Call NEPTS on ext 4421. Confirm pickup address and mobility requirements.',                                 priority:'recommended' },
  { title:'Notify family of discharge plan',           desc:'Call primary carer. Confirm EDD and any equipment needs. Document in notes.',                              priority:'recommended' },
  { title:'Arrange outpatient follow-up',              desc:'Refer to relevant outpatient clinic. Ensure letter sent to GP simultaneously.',                            priority:'recommended' },
  { title:'Confirm care home placement',               desc:'Contact placement coordinator. Two homes have vacancies — confirm suitability with family.',               priority:'recommended' },
  { title:'Request equipment delivery confirmation',   desc:'Chase community OT. Equipment required before discharge can proceed.',                                     priority:'recommended' },
  { title:'Update e-discharge in EPR',                 desc:'Ensure GP letter auto-generated and reviewed before patient leaves.',                                      priority:'optional' },
  { title:'Confirm medication counselling done',       desc:'Pharmacist to confirm patient understands new medications before discharge.',                              priority:'optional' },
];

const TIMELINE_TEMPLATES = [
  (d: number) => ({ time:`Day 1`, status:'done'    as const, text:`Admitted via ${d%2===0?'ED':'GP referral'}. Bloods and imaging requested.` }),
  (d: number) => ({ time:`Day 2`, status:'done'    as const, text:`Diagnosis confirmed. Treatment plan initiated. Patient stable.` }),
  (d: number) => ({ time:`Day ${Math.min(d-1,3)}`, status:'done' as const, text:`Consultant reviewed. Discharge planning discussion documented.` }),
  (d: number) => ({ time:`Day ${d}`, status:'pending' as const, text:`Today: ${d>5?'Extended stay — barriers identified.':'Progressing. Discharge anticipated tomorrow.'}` }),
  (d: number) => ({ time:'Target', status:'pending' as const, text:`EDD set. Awaiting ${d>7?'social care and pharmacy clearance':'pharmacy and family confirmation'}.` }),
];

export function generateWardPatients(wardName: string, wardType: string, bedPrefix: string): Patient[] {
  const seed = wardName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = seeded(seed);
  const count = 8 + Math.floor(r() * 3); // 8–10 patients
  const diagPool = DIAGNOSES[wardType] ?? DIAGNOSES['AMU'];
  const risks: RiskLevel[] = ['high','high','medium','medium','medium','low','low','low','low','high'];

  return Array.from({ length: count }, (_, i) => {
    const pr   = seeded(seed + i * 97);
    const firstName = FIRST_NAMES[Math.floor(pr() * FIRST_NAMES.length)];
    const lastName  = LAST_NAMES [Math.floor(pr() * LAST_NAMES.length)];
    const sex: 'M'|'F' = pr() > 0.5 ? 'M' : 'F';
    const age  = 40 + Math.floor(pr() * 50);
    const los  = 1  + Math.floor(pr() * 13);
    const risk = risks[Math.floor(pr() * risks.length)];
    const nhs  = `${100+Math.floor(pr()*900)} ${100+Math.floor(pr()*900)} ${1000+Math.floor(pr()*9000)}`;
    const diag = diagPool[Math.floor(pr() * diagPool.length)];
    const cons = CONSULTANTS[Math.floor(pr() * CONSULTANTS.length)];
    const bed  = `${bedPrefix}-${String(i+1).padStart(2,'0')}`;
    const pathway = 1 + Math.floor(pr() * 3);

    // Pick risk factors based on risk level
    const rfCount = risk==='high' ? 3+Math.floor(pr()*2) : risk==='medium' ? 2 : 1;
    const rfStartIdx = Math.floor(pr() * (RISK_FACTOR_POOL.length - rfCount));
    const riskFactors = RISK_FACTOR_POOL.slice(rfStartIdx, rfStartIdx + rfCount);

    // Pick interventions
    const ivCount = risk==='high' ? 3 : risk==='medium' ? 2 : 1;
    const ivStartIdx = Math.floor(pr() * (INTERVENTION_POOL.length - ivCount));
    const interventions = INTERVENTION_POOL.slice(ivStartIdx, ivStartIdx + ivCount);

    // Build timeline
    const tlCount = Math.min(los, 3) + (risk==='high' ? 2 : 1);
    const timeline = TIMELINE_TEMPLATES.slice(0, tlCount).map(fn => fn(los));

    const drdOffset = los + 1 + Math.floor(pr() * 4);
    const drdDate = new Date(Date.now() + drdOffset * 86400000).toISOString().split('T')[0];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const drdD = new Date(drdDate);
    const forecast = `${drdD.getDate()} ${months[drdD.getMonth()]}`;

    return {
      id: seed * 100 + i,
      name: `${firstName} ${lastName}`,
      nhs, age, sex, bed, los,
      drd: pr() > 0.4 ? 'Set' : 'Predicted',
      drdDate, risk, pathway, forecast,
      forecastConf: `${55 + Math.floor(pr() * 40)}%`,
      diagnosis: diag,
      consultant: cons,
      riskFactors,
      interventions,
      timeline,
    };
  });
}
