import React, { useState } from 'react';
import {
  Activity, BedDouble, Users, Clock,
  BarChart2, LayoutDashboard, AlertTriangle,
  Info, User, Play, Pause, FastForward, RotateCcw, Settings,
  ChevronLeft
} from 'lucide-react';

const locationsList = [
  { name: 'Ward 1 Medical', site: 'Gen', type: 'Medical' },
  { name: 'Ward 2 Surgical', site: 'Gen', type: 'Surgical' },
  { name: 'Ward 3 Cardiology', site: 'Gen', type: 'Cardiology' },
  { name: 'Ward 4 Gastroenterology', site: 'Gen', type: 'Gastroenterology' },
  { name: 'Acute Care Unit C CGH', site: 'CGH', type: 'AMU' },
  { name: 'Alstone Ward CGH', site: 'CGH', type: 'Elective Specialty' },
  { name: 'Acute Medical Unit 2 GRH', site: 'GRH', type: 'AMU' },
  { name: 'Avening Ward CGH', site: 'CGH', type: 'Elective Specialty' },
  { name: 'Bibury Ward CGH', site: 'CGH', type: 'Elective Specialty' },
  { name: 'Cardiac Ward CGH', site: 'CGH', type: 'Non-Elective Specialty' },
  { name: 'Cardiology GRH', site: 'GRH', type: 'Non-Elective Specialty' },
  { name: 'Dept of Critical Care CGH', site: 'CGH', type: 'DCC' },
  { name: 'Dept of Critical Care GRH', site: 'GRH', type: 'DCC' },
  { name: 'Dixton Ward CGH', site: 'CGH', type: 'Elective Specialty' },
  { name: 'Frailty Assessment Unit GRH', site: 'GRH', type: 'Non-Elective Specialty' },
  { name: 'Gloucestershire Priority Admission Unit GRH', site: 'GRH', type: 'GPAU' },
];

const generateLocationData = (locationName: string, day: number) => {
  const hash = locationName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + day * 13;
  const avgOccupancy = 40 + (hash % 60);
  const avgStay = 1 + (hash % 48);
  const totalAdmissions = 10 + (hash % 50);
  const queueSize = hash % 15;
  const delayedDays = Math.floor((hash % 100) / 10) + Math.floor(day / 3);
  const totalBeds = 20 + (hash % 10);
  const occupiedBeds = Math.floor((avgOccupancy / 100) * totalBeds);
  const beds = Array.from({ length: totalBeds }).map((_, i) => {
    if (i >= occupiedBeds) return 'empty';
    const statusHash = hash + i * 7;
    const rand = statusHash % 100;
    if (rand < 50) return 'treated';
    if (rand < 70) return 'waiting_move';
    if (rand < 80) return 'outlier_treated';
    if (rand < 90) return 'outlier_waiting';
    return 'medically_fit';
  });
  return { avgOccupancy, avgStay, totalAdmissions, queueSize, delayedDays, beds };
};

const getBedColor = (status: string) => {
  switch (status) {
    case 'treated': return 'text-[#005EB8]';
    case 'waiting_move': return 'text-[#D946A9]';
    case 'outlier_treated': return 'text-[#F59E0B]';
    case 'outlier_waiting': return 'text-[#6366F1]';
    case 'medically_fit': return 'text-[#EF4444]';
    default: return 'text-slate-200';
  }
};

function BedSVG({ x, y, occupied }: { x: number, y: number, occupied: boolean }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="0" y="0" width="25" height="15" fill="none" stroke="#ef4444" strokeWidth="1"/>
      <rect x="2" y="2" width="5" height="11" fill="none" stroke="#ef4444" strokeWidth="1"/>
      {occupied && (
        <g>
          <rect x="0" y="0" width="25" height="15" fill="#0f2e4a"/>
          <circle cx="5" cy="7.5" r="2" fill="#e2e8f0"/>
          <rect x="8" y="4.5" width="8" height="6" rx="1" fill="#e2e8f0"/>
          <rect x="10" y="5.5" width="6" height="4" fill="#ea580c"/>
          <rect x="16" y="5" width="7" height="2" fill="#94a3b8"/>
          <rect x="16" y="8" width="7" height="2" fill="#94a3b8"/>
          <rect x="8" y="3" width="6" height="1.5" fill="#e2e8f0"/>
          <rect x="8" y="10.5" width="6" height="1.5" fill="#e2e8f0"/>
        </g>
      )}
    </g>
  );
}

