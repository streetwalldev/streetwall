// app/VideoPlaceholder.js
"use client";  // ← ЭТО ОБЯЗАТЕЛЬНО

export default function VideoPlaceholder() {
  const handleError = (e) => {
    console.error('Video failed to load:', e.target.error);
  };

  return (
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
      {/* Placeholder image */}
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
          zIndex: 2,
        }}
      />
      {/* Video — поверх изображения */}
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
          zIndex: 1,
        }}
        onError={handleError}  // ← теперь можно!
      >
        <source src="/preview.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
