import React, { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Upload, Trash2, Download, File, Image, FileText, Film, Share2, Copy, X, Clock, Zap } from 'lucide-react';

const getFileIcon = (type: string) => {
  if (type?.startsWith('image/')) return <Image size={20} color="#6C63FF" />;
  if (type?.startsWith('video/')) return <Film size={20} color="#FF6584" />;
  if (type?.includes('pdf')) return <FileText size={20} color="#F59E0B" />;
  return <File size={20} color="#10B981" />;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
};

const Files: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [shareModal, setShareModal] = useState<any>(null);
  const [shareLink, setShareLink] = useState('');
  const [sharing, setSharing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFiles = () => api.get('/api/storage/files').then(r => setFiles(r.data));
  useEffect(() => { loadFiles(); }, []);

  const uploadFile = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      await api.post('/api/storage/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`${file.name} uploaded!`);
      loadFiles();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const deleteFile = async (key: string, name: string) => {
    try {
      await api.delete(`/api/storage/delete/${key}`);
      toast.success(`${name} deleted`);
      loadFiles();
    } catch { toast.error('Delete failed'); }
  };

  const downloadFile = async (key: string, name: string) => {
    try {
      const token = localStorage.getItem('storax_token');
      const response = await fetch(
        `https://storax.onrender.com/api/storage/download/${key}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  const createShareLink = async (file: any, hours: number = 24) => {
    setSharing(true);
    try {
      const res = await api.post(`/api/storage/share/${file.object_key}?hours=${hours}`);
      setShareLink(res.data.share_url);
      setShareModal({ ...file, expires_at: res.data.expires_at });
      toast.success('Share link created!');
    } catch { toast.error('Failed to create share link'); }
    finally { setSharing(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="fade-in">
      {/* Share Modal */}
      {shareModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '480px', padding: '32px', position: 'relative' }}>
            <button onClick={() => { setShareModal(null); setShareLink(''); }}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                🔗 Share File
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {shareModal.filename}
              </p>
            </div>

            {/* Expiry Options */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                LINK EXPIRY
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { label: '1 Hour', hours: 1 },
                  { label: '24 Hours', hours: 24 },
                  { label: '7 Days', hours: 168 },
                ].map(({ label, hours }) => (
                  <button key={hours} onClick={() => createShareLink(shareModal, hours)}
                    className="btn-secondary" style={{ flex: 1, fontSize: '13px', padding: '8px' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Share Link */}
            {shareLink && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  SHAREABLE LINK
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    value={shareLink}
                    readOnly
                    style={{ flex: 1, fontSize: '12px', padding: '10px 12px', background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '8px', color: 'var(--text)' }}
                  />
                  <button onClick={copyLink} className="btn-primary" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                    <Copy size={14} /> Copy
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                  <Clock size={12} color="var(--text-muted)" />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Expires: {new Date(shareModal.expires_at).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {sharing && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Generating link...</p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>My Files</h1>
          <p style={{ color: 'var(--text-muted)' }}>{files.length} files in your bucket</p>
        </div>
        <button className="btn-primary" onClick={() => fileRef.current?.click()}
          disabled={uploading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
        </button>
        <input ref={fileRef} type="file" style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); e.dataTransfer.files[0] && uploadFile(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '16px', padding: '40px', textAlign: 'center',
          marginBottom: '24px', cursor: 'pointer',
          background: dragging ? 'rgba(108,99,255,0.05)' : 'transparent',
          transition: 'all 0.3s ease'
        }}
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Drag & drop files here or <span style={{ color: 'var(--primary)', fontWeight: '600' }}>browse</span>
        </p>
      </div>

      {/* File List */}
      {files.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <File size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>No files yet. Upload your first file!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {files.map(file => (
            <div key={file.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {getFileIcon(file.content_type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.filename}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {formatBytes(file.size_bytes)} • {new Date(file.uploaded_at).toLocaleDateString()}
                </div>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                {file.content_type?.split('/')[1] || 'file'}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Share Button */}
                <button
                  onClick={() => { setShareModal(file); setShareLink(''); }}
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500' }}>
                  <Share2 size={14} /> Share
                </button>
                {/* AI Compress Button */}
                <button
                  onClick={() => window.location.href = '/compression'}
                  style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', color: 'var(--primary)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <Zap size={14} /> AI
                </button>
                {/* Download Button */}
                <button
                  onClick={() => downloadFile(file.object_key, file.filename)}
                  style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', color: 'var(--primary)', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Download size={14} />
                </button>
                {/* Delete Button */}
                <button onClick={() => deleteFile(file.object_key, file.filename)}
                  className="btn-danger" style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Files;