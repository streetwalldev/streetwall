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

      {/* ▼ Видео-плейсхолдер 500×500 px ▼ */}
      <div style={{
        position: 'relative',
        width: '500px',
        height: '500px',
        margin: '0 auto 40px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #333',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        backgroundColor: '#111',
      }}>
        {/* Placeholder image — fallback до загрузки видео */}
        <img
          src="/placeholder.png"
          alt="StreetWall preview"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
          }}
        />
        {/* Видео — поверх изображения */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 2,
          }}
          onError={(e) => {
            console.error('Video failed to load:', e.target.error);
          }}
        >
          <source src="/preview.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
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
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#ff1a44'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#ff2d55'}
      >
        Notify Me in Telegram
      </a>
    </main>
  );
}
