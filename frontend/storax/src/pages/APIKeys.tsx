import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Key, Plus, Trash2, Copy, Eye, EyeOff, Shield } from 'lucide-react';

const APIKeys: React.FC = () => {
  const [keys, setKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [permissions, setPermissions] = useState('read_write');
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);

  const loadKeys = () => api.get('/api/keys/list').then(r => setKeys(r.data));
  useEffect(() => { loadKeys(); }, []);

  const generateKey = async () => {
    if (!newKeyName.trim()) { toast.error('Enter a key name'); return; }
    setGenerating(true);
    try {
      const res = await api.post(`/api/keys/generate?name=${encodeURIComponent(newKeyName)}&permissions=${permissions}`);
      setNewKey(res.data.key);
      setShowNewKey(true);
      setNewKeyName('');
      loadKeys();
      toast.success('API Key generated!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to generate key');
    } finally { setGenerating(false); }
  };

  const revokeKey = async (id: number) => {
    try {
      await api.delete(`/api/keys/revoke/${id}`);
      toast.success('Key revoked');
      loadKeys();
    } catch { toast.error('Failed to revoke key'); }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(newKey);
    toast.success('Key copied!');
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>API Keys</h1>
        <p style={{ color: 'var(--text-muted)' }}>Generate keys to access StoraX programmatically</p>
      </div>

      {/* New Key Alert */}
      {showNewKey && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Shield size={20} color="#10B981" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#10B981', margin: 0 }}>Save Your API Key Now!</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>This key will never be shown again. Copy and store it safely.</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={newKey} readOnly style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }} />
            <button onClick={copyKey} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <Copy size={14} /> Copy
            </button>
            <button onClick={() => setShowNewKey(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Generate New Key */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Generate New API Key</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>KEY NAME</label>
            <input placeholder="e.g. My App, Production, Testing" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>PERMISSIONS</label>
            <select value={permissions} onChange={e => setPermissions(e.target.value)}>
              <option value="read_write">Read & Write</option>
              <option value="read_only">Read Only</option>
              <option value="write_only">Write Only</option>
            </select>
          </div>
          <button className="btn-primary" onClick={generateKey} disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', height: '44px' }}>
            <Plus size={16} /> {generating ? 'Generating...' : 'Generate Key'}
          </button>
        </div>
      </div>

      {/* Keys List */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
          Your API Keys <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '400' }}>({keys.length}/5)</span>
        </h3>
        {keys.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Key size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p>No API keys yet. Generate your first key above!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {keys.map(key => (
              <div key={key.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Key size={18} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{key.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{key.key_prefix}</div>
                </div>
                <span className={`badge ${key.permissions === 'read_only' ? 'badge-warning' : key.permissions === 'write_only' ? 'badge-danger' : 'badge-success'}`}>
                  {key.permissions}
                </span>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {key.last_used ? `Last used: ${new Date(key.last_used).toLocaleDateString()}` : 'Never used'}
                </div>
                <button onClick={() => revokeKey(key.id)} className="btn-danger" style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Guide */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>How to Use API Keys</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>Use your API key in the Authorization header:</p>
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: '#10B981' }}>
          curl -H "Authorization: Bearer sx_your_api_key" \<br />
          &nbsp;&nbsp;https://storax.onrender.com/api/storage/files
        </div>
      </div>
    </div>
  );
};

export default APIKeys;