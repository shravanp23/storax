import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Key, Plus, Trash2, Copy, Shield, CheckCircle, AlertCircle } from 'lucide-react';

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
      toast.error(err.response?.data?.detail || 'Failed');
    } finally { setGenerating(false); }
  };

  const revokeKey = async (id: number) => {
    try {
      await api.delete(`/api/keys/revoke/${id}`);
      toast.success('Key revoked');
      loadKeys();
    } catch { toast.error('Failed to revoke'); }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.3px' }}>API Keys</h1>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>Generate API keys for programmatic access to your storage</p>
      </div>

      {/* New Key Alert */}
      {showNewKey && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <CheckCircle size={20} color="#16A34A" />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#15803D', margin: 0 }}>Save your API key now!</h3>
          </div>
          <p style={{ color: '#16A34A', fontSize: '13px', marginBottom: '16px' }}>This key will never be shown again. Copy and store it securely.</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={newKey} readOnly style={{ flex: 1, fontFamily: 'monospace', fontSize: '12px', background: 'white', borderColor: '#BBF7D0', color: '#15803D' }} />
            <button onClick={() => { navigator.clipboard.writeText(newKey); toast.success('Copied!'); }} style={{ background: '#16A34A', color: 'white', border: 'none', padding: '0 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
              <Copy size={14} /> Copy Key
            </button>
            <button onClick={() => setShowNewKey(false)} style={{ background: 'white', border: '1px solid #BBF7D0', color: '#16A34A', padding: '0 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Generate */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '20px' }}>Generate New API Key</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Key Name</label>
            <input placeholder="e.g. Production App, Testing..." value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Permissions</label>
            <select value={permissions} onChange={e => setPermissions(e.target.value)}>
              <option value="read_write">Read & Write</option>
              <option value="read_only">Read Only</option>
              <option value="write_only">Write Only</option>
            </select>
          </div>
          <button onClick={generateKey} disabled={generating} className="btn-primary" style={{ borderRadius: '10px', padding: '12px 20px', whiteSpace: 'nowrap' }}>
            <Plus size={16} /> {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Keys List */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' }}>Your API Keys</h3>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>{keys.length} of 5 keys used</p>
          </div>
        </div>

        {keys.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Key size={40} color="#D1D5DB" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>No API keys yet</h3>
            <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Generate your first API key above</p>
          </div>
        ) : (
          keys.map((key, idx) => (
            <div key={key.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderBottom: idx < keys.length - 1 ? '1px solid #F9FAFB' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Key size={18} color="#2563EB" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827', marginBottom: '2px' }}>{key.name}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace' }}>{key.key_prefix}••••••••••••</div>
              </div>
              <span className={`badge ${key.permissions === 'read_only' ? 'badge-warning' : key.permissions === 'write_only' ? 'badge-primary' : 'badge-success'}`}>
                {key.permissions.replace('_', ' ')}
              </span>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }} className="hide-mobile">
                {key.last_used ? `Used ${new Date(key.last_used).toLocaleDateString()}` : 'Never used'}
              </div>
              <button onClick={() => revokeKey(key.id)} className="btn-danger" style={{ padding: '8px 12px', borderRadius: '8px' }}>
                <Trash2 size={14} /> Revoke
              </button>
            </div>
          ))
        )}
      </div>

      {/* Usage Guide */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '16px' }}>How to use API keys</h3>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>Include your API key in the Authorization header:</p>
        <div style={{ background: '#0F172A', borderRadius: '10px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: '#86EFAC', lineHeight: '1.6' }}>
          curl -H "Authorization: Bearer sx_your_api_key" \<br />
          &nbsp;&nbsp;https://storax.onrender.com/api/storage/files
        </div>
      </div>
    </div>
  );
};

export default APIKeys;