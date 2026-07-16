import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Upload, Zap, CheckCircle, Cloud, File, Image,
  FileText, Film, ArrowRight, X, RefreshCw,
  TrendingDown, DollarSign, Eye, EyeOff
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

interface FileAnalysis {
  filename: string;
  original_size_bytes: number;
  content_type: string;
  should_compress: boolean;
  estimated_savings_percent: number;
  estimated_new_size_bytes: number;
  reason: string;
  ai_verdict: string;
  compression_type: string | null;
}

interface CompressionResult {
  original_size_bytes: number;
  compressed_size_bytes: number;
  savings_bytes: number;
  savings_percent: number;
  savings_mb: number;
  compressed_filename: string;
  new_object_key: string;
}

type Stage =
  | 'idle'
  | 'analyzing'
  | 'analyzed'
  | 'compressing'
  | 'compressed'
  | 'uploading'
  | 'done';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatBytes = (b: number) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 ** 2).toFixed(2)} MB`;
};

const getFileIcon = (type: string) => {
  if (type?.startsWith('image/')) return { icon: '🖼️', label: 'Image' };
  if (type?.includes('pdf')) return { icon: '📄', label: 'PDF' };
  if (type?.startsWith('video/')) return { icon: '🎬', label: 'Video' };
  if (type?.includes('word') || type?.includes('document')) return { icon: '📝', label: 'Document' };
  if (type?.includes('presentation') || type?.includes('powerpoint')) return { icon: '📊', label: 'Presentation' };
  if (type?.includes('zip') || type?.includes('archive')) return { icon: '📦', label: 'Archive' };
  return { icon: '📁', label: 'File' };
};

const uid = () => Math.random().toString(36).slice(2);

// ─── AI Avatar ───────────────────────────────────────────────────────────────
const AIAvatar = () => (
  <div style={{
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxShadow: '0 2px 8px rgba(37,99,235,.35)'
  }}>
    <Zap size={18} color="white" />
  </div>
);

// ─── Chat Bubble ─────────────────────────────────────────────────────────────
const Bubble: React.FC<{ msg: Message }> = ({ msg }) => {
  const isAI = msg.role === 'ai';
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-end',
      flexDirection: isAI ? 'row' : 'row-reverse',
      animation: 'fadeUp .3s ease',
    }}>
      {isAI && <AIAvatar />}
      <div style={{
        maxWidth: '78%',
        background: isAI
          ? 'white'
          : 'linear-gradient(135deg,#2563EB,#1D4ED8)',
        color: isAI ? '#111827' : 'white',
        padding: '12px 16px',
        borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        fontSize: 14, lineHeight: 1.6,
        boxShadow: isAI
          ? '0 1px 6px rgba(0,0,0,.08)'
          : '0 2px 12px rgba(37,99,235,.3)',
        border: isAI ? '1px solid #E5E7EB' : 'none',
      }}>
        {msg.text}
      </div>
    </div>
  );
};

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
    <AIAvatar />
    <div style={{
      background: 'white', border: '1px solid #E5E7EB',
      borderRadius: '4px 16px 16px 16px',
      padding: '14px 18px', display: 'flex', gap: 5,
      boxShadow: '0 1px 6px rgba(0,0,0,.08)'
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#94A3B8',
          animation: `bounce .9s ease ${i * .15}s infinite`
        }} />
      ))}
    </div>
  </div>
);

// ─── Progress Ring ────────────────────────────────────────────────────────────
const ProgressRing: React.FC<{ pct: number }> = ({ pct }) => {
  const r = 54, c = 2 * Math.PI * r;
  return (
    <svg width={128} height={128} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={64} cy={64} r={r} fill="none" stroke="#E5E7EB" strokeWidth={8} />
      <circle cx={64} cy={64} r={r} fill="none"
        stroke="url(#prog)" strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (pct / 100) * c}
        style={{ transition: 'stroke-dashoffset .4s ease' }}
      />
      <defs>
        <linearGradient id="prog" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <text x={64} y={68}
        textAnchor="middle" fontSize={20} fontWeight={800}
        fill="#0F172A"
        style={{ transform: 'rotate(90deg)', transformOrigin: '64px 64px' }}>
        {pct}%
      </text>
    </svg>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const Compression: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(), role: 'ai', timestamp: new Date(),
      text: "Hi! I'm StoraX AI Assistant. I can help you compress files before uploading them to your cloud storage.",
    },
    {
      id: uid(), role: 'ai', timestamp: new Date(),
      text: "Upload an image, PDF, video, or document to get started. I'll analyze it and recommend the best compression settings.",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typing]);

  const addAIMessage = useCallback((text: string, delay = 600) => {
    setTyping(true);
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setTyping(false);
        setMessages(prev => [...prev, { id: uid(), role: 'ai', text, timestamp: new Date() }]);
        resolve();
      }, delay);
    });
  }, []);

  // ── File selected ──
  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setResult(null);
    setProgress(0);
    setStage('analyzing');

    // Preview
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }

    const { icon, label } = getFileIcon(f.type);
    setMessages(prev => [...prev,
      { id: uid(), role: 'user', text: `📎 ${f.name} (${formatBytes(f.size)})`, timestamp: new Date() }
    ]);

    await addAIMessage(`${icon} I detected a ${label} file — **${f.name}** (${formatBytes(f.size)}).`, 700);
    await addAIMessage('Analyzing file metadata and estimating compression potential...', 500);

    try {
      let analysisData: FileAnalysis;

      try {
        const res = await api.post('/api/storage/analyze-before-upload', {
          filename: f.name,
          content_type: f.type,
          size_bytes: f.size,
        });

        analysisData = {
          filename: f.name,
          original_size_bytes: f.size,
          content_type: f.type,
          should_compress: res.data.should_compress,
          estimated_savings_percent: res.data.estimated_savings_percent || 0,
          estimated_new_size_bytes: res.data.estimated_new_size_bytes || f.size,
          reason: res.data.reason || '',
          ai_verdict: res.data.ai_verdict || 'optional',
          compression_type: res.data.compression_type || null,
        };
      } catch (err) {
        const size_mb = f.size / (1024 * 1024);
        const ext = f.name.toLowerCase().split('.').pop() || '';
        let savings = 0;
        let should = false;
        let reason = '';
        let ct: string | null = null;
        let verdict = 'optional';

        if (['jpg', 'jpeg'].includes(ext)) {
          savings = size_mb > 1 ? 65 : 40;
          should = true;
          reason = `JPEG of ${size_mb.toFixed(1)}MB — high compression potential.`;
          ct = 'image_jpeg';
          verdict = size_mb > 1 ? 'highly_recommended' : 'recommended';
        } else if (ext === 'png') {
          savings = size_mb > 0.5 ? 50 : 20;
          should = size_mb > 0.3;
          reason = 'PNG can be optimized to reduce size.';
          ct = 'image_png';
          verdict = 'recommended';
        } else if (['bmp', 'gif', 'tiff', 'tif'].includes(ext)) {
          savings = 60;
          should = true;
          reason = `${ext.toUpperCase()} has high compression potential.`;
          ct = 'image_jpeg';
          verdict = 'highly_recommended';
        } else if (ext === 'pdf') {
          savings = size_mb > 5 ? 55 : size_mb > 1 ? 35 : 10;
          should = size_mb > 1;
          reason = `PDF of ${size_mb.toFixed(1)}MB.`;
          ct = 'pdf';
          verdict = size_mb > 5 ? 'highly_recommended' : 'recommended';
        } else if (['txt', 'csv', 'json', 'xml', 'html', 'js', 'ts', 'py'].includes(ext)) {
          savings = 75;
          should = true;
          reason = 'Text file — very high compression possible.';
          ct = 'text';
          verdict = 'highly_recommended';
        } else if (['mp4', 'mov', 'avi'].includes(ext)) {
          savings = size_mb > 50 ? 35 : 10;
          should = size_mb > 50;
          reason = 'Video compression available for large files.';
          verdict = 'optional';
        } else if (['zip', 'rar', '7z', 'gz'].includes(ext)) {
          savings = 0;
          should = false;
          reason = 'Already compressed.';
          verdict = 'already_compressed';
        }

        analysisData = {
          filename: f.name,
          original_size_bytes: f.size,
          content_type: f.type,
          should_compress: should,
          estimated_savings_percent: savings,
          estimated_new_size_bytes: f.size * (1 - savings / 100),
          reason,
          ai_verdict: verdict,
          compression_type: ct,
        };
      }

      setAnalysis(analysisData);
      setStage('analyzed');

      if (analysisData.should_compress && analysisData.estimated_savings_percent >= 10) {
        await addAIMessage(`This file can be compressed by approximately **${analysisData.estimated_savings_percent.toFixed(0)}%**.`, 600);
        await addAIMessage(analysisData.reason, 500);
        const savedMB = ((analysisData.original_size_bytes - analysisData.estimated_new_size_bytes) / (1024 * 1024)).toFixed(2);
        const costSaving = ((analysisData.original_size_bytes - analysisData.estimated_new_size_bytes) / (1024 ** 3) * 0.02).toFixed(5);
        await addAIMessage(`Estimated savings: **${savedMB} MB** (~$${costSaving}/month storage cost reduction).`, 500);
        await addAIMessage('Click **Compress Now** when you\'re ready, or upload directly without compression.', 600);
      } else {
        await addAIMessage('This file is already well-optimized. Compression would provide minimal benefit.', 600);
        await addAIMessage('You can upload it directly to StoraX using the button below.', 500);
      }
    } catch (e) {
      await addAIMessage('File analyzed. You can proceed with compression or upload directly.', 600);
      setStage('analyzed');
    }
  }, [addAIMessage]);

  // ── Compress ──
  const handleCompress = useCallback(async () => {
    if (!file || !analysis) return;
    setStage('compressing');
    setProgress(0);

    await addAIMessage(`Compressing your ${getFileIcon(file.type).label.toLowerCase()}...`, 400);

    // Simulate progress while backend compresses
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 85) { clearInterval(interval); return 85; }
        return p + Math.random() * 8 + 2;
      });
    }, 200);

    try {
      // Upload file first to get object_key, then compress
      const form = new FormData();
      form.append('file', file);
      const uploadRes = await api.post('/api/storage/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const objectKey = uploadRes.data.object_key;

      // Now compress
      const compRes = await api.post(`/api/storage/compress/${objectKey}`);
      clearInterval(interval);
      setProgress(100);

      const r: CompressionResult = {
        original_size_bytes: compRes.data.original_size_bytes,
        compressed_size_bytes: compRes.data.compressed_size_bytes,
        savings_bytes: compRes.data.savings_bytes,
        savings_percent: compRes.data.savings_percent,
        savings_mb: compRes.data.savings_mb,
        compressed_filename: compRes.data.compressed_filename,
        new_object_key: compRes.data.new_object_key,
      };
      setResult(r);
      setStage('compressed');

      await addAIMessage('✅ Compression completed successfully!', 500);
      await addAIMessage(`You saved **${r.savings_mb} MB** (${r.savings_percent.toFixed(1)}% reduction).`, 400);
      await addAIMessage(
        `Original: ${formatBytes(r.original_size_bytes)} → Compressed: ${formatBytes(r.compressed_size_bytes)}`,
        400
      );
      const costSave = (r.savings_bytes / (1024 ** 3) * 0.02 * 12).toFixed(4);
      await addAIMessage(`You saved ${r.savings_percent.toFixed(0)}% storage. This will reduce your monthly storage bill by ~$${costSave}/year.`, 500);
      await addAIMessage('The compressed file is now stored in your bucket. You can also download it directly.', 600);
    } catch (err: any) {
      clearInterval(interval);
      setProgress(0);
      setStage('analyzed');
      const msg = err.response?.data?.detail || 'Compression failed';
      await addAIMessage(`❌ ${msg}. You can try uploading the original file instead.`, 400);
      toast.error(msg);
    }
  }, [file, analysis, addAIMessage]);

  // ── Upload original directly ──
  const handleUploadOriginal = useCallback(async () => {
    if (!file) return;
    setStage('uploading');
    setUploadProgress(0);
    await addAIMessage('Uploading original file to StoraX...', 300);

    const form = new FormData();
    form.append('file', file);
    try {
      await api.post('/api/storage/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setUploadProgress(Math.round((e.loaded * 100) / (e.total || 1)))
      });
      setStage('done');
      await addAIMessage(`✅ **${file.name}** uploaded successfully to your StoraX bucket!`, 400);
      await addAIMessage('Visit My Files to view and manage all your stored files.', 400);
      toast.success(`${file.name} uploaded!`);
    } catch {
      setStage('analyzed');
      await addAIMessage('❌ Upload failed. Please try again.', 400);
      toast.error('Upload failed');
    }
  }, [file, addAIMessage]);

  // ── Reset ──
  const handleReset = useCallback(async () => {
    setFile(null); setPreview(null); setAnalysis(null);
    setResult(null); setProgress(0); setStage('idle');
    setMessages([
      { id: uid(), role: 'ai', timestamp: new Date(), text: "Hi! I'm StoraX AI Assistant. Ready to help with your next file." },
      { id: uid(), role: 'ai', timestamp: new Date(), text: "Upload another file to compress and store." },
    ]);
  }, []);

  // ── Drag handlers ──
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const canCompress = analysis?.should_compress && analysis.estimated_savings_percent >= 10 && analysis.compression_type && ['image_jpeg', 'image_png', 'pdf'].includes(analysis.compression_type);

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .glass { background:rgba(255,255,255,.85); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,.6); }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, height: 'calc(100vh - 120px)', minHeight: 600 }}>

        {/* ── LEFT: Chat Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#F1F5F9', borderRadius: 20, overflow: 'hidden', border: '1px solid #E2E8F0' }}>

          {/* Chat Header */}
          <div style={{ background: '#0F172A', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>StoraX AI</div>
              <div style={{ color: '#94A3B8', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                Active
              </div>
            </div>
            {stage !== 'idle' && (
              <button onClick={handleReset} title="Start over"
                style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                <RefreshCw size={13} /> New
              </button>
            )}
          </div>

          {/* Messages */}
          <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map(m => <Bubble key={m.id} msg={m} />)}
            {typing && <TypingIndicator />}
          </div>

          {/* File types hint */}
          {stage === 'idle' && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #E2E8F0', background: 'white' }}>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Supported Files</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['🖼️ Images', '📄 PDFs', '🎬 Videos', '📝 Docs', '📊 PPT', '📦 Archives'].map(t => (
                  <span key={t} style={{ fontSize: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '3px 8px', color: '#64748B' }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Workspace ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

          {/* ─ IDLE: Drop Zone ─ */}
          {stage === 'idle' && (
            <div
              onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                flex: 1, border: `2px dashed ${dragging ? '#2563EB' : '#CBD5E1'}`,
                borderRadius: 20, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: dragging ? '#EFF6FF' : 'white',
                cursor: 'pointer', transition: 'all .2s', padding: 40,
                minHeight: 400,
              }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: dragging ? '#DBEAFE' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, transition: 'all .2s' }}>
                <Upload size={36} color={dragging ? '#2563EB' : '#94A3B8'} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
                {dragging ? 'Drop your file here' : 'Upload a file to compress'}
              </h3>
              <p style={{ color: '#64748B', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
                Drag & drop your file here, or click to browse.<br />
                AI will analyze and compress it before uploading to StoraX.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[{ label: 'JPG / PNG / WEBP', color: '#7C3AED', bg: '#F5F3FF' },
                  { label: 'PDF Documents', color: '#D97706', bg: '#FFFBEB' },
                  { label: 'Videos', color: '#DC2626', bg: '#FEF2F2' },
                  { label: 'Word / PPT', color: '#059669', bg: '#F0FDF4' }].map(t => (
                  <span key={t.label} style={{ fontSize: 12, fontWeight: 600, color: t.color, background: t.bg, padding: '5px 12px', borderRadius: 100 }}>{t.label}</span>
                ))}
              </div>
              <input ref={fileRef} type="file" style={{ display: 'none' }}
                accept="image/*,.pdf,video/*,.doc,.docx,.ppt,.pptx,.zip,.rar,.txt,.csv,.json"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          )}

          {/* ─ ANALYZING ─ */}
          {stage === 'analyzing' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: 20, border: '1px solid #E5E7EB', minHeight: 400, gap: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid #E5E7EB', borderTop: '4px solid #2563EB', animation: 'spin 1s linear infinite' }} />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>AI is analyzing your file...</h3>
                <p style={{ color: '#64748B', fontSize: 14 }}>Detecting file type, size, and compression potential</p>
              </div>
            </div>
          )}

          {/* ─ ANALYZED ─ */}
          {(stage === 'analyzed' || stage === 'compressing' || stage === 'compressed' || stage === 'uploading' || stage === 'done') && analysis && file && (
            <>
              {/* File Info Card */}
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                    {getFileIcon(file.type).icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 3 }}>{getFileIcon(file.type).label} · {formatBytes(file.size)}</div>
                  </div>
                  {stage === 'done' ? (
                    <span style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', borderRadius: 100, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>✅ Stored</span>
                  ) : (
                    <span style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: 100, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>
                      {analysis.ai_verdict === 'highly_recommended' ? '🔥 Highly Compressible' : analysis.ai_verdict === 'recommended' ? '✅ Compressible' : '💡 Minor Savings'}
                    </span>
                  )}
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Original Size', value: formatBytes(file.size), color: '#0F172A' },
                    { label: 'Est. After Compress', value: formatBytes(analysis.estimated_new_size_bytes), color: '#2563EB' },
                    { label: 'Est. Savings', value: `${analysis.estimated_savings_percent.toFixed(0)}%`, color: '#059669' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: '#F8FAFC', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Preview */}
              {preview && (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Preview</h4>
                    {result && (
                      <button onClick={() => setShowCompare(!showCompare)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 13, color: '#374151', fontFamily: 'inherit' }}>
                        {showCompare ? <EyeOff size={13} /> : <Eye size={13} />}
                        {showCompare ? 'Hide' : 'Compare'}
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: result && showCompare ? '1fr 1fr' : '1fr', gap: 12 }}>
                    <div>
                      {result && showCompare && <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, textAlign: 'center' }}>ORIGINAL</div>}
                      <img src={preview} alt="Original" style={{ width: '100%', borderRadius: 10, objectFit: 'contain', maxHeight: 220, background: '#F8FAFC' }} />
                      <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 6 }}>{formatBytes(file.size)}</div>
                    </div>
                    {result && showCompare && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, textAlign: 'center' }}>COMPRESSED</div>
                        <div style={{ width: '100%', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                          <CheckCircle size={32} color="#16A34A" />
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#16A34A' }}>Compressed</div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>{formatBytes(result.compressed_size_bytes)}</div>
                        </div>
                        <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 600, textAlign: 'center', marginTop: 6 }}>Saved {result.savings_mb} MB</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─ Compressing Progress ─ */}
              {stage === 'compressing' && (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: 32, textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <ProgressRing pct={Math.round(progress)} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Compressing with AI...</h3>
                  <p style={{ color: '#64748B', fontSize: 14 }}>Applying optimal compression algorithms</p>
                </div>
              )}

              {/* ─ Compression Result ─ */}
              {(stage === 'compressed' || stage === 'done') && result && (
                <div style={{ background: 'linear-gradient(135deg,#F0FDF4,#ECFEFF)', borderRadius: 16, border: '1px solid #BBF7D0', padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={22} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#15803D' }}>Compression Complete!</h3>
                      <p style={{ fontSize: 13, color: '#16A34A' }}>File optimized and stored in your bucket</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: 'Original Size', value: formatBytes(result.original_size_bytes), color: '#374151' },
                      { label: 'Compressed Size', value: formatBytes(result.compressed_size_bytes), color: '#16A34A' },
                      { label: 'Space Saved', value: `${result.savings_mb} MB`, color: '#059669' },
                      { label: 'Compression', value: `${result.savings_percent.toFixed(1)}%`, color: '#0891B2' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: 'rgba(255,255,255,.7)', borderRadius: 12, padding: '14px 16px', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
                        <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,.6)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DollarSign size={15} color="#059669" />
                    <span style={{ fontSize: 13, color: '#15803D', fontWeight: 500 }}>
                      You saved {result.savings_percent.toFixed(0)}% storage. This reduces your monthly bill by ~${(result.savings_bytes / (1024 ** 3) * 0.02).toFixed(5)}.
                    </span>
                  </div>
                </div>
              )}

              {/* ─ Upload to StoraX Button ─ */}
              {stage === 'compressed' && result && (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Ready to Store</h4>
                  <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20, lineHeight: 1.6 }}>
                    The compressed file (<strong>{result.compressed_filename}</strong>) is already stored in your bucket. You can view it in My Files.
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a href="/files" style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: '#0F172A', color: 'white', textDecoration: 'none',
                      padding: '14px 24px', borderRadius: 100, fontSize: 15, fontWeight: 700,
                    }}>
                      <Cloud size={18} /> View in My Files
                    </a>
                    <button onClick={handleReset} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: 'white', color: '#374151', border: '1px solid #E5E7EB',
                      padding: '14px 20px', borderRadius: 100, fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit'
                    }}>
                      <RefreshCw size={15} /> New File
                    </button>
                  </div>
                </div>
              )}

              {/* ─ Upload original button (when compression not possible) ─ */}
              {stage === 'analyzed' && !canCompress && (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24, textAlign: 'center' }}>
                  <p style={{ fontSize: 14, color: '#64748B', marginBottom: 16 }}>This file is already optimized. Upload the original file directly to StoraX.</p>
                  <button onClick={handleUploadOriginal} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: '#0F172A', color: 'white', border: 'none',
                    padding: '15px 24px', borderRadius: 100, fontSize: 15, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit'
                  }}>
                    <Cloud size={18} /> Upload to StoraX
                  </button>
                </div>
              )}

              {/* ─ Action Buttons when compressible ─ */}
              {stage === 'analyzed' && canCompress && (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24 }}>
                  <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16, lineHeight: 1.6 }}>
                    AI recommends compressing this file before storing. You'll save approximately <strong style={{ color: '#059669' }}>{analysis.estimated_savings_percent.toFixed(0)}% storage</strong>.
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button onClick={handleCompress} style={{
                      flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: 'white', border: 'none',
                      padding: '15px 24px', borderRadius: 100, fontSize: 15, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit',
                      boxShadow: '0 4px 20px rgba(37,99,235,.3)'
                    }}>
                      <Zap size={18} /> Compress &amp; Upload to StoraX
                    </button>
                    <button onClick={handleUploadOriginal} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: 'white', color: '#374151', border: '1px solid #E5E7EB',
                      padding: '15px 20px', borderRadius: 100, fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit'
                    }}>
                      <Cloud size={15} /> Upload Original
                    </button>
                  </div>
                </div>
              )}

              {/* ─ Uploading Progress ─ */}
              {stage === 'uploading' && (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Uploading to StoraX...</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#2563EB' }}>{uploadProgress}%</span>
                  </div>
                  <div style={{ background: '#F3F4F6', borderRadius: 100, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg,#2563EB,#7C3AED)', borderRadius: 100, transition: 'width .3s ease' }} />
                  </div>
                </div>
              )}

              {/* ─ Done ─ */}
              {stage === 'done' && (
                <div style={{ background: '#F0FDF4', borderRadius: 16, border: '1px solid #BBF7D0', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckCircle size={28} color="#16A34A" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#15803D', fontSize: 15 }}>File stored in StoraX!</div>
                      <div style={{ fontSize: 13, color: '#16A34A' }}>{file.name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <a href="/files" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16A34A', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: 100, fontSize: 13, fontWeight: 700 }}>
                      <ArrowRight size={14} /> View Files
                    </a>
                    <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', border: '1px solid #BBF7D0', color: '#374151', padding: '10px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      <RefreshCw size={13} /> New
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Compression;