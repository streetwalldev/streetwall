// app/page.js
export default function Home() {
  return (
    <main style={{
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#000',
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      boxSizing: 'border-box',
    }}>
      <h1 style={{ margin: '0 0 12px', fontSize: '2.4rem', fontWeight: '700' }}>
        Street Wall
      </h1>
      <p style={{ margin: '0 0 6px', fontSize: '1.2rem', opacity: 0.85 }}>
        Coming Soon, in 2026
      </p>
      <p style={{ margin: '0 0 40px', fontSize: '1rem', opacity: 0.7 }}>
        A living digital graffiti wall.
      </p>

      {/* ▼ Адаптивная картинка-плейсхолдер ▼ */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        height: 'auto',
        margin: '0 auto 40px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #333',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        backgroundColor: '#111',
      }}>
        <img 
          src="https://raw.githubusercontent.com/streetwalldev/streetwall/main/public/placeholder.png"
          alt="preview"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Кнопка */}
      <a
        href="https://t.me/streetwallart"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '14px 32px',
          background: '#ff2d55',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '1.05rem',
          display: 'inline-block',
        }}
      >
        Notify Me in Telegram
      </a>
    </main>
  );
}
