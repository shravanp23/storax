import React, { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Upload, Trash2, Download, File, Image, FileText, Film } from 'lucide-react';

const getFileIcon = (type: string) => {
  if (type?.startsWith('image/')) return <Image size={20} color="#6C63FF" />;
  if (type?.startsWith('video/')) return <Film size={20} color="#FF6584" />;
  if (type?.includes('pdf'))      return <FileText size={20} color="#F59E0B" />;
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
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFiles = () => api.get('/api/storage/files').then(r => setFiles(r.data));

  useEffect(() => { loadFiles(); }, []);

  const uploadFile = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      await api.post('/api/storage/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
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

  const downloadFile = (key: string) => {
    window.open(`https://storax.onrender.com/api/storage/download/${key}?token=${localStorage.getItem('storax_token')}`);
};

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>My Files</h1>
          <p style={{ color: 'var(--text-muted)' }}>{files.length} files in your bucket</p>
        </div>
        <button className="btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
        </button>
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} />
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
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Drag & drop files here or <span style={{ color: 'var(--primary)', fontWeight: '600' }}>browse</span></p>
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
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.filename}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatBytes(file.size_bytes)} • {new Date(file.uploaded_at).toLocaleDateString()}</div>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '11px' }}>{file.content_type?.split('/')[1] || 'file'}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => downloadFile(file.object_key)} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Download size={14} />
                </button>
                <button onClick={() => deleteFile(file.object_key, file.filename)} className="btn-danger" style={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
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