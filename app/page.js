'use client';

import { useEffect } from 'react';

export default function Home() {
  // Яндекс.Метрика — client-side
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.yaMetrikaLoaded) {
      const script = document.createElement('script');
      script.innerHTML = `
        (function(m,e,t,r,i,k,a){
          m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
        })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=105964105', 'ym');
        ym(105964105, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
      `;
      document.head.appendChild(script);
      window.yaMetrikaLoaded = true;
    }
  }, []);

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

      <div style={{
        width: '100%',
        maxWidth: '500px',
        margin: '30px auto',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #333',
        backgroundColor: '#111',
      }}>
        <img 
          src="https://raw.githubusercontent.com/streetwalldev/streetwall/main/public/placeholder.png"
          alt="preview"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <a href="https://t.me/streetwallart" target="_blank" style={{
        padding: '12px 28px',
        background: '#ff2d55',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px',
        margin: '8px',
      }}>
        Notify Me in Telegram
      </a>

      <a href="/spraytest" style={{
        padding: '10px 24px',
        border: '1px solid #555',
        color: '#aaa',
        textDecoration: 'none',
        borderRadius: '4px',
      }}>
        Try Spray Tool
      </a>
    </main>
  );
}
