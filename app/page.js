// app/page.js — остаётся Server Component (без "use client")
import VideoPlaceholder from './VideoPlaceholder';

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
      <h1 style={{ margin: '0 0 12px', fontSize: '2.4rem', fontWeight: '700' }}>
        Street Wall
      </h1>
      <p style={{ margin: '0 0 6px', fontSize: '1.2rem', opacity: 0.85 }}>
        Coming Soon, in 2026
      </p>
      <p style={{ margin: '0 0 40px', fontSize: '1rem', opacity: 0.7 }}>
        A living digital graffiti wall.
      </p>

      {/* ▼ Видео-плейсхолдер — теперь как отдельный Client Component ▼ */}
      <VideoPlaceholder />

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
