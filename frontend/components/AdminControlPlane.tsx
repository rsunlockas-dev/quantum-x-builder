import React, { useEffect, useMemo, useState } from 'react';
import { BrainIcon, CloudIcon, LayersIcon, MessageSquareIcon, SettingsIcon } from './Icons';

const NAV_ITEMS = [
  { id: 'capabilities', label: 'Capabilities', icon: <LayersIcon size={14} /> },
  { id: 'readiness', label: 'Readiness', icon: <MessageSquareIcon size={14} /> },
  { id: 'gates', label: 'Gates', icon: <BrainIcon size={14} /> },
  { id: 'varz', label: 'NATS Varz', icon: <CloudIcon size={14} /> },
  { id: 'jetstream', label: 'JetStream', icon: <CloudIcon size={14} /> },
  { id: 'evidence', label: 'Evidence', icon: <LayersIcon size={14} /> },
  { id: 'logs', label: 'Logs', icon: <MessageSquareIcon size={14} /> },
  { id: 'runtime', label: 'Runtime', icon: <SettingsIcon size={14} /> }
];

type Probe = { status: 'idle' | 'ok' | 'error'; message: string };

type AdminControlPlaneProps = {
  isOpen: boolean;
  onClose: () => void;
};

const storageKey = 'vizualx_admin_pat';

const DEFAULT_PROBES: Record<string, Probe> = {
  capabilities: { status: 'idle', message: '' },
  phase3: { status: 'idle', message: '' },
  readiness: { status: 'idle', message: '' },
  nats: { status: 'idle', message: '' }
};

