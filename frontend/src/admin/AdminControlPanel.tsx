/**
 * Admin Control Panel - React Component Stub
 * 
 * This is a STUB implementation of the admin control panel UI.
 * TODO: Complete implementation with real API calls and state management.
 * 
 * Features:
 * - Autonomy enable/disable toggle
 * - Audit ledger viewer
 * - Rollback token search
 * - Rehydration trigger
 * - Agent allowlist management
 */

import React, { useState, useEffect } from 'react';

interface AutonomyStatus {
  enabled: boolean;
  killswitch: {
    active: boolean;
    path: string;
  };
  rehydrate: {
    tag: string;
    hash: string;
    required: boolean;
  };
  last_updated: string;
}

interface AuditEntry {
  timestamp: string;
  type: 'validation' | 'deployment' | 'auto-fix';
  rollback_token: string;
  pr_number?: number;
  commit_sha: string;
  status: 'success' | 'failure' | 'pending';
}

export const AdminControlPanel: React.FC = () => {
  // State management (stub)
  const [autonomyStatus, setAutonomyStatus] = useState<AutonomyStatus>({
    enabled: true,
    killswitch: { active: false, path: '_OPS/SAFETY/KILL_SWITCH.json' },
    rehydrate: { tag: 'qxb-phase5-lock-2026-02-06', hash: 'abc123...', required: true },
    last_updated: new Date().toISOString(),
  });

  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [searchToken, setSearchToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'audit' | 'rollback' | 'rehydrate' | 'agents'>('status');

  // TODO: Replace with real API calls
  const fetchAutonomyStatus = async () => {
    console.log('TODO: Fetch autonomy status from API');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const fetchAuditEntries = async () => {
    console.log('TODO: Fetch audit entries from API');
    setAuditEntries([
      {
        timestamp: new Date().toISOString(),
        type: 'validation',
        rollback_token: 'qxb-rollback-20260208T210000Z',
        pr_number: 123,
        commit_sha: 'abc123',
        status: 'success',
      },
    ]);
  };

  const toggleAutonomy = async () => {
    console.log('TODO: Toggle autonomy via API');
    setAutonomyStatus(prev => ({
      ...prev,
      enabled: !prev.enabled,
      last_updated: new Date().toISOString(),
    }));
  };

  const triggerRehydration = async () => {
    console.log('TODO: Trigger rehydration workflow via API');
    alert('Rehydration workflow triggered (stub)');
  };

  const searchRollbackToken = async (token: string) => {
    console.log(`TODO: Search for rollback token: ${token}`);
    alert(`Searching for token: ${token} (stub)`);
  };

  useEffect(() => {
    fetchAutonomyStatus();
    fetchAuditEntries();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            QXB Admin Control Plane
          </h1>
          <p className="text-gray-600">
            Manage autonomous operations, view audit trails, and control system behavior
          </p>
          <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md inline-block text-sm">
            ⚠️ STUB IMPLEMENTATION - Connect to real API
          </div>
        </header>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {(['status', 'audit', 'rollback', 'rehydrate', 'agents'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'status' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Autonomy Status</h2>
                <button
                  onClick={toggleAutonomy}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    autonomyStatus.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      autonomyStatus.enabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Status:</strong> {autonomyStatus.enabled ? '✅ Enabled' : '❌ Disabled'}</p>
                <p><strong>Kill Switch:</strong> {autonomyStatus.killswitch.active ? '🔴 Active' : '🟢 Inactive'}</p>
                <p><strong>Last Updated:</strong> {new Date(autonomyStatus.last_updated).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">PRs Validated</h3>
                <p className="text-3xl font-bold text-blue-600">24</p>
                <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Deployments</h3>
                <p className="text-3xl font-bold text-green-600">12</p>
                <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Rollbacks</h3>
                <p className="text-3xl font-bold text-red-600">2</p>
                <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">Audit Ledger</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rollback Token</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auditEntries.map((entry, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                        {entry.rollback_token}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          entry.status === 'success' ? 'bg-green-100 text-green-800' :
                          entry.status === 'failure' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rollback' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rollback Management</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Rollback Token
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchToken}
                  onChange={e => setSearchToken(e.target.value)}
                  placeholder="qxb-rollback-20260208T210000Z"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={() => searchRollbackToken(searchToken)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rehydrate' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rehydration Control</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-700 mb-1"><strong>Current Tag:</strong></p>
                <p className="font-mono text-blue-600">{autonomyStatus.rehydrate.tag}</p>
              </div>
              <button
                onClick={triggerRehydration}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Trigger Rehydration
              </button>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agent Allowlist</h2>
            <div className="space-y-2">
              {['copilot', 'github-actions[bot]', 'qxb-bot'].map(agent => (
                <div key={agent} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <span className="font-mono text-sm">{agent}</span>
                  <span className="text-green-600 text-sm">✓ Allowed</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminControlPanel;
