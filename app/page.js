'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleOpenSpray = useCallback((e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    router.push('/spraytest');
  }, [loading, router]);

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
    <>
      {loading && (
        <div aria-live="polite" className="loader-overlay" style={{
          position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.75)', zIndex: 2000, backdropFilter: 'blur(4px)'
        }}>
          <div className="loader-box" style={{
            width: 360, maxWidth: '92%', padding: 18, borderRadius: 12, textAlign: 'center',
            color: '#fff', background: 'linear-gradient(135deg, rgba(10,10,10,0.9), rgba(20,20,20,0.85))',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 2px 6px rgba(255,51,102,0.06)'
          }}>
            <style dangerouslySetInnerHTML={{__html: `
              .sprayStroke { height: 12px; border-radius: 8px; margin: 8px auto 18px; width: 100%;
                background: linear-gradient(90deg, transparent 0%, rgba(255,51,102,0.95) 45%, rgba(255,51,102,0.6) 55%, transparent 100%);
                background-size: 200% 100%; animation: sprayMove 2.4s linear infinite;
                box-shadow: 0 6px 18px rgba(255,51,102,0.08) inset;
              }
              @keyframes sprayMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
              .droplet { width: 8px; height: 8px; background: #ff3366; border-radius: 50%; display: inline-block; margin: 0 6px; opacity: 0.9; animation: drip 1.6s ease-in-out infinite; }
              .droplet:nth-child(2) { animation-delay: 0.2s }
              .droplet:nth-child(3) { animation-delay: 0.4s }
              @keyframes drip { 0% { transform: translateY(0) scale(0.95); opacity: 0.9 } 50% { transform: translateY(6px) scale(1.05); opacity: 0.6 } 100% { transform: translateY(0) scale(0.95); opacity: 0.9 } }
              .loader-title { font-weight: 700; letter-spacing: 0.6px; font-size: 1.05rem; margin-bottom: 6px; color: #fff }
              .loader-sub { color: #d6d6d6; font-size: 0.92rem; margin-bottom: 10px }
            `}} />

            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{width: 60, height: 60, borderRadius: 8, marginRight: 12, background: 'linear-gradient(180deg, #111, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(255,51,102,0.06)'}}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M6 3h9v4H6z" fill="#ff3366" opacity="0.95"/>
                  <rect x="5" y="8" width="14" height="12" rx="2" fill="#111" stroke="#222"/>
                  <circle cx="12" cy="14" r="2.2" fill="#ff3366"/>
                </svg>
              </div>
              <div style={{textAlign: 'left'}}>
                <div className="loader-title">Загрузка стены…</div>
                <div className="loader-sub">Подгружается интерактивный прототип — дождитесь окончания</div>
                <div className="sprayStroke" />
                <div style={{marginTop: 8}}>
                  <span className="droplet"></span>
                  <span className="droplet"></span>
                  <span className="droplet"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}
