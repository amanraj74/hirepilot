// Minimal verification-email template (Day 3 swaps this for a full
// React Email component). Kept inline-importable from the server action.

export function EmailVerificationTemplate({
  name,
  verifyUrl,
}: {
  name: string;
  verifyUrl: string;
}) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>Welcome to HirePilot, {name}</h1>
      <p>Confirm your recruiter email to start posting jobs.</p>
      <p>
        <a
          href={verifyUrl}
          style={{
            background: '#4F46E5',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          Verify email
        </a>
      </p>
      <p style={{ color: '#666', fontSize: 12 }}>This link expires in 24 hours.</p>
    </div>
  );
}
