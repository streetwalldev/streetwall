// app/page.js
export default function Home() {
  return (
    <main style={{
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
      background: '#000',
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    }}>
      <h1>Street Wall</h1>
      <p>Coming Soon, in 2026</p>
      <p>A living digital graffiti wall.</p>

      {/* ▼ Картинка — 500×500 px ▼ */}
      <div style={{
        width: '500px',
        height: '500px',
        margin: '40px auto',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #444',
      }}>
        <img 
          src="https://raw.githubusercontent.com/streetwalldev/streetwall/main/public/placeholder.png"
          alt="preview"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <a
        href="https://t.me/streetwallart"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '12px 24px',
          background: '#ff3366',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
        }}
      >
        Notify In Telegram
      </a>
    </main>
  );
}