const AdminControlPlane: React.FC<AdminControlPlaneProps> = ({ isOpen, onClose }) => {
  const [active, setActive] = useState('capabilities');
  const [patRecord, setPatRecord] = useState('');
  const [patDraft, setPatDraft] = useState('');
  const [patError, setPatError] = useState('');
  const [patModalOpen, setPatModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [probes, setProbes] = useState<Record<string, Probe>>(DEFAULT_PROBES);
  const [phase3Enabled, setPhase3Enabled] = useState(false);
  const [phase3Checked, setPhase3Checked] = useState(false);

  const [capabilities, setCapabilities] = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [gates, setGates] = useState<any>(null);
  const [natsVarz, setNatsVarz] = useState<any>(null);
  const [jetStream, setJetStream] = useState<any>(null);
  const [evidence, setEvidence] = useState<any>(null);
  const [logs, setLogs] = useState<any>(null);
  const [logTail, setLogTail] = useState<any>(null);
  const [runtime, setRuntime] = useState<any>(null);
  const [selectedLog, setSelectedLog] = useState('');
  const [logLimit, setLogLimit] = useState(120);

  const baseUrl = useMemo(() => {
    const envUrl = ((import.meta as any).env?.VITE_BACKEND_URL as string | undefined) || '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const value = envUrl || origin;
    return value ? value.replace(/\/$/, '') : '';
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const stored = localStorage.getItem(storageKey) || '';
    setPatRecord(stored);
    setPatDraft(stored);
  }, [isOpen]);

  const adminFetch = async (path: string) => {
    if (!baseUrl) throw new Error('Backend URL not configured');
    if (!patRecord) throw new Error('PAT record missing');
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-PAT-RECORD': patRecord
      }
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }
    return response.json();
  };

  const savePat = () => {
    setPatError('');
    try {
      const parsed = JSON.parse(patDraft || '{}');
      const normalized = JSON.stringify(parsed);
      localStorage.setItem(storageKey, normalized);
      setPatRecord(normalized);
      setPatModalOpen(false);
    } catch (err) {
      setPatError('Invalid JSON. Paste a full PAT record payload.');
    }
  };

  const clearPat = () => {
    localStorage.removeItem(storageKey);
    setPatRecord('');
    setPatDraft('');
    setPhase3Enabled(false);
    setPhase3Checked(false);
  };

  const checkPhase3 = async () => {
    if (!patRecord || !isOpen) return;
    setPhase3Checked(false);
    try {
      const response = await adminFetch('/__ops/admin/phase3/status');
      setPhase3Enabled(Boolean(response?.ok));
    } catch {
      setPhase3Enabled(false);
    } finally {
      setPhase3Checked(true);
    }
  };

  useEffect(() => {
    checkPhase3();
  }, [patRecord, isOpen]);

  const runProbes = async () => {
    setProbes(DEFAULT_PROBES);
    if (!patRecord) {
      setProbes((prev) => ({
        ...prev,
        capabilities: { status: 'error', message: 'PAT record missing' }
      }));
      return;
    }
    const next = { ...DEFAULT_PROBES } as Record<string, Probe>;
    try {
      await adminFetch('/__ops/admin/capabilities');
      next.capabilities = { status: 'ok', message: 'Capabilities ok' };
    } catch (err) {
      next.capabilities = { status: 'error', message: String(err) };
    }
    try {
      await adminFetch('/__ops/admin/phase3/status');
      next.phase3 = { status: 'ok', message: 'Phase 3 enabled' };
    } catch (err) {
      next.phase3 = { status: 'error', message: String(err) };
    }
    try {
      await adminFetch('/__ops/admin/readiness');
      next.readiness = { status: 'ok', message: 'Readiness ok' };
    } catch (err) {
      next.readiness = { status: 'error', message: String(err) };
    }
    try {
      await adminFetch('/__ops/admin/nats/varz');
      next.nats = { status: 'ok', message: 'NATS varz ok' };
    } catch (err) {
      next.nats = { status: 'error', message: String(err) };
    }
    setProbes(next);
  };

  const loadSection = async () => {
    if (!isOpen || !patRecord || !phase3Enabled) return;
    setLoading(true);
    setError('');
    try {
      if (active === 'capabilities') {
        const data = await adminFetch('/__ops/admin/capabilities');
        setCapabilities(data);
      }
      if (active === 'readiness') {
        const data = await adminFetch('/__ops/admin/readiness');
        setReadiness(data);
      }
      if (active === 'gates') {
        const data = await adminFetch('/__ops/admin/gates');
        setGates(data);
      }
      if (active === 'varz') {
        const data = await adminFetch('/__ops/admin/nats/varz');
        setNatsVarz(data);
      }
      if (active === 'jetstream') {
        const data = await adminFetch('/__ops/admin/nats/js');
        setJetStream(data);
      }
      if (active === 'evidence') {
        const data = await adminFetch('/__ops/admin/evidence');
        setEvidence(data);
      }
      if (active === 'logs') {
        const data = await adminFetch('/__ops/admin/logs');
        setLogs(data);
      }
      if (active === 'runtime') {
        const data = await adminFetch('/__ops/admin/runtime');
        setRuntime(data);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSection();
  }, [active, patRecord, phase3Enabled, isOpen]);

  const fetchLogTail = async () => {
    if (!selectedLog) return;
    try {
      const data = await adminFetch(`/__ops/admin/logs/${encodeURIComponent(selectedLog)}?limit=${logLimit}`);
      setLogTail(data);
    } catch (err) {
      setError(String(err));
    }
  };

  const copyPayload = (payload: any) => {
    if (!payload) return;
    const text = JSON.stringify(payload, null, 2);
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const renderPanel = (title: string, payload: any, refresh?: () => void) => (
    <div className="p-4 border border-white/10 bg-black/40">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-white/40">{title}</p>
        <div className="flex items-center space-x-2">
          {refresh && (
            <button
              onClick={refresh}
              className="px-2 py-1 text-[9px] uppercase tracking-widest border border-white/10 hover:border-blue-400/40"
            >
              Refresh
            </button>
          )}
          <button
            onClick={() => copyPayload(payload)}
            className="px-2 py-1 text-[9px] uppercase tracking-widest border border-white/10 hover:border-blue-400/40"
          >
            Copy
          </button>
        </div>
      </div>
      <pre className="text-[12px] whitespace-pre-wrap text-blue-100 mt-2">
        {payload ? JSON.stringify(payload, null, 2) : 'Awaiting data'}
      </pre>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0 admin-grid" />
      <div className="relative w-full h-full flex flex-col text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="h-14 flex items-center justify-between px-6 border-b border-white/10 bg-black/60">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <LayersIcon size={16} />
            </div>
            <div>
              <p className="text-[12px] uppercase tracking-[0.3em] text-blue-300">Phase 3 Admin</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Control Plane</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPatModalOpen(true)}
              className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-blue-400/40 bg-blue-500/10 hover:bg-blue-500/30 transition-all"
            >
              PAT Record
            </button>
            <button
              onClick={clearPat}
              className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-white/10 hover:border-amber-400/60 hover:text-amber-200 transition-all"
            >
              Lock
            </button>
            <button
              onClick={runProbes}
              className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-white/10 hover:border-blue-500/50 hover:text-blue-200 transition-all"
            >
              Run Probes
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-white/10 hover:border-red-400/60 hover:text-red-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <aside className="w-64 border-r border-white/10 bg-black/50 p-4 space-y-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center px-3 py-2 rounded text-[11px] uppercase tracking-widest transition-all ${
                  active === item.id
                    ? 'bg-blue-500/20 text-blue-200 border-l-2 border-blue-400'
                    : 'text-white/40 hover:text-blue-200 hover:bg-white/5'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div className="pt-4 mt-4 border-t border-white/10 text-[10px] uppercase tracking-widest text-white/40">
              <div className="space-y-2">
                {(Object.entries(probes) as [string, Probe][]).map(([key, probe]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span>{key}</span>
                    <span
                      className={`text-[9px] ${
                        probe.status === 'ok'
                          ? 'text-emerald-400'
                          : probe.status === 'error'
                          ? 'text-red-300'
                          : 'text-white/40'
                      }`}
                    >
                      {probe.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex-1 overflow-y-auto p-6 space-y-6">
            {!baseUrl && (
              <div className="p-4 border border-amber-400/40 bg-amber-500/10 text-[12px] uppercase tracking-widest text-amber-200">
                Backend URL missing. Set VITE_BACKEND_URL or use same-origin.
              </div>
            )}
            {!patRecord && (
              <div className="p-4 border border-red-400/40 bg-red-500/10 text-[12px] uppercase tracking-widest text-red-200">
                PAT record required for admin access.
              </div>
            )}
            {patRecord && !phase3Enabled && phase3Checked && (
              <div className="p-4 border border-red-400/40 bg-red-500/10 text-[12px] uppercase tracking-widest text-red-200">
                Phase 3 admin expansions are disabled.
              </div>
            )}
            {loading && (
              <div className="p-4 border border-white/10 bg-white/5 text-[11px] uppercase tracking-widest">
                Loading {active}...
              </div>
            )}
            {error && (
              <div className="p-4 border border-red-400/40 bg-red-500/10 text-[11px] uppercase tracking-widest text-red-200">
                {error}
              </div>
            )}

            {active === 'capabilities' && renderPanel('Capabilities', capabilities, loadSection)}
            {active === 'readiness' && renderPanel('Readiness', readiness, loadSection)}
            {active === 'gates' && renderPanel('Gates', gates, loadSection)}
            {active === 'varz' && renderPanel('NATS Varz', natsVarz, loadSection)}
            {active === 'jetstream' && renderPanel('JetStream', jetStream, loadSection)}
            {active === 'evidence' && renderPanel('Evidence', evidence, loadSection)}

            {active === 'logs' && (
              <div className="space-y-4">
                {renderPanel('Log Files', logs, loadSection)}
                <div className="p-4 border border-white/10 bg-black/40">
                  <p className="text-[11px] uppercase tracking-widest text-white/40">Log Tail</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <select
                      value={selectedLog}
                      onChange={(e) => setSelectedLog(e.target.value)}
                      className="bg-black/60 border border-white/10 px-3 py-2 text-[12px]"
                    >
                      <option value="">Select log</option>
                      {(logs?.data?.files || logs?.files || []).map((file: any) => (
                        <option key={file.name} value={file.name}>
                          {file.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={10}
                      max={400}
                      value={logLimit}
                      onChange={(e) => setLogLimit(Number(e.target.value))}
                      className="w-24 bg-black/60 border border-white/10 px-3 py-2 text-[12px]"
                    />
                    <button
                      onClick={fetchLogTail}
                      className="px-3 py-2 text-[10px] uppercase tracking-widest border border-blue-400/40 hover:bg-blue-500/20"
                    >
                      Fetch Tail
                    </button>
                  </div>
                  <pre className="text-[12px] whitespace-pre-wrap text-blue-100 mt-3">
                    {logTail ? JSON.stringify(logTail, null, 2) : 'Awaiting data'}
                  </pre>
                </div>
              </div>
            )}

            {active === 'runtime' && renderPanel('Runtime', runtime, loadSection)}
          </section>
        </div>
      </div>

      {patModalOpen && (
        <div className="absolute inset-0 z-[130] flex items-center justify-center bg-black/70">
          <div className="w-full max-w-3xl bg-[#0b0f1a] border border-white/10 shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[12px] uppercase tracking-[0.3em] text-blue-300">PAT Record</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Paste JSON payload</p>
              </div>
              <button onClick={() => setPatModalOpen(false)} className="text-white/40 hover:text-blue-200">Close</button>
            </div>
            <div className="p-4 space-y-3">
              <textarea
                value={patDraft}
                onChange={(e) => setPatDraft(e.target.value)}
                rows={10}
                className="w-full bg-black/60 border border-white/10 text-[12px] p-3"
                placeholder='{"policy":{"allowed":["ops:admin:capabilities"]},"authority":{"actor":"ops","scope":["admin"],"permissions":["ops:admin:capabilities"],"approvals_required":false},"truth":{"verdict":"PASS","evidence":["EVIDENCE_MANIFEST.json"],"hashes":["HASHES.sha256"]},"evidence_paths":["EVIDENCE_MANIFEST.json"],"hashes":["HASHES.sha256"],"response_state":"ALLOW: proceed"}'
              />
              {patError && (
                <div className="text-[11px] uppercase tracking-widest text-red-200">{patError}</div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setPatModalOpen(false)}
                  className="px-3 py-2 text-[10px] uppercase tracking-widest border border-white/10 hover:border-white/40"
                >
                  Cancel
                </button>
                <button
                  onClick={savePat}
                  className="px-4 py-2 text-[10px] uppercase tracking-widest border border-blue-400/40 bg-blue-500/20 hover:bg-blue-500/40"
                >
                  Save PAT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminControlPlane;
