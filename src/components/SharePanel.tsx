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
    <div className="share-panel">
      <h3
        style={{
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'center',
        }}
      >
        <Share2 size={18} color="var(--accent-blue)" /> Share Session
      </h3>
      <p
        className="meta-text"
        style={{ marginBottom: '1rem', fontSize: '0.85rem' }}
      >
        Scan or share the link below
      </p>
      <div className="qr-container">
        <QRCode value={sessionUrl} size={150} level="M" />
      </div>
      <div className="share-url-row">
        <input readOnly value={sessionUrl} style={{ fontSize: '0.75rem' }} />
        <button
          className="btn btn-primary"
          onClick={copyToClipboard}
          style={{ padding: '0 0.9rem', flexShrink: 0 }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      {copied && <p className="copy-success">Copied to clipboard!</p>}
    </div>
  );
}