function FloorPlanMini({ beds }: { beds: string[] }) {
  // Bed positions mapped to actual locations on the ward floor plan image (% of image)
  const bedPositions = [
    { left: '4%',  top: '43%' },  // SAU 636 — bed 1
    { left: '4%',  top: '54%' },  // SAU 636 — bed 2
    { left: '12%', top: '43%' },  // SAU 636 — bed 3
    { left: '28%', top: '32%' },  // 6-Bed Ward 634 — left col 1
    { left: '28%', top: '42%' },  // 6-Bed Ward 634 — left col 2
    { left: '28%', top: '53%' },  // 6-Bed Ward 634 — left col 3
    { left: '40%', top: '32%' },  // 6-Bed Ward 634 — right col 1
    { left: '40%', top: '42%' },  // 6-Bed Ward 634 — right col 2
    { left: '40%', top: '53%' },  // 6-Bed Ward 634 — right col 3
    { left: '7%',  top: '76%' },  // 4-Bed Ward 640 — bed 1
    { left: '7%',  top: '84%' },  // 4-Bed Ward 640 — bed 2
    { left: '31%', top: '79%' },  // Single Ward 637
    { left: '39%', top: '79%' },  // Single Ward 638
  ];
  return (
    <div className="relative w-full h-full">
      <img src="/ward-floorplan.png" alt="Ward Floor Plan" className="w-full h-full object-contain"/>
      {beds.slice(0, bedPositions.length).map((status, i) => (
        <div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full border border-white shadow-sm"
          style={{
            left: bedPositions[i].left,
            top: bedPositions[i].top,
            transform: 'translate(-50%, -50%)',
            backgroundColor: status === 'occupied' ? '#005EB8' : status === 'cleaning' ? '#F59E0B' : '#4ade80',
          }}
        />
      ))}
    </div>
  );
}

function BedPatient({ status, id, isViewed }: { status: string, id: string, isViewed?: boolean }) {
  const getBg = (s: string) => {
    switch (s) {
      case 'treated': return 'bg-[#005EB8]';
      case 'waiting_move': return 'bg-[#D946A9]';
      case 'outlier_treated': return 'bg-[#F59E0B]';
      case 'outlier_waiting': return 'bg-[#6366F1]';
      case 'medically_fit': return 'bg-[#EF4444]';
      default: return 'bg-slate-200';
    }
  };
  return (
    <div className={`w-full h-full ${getBg(status)} flex items-center justify-center relative ${isViewed ? 'ring-2 ring-offset-1 ring-blue-500 animate-pulse' : ''}`}>
      <User size={12} className="text-white"/>
      {isViewed && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-1 rounded z-10">
          {id}
        </div>
      )}
    </div>
  );
}

function CircularMetric({ value, label, color }: { value: number, label: string, color: string }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-[10px] text-slate-500 font-medium text-center w-20 leading-tight h-8">{label}</div>
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100"/>
          <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            className={`${color} transition-all duration-1000 ease-out`}/>
        </svg>
        <span className="absolute text-sm font-bold text-slate-700">{value}%</span>
      </div>
    </div>
  );
}

