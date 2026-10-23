import React, { useRef, useState } from 'react';

export function WishContact({ email, title = 'My own wish' }: { email: string; title?: string }) {
  const [status, setStatus] = useState('');
  const [manual, setManual] = useState(false);
  const template = useRef<HTMLTextAreaElement>(null);
  const message = `To: ${email}\nSubject: Codetober 2026 · Make a Wish · ${title}\n\nLeetCode username:\n\nMy choice or proposal: ${title}\n\nHow it helps the community:\n`;
  const [manualText, setManualText] = useState(message);
  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(`${label} copied.`);
    } catch {
      setManualText(text); setManual(true);
      setStatus('Select and copy the text below.');
      requestAnimationFrame(() => { template.current?.focus(); template.current?.select(); });
    }
  }
  return <div className="wish-contact">
    <p className="wish-contact-label">Send your choice from your registration email</p>
    <div className="wish-contact-address"><span>{email}</span><button type="button" onClick={() => void copy(email, 'Email address')}>Copy email</button></div>
    <div className="wish-contact-actions"><button type="button" className="wish-cta" onClick={() => void copy(message, 'Message template')}>Copy choice template</button><span role="status" aria-live="polite">{status}</span></div>
    <details className="wish-contact-template" open={manual || undefined}><summary>View text to copy</summary><textarea ref={template} aria-label="Choice email text" readOnly value={manual ? manualText : message} onFocus={e => e.currentTarget.select()} /></details>
    <p className="wish-mail-note">Paste the address and template into the email service you normally use. Include your LeetCode username and send within 24 hours of winner confirmation.</p>
  </div>;
}
