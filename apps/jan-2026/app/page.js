// app/page.js
export default function HomePage() {
  return (
    <main style={{
      padding: '40px',
      fontFamily: 'system-ui, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      background: '#000',
      color: '#fff'
    }}>
      <h1 style={{ fontSize: '2.5rem', margin: '0 0 20px' }}>🎨 StreetWall Art</h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.85 }}>Coming Soon — January 1, 2026</p>
      <p style={{ marginBottom: '30px', opacity: 0.7 }}>
        A living digital graffiti wall.<br />
        Memory, spray-painted — not erased.
      </p>
      <a
        href="/jan-2026"
        style={{
          padding: '14px 32px',
          background: '#ff2d55',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '1.05rem',
          display: 'inline-block'
        }}
      >
        🔍 Preview January 2026
      </a>
    </main>
  );
}
