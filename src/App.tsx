import React, { useState, useMemo } from 'react';
import {
  Search, Activity, Users, Clock,
  BarChart2, LayoutDashboard, AlertTriangle, CheckCircle2,
  Check, User, ActivitySquare,
  ArrowLeft, ArrowRight, Home, Calendar, Inbox, FileText, Printer, Lock, LogOut
} from 'lucide-react';
import { patients, Patient, RiskLevel, generateWardPatients } from './data';
import DigitalTwin from './DigitalTwin';

const WARD_LIST = [
  // floorplan 0 — ward-floorplan.png (5 wards)
  { name: 'Ward 7A',                                     site: 'GRH', type: 'General Medicine',       bedPrefix: '7A',  floorPlan: '/ward-floorplan.png'   },
  { name: 'Ward 1 Medical',                              site: 'Gen', type: 'Medical',                bedPrefix: '1M',  floorPlan: '/ward-floorplan.png'   },
  { name: 'Ward 2 Surgical',                             site: 'Gen', type: 'Surgical',               bedPrefix: '2S',  floorPlan: '/ward-floorplan.png'   },
  { name: 'Ward 3 Cardiology',                           site: 'Gen', type: 'Cardiology',             bedPrefix: '3C',  floorPlan: '/ward-floorplan.png'   },
  { name: 'Ward 4 Gastroenterology',                     site: 'Gen', type: 'Gastroenterology',       bedPrefix: '4G',  floorPlan: '/ward-floorplan.png'   },
  // floorplan 1 — ward-floorplan_1.png (4 wards)
  { name: 'Acute Care Unit C CGH',                       site: 'CGH', type: 'AMU',                    bedPrefix: 'AC',  floorPlan: '/ward-floorplan_1.png' },
  { name: 'Alstone Ward CGH',                            site: 'CGH', type: 'Elective Specialty',     bedPrefix: 'AL',  floorPlan: '/ward-floorplan_1.png' },
  { name: 'Acute Medical Unit 2 GRH',                    site: 'GRH', type: 'AMU',                    bedPrefix: 'AM',  floorPlan: '/ward-floorplan_1.png' },
  { name: 'Avening Ward CGH',                            site: 'CGH', type: 'Elective Specialty',     bedPrefix: 'AV',  floorPlan: '/ward-floorplan_1.png' },
  // floorplan 2 — ward-floorplan_2.png (4 wards)
  { name: 'Bibury Ward CGH',                             site: 'CGH', type: 'Elective Specialty',     bedPrefix: 'BI',  floorPlan: '/ward-floorplan_2.png' },
  { name: 'Cardiac Ward CGH',                            site: 'CGH', type: 'Non-Elective Specialty', bedPrefix: 'CW',  floorPlan: '/ward-floorplan_2.png' },
  { name: 'Cardiology GRH',                              site: 'GRH', type: 'Non-Elective Specialty', bedPrefix: 'CG',  floorPlan: '/ward-floorplan_2.png' },
  { name: 'Dept of Critical Care CGH',                   site: 'CGH', type: 'DCC',                    bedPrefix: 'DC',  floorPlan: '/ward-floorplan_2.png' },
  // floorplan 3 — ward-floorplan_3.png (4 wards)
  { name: 'Dept of Critical Care GRH',                   site: 'GRH', type: 'DCC',                    bedPrefix: 'DG',  floorPlan: '/ward-floorplan_3.png' },
  { name: 'Dixton Ward CGH',                             site: 'CGH', type: 'Elective Specialty',     bedPrefix: 'DI',  floorPlan: '/ward-floorplan_3.png' },
  { name: 'Frailty Assessment Unit GRH',                 site: 'GRH', type: 'Non-Elective Specialty', bedPrefix: 'FA',  floorPlan: '/ward-floorplan_3.png' },
  { name: 'Gloucestershire Priority Admission Unit GRH', site: 'GRH', type: 'GPAU',                   bedPrefix: 'GP',  floorPlan: '/ward-floorplan_3.png' },
];

// Bed positions mapped to the ward floor plan image (as % of image width/height)
const BED_POSITIONS: Record<string, { left: string; top: string }> = {
  '7A-01': { left: '5%',  top: '43%' },  // SAU 636 — bed 1
  '7A-02': { left: '5%',  top: '54%' },  // SAU 636 — bed 2
  '7A-03': { left: '12%', top: '43%' },  // SAU 636 — bed 3
  '7A-04': { left: '29%', top: '32%' },  // 6-Bed Ward 634 — left col 1
  '7A-05': { left: '29%', top: '43%' },  // 6-Bed Ward 634 — left col 2
  '7A-06': { left: '29%', top: '54%' },  // 6-Bed Ward 634 — left col 3
  '7A-07': { left: '41%', top: '32%' },  // 6-Bed Ward 634 — right col 1
  '7A-08': { left: '41%', top: '43%' },  // 6-Bed Ward 634 — right col 2
  '7A-09': { left: '41%', top: '54%' },  // 6-Bed Ward 634 — right col 3
  '7A-10': { left: '7%',  top: '77%' },  // 4-Bed Ward 640
};

