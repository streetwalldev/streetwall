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
      <h1 style={{ margin: '0 0 20px', fontSize: '2rem' }}>
        Street Wall
      </h1>
      <p style={{ opacity: 0.8, marginBottom: '30px' }}>
        Coming Soon, in 2026<br />
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
        border: '1px solid #444',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        backgroundColor: '#111', // fallback для мгновенного отображения
      }}>
        {/* Placeholder image — показывается до загрузки видео */}
        <img
          src="/placeholder.png"
          alt="StreetWall Art preview placeholder"
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
        >
          <source src="/preview.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
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
          fontWeight: 'bold',
          display: 'inline-block',
        }}
      >
        Notify Me in Telegram
      </a>
    </main>
  );
}
