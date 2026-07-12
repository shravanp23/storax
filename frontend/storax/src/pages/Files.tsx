import React, { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Upload, Trash2, Download, File, Image, FileText, Film, Share2, Copy, X, Clock, Search, Filter, HardDrive } from 'lucide-react';

const getFileIcon = (type: string) => {
  if (type?.startsWith('image/')) return { icon: '🖼️', color: '#7C3AED', bg: '#F5F3FF' };
  if (type?.startsWith('video/')) return { icon: '🎬', color: '#DC2626', bg: '#FEF2F2' };
  if (type?.includes('pdf')) return { icon: '📄', color: '#D97706', bg: '#FFFBEB' };
  if (type?.startsWith('text/')) return { icon: '📝', color: '#059669', bg: '#F0FDF4' };
  return { icon: '📁', color: '#2563EB', bg: '#EFF6FF' };
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
};

const Files: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [shareModal, setShareModal] = useState<any>(null);
  const [shareLink, setShareLink] = useState('');
  const [sharing, setSharing] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFiles = () => {
    setLoading(true);
    api.get('/api/storage/files').then(r => {
      setFiles(r.data);
      setFiltered(r.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadFiles(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(files); return; }
    setFiltered(files.filter((f: any) => f.filename.toLowerCase().includes(search.toLowerCase())));
  }, [search, files]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    const form = new FormData();
    form.append('file', file);
    try {
      await api.post('/api/storage/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / (e.total || 1)))
      });
      toast.success(`${file.name} uploaded successfully!`);
      loadFiles();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); setUploadProgress(0); }
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
      const res = await fetch(`https://storax.onrender.com/api/storage/download/${key}`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name; a.click();
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

  return (
    <div className="fade-in">
      {/* Share Modal */}
      {shareModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '460px', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <button onClick={() => { setShareModal(null); setShareLink(''); }} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
              <X size={16} />
            </button>
            <div style={{ width: '48px', height: '48px', background: '#EFF6FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Share2 size={24} color="#2563EB" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Share File</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>{shareModal.filename}</p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '10px' }}>Link expiry</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[{ label: '1 Hour', hours: 1 }, { label: '24 Hours', hours: 24 }, { label: '7 Days', hours: 168 }].map(({ label, hours }) => (
                  <button key={hours} onClick={() => createShareLink(shareModal, hours)} style={{
                    flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #E5E7EB',
                    background: 'white', color: '#374151', fontSize: '13px', fontWeight: '600',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = 'white'; }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {shareLink && (
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Shareable link</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={shareLink} readOnly style={{ flex: 1, fontSize: '12px', background: '#F8FAFC', borderColor: '#E5E7EB' }} />
                  <button onClick={() => { navigator.clipboard.writeText(shareLink); toast.success('Copied!'); }} style={{
                    background: '#0F172A', color: 'white', border: 'none', padding: '0 16px',
                    borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap'
                  }}>
                    <Copy size={14} /> Copy
                  </button>
                </div>
                {shareModal.expires_at && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#6B7280', fontSize: '12px' }}>
                    <Clock size={12} />
                    Expires: {new Date(shareModal.expires_at).toLocaleString()}
                  </div>
                )}
              </div>
            )}
            {sharing && <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', marginTop: '16px' }}>Generating link...</p>}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.3px' }}>My Files</h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>{files.length} files in your storage bucket</p>
        </div>
        <button className="btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ borderRadius: '10px', padding: '10px 20px' }}>
          <Upload size={16} /> {uploading ? `Uploading ${uploadProgress}%` : 'Upload File'}
        </button>
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Uploading file...</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB' }}>{uploadProgress}%</span>
          </div>
          <div style={{ background: '#F3F4F6', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg, #2563EB, #7C3AED)', borderRadius: '100px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); e.dataTransfer.files[0] && uploadFile(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#2563EB' : '#D1D5DB'}`,
          borderRadius: '16px', padding: '40px', textAlign: 'center',
          marginBottom: '24px', cursor: 'pointer',
          background: dragging ? '#EFF6FF' : '#F9FAFB',
          transition: 'all 0.2s ease'
        }}>
        <Upload size={28} color={dragging ? '#2563EB' : '#9CA3AF'} style={{ marginBottom: '12px' }} />
        <p style={{ fontSize: '15px', color: dragging ? '#2563EB' : '#6B7280', fontWeight: '500' }}>
          Drag & drop files here or <span style={{ color: '#2563EB', fontWeight: '700' }}>browse</span>
        </p>
        <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Supports all file types</p>
      </div>

      {/* Search Bar */}
      {files.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '42px', background: 'white' }} />
        </div>
      )}

      {/* Files List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '72px', borderRadius: '12px' }} className="skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
          <HardDrive size={40} color="#D1D5DB" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            {search ? 'No files match your search' : 'No files yet'}
          </h3>
          <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
            {search ? 'Try a different search term' : 'Upload your first file to get started'}
          </p>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{filtered.length} files</span>
          </div>
          {filtered.map((file, idx) => {
            const { icon, color, bg } = getFileIcon(file.content_type);
            return (
              <div key={file.id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 20px',
                borderBottom: idx < filtered.length - 1 ? '1px solid #F9FAFB' : 'none',
                transition: 'background 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.filename}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                    {formatBytes(file.size_bytes)} · {new Date(file.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '600', background: '#F3F4F6', color: '#6B7280', padding: '3px 8px', borderRadius: '6px' }} className="hide-mobile">
                  {file.content_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => { setShareModal(file); setShareLink(''); }} style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.color = '#059669'; e.currentTarget.style.background = '#F0FDF4'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'white'; }}>
                    <Share2 size={14} />
                  </button>
                  <button onClick={() => downloadFile(file.object_key, file.filename)} style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'white'; }}>
                    <Download size={14} />
                  </button>
                  <button onClick={() => deleteFile(file.object_key, file.filename)} style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'white'; }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Files;