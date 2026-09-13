import { useState } from 'react';
import { Share2, Copy, Check, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode.react';

type Props = {
  sessionUrl: string;
};

export function SharePanel({ sessionUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(sessionUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = sessionUrl;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.focus();
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  const shareSession = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Join my FC League session', url: sessionUrl });
    } else {
      await copyToClipboard();
    }
  };

  return (
    <div className="share-panel">
      <h3 className="share-title"><Share2 size={18} color="var(--accent-gold)" /> Share session</h3>
      <p className="meta-text share-subtitle">Scan this code or send the link to your squad.</p>
      <div className="qr-container" aria-label="QR code for this session">
        <QRCode value={sessionUrl} size={176} level="H" includeMargin />
      </div>
      <div className="share-url-row">
        <input readOnly value={sessionUrl} aria-label="Session link" onFocus={(event) => event.currentTarget.select()} />
        <button className="btn btn-primary" onClick={copyToClipboard} aria-label="Copy session link">
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <div className="share-actions">
        <button className="btn btn-ghost" onClick={shareSession}><ExternalLink size={15} /> Share link</button>
        {copied && <span className="copy-success"><Check size={14} /> Copied</span>}
      </div>
    </div>
  );
}