export default function DigitalTwin() {
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Patients' | 'Locations'>('Dashboard');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locationView, setLocationView] = useState<'select' | 'display'>('select');
  const [currentDay, setCurrentDay] = useState(7);
  const [patientIdInput, setPatientIdInput] = useState('1003');
  const [viewedPatientId, setViewedPatientId] = useState('');
  const [patientKpiTab, setPatientKpiTab] = useState<'Statistics' | 'Location Durations' | 'Time in groups'>('Location Durations');
  const [wardKpiTab, setWardKpiTab] = useState<'Location Data' | 'Beds & Queues'>('Location Data');

  const toggleLocation = (name: string) => {
    setSelectedLocations(prev => {
      if (prev.includes(name)) return prev.filter(l => l !== name);
      if (prev.length < 4) return [...prev, name];
      return prev;
    });
  };

  const baseDate = new Date(2022, 6, 26);
  const currentDate = new Date(baseDate);
  currentDate.setDate(baseDate.getDate() + currentDay);
  const dateString = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const bedPatients: { status: string, id: string }[] = [
    { status: 'treated', id: '1003' },
    { status: 'waiting_move', id: '1042' },
    { status: 'medically_fit', id: '1085' },
    { status: 'treated', id: '1102' },
    { status: 'outlier_treated', id: '1156' },
    { status: 'treated', id: '1190' },
    { status: 'waiting_move', id: '1204' },
    { status: 'medically_fit', id: '1255' },
    { status: 'treated', id: '1301' },
    { status: 'outlier_waiting', id: '1344' },
    { status: 'treated', id: '1401' },
    { status: 'medically_fit', id: '1402' },
    { status: 'waiting_move', id: '1501' },
    { status: 'outlier_treated', id: '1502' },
    { status: 'treated', id: '1601' },
    { status: 'treated', id: '1602' },
    { status: 'medically_fit', id: '1603' },
    { status: 'waiting_move', id: '1604' },
    { status: 'treated', id: '1701' },
    { status: 'outlier_waiting', id: '1702' },
    { status: 'treated', id: '1703' },
    { status: 'medically_fit', id: '1704' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200 z-20 w-full">
      {/* Top Header */}
      <div className="bg-[#005EB8] text-white p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold italic tracking-tight">NHS Trust</h1>
          <div className="flex bg-white/10 rounded overflow-hidden">
            {(['Dashboard', 'Patients', 'Locations'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'Locations') setLocationView('select');
                }}
                className={`px-6 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab ? 'bg-white text-[#005EB8]' : 'hover:bg-white/20 text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium flex items-center gap-2 justify-end">
            Day:
            <div className="flex items-center bg-white/20 rounded px-1">
              <button onClick={() => setCurrentDay(Math.max(1, currentDay - 1))} className="px-1 hover:text-blue-200">‹</button>
              <span className="w-6 text-center">{currentDay}</span>
              <button onClick={() => setCurrentDay(Math.min(30, currentDay + 1))} className="px-1 hover:text-blue-200">›</button>
            </div>
            <span className="ml-2 text-lg">06:38</span>
          </div>
          <div className="text-xs text-blue-200 mt-0.5">{dateString}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col p-6">
        {/* DASHBOARD TAB */}
        {activeTab === 'Dashboard' && (
          <div className="flex flex-col h-full gap-6 overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-800">Daily Overview</h2>
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Patients Admitted', value: '124', color: 'text-blue-600', sub: '↑ 12% from yesterday', subColor: 'text-emerald-600' },
                { label: 'Ready for Discharge', value: '38', color: 'text-emerald-600', sub: '15 pending transport', subColor: 'text-slate-400' },
                { label: 'Staff Present', value: '86', color: 'text-indigo-600', sub: '92% attendance rate', subColor: 'text-slate-400' },
              ].map(card => (
                <div key={card.label} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                  <div className="text-slate-500 font-medium mb-2 uppercase tracking-wider text-sm">{card.label}</div>
                  <div className={`text-5xl font-bold ${card.color}`}>{card.value}</div>
                  <div className={`text-sm mt-2 font-medium ${card.subColor}`}>{card.sub}</div>
                </div>
              ))}
            </div>
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6">ED Performance</h3>
              <div className="flex items-center justify-center gap-12">
                <CircularMetric value={45} label="Triage Utilisation" color="text-blue-500"/>
                <CircularMetric value={72} label="Major Area Utilisation" color="text-orange-500"/>
                <CircularMetric value={100} label="Under 4 Hours" color="text-emerald-500"/>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Queue Summary</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600">Walk-in</span><span className="font-bold">7 patients (58%)</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Ambulance</span><span className="font-bold">5 patients (42%)</span></div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Current Queue Lengths</div>
                  <div className="space-y-1.5 text-xs">
                    {[
                      { name: 'Triage', count: 4, color: 'bg-indigo-400' },
                      { name: 'Major Area', count: 12, color: 'bg-purple-300' },
                      { name: 'AMU', count: 190, color: 'bg-blue-300' },
                      { name: 'COVID', count: 64, color: 'bg-teal-300' },
                    ].map(q => (
                      <div key={q.name} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${q.color} shrink-0`}></div>
                        <span className="text-slate-600 w-24">{q.name}</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                          <div className={`${q.color} h-1.5 rounded-full`} style={{ width: `${Math.min(100, (q.count / 200) * 100)}%` }}></div>
                        </div>
                        <span className="font-bold w-8 text-right">{q.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PATIENTS TAB */}
        {activeTab === 'Patients' && (
          <div className="flex flex-col h-full gap-4">
            <div className="flex gap-4 shrink-0">
              {/* Controls */}
              <div className="w-64 bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col">
                <label className="block text-xs font-semibold text-slate-600 mb-2">Input patient ID number:</label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={patientIdInput}
                    onChange={(e) => setPatientIdInput(e.target.value)}
                    className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 min-w-0"
                    placeholder="e.g. 1003"
                  />
                  <button
                    onClick={() => setViewedPatientId(patientIdInput)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shrink-0"
                  >
                    View
                  </button>
                </div>
                <div className="text-xs text-slate-500 mb-2">Or:</div>
                <div className="flex gap-2 mt-auto">
                  <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
                    Search
                  </button>
                  <button
                    onClick={() => setViewedPatientId('')}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                  >
                    Stop
                  </button>
                </div>
              </div>

              {/* Patient KPIs */}
              <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex border-b border-slate-200 mb-3">
                  {(['Statistics', 'Location Durations', 'Time in groups'] as const).map(tab => (
                    <div
                      key={tab}
                      onClick={() => setPatientKpiTab(tab)}
                      className={`px-4 py-1.5 text-sm cursor-pointer ${patientKpiTab === tab ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {tab === 'Statistics' ? 'Patient Statistics' : tab === 'Location Durations' ? 'Patient Location Durations' : 'Patient time in groups'}
                    </div>
                  ))}
                </div>
                {viewedPatientId ? (
                  patientKpiTab === 'Statistics' ? (
                    <div className="grid grid-cols-[1fr_auto] gap-y-2 text-sm">
                      <div className="text-slate-600 font-medium">Current Reporting Group:</div><div className="font-bold text-right">PATIENTS_BEING_TREATED</div>
                      <div className="text-slate-600 font-medium">Triage Score:</div><div className="font-bold text-right">3</div>
                      <div className="text-slate-600 font-medium">Current Activity:</div><div className="font-bold text-right">IN_WARD</div>
                      <div className="text-slate-600 font-medium">Current Location:</div><div className="font-bold text-right">W5ASAUG: GRH</div>
                      <div className="text-slate-600 font-medium">Total Time in Hospital:</div><div className="font-bold text-right">Days: 0 | Hours: 14.0</div>
                      <div className="text-slate-600 font-medium">Total Time Spent Queueing:</div><div className="font-bold text-right">Hours: 6 | Minutes: 13.0</div>
                    </div>
                  ) : patientKpiTab === 'Location Durations' ? (
                    <div className="flex flex-col">
                      <div className="flex justify-end mb-2">
                        <div className="text-[10px] text-slate-600">
                          <div className="font-bold mb-1">KEY</div>
                          <div className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-300 inline-block"></span> EDGRHA</div>
                          <div className="flex items-center gap-1"><span className="w-2 h-2 bg-[#005EB8] inline-block"></span> W5ASAUG</div>
                        </div>
                      </div>
                      <div className="relative h-12 w-full mt-4">
                        <div className="absolute top-0 left-0 h-full bg-blue-300" style={{ width: '40%' }}></div>
                        <div className="absolute top-0 left-[40%] h-full bg-[#005EB8]" style={{ width: '35%' }}></div>
                        <div className="absolute -bottom-5 left-0 w-full flex justify-between text-[10px] text-slate-500">
                          <span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>
                        </div>
                        <div className="absolute top-0 left-[25%] h-full border-l border-dashed border-slate-400/50"></div>
                        <div className="absolute top-0 left-[50%] h-full border-l border-dashed border-slate-400/50"></div>
                        <div className="absolute top-0 left-[75%] h-full border-l border-dashed border-slate-400/50"></div>
                      </div>
                      <div className="text-center text-[10px] text-slate-500 mt-6">Duration (hours)</div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 py-4 text-center">Time in groups data not available</div>
                  )
                ) : (
                  <div className="text-sm text-slate-400 italic py-4 text-center">Enter a patient ID to view statistics</div>
                )}
              </div>

              {/* Ward KPIs */}
              <div className="w-64 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex border-b border-slate-200 mb-3">
                  {(['Location Data', 'Beds & Queues'] as const).map(tab => (
                    <div
                      key={tab}
                      onClick={() => setWardKpiTab(tab)}
                      className={`px-4 py-1.5 text-sm cursor-pointer ${wardKpiTab === tab ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
                {viewedPatientId ? (
                  wardKpiTab === 'Location Data' ? (
                    <div className="text-xs">
                      <div className="font-bold text-slate-600 mb-2 border-b border-slate-200 pb-1">Results</div>
                      <div className="space-y-2 mb-4">
                        {[
                          { icon: <User size={12} className="text-slate-400"/>, label: 'Avg. Occupancy Level', val: 'N/A' },
                          { icon: <Clock size={12} className="text-slate-400"/>, label: 'Avg. Stay (hours)', val: '9.0' },
                          { icon: <LayoutDashboard size={12} className="text-slate-400"/>, label: 'Total Ward Admissions', val: '94' },
                          { icon: <Activity size={12} className="text-slate-400"/>, label: '% Perc. Time Above Optimal', val: 'N/A' },
                        ].map((row, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {row.icon}
                            <span className="text-slate-600 flex-1">{row.label}</span>
                            <span className="font-bold">{row.val}</span>
                          </div>
                        ))}
                      </div>
                      <div className="font-bold text-slate-600 mb-2 border-b border-slate-200 pb-1">Information</div>
                      <div className="space-y-2">
                        {[
                          { label: 'ID', val: 'W5ASAUG...' },
                          { label: 'Desc', val: '5A/SAU Chairs...' },
                          { label: 'Site', val: 'GRH' },
                          { label: 'Capacity', val: 'N/A' },
                        ].map((row, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Info size={12} className="text-slate-400"/>
                            <span className="text-slate-600 flex-1">{row.label}</span>
                            <span className="font-bold">{row.val}</span>
                          </div>
                        ))}
                        <div className="flex items-start gap-2 mt-1">
                          <Info size={12} className="text-slate-400 mt-0.5"/>
                          <span className="text-slate-600">Treats: <strong>Surgical SDEC</strong></span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 py-4 text-center">Beds & Queues data not available</div>
                  )
                ) : (
                  <div className="text-sm text-slate-400 italic py-4 text-center">No location selected</div>
                )}
              </div>
            </div>

            {/* Floor Plan */}
            <div className="flex-1 bg-slate-100 rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
              {/* Legend bar */}
              <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200 shrink-0">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Ward 6A — Live Bed Map</span>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  {[
                    { color: 'bg-[#005EB8]', label: 'Treated' },
                    { color: 'bg-[#EF4444]', label: 'Medically Fit' },
                    { color: 'bg-[#D946A9]', label: 'Waiting Move' },
                    { color: 'bg-[#F59E0B]', label: 'Outlier' },
                    { color: 'bg-slate-300', label: 'Empty' },
                  ].map(({ color, label }) => (
                    <span key={label} className="flex items-center gap-1">
                      <span className={`w-2.5 h-2.5 rounded-full inline-block ${color}`}/>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              {/* Image + overlay */}
              <div className="flex-1 relative overflow-hidden">
                <img
                  src="/ward-floorplan.png"
                  alt="Ward 6A Topological Floor Plan"
                  className="w-full h-full object-contain"
                />
                {/* Bed overlays — positions mapped to floor plan image */}
                {[
                  // Single Ward top-left (637)
                  { bp: bedPatients[0],  left: '4.2%',  top: '31%' },
                  // SAU (636) — 3 beds
                  { bp: bedPatients[1],  left: '5%',    top: '43%' },
                  { bp: bedPatients[2],  left: '5%',    top: '54%' },
                  { bp: bedPatients[3],  left: '12%',   top: '43%' },
                  // 6-Bed Ward (634) — 6 beds
                  { bp: bedPatients[4],  left: '29%',   top: '32%' },
                  { bp: bedPatients[5],  left: '29%',   top: '42%' },
                  { bp: bedPatients[6],  left: '29%',   top: '53%' },
                  { bp: bedPatients[7],  left: '41%',   top: '32%' },
                  { bp: bedPatients[8],  left: '41%',   top: '42%' },
                  { bp: bedPatients[9],  left: '41%',   top: '53%' },
                  // Right-side single rooms (627 area)
                  { bp: bedPatients[10], left: '63%',   top: '37%' },
                  { bp: bedPatients[11], left: '63%',   top: '50%' },
                  // Dayroom / additional rooms
                  { bp: bedPatients[12], left: '72%',   top: '56%' },
                  { bp: bedPatients[13], left: '79%',   top: '56%' },
                  // 4-Bed Ward 640 bottom-left
                  { bp: bedPatients[14], left: '7%',    top: '75%' },
                  { bp: bedPatients[15], left: '7%',    top: '84%' },
                  { bp: bedPatients[16], left: '16%',   top: '75%' },
                  { bp: bedPatients[17], left: '16%',   top: '84%' },
                  // Bottom single wards (640→637)
                  { bp: bedPatients[18], left: '31%',   top: '79%' },
                  { bp: bedPatients[19], left: '39%',   top: '79%' },
                  { bp: bedPatients[20], left: '47%',   top: '79%' },
                  { bp: bedPatients[21], left: '55%',   top: '79%' },
                ].map(({ bp, left, top }) => {
                  const bgColor = bp.status === 'treated' ? '#005EB8'
                    : bp.status === 'waiting_move' ? '#D946A9'
                    : bp.status === 'outlier_treated' ? '#F59E0B'
                    : bp.status === 'outlier_waiting' ? '#6366F1'
                    : bp.status === 'medically_fit' ? '#EF4444'
                    : '#CBD5E1';
                  return (
                    <div
                      key={bp.id}
                      title={`${bp.id} — ${bp.status.replace(/_/g, ' ')}`}
                      className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-150 ${viewedPatientId === bp.id ? 'ring-2 ring-offset-1 ring-yellow-400 animate-pulse scale-125' : ''}`}
                      style={{ left, top, backgroundColor: bgColor }}
                    >
                      {viewedPatientId === bp.id && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-1 rounded whitespace-nowrap z-10">
                          {bp.id}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* LOCATIONS TAB — SELECT */}
        {activeTab === 'Locations' && locationView === 'select' && (
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200 w-full">
            <h2 className="text-lg font-bold text-[#005EB8] mb-6">Select up to FOUR locations to display:</h2>
            <div className="flex gap-8">
              <div className="flex-1 border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 border-b border-slate-300">
                    <tr>
                      <th className="py-2 px-3 font-semibold text-slate-700">Location</th>
                      <th className="py-2 px-3 font-semibold text-slate-700 border-l border-slate-300">Site</th>
                      <th className="py-2 px-3 font-semibold text-slate-700 border-l border-slate-300">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationsList.map((loc, i) => (
                      <tr key={i} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                        <td className="py-2 px-3 flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            checked={selectedLocations.includes(loc.name)}
                            onChange={() => toggleLocation(loc.name)}
                            disabled={!selectedLocations.includes(loc.name) && selectedLocations.length >= 4}
                          />
                          <span className="text-slate-600">{loc.name}</span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 border-l border-slate-200">{loc.site}</td>
                        <td className="py-2 px-3 text-slate-600 border-l border-slate-200">{loc.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="w-32 flex flex-col gap-4">
                <button
                  onClick={() => setLocationView('display')}
                  disabled={selectedLocations.length === 0}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded font-medium transition-colors"
                >
                  Display
                </button>
                <div className="mt-auto flex gap-2">
                  <button className="flex-1 py-2 bg-slate-200 text-slate-400 rounded font-medium cursor-not-allowed">Previous</button>
                  <button className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors">Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOCATIONS TAB — DISPLAY */}
        {activeTab === 'Locations' && locationView === 'display' && (
          <div className="flex gap-4 h-full overflow-hidden">
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="mb-4">
                <button
                  onClick={() => setLocationView('select')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors text-sm"
                >
                  <ChevronLeft size={16}/> Back to Selection
                </button>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto pr-2 pb-4">
                {selectedLocations.map(loc => {
                  const data = generateLocationData(loc, currentDay);
                  return (
                    <div key={loc} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800 text-sm max-w-[200px] leading-tight">{loc}</h3>
                        <button className="text-[10px] bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors font-medium">
                          View Ward Info
                        </button>
                      </div>
                      {/* Floor plan — full card width */}
                      <div className="w-full border border-slate-200 rounded overflow-hidden mb-3" style={{ aspectRatio: '1.4 / 1' }}>
                        <FloorPlanMini beds={data.beds}/>
                      </div>
                      {/* Stats row */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        {[
                          { icon: <User size={11}/>, label: 'Avg. Occupancy', val: `${data.avgOccupancy}%` },
                          { icon: <Clock size={11}/>, label: 'Avg. Stay (hrs)', val: data.avgStay.toFixed(1) },
                          { icon: <LayoutDashboard size={11}/>, label: 'Total Admissions', val: String(data.totalAdmissions) },
                          { icon: <Users size={11}/>, label: 'Queue Size', val: String(data.queueSize) },
                          { icon: <AlertTriangle size={11}/>, label: 'Delayed Days', val: String(data.delayedDays), valClass: 'text-red-600 font-bold' },
                        ].map((row, i) => (
                          <div key={i} className="flex justify-between items-center py-0.5 border-b border-slate-100">
                            <span className="flex items-center gap-1 text-slate-500">{row.icon} {row.label}</span>
                            <span className={`font-semibold ${row.valClass || ''}`}>{row.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* KEY Sidebar */}
            <div className="w-56 bg-white border border-slate-200 p-5 rounded-lg shadow-sm shrink-0 h-fit">
              <h3 className="font-bold text-sm mb-4 text-slate-800 tracking-wide">KEY</h3>
              <div className="flex flex-col gap-3.5 text-xs text-slate-600">
                {[
                  { color: 'text-[#005EB8]', label: 'Patient Being Treated' },
                  { color: 'text-[#D946A9]', label: 'Patient Waiting to Move' },
                  { color: 'text-[#F59E0B]', label: 'Outlier Being Treated' },
                  { color: 'text-[#6366F1]', label: 'Outlier Waiting to Move' },
                  { color: 'text-[#EF4444]', label: 'Medically Fit' },
                ].map((k, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <User size={16} className={k.color} fill="currentColor"/>
                    <span className="font-medium">{k.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed">
                <strong className="text-slate-700 block mb-1">NOTE</strong>
                Stats do not cover warm-up period. Total admissions may be less than number of beds shown as occupied.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-slate-200 p-3 flex items-center justify-between shrink-0 border-t border-slate-300">
        <div className="flex items-center gap-4 text-slate-500">
          <button className="hover:text-slate-800"><Pause size={18} fill="currentColor"/></button>
          <button className="hover:text-slate-800"><Play size={18} fill="currentColor"/></button>
          <button className="hover:text-slate-800 flex items-center gap-1 text-xs font-bold border border-slate-400 rounded px-1">x1</button>
          <button className="hover:text-slate-800"><RotateCcw size={18}/></button>
          <div className="bg-slate-400 text-white text-xs font-bold px-3 py-1 rounded">x1/25</div>
          <button className="hover:text-slate-800"><FastForward size={18}/></button>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm italic">
            <Activity size={18}/> Running
          </div>
          <button className="hover:text-slate-800"><LayoutDashboard size={18}/></button>
          <button className="hover:text-slate-800"><Settings size={18}/></button>
        </div>
      </div>
    </div>
  );
}
