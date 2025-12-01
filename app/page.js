'use client';

import { useEffect, useRef } from 'react';

export default function Home() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (err) {
        console.warn('Autoplay prevented:', err);
      }
    };

    playVideo();

    const handleUserGesture = () => {
      playVideo();
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
    };

    window.addEventListener('click', handleUserGesture);
    window.addEventListener('touchstart', handleUserGesture);

    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
    };
  }, []);

  return (
    <main
      style={{
        padding: '20px',
        fontFamily: 'system-ui, sans-serif',
        background: '#0a0a0a',
        color: '#fff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: '30px',
      }}
    >
      <h1 style={{ fontSize: '2.2rem', margin: 0, fontWeight: 700 }}>
        🏴‍☠️ StreetWall Art
      </h1>
      <p style={{ opacity: 0.7, maxWidth: '600px', margin: 0 }}>
        A living digital graffiti wall. Memory, spray-painted — not erased.
      </p>

      {/* Media Box: 500×500 */}
      <div
        style={{
          position: 'relative',
          width: '500px',
          height: '500px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '1px solid #333',
          background: '#111',
        }}
      >
        {/* Placeholder image */}
        <img
          src="/placeholder.png"
          alt="StreetWall Art — digital graffiti preview"
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

        {/* Video on top */}
        <video
          ref={videoRef}
          src="/preview.mp4"
          autoPlay
          loop
          muted
          playsInline
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
      </div>

      <p style={{ fontSize: '0.9rem', opacity: 0.5, marginTop: '10px' }}>
        Launching January 1, 2026 · <code>streetwall.art</code>
      </p>
    </main>
  );
}
