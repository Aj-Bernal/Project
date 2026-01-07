import React, { useState, useEffect } from 'react';
import { Users, Plus, AlertCircle, Clock, Activity, Calendar, TrendingUp, Download, Trash2, X } from 'lucide-react';

const HospitalTriageSystem = () => {
  const [patients, setPatients] = useState([]);
  const [queue, setQueue] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [algorithm, setAlgorithm] = useState('NPP');
  const [nextId, setNextId] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newPatient, setNewPatient] = useState({
    name: '', age: '', condition: '', severity: '3', estimatedTime: ''
  });

  const severityLevels = {
    1: { label: 'Critical', bg: '#dc2626', border: '#ef4444' },
    2: { label: 'Urgent', bg: '#f97316', border: '#fb923c' },
    3: { label: 'Moderate', bg: '#eab308', border: '#facc15' },
    4: { label: 'Minor', bg: '#16a34a', border: '#22c55e' }
  };

  const addPatient = () => {
    if (!newPatient.name || !newPatient.condition || !newPatient.estimatedTime) {
      alert('Please fill in all required fields');
      return;
    }

    const patient = {
      id: nextId,
      name: newPatient.name,
      age: parseInt(newPatient.age) || 0,
      condition: newPatient.condition,
      severity: parseInt(newPatient.severity),
      estimatedTime: parseInt(newPatient.estimatedTime),
      arrivalTime: currentTime,
      status: 'waiting'
    };

    setPatients([...patients, patient]);
    setNextId(nextId + 1);
    setShowAddForm(false);
    setNewPatient({ name: '', age: '', condition: '', severity: '3', estimatedTime: '' });
  };

  const processQueue = () => {
    const waiting = patients.filter(p => p.status === 'waiting');
    let sorted = [];

    if (algorithm === 'FCFS') {
      sorted = [...waiting].sort((a, b) => a.arrivalTime - b.arrivalTime);
    } else if (algorithm === 'SJF' || algorithm === 'SRTF') {
      sorted = [...waiting].sort((a, b) => a.estimatedTime - b.estimatedTime || a.arrivalTime - b.arrivalTime);
    } else if (algorithm === 'NPP') {
      sorted = [...waiting].sort((a, b) => a.severity - b.severity || a.arrivalTime - b.arrivalTime);
    }

    setQueue(sorted);
  };

  useEffect(() => {
    processQueue();
  }, [patients, algorithm]);

  const startTreatment = () => {
    if (queue.length === 0 || currentPatient) return;
    const next = queue[0];
    setPatients(patients.map(p => p.id === next.id ? { ...p, status: 'in-treatment', startTime: currentTime } : p));
    setCurrentPatient({ ...next, startTime: currentTime });
  };

  const completeTreatment = () => {
    if (!currentPatient) return;
    const endTime = currentTime + currentPatient.estimatedTime;
    const waitingTime = currentPatient.startTime - currentPatient.arrivalTime;
    const turnaroundTime = endTime - currentPatient.arrivalTime;

    setCompleted([...completed, { ...currentPatient, endTime, waitingTime, turnaroundTime }]);
    setPatients(patients.filter(p => p.id !== currentPatient.id));
    setCurrentPatient(null);
    setCurrentTime(endTime);
  };

  const calculateStatistics = () => {
    if (completed.length === 0) return null;
    const avgWait = (completed.reduce((sum, p) => sum + p.waitingTime, 0) / completed.length).toFixed(1);
    const avgTurn = (completed.reduce((sum, p) => sum + p.turnaroundTime, 0) / completed.length).toFixed(1);
    return {
      avgWait,
      avgTurn,
      total: completed.length,
      critical: completed.filter(p => p.severity === 1).length
    };
  };

  const stats = calculateStatistics();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e3a8a, #0f172a)', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'linear-gradient(135deg, #ef4444, #ec4899)', padding: '16px', borderRadius: '16px' }}>
                <Activity style={{ color: 'white' }} size={40} />
              </div>
              <div>
                <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>ER Triage System</h1>
                <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Emergency Room Patient Management</p>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', padding: '24px', borderRadius: '16px', color: 'white', textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.9 }}>Current Time</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{currentTime} <span style={{ fontSize: '18px' }}>min</span></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px' }}>
              <label style={{ fontWeight: 'bold', color: '#334155' }}>Algorithm:</label>
              <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} disabled={currentPatient !== null} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '14px', fontWeight: 600 }}>
                <option value="NPP">🚨 Priority (Critical First) - NPP</option>
                <option value="FCFS">⏰ First Come First Serve - FCFS</option>
                <option value="SJF">⚡ Shortest Job First - SJF</option>
                <option value="SRTF">🔄 Shortest Remaining Time - SRTF</option>
              </select>
            </div>
            <button onClick={() => setShowAddForm(true)} style={{ background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20} /> New Patient
            </button>
            <button onClick={() => {
              const data = { patients, completed, currentTime };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `triage-${Date.now()}.json`;
              a.click();
            }} style={{ background: 'linear-gradient(to right, #3b82f6, #06b6d4)', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={20} /> Export
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Main Content */}
          <div>
            {/* Currently Treating */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '24px', borderTop: '4px solid #10b981', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Activity style={{ color: '#16a34a' }} size={28} /> Currently Treating
              </h2>
              {currentPatient ? (
                <div style={{ background: 'linear-gradient(135deg, #dcfce7, #d1fae5)', border: '2px solid #86efac', borderRadius: '16px', padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }}>{currentPatient.name}</div>
                      <div style={{ color: '#64748b', fontSize: '18px' }}>Age: {currentPatient.age} • ID: #{currentPatient.id}</div>
                    </div>
                    <span style={{ background: severityLevels[currentPatient.severity].bg, color: 'white', padding: '12px 24px', borderRadius: '9999px', fontWeight: 'bold' }}>
                      {severityLevels[currentPatient.severity].label}
                    </span>
                  </div>
                  <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                    <strong>Condition:</strong> {currentPatient.condition}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '16px 24px' }}>
                      <div style={{ marginBottom: '8px' }}><strong>Started:</strong> {currentPatient.startTime} min</div>
                      <div><strong>Duration:</strong> {currentPatient.estimatedTime} min</div>
                    </div>
                    <button onClick={completeTreatment} style={{ background: 'linear-gradient(to right, #3b82f6, #06b6d4)', color: 'white', padding: '16px 32px', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                      ✓ Complete
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '64px', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                  <AlertCircle size={64} style={{ margin: '0 auto 24px', color: '#94a3b8' }} />
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#64748b', marginBottom: '16px' }}>No patient in treatment</p>
                  {queue.length > 0 && (
                    <button onClick={startTreatment} style={{ background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', padding: '16px 40px', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                      Start Next Patient →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Waiting Queue */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', borderTop: '4px solid #3b82f6', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users style={{ color: '#2563eb' }} size={28} /> Waiting Queue <span style={{ background: '#3b82f6', color: 'white', padding: '4px 16px', borderRadius: '9999px' }}>{queue.length}</span>
              </h2>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {queue.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '64px', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                    <Clock size={64} style={{ margin: '0 auto 24px', color: '#94a3b8' }} />
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#64748b' }}>No patients in queue</p>
                  </div>
                ) : (
                  queue.map((patient, index) => (
                    <div key={patient.id} style={{ background: 'white', borderLeft: `8px solid ${severityLevels[patient.severity].border}`, borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', color: 'white', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px' }}>
                              {index + 1}
                            </span>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#1e293b' }}>{patient.name}</div>
                              <div style={{ color: '#64748b' }}>Age: {patient.age} • ID: #{patient.id}</div>
                            </div>
                          </div>
                          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
                            <strong>Condition:</strong> {patient.condition}
                          </div>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b', background: '#f8fafc', borderRadius: '12px', padding: '8px 16px' }}>
                            <span>⏰ Arrived: {patient.arrivalTime}m</span>
                            <span>⏱️ Est: {patient.estimatedTime}m</span>
                            <span style={{ fontWeight: 'bold', color: '#dc2626' }}>⌛ Waiting: {currentTime - patient.arrivalTime}m</span>
                          </div>
                        </div>
                        <span style={{ background: severityLevels[patient.severity].bg, color: 'white', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', height: 'fit-content', marginLeft: '16px' }}>
                          {severityLevels[patient.severity].label}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Statistics */}
            {stats && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', borderTop: '4px solid #a855f7', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp style={{ color: '#a855f7' }} size={24} /> Statistics
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.9 }}>Avg Waiting Time</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.avgWait} <span style={{ fontSize: '16px' }}>min</span></div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.9 }}>Avg Turnaround</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.avgTurn} <span style={{ fontSize: '16px' }}>min</span></div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.9 }}>Total Treated</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.total}</div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.9 }}>Critical Cases</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.critical}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Completed */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', borderTop: '4px solid #10b981', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar style={{ color: '#16a34a' }} size={24} /> Completed <span style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '9999px', fontSize: '14px' }}>{completed.length}</span>
              </h2>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {completed.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
                    <p style={{ color: '#64748b', fontWeight: 600 }}>No completed patients</p>
                  </div>
                ) : (
                  completed.slice().reverse().map(patient => (
                    <div key={patient.id} style={{ background: 'linear-gradient(to right, #dcfce7, #d1fae5)', border: '2px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{patient.name}</div>
                      <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>{patient.condition}</div>
                      <div style={{ fontSize: '12px', color: '#475569', background: 'white', borderRadius: '8px', padding: '8px', fontWeight: 600 }}>
                        ⏱️ Wait: {patient.waitingTime}m • ⏰ Total: {patient.turnaroundTime}m
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reset */}
            <button onClick={() => {
              /* eslint-disable-next-line no-alert */
              if (window.confirm('Reset all data?')) {
                setPatients([]);
                setQueue([]);
                setCompleted([]);
                setCurrentPatient(null);
                setCurrentTime(0);
                setNextId(1);
              }
            }} style={{ width: '100%', background: 'linear-gradient(to right, #ef4444, #ec4899)', color: 'white', padding: '16px', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Trash2 size={20} /> Reset System
            </button>
          </div>
        </div>

        {/* Modal */}
        {showAddForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }} onClick={(e) => e.target === e.currentTarget && setShowAddForm(false)}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', maxWidth: '500px', width: '100%', border: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Plus style={{ color: '#16a34a' }} size={32} /> Register Patient
                </h2>
                <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={32} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Patient Name *</label>
                  <input type="text" value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} placeholder="John Doe" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '16px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Age</label>
                  <input type="number" value={newPatient.age} onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })} placeholder="30" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '16px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Condition *</label>
                  <input type="text" value={newPatient.condition} onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })} placeholder="Chest pain, fever, etc." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '16px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Severity Level *</label>
                  <select value={newPatient.severity} onChange={(e) => setNewPatient({ ...newPatient, severity: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '16px' }}>
                    <option value="1">🔴 1 - Critical</option>
                    <option value="2">🟠 2 - Urgent</option>
                    <option value="3">🟡 3 - Moderate</option>
                    <option value="4">🟢 4 - Minor</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Est. Treatment Time (min) *</label>
                  <input type="number" value={newPatient.estimatedTime} onChange={(e) => setNewPatient({ ...newPatient, estimatedTime: e.target.value })} placeholder="30" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '16px' }} />
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                  <button onClick={addPatient} style={{ flex: 1, background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', padding: '16px', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                    ✓ Register
                  </button>
                  <button onClick={() => setShowAddForm(false)} style={{ flex: 1, background: '#cbd5e1', color: '#334155', padding: '16px', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalTriageSystem;