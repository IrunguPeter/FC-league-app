import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode.react';

type Props = {
  sessionUrl: string;
};

export function SharePanel({ sessionUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sessionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
      <h3
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'center',
        }}
      >
        <Share2 size={20} color="var(--accent-blue)" /> Share
      </h3>
      <div
        style={{
          background: 'white',
          padding: '1rem',
          borderRadius: '1rem',
          display: 'inline-block',
          marginBottom: '1.5rem',
        }}
      >
        <QRCode value={sessionUrl} size={160} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input readOnly value={sessionUrl} style={{ fontSize: '0.8rem' }} />
        <button
          className="btn btn-primary"
          onClick={copyToClipboard}
          style={{ padding: '0 1rem' }}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
      {copied && (
        <p
          style={{
            marginTop: '0.5rem',
            color: 'var(--accent-emerald)',
            fontSize: '0.9rem',
          }}
        >
          Link copied to clipboard!
        </p>
      )}
    </div>
  );
}
