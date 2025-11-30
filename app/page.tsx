export default function Home() {
  return (
    <main style={{
      padding: '40px',
      fontFamily: 'system-ui, sans-serif',
      background: '#000',
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <h1>🎨 StreetWall Art</h1>
      <p>Launching January 1, 2026</p>
      <p>A living digital graffiti wall.<br />
         Memory, spray-painted — not erased.</p>
      <p style={{ marginTop: '30px', fontSize: '0.9rem', opacity: 0.6 }}>
        ✅ GitHub: <code>streetwalldev/streetwall</code>
      </p>
    </main>
  );
}