function getRiskHex(risk: RiskLevel) {
  if (risk === 'high')   return '#C53030';
  if (risk === 'medium') return '#C05621';
  return '#276749';
}

export default function App() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all');
  const [selectedWard, setSelectedWard] = useState('Ward 7A');
  const [completedInterventions, setCompletedInterventions] = useState<Record<string, boolean>>({});
  const [activeView, setActiveView] = useState<'discharge' | 'digitalTwin' | 'chartReview' | 'snapshot' | 'resultsReview' | 'orders' | 'notes' | 'carePlan'>('discharge');

  const filteredPatients = useMemo(() => {
    const ward = WARD_LIST.find(w => w.name === selectedWard);
    const wardPatients = selectedWard === 'Ward 7A'
      ? patients
      : ward ? generateWardPatients(ward.name, ward.type, ward.bedPrefix) : [];
    return wardPatients.filter(p => {
      const matchesRisk = riskFilter === 'all' || p.risk === riskFilter;
      const matchesSearch = searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nhs.includes(searchQuery) ||
        p.bed.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRisk && matchesSearch;
    });
  }, [selectedWard, searchQuery, riskFilter]);

  const selectedPatient = useMemo(() => {
    return filteredPatients.find(p => p.id === selectedPatientId) || null;
  }, [filteredPatients, selectedPatientId]);

  const toggleIntervention = (patientId: number, interventionIndex: number) => {
    const key = `${patientId}-${interventionIndex}`;
    setCompletedInterventions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const viewLabel = activeView === 'discharge' ? 'Discharge Planning' :
    activeView === 'digitalTwin' ? 'Digital Twin' :
    activeView === 'snapshot' ? 'SnapShot' :
    activeView === 'chartReview' ? 'Chart Review' :
    activeView === 'resultsReview' ? 'Results Review' :
    activeView === 'orders' ? 'Orders' :
    activeView === 'notes' ? 'Notes' : 'Care Plan';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#E6E8EB] text-slate-900 font-sans text-sm">
      {/* EPIC TOP MENU BAR */}
      <div className="bg-[#2B579A] text-white flex items-center px-2 py-1 text-xs font-medium shrink-0">
        <div className="flex space-x-4">
          {['Epic','Desktop','Action','Patient Care','Tools','Reports','Window','Help'].map(item => (
            <span key={item} className="cursor-pointer hover:bg-white/10 px-2 py-1 rounded">{item}</span>
          ))}
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <span>Dr. S. Johnson</span>
          <span>Discharge Coordinator</span>
          <span>Ward 7A</span>
        </div>
      </div>

      {/* EPIC TOOLBAR */}
      <div className="bg-[#F3F5F8] border-b border-slate-300 flex items-center px-2 py-1 shrink-0 gap-1">
        <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><ArrowLeft size={16}/></button>
        <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><ArrowRight size={16}/></button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-200 rounded text-slate-700 font-medium text-xs"><Home size={14}/> Home</button>
        <button className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-200 rounded text-slate-700 font-medium text-xs"><Calendar size={14}/> Schedule</button>
        <button className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-200 rounded text-slate-700 font-medium text-xs"><Inbox size={14}/> In Basket</button>
        <button className="flex items-center gap-1 px-2 py-1.5 hover:bg-slate-200 rounded text-slate-700 font-medium text-xs"><Users size={14}/> Patient Lists</button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <div className="relative flex items-center">
          <Search className="absolute left-2 text-slate-400" size={14}/>
          <input type="text" placeholder="Patient Search" className="pl-7 pr-2 py-1 border border-slate-300 rounded text-xs w-48 focus:outline-none focus:border-blue-500"/>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><Printer size={16}/></button>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><Lock size={16}/></button>
          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600"><LogOut size={16}/></button>
        </div>
      </div>

      {/* EPIC TAB BAR */}
      <div className="bg-[#E6E8EB] flex items-end px-2 pt-1 gap-1 shrink-0 border-b border-slate-300">
        <div className="bg-slate-300 px-4 py-1.5 rounded-t-md text-xs font-medium text-slate-600 cursor-pointer border border-b-0 border-slate-400">Epic</div>
        <div className="bg-slate-300 px-4 py-1.5 rounded-t-md text-xs font-medium text-slate-600 cursor-pointer border border-b-0 border-slate-400">Home</div>
        <div className="bg-white px-4 py-1.5 rounded-t-md text-xs font-bold text-slate-800 cursor-pointer border border-b-0 border-slate-300 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] relative">
          {viewLabel}
          <div className="absolute bottom-[-1px] left-0 right-0 h-px bg-white"></div>
        </div>
      </div>

      {/* PATIENT BANNER */}
      {selectedPatient && activeView !== 'digitalTwin' && activeView !== 'discharge' && (
        <div className="bg-[#FFF9C4] border-b border-[#FBC02D] px-4 py-2 flex items-center gap-6 shrink-0 text-xs">
          <div className="font-bold text-sm">{selectedPatient.name}</div>
          <div className="flex items-center gap-4 text-slate-700">
            <span><span className="font-semibold">Sex:</span> {selectedPatient.sex}</span>
            <span><span className="font-semibold">Age:</span> {selectedPatient.age}</span>
            <span><span className="font-semibold">DOB:</span> 12/05/1945</span>
            <span><span className="font-semibold">MRN:</span> {selectedPatient.nhs}</span>
            <span><span className="font-semibold">Loc:</span> {selectedPatient.bed}</span>
            <span><span className="font-semibold">Admit:</span> {formatDate(new Date(Date.now() - selectedPatient.los * 24 * 60 * 60 * 1000).toISOString())}</span>
          </div>
          <div className="ml-auto flex gap-2">
            <span className={`px-2 py-0.5 rounded font-bold ${getRiskBadgeClasses(selectedPatient.risk)}`}>
              {selectedPatient.risk.toUpperCase()} RISK
            </span>
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden bg-white">

        {/* LEFT SIDEBAR */}
        <div className="w-48 bg-[#F3F5F8] border-r border-slate-300 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-2 font-bold text-slate-700 border-b border-slate-300 bg-slate-200">Activities</div>
          <div className="py-1">
            <SidebarItem label="SnapShot" icon={<LayoutDashboard size={14}/>} active={activeView === 'snapshot'} onClick={() => setActiveView('snapshot')} />
            <SidebarItem label="Chart Review" icon={<FileText size={14}/>} active={activeView === 'chartReview'} onClick={() => setActiveView('chartReview')} />
            <SidebarItem label="Results Review" icon={<ActivitySquare size={14}/>} active={activeView === 'resultsReview'} onClick={() => setActiveView('resultsReview')} />
            <SidebarItem label="Orders" icon={<Activity size={14}/>} active={activeView === 'orders'} onClick={() => setActiveView('orders')} />
            <div className="my-1 border-t border-slate-300"></div>
            <SidebarItem label="Discharge Planning" icon={<Users size={14}/>} active={activeView === 'discharge'} onClick={() => setActiveView('discharge')} />
            <SidebarItem label="Digital Twin" icon={<BarChart2 size={14}/>} active={activeView === 'digitalTwin'} onClick={() => setActiveView('digitalTwin')} />
            <div className="my-1 border-t border-slate-300"></div>
            <SidebarItem label="Notes" icon={<FileText size={14}/>} active={activeView === 'notes'} onClick={() => setActiveView('notes')} />
            <SidebarItem label="Care Plan" icon={<CheckCircle2 size={14}/>} active={activeView === 'carePlan'} onClick={() => setActiveView('carePlan')} />
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeView === 'digitalTwin' ? (
            <DigitalTwin />
          ) : activeView === 'discharge' ? (
            <div className="flex-1 flex overflow-hidden">

              {/* COL 1 — PATIENT LIST */}
              <div className="w-[420px] border-r border-slate-300 flex flex-col bg-white shrink-0">
                <div className="p-2 border-b border-slate-300 bg-slate-50 flex flex-col gap-2 shrink-0">
                  {/* Ward dropdown */}
                  <select
                    value={selectedWard}
                    onChange={(e) => { setSelectedWard(e.target.value); setSelectedPatientId(null); }}
                    className="w-full border border-slate-300 rounded text-xs px-2 py-1.5 bg-white focus:outline-none focus:border-blue-500 text-slate-700 font-medium"
                  >
                    {WARD_LIST.map(w => (
                      <option key={w.name} value={w.name}>
                        {w.name} — {w.site} · {w.type}
                      </option>
                    ))}
                  </select>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                    <input
                      type="text"
                      placeholder="Filter list..."
                      className="w-full pl-7 pr-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-1">
                    <FilterButton active={riskFilter === 'all'} onClick={() => setRiskFilter('all')}>All</FilterButton>
                    <FilterButton active={riskFilter === 'high'} onClick={() => setRiskFilter('high')} dotColor="bg-[#C53030]">High</FilterButton>
                    <FilterButton active={riskFilter === 'medium'} onClick={() => setRiskFilter('medium')} dotColor="bg-[#C05621]">Medium</FilterButton>
                    <FilterButton active={riskFilter === 'low'} onClick={() => setRiskFilter('low')} dotColor="bg-[#276749]">Low</FilterButton>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-slate-100 shadow-sm z-10">
                      <tr className="border-b border-slate-300 text-slate-600">
                        <th className="py-1.5 px-3 font-medium">Patient</th>
                        <th className="py-1.5 px-3 font-medium">Bed</th>
                        <th className="py-1.5 px-3 font-medium">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-xs text-slate-400 italic">
                            No patients found for {selectedWard}
                          </td>
                        </tr>
                      )}
                      {filteredPatients.map((p) => (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedPatientId(p.id)}
                          className={`border-b border-slate-200 cursor-pointer hover:bg-blue-50 transition-colors ${selectedPatientId === p.id ? 'bg-blue-100' : ''}`}
                        >
                          <td className="py-2 px-3">
                            <div className="font-semibold text-slate-800">{p.name}</div>
                            <div className="text-[10px] text-slate-500">{p.nhs}</div>
                          </td>
                          <td className="py-2 px-3 text-slate-600">{p.bed}</td>
                          <td className="py-2 px-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${getRiskDotColor(p.risk)}`}/>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* COL 2 — FLOOR PLAN + PATIENT TRAJECTORY */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 border-r border-slate-200">
                {/* Patient header card */}
                <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-3">
                  {selectedPatient ? (
                    <>
                      <h2 className="font-bold text-base text-slate-900">{selectedPatient.name}</h2>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-600 mt-1">
                        <span>A: {selectedPatient.age}{selectedPatient.sex}</span>
                        <span>NHS: {selectedPatient.nhs}</span>
                        <span>Bed: {selectedPatient.bed}</span>
                        <span>LoS: {selectedPatient.los} days</span>
                        <span>Consultant: {selectedPatient.consultant}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-700">
                        <strong className="text-slate-800">Dx:</strong> {selectedPatient.diagnosis}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Select a patient to view their location</p>
                  )}
                </div>

                {/* Floor plan */}
                <div className="flex-1 relative overflow-hidden m-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <img
                    src={WARD_LIST.find(w => w.name === selectedWard)?.floorPlan ?? '/ward-floorplan.png'}
                    alt={`${selectedWard} Floor Plan`}
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {/* Patient bed dots */}
                  {patients.map((p) => {
                    const pos = BED_POSITIONS[p.bed];
                    if (!pos) return null;
                    const isSelected = p.id === selectedPatientId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPatientId(p.id)}
                        title={`${p.name} — ${p.bed}`}
                        className={`absolute cursor-pointer rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 ${
                          isSelected
                            ? 'w-5 h-5 ring-2 ring-offset-1 ring-blue-500 animate-pulse z-10'
                            : 'w-3.5 h-3.5 z-0'
                        }`}
                        style={{ left: pos.left, top: pos.top, backgroundColor: getRiskHex(p.risk) }}
                      />
                    );
                  })}
                </div>

                {/* Ward Stats bar */}
                {(() => {
                  const totalBeds = 12;
                  const occupied = patients.length;
                  const avgOccupancy = Math.round((occupied / totalBeds) * 100);
                  const avgStayHrs = Math.round((patients.reduce((s, p) => s + p.los, 0) / patients.length) * 24 * 10) / 10;
                  const totalAdmissions = patients.length + 25; // includes discharged
                  const queueSize = patients.filter(p => p.risk === 'high').length;
                  const delayedDays = patients.reduce((s, p) => s + p.riskFactors.filter(r => r.tag === 'critical').length, 0);
                  const stats = [
                    { icon: <User size={12}/>,          label: 'Avg. Occupancy',    val: `${avgOccupancy}%`,           cls: '' },
                    { icon: <Clock size={12}/>,         label: 'Avg. Stay (hrs)',   val: `${avgStayHrs}`,              cls: '' },
                    { icon: <LayoutDashboard size={12}/>, label: 'Total Admissions', val: `${totalAdmissions}`,         cls: '' },
                    { icon: <Users size={12}/>,         label: 'Queue Size',        val: `${queueSize}`,               cls: '' },
                    { icon: <AlertTriangle size={12}/>, label: 'Delayed Days',      val: `${delayedDays}`,             cls: 'text-red-600 font-bold' },
                  ];
                  return (
                    <div className="shrink-0 bg-white border-t border-slate-200 px-4 py-2 grid grid-cols-2 gap-x-6 gap-y-1">
                      {stats.map(({ icon, label, val, cls }) => (
                        <div key={label} className="flex items-center justify-between text-xs py-0.5">
                          <span className="flex items-center gap-1.5 text-slate-500">{icon} {label}</span>
                          <span className={`font-semibold ${cls || 'text-slate-800'}`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* COL 3 — DISCHARGE DETAILS */}
              <div className="w-[380px] overflow-y-auto bg-slate-50 shrink-0 flex flex-col">
                {selectedPatient ? (
                  <div className="p-4 space-y-4">
                    {/* Risk Banner */}
                    <div className={`p-4 rounded-lg flex items-center gap-3 border ${getRiskBadgeClasses(selectedPatient.risk)} shadow-sm`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${getRiskIconBg(selectedPatient.risk)} text-white`}>
                        {selectedPatient.risk === 'low' ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${getRiskTextColor(selectedPatient.risk)}`}>
                          {selectedPatient.risk === 'high' ? 'High Risk of Delayed Discharge' :
                           selectedPatient.risk === 'medium' ? 'Medium Risk of Delayed Discharge' :
                           'Low Risk — On Track'}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {selectedPatient.risk === 'high'
                            ? `${selectedPatient.riskFactors.filter(r => r.tag === 'critical').length} critical bottlenecks identified. Immediate action required.`
                            : selectedPatient.risk === 'medium'
                            ? 'Moderate barriers present. Proactive steps recommended.'
                            : 'All discharge tasks progressing normally. Monitor for changes.'}
                        </div>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <AlertTriangle size={12}/> Risk Factors Identified
                      </div>
                      <div className="divide-y divide-slate-100">
                        {selectedPatient.riskFactors.map((rf, idx) => (
                          <div key={idx} className="flex gap-3 p-4">
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-sm font-bold ${getFactorIconClasses(rf.icon)}`}>
                              {rf.icon === 'critical' ? '!' : rf.icon === 'warning' ? '~' : 'i'}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{rf.title}</div>
                              <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">{rf.desc}</div>
                              {rf.tag && (
                                <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1.5 ${getFactorTagClasses(rf.tag)}`}>
                                  {rf.tagLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interventions */}
                    <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Activity size={12}/> Recommended Interventions
                      </div>
                      <div className="divide-y divide-slate-100">
                        {selectedPatient.interventions.map((iv, idx) => {
                          const isDone = completedInterventions[`${selectedPatient.id}-${idx}`];
                          return (
                            <div key={idx} className="flex gap-3 p-4 items-start">
                              <button
                                onClick={() => toggleIntervention(selectedPatient.id, idx)}
                                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isDone ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 hover:border-blue-500'
                                }`}
                              >
                                {isDone && <Check size={12} strokeWidth={3}/>}
                              </button>
                              <div>
                                <div className={`text-xs font-bold ${isDone ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{iv.title}</div>
                                <div className={`text-[11px] mt-1 ${isDone ? 'opacity-60' : 'text-slate-600'}`}>{iv.desc}</div>
                                <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1.5 ${getPriorityClasses(iv.priority, isDone)}`}>
                                  {iv.priority}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Clock size={12}/> Patient Journey Timeline
                      </div>
                      <div className="p-4 space-y-0">
                        {selectedPatient.timeline.map((t, idx) => (
                          <div key={idx} className="flex gap-3 text-[11px]">
                            <div className="font-mono text-[10px] text-slate-500 w-10 shrink-0 pt-0.5">{t.time}</div>
                            <div className="flex flex-col items-center">
                              <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${getTimelineDotColor(t.status)}`}/>
                              {idx < selectedPatient.timeline.length - 1 && (
                                <div className="w-px flex-1 bg-slate-200 my-1 min-h-[16px]"/>
                              )}
                            </div>
                            <div
                              className="text-slate-600 pb-3 pt-0.5"
                              dangerouslySetInnerHTML={{ __html: t.text.replace(/<strong>/g, '<strong class="text-slate-900 font-semibold">') }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm p-8 text-center">
                    Select a patient from the list to view discharge planning details.
                  </div>
                )}
              </div>
            </div>
          ) : !selectedPatient ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Select a patient from the Discharge Planning list to view their chart.
            </div>
          ) : activeView === 'snapshot' ? (
            <SnapshotView patient={selectedPatient} />
          ) : activeView === 'resultsReview' ? (
            <ResultsReviewView />
          ) : activeView === 'orders' ? (
            <OrdersView />
          ) : activeView === 'notes' ? (
            <NotesView />
          ) : activeView === 'chartReview' ? (
            <ChartReviewView />
          ) : activeView === 'carePlan' ? (
            <CarePlanView patient={selectedPatient} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function SidebarItem({ icon, label, active, badge, onClick }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string, onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer transition-colors font-bold ${
        active ? 'bg-[#cde1f8] text-black border-l-4 border-[#2b579a]' : 'text-black hover:bg-slate-200 border-l-4 border-transparent'
      }`}
    >
      <span className={active ? 'text-[#2b579a]' : 'text-slate-600'}>{icon}</span>
      {label}
      {badge && (
        <span className="ml-auto bg-[#C53030] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
          {badge}
        </span>
      )}
    </div>
  );
}

function FilterButton({ children, active, onClick, dotColor }: { children: React.ReactNode, active: boolean, onClick: () => void, dotColor?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-medium transition-colors ${
        active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
      }`}
    >
      {dotColor && <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : dotColor}`}></span>}
      {children}
    </button>
  );
}

// --- Helper Functions ---

function getRiskDotColor(risk: RiskLevel) {
  if (risk === 'high') return 'bg-[#C53030]';
  if (risk === 'medium') return 'bg-[#C05621]';
  return 'bg-[#276749]';
}

function getRiskBadgeClasses(risk: RiskLevel) {
  if (risk === 'high') return 'bg-[#FFF5F5] text-[#C53030] border-[#FEB2B2]';
  if (risk === 'medium') return 'bg-[#FFFAF0] text-[#C05621] border-[#FEEBC8]';
  return 'bg-[#F0FFF4] text-[#276749] border-[#C6F6D5]';
}

function getRiskIconBg(risk: RiskLevel) {
  if (risk === 'high') return 'bg-[#C53030]';
  if (risk === 'medium') return 'bg-[#C05621]';
  return 'bg-[#276749]';
}

function getRiskTextColor(risk: RiskLevel) {
  if (risk === 'high') return 'text-[#C53030]';
  if (risk === 'medium') return 'text-[#C05621]';
  return 'text-[#276749]';
}

function getFactorIconClasses(icon: string) {
  if (icon === 'critical') return 'bg-[#FFF5F5] text-[#C53030] font-bold';
  if (icon === 'warning') return 'bg-[#FFFAF0] text-[#C05621] font-bold';
  return 'bg-blue-50 text-blue-600 font-bold font-serif italic';
}

function getFactorTagClasses(tag: string) {
  if (tag === 'critical') return 'bg-[#FFF5F5] text-[#C53030]';
  if (tag === 'warning') return 'bg-[#FFFAF0] text-[#C05621]';
  return 'bg-slate-100 text-slate-600';
}

function getPriorityClasses(priority: string, isDone: boolean) {
  if (isDone) return 'bg-slate-100 text-slate-400';
  if (priority === 'urgent') return 'bg-[#FFF5F5] text-[#C53030]';
  if (priority === 'recommended') return 'bg-[#FFFAF0] text-[#C05621]';
  return 'bg-slate-100 text-slate-500';
}

function getTimelineDotColor(status: string) {
  if (status === 'done') return 'bg-[#276749]';
  if (status === 'pending') return 'bg-[#C05621]';
  if (status === 'blocked') return 'bg-[#C53030]';
  return 'bg-slate-300';
}

// --- View Components ---

function SnapshotView({ patient }: { patient: Patient }) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F2F5] p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-300 rounded shadow-sm">
          <div className="bg-[#D3E1F1] px-2 py-1 font-bold text-blue-900 border-b border-slate-300 text-xs">Vitals</div>
          <div className="p-2 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">BP</span><span className="font-bold">132/84</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Pulse</span><span className="font-bold">78</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Temp</span><span className="font-bold">37.1 °C</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Resp</span><span className="font-bold">16</span></div>
            <div className="flex justify-between"><span className="text-slate-500">SpO2</span><span className="font-bold">96%</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Wt</span><span className="font-bold">74.2 kg</span></div>
          </div>
        </div>
        <div className="bg-white border border-slate-300 rounded shadow-sm">
          <div className="bg-[#D3E1F1] px-2 py-1 font-bold text-blue-900 border-b border-slate-300 text-xs">Active Problems</div>
          <div className="p-2 space-y-2 text-xs">
            <div>• {patient.diagnosis}</div>
            <div>• Essential hypertension</div>
            <div>• Type 2 diabetes mellitus</div>
            <div>• Hyperlipidemia</div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-slate-300 rounded shadow-sm">
            <div className="bg-[#D3E1F1] px-2 py-1 font-bold text-blue-900 border-b border-slate-300 text-xs">Allergies</div>
            <div className="p-2 text-xs text-red-600 font-bold">• Penicillin (Hives)</div>
          </div>
          <div className="bg-white border border-slate-300 rounded shadow-sm">
            <div className="bg-[#D3E1F1] px-2 py-1 font-bold text-blue-900 border-b border-slate-300 text-xs">Care Team</div>
            <div className="p-2 space-y-1 text-xs">
              <div><span className="text-slate-500">Attending:</span> {patient.consultant}</div>
              <div><span className="text-slate-500">Primary RN:</span> Sarah Jenkins</div>
              <div><span className="text-slate-500">Case Mgr:</span> David Chen</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsReviewView() {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="bg-[#F3F5F8] p-2 border-b border-slate-300 flex gap-2 shrink-0">
        <button className="bg-white border border-slate-300 px-3 py-1 rounded text-xs font-medium hover:bg-slate-50">Lab</button>
        <button className="bg-white border border-slate-300 px-3 py-1 rounded text-xs font-medium hover:bg-slate-50">Imaging</button>
        <button className="bg-white border border-slate-300 px-3 py-1 rounded text-xs font-medium hover:bg-slate-50">Micro</button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300">
              <th className="text-left p-2 border-r border-slate-300">Component</th>
              <th className="text-left p-2 border-r border-slate-300">Ref Range</th>
              <th className="text-left p-2 border-r border-slate-300">Today 06:00</th>
              <th className="text-left p-2 border-r border-slate-300">Yesterday 06:00</th>
              <th className="text-left p-2">2 Days Ago</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Sodium', ref: '136-145', v: ['138','137','139'], flags: [false,false,false] },
              { name: 'Potassium', ref: '3.5-5.1', v: ['3.2 (L)','3.6','3.8'], flags: [true,false,false] },
              { name: 'Creatinine', ref: '0.6-1.2', v: ['1.4 (H)','1.5 (H)','1.6 (H)'], flags: [true,true,true] },
              { name: 'WBC', ref: '4.5-11.0', v: ['12.4 (H)','14.2 (H)','16.8 (H)'], flags: [true,true,true] },
              { name: 'Hemoglobin', ref: '12.0-16.0', v: ['12.5','12.6','12.8'], flags: [false,false,false] },
            ].map(row => (
              <tr key={row.name} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="p-2 border-r border-slate-300 font-medium">{row.name}</td>
                <td className="p-2 border-r border-slate-300 text-slate-500">{row.ref}</td>
                {row.v.map((val, i) => (
                  <td key={i} className={`p-2 border-r border-slate-300 last:border-r-0 ${row.flags[i] ? 'text-red-600 font-bold' : ''}`}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersView() {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="bg-[#F3F5F8] p-2 border-b border-slate-300 flex gap-2 shrink-0 items-center">
        <span className="font-bold text-slate-700 text-xs mr-2">Active Orders</span>
        <button className="bg-blue-600 text-white border border-blue-700 px-3 py-1 rounded text-xs font-medium hover:bg-blue-700">New Order</button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          <div className="bg-[#D3E1F1] px-2 py-1 font-bold text-blue-900 border border-slate-300 text-xs">Medications</div>
          <table className="w-full text-xs border-collapse border border-t-0 border-slate-300">
            <tbody>
              {[
                { name: 'Ceftriaxone (ROCEPHIN) 1 g in NaCl 0.9% 50 mL IVPB', freq: 'Q24H' },
                { name: 'Lisinopril (PRINIVIL) 10 mg tablet', freq: 'Daily' },
                { name: 'Metformin (GLUCOPHAGE) 500 mg tablet', freq: 'BID with meals' },
              ].map((med, i) => (
                <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-2 w-8"><Activity size={14} className="text-blue-600"/></td>
                  <td className="p-2 font-medium">{med.name}</td>
                  <td className="p-2 text-slate-500">{med.freq}</td>
                  <td className="p-2 text-emerald-600 font-medium">Active</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-4">
          <div className="bg-[#D3E1F1] px-2 py-1 font-bold text-blue-900 border border-slate-300 text-xs">Nursing/Diet/Activity</div>
          <table className="w-full text-xs border-collapse border border-t-0 border-slate-300">
            <tbody>
              {[
                { name: 'Vital Signs', freq: 'Q4H' },
                { name: 'Diet - Consistent Carbohydrate', freq: 'Now' },
                { name: 'Activity - Up ad lib', freq: 'Now' },
              ].map((order, i) => (
                <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-2 w-8"><CheckCircle2 size={14} className="text-slate-400"/></td>
                  <td className="p-2 font-medium">{order.name}</td>
                  <td className="p-2 text-slate-500">{order.freq}</td>
                  <td className="p-2 text-emerald-600 font-medium">Active</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NotesView() {
  return (
    <div className="flex-1 flex bg-white overflow-hidden">
      <div className="w-1/3 border-r border-slate-300 flex flex-col">
        <div className="bg-[#F3F5F8] p-2 border-b border-slate-300 flex gap-2 shrink-0">
          <button className="bg-blue-600 text-white border border-blue-700 px-3 py-1 rounded text-xs font-medium hover:bg-blue-700">New Note</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[
            { title: 'Progress Note', meta: 'Today 08:30 • Dr. R. Patel', active: true },
            { title: 'Physical Therapy Eval', meta: 'Yesterday 14:15 • S. Miller, PT', active: false },
            { title: 'History & Physical', meta: 'Admit Date • Dr. J. Smith', active: false },
          ].map((note, i) => (
            <div key={i} className={`p-3 border-b border-slate-200 cursor-pointer ${note.active ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
              <div className={`font-bold text-xs ${note.active ? 'text-blue-900' : 'text-slate-800'}`}>{note.title}</div>
              <div className="text-[10px] text-slate-500 mt-1">{note.meta}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed">
        <h2 className="text-sm font-bold mb-4 font-sans">Progress Note - Medicine</h2>
        <p className="mb-4"><strong>Date/Time:</strong> Today 08:30</p>
        <p className="mb-4"><strong>Subjective:</strong><br/>Patient reports feeling much better today. Shortness of breath has improved. Cough is less productive. Denies chest pain, nausea, or vomiting. Slept well overnight.</p>
        <p className="mb-4"><strong>Objective:</strong><br/>Vitals: T 37.1, HR 78, BP 132/84, RR 16, SpO2 96% on RA.<br/>Gen: NAD, conversant.<br/>Resp: CTAB, no wheezes or rales appreciated today.<br/>CV: RRR, no m/r/g.<br/>Ext: No edema.</p>
        <p className="mb-4"><strong>Assessment & Plan:</strong><br/>82yo F admitted with CAP and COPD exacerbation. Improving.<br/>1. CAP: Continue Ceftriaxone. Transition to oral antibiotics tomorrow if afebrile.<br/>2. COPD: Continue inhalers. Wean nebs.<br/>3. Dispo: PT cleared yesterday. Awaiting pharmacy for TTOs and care home bed availability. High risk of delayed discharge due to placement.</p>
        <p className="mt-8 text-slate-500">Signed by: Dr. R. Patel, Attending Physician</p>
      </div>
    </div>
  );
}

function CarePlanView({ patient }: { patient: Patient | null }) {
  if (!patient) return null;
  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F2F5] p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="bg-white border border-slate-300 rounded shadow-sm">
          <div className="bg-[#D3E1F1] px-3 py-1.5 font-bold text-blue-900 border-b border-slate-300 text-xs">Goals of Care</div>
          <div className="p-3 space-y-2 text-xs">
            {[
              'Safe discharge to appropriate care setting within estimated discharge date',
              `Optimise management of ${patient.diagnosis}`,
              'Prevent readmission through community follow-up and patient education',
            ].map((goal, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#276749] mt-1.5 shrink-0"></div>
                <span>{goal}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-300 rounded shadow-sm">
          <div className="bg-[#D3E1F1] px-3 py-1.5 font-bold text-blue-900 border-b border-slate-300 text-xs">Discharge Pathway</div>
          <div className="p-3 text-xs space-y-1">
            <div className="flex justify-between"><span className="text-slate-500">Pathway</span><span className="font-semibold">{patient.pathway === 0 ? '0 — Home' : patient.pathway === 1 ? '1 — Home with support' : patient.pathway === 2 ? '2 — Rehab' : '3 — Care home'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Estimated Discharge</span><span className="font-semibold">{patient.forecast}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">AI Confidence</span><span className="font-semibold">{patient.forecastConf}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Consultant</span><span className="font-semibold">{patient.consultant}</span></div>
          </div>
        </div>
        <div className="bg-white border border-slate-300 rounded shadow-sm">
          <div className="bg-[#D3E1F1] px-3 py-1.5 font-bold text-blue-900 border-b border-slate-300 text-xs">Pending Actions</div>
          <div className="p-3 space-y-2 text-xs">
            {patient.interventions.map((iv, i) => (
              <div key={i} className="flex items-start gap-2 pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${iv.priority === 'urgent' ? 'bg-[#C53030]' : iv.priority === 'recommended' ? 'bg-[#C05621]' : 'bg-slate-400'}`}></div>
                <div>
                  <div className="font-semibold text-slate-800">{iv.title}</div>
                  <div className="text-slate-500 mt-0.5">{iv.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartReviewView() {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden p-4">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Chart Review</h2>
      <div className="flex gap-4 border-b border-slate-300 pb-2 mb-4">
        <button className="font-bold text-blue-700 border-b-2 border-blue-700 pb-2 -mb-[9px]">Encounters</button>
        {['Notes','Labs','Imaging','Cardiology'].map(t => (
          <button key={t} className="font-medium text-slate-600 hover:text-slate-900 pb-2">{t}</button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Provider</th>
              <th className="text-left p-2">Department</th>
              <th className="text-left p-2">Diagnosis</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: 'Today', type: 'Progress Note', provider: 'Dr. R. Patel', dept: 'General Medicine', dx: 'Pneumonia' },
              { date: 'Yesterday', type: 'PT Evaluation', provider: 'S. Miller, PT', dept: 'Physical Therapy', dx: 'Mobility Assessment' },
              { date: 'Admit Date', type: 'History & Physical', provider: 'Dr. J. Smith', dept: 'Emergency Dept', dx: 'Pneumonia, COPD Exac' },
              { date: 'Admit Date', type: 'ED Provider Note', provider: 'Dr. A. Lee', dept: 'Emergency Dept', dx: 'SOB, Fever' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer">
                <td className="p-2">{row.date}</td>
                <td className="p-2 font-medium text-blue-600">{row.type}</td>
                <td className="p-2">{row.provider}</td>
                <td className="p-2">{row.dept}</td>
                <td className="p-2">{row.dx}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
