// Password reset email template.

export function PasswordResetTemplate({ name, resetUrl }: { name: string; resetUrl: string }) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>Hi {name}</h1>
      <p>Someone (hopefully you) requested a password reset for your HirePilot account.</p>
      <p>
        <a
          href={resetUrl}
          style={{
            background: '#4F46E5',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          Reset password
        </a>
      </p>
      <p style={{ color: '#666', fontSize: 12 }}>
        This link expires in 1 hour. If you didn&rsquo;t request this, ignore this email — your
        password is unchanged.
      </p>
    </div>
  );
}
