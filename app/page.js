// app/page.js
import Head from 'next/head';

export default function Home() {
  return (
    <>
      {/* === Яндекс.Метрика (в <head>) === */}
      <Head>
        <script
          key="yandex-metrica"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=105964105','ym');
              ym(105964105, 'init', {ssr:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
            `,
          }}
        />
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/105964105"
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          </div>
        </noscript>
      </Head>

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
        <p style={{ margin: '0 0 30px', fontSize: '1rem', opacity: 0.7 }}>
          A living digital graffiti wall.
        </p>

        {/* ▼ Адаптивная картинка-плейсхолдер ▼ */}
        <div style={{
          width: '100%',
          maxWidth: '500px',
          height: 'auto',
          margin: '0 auto 30px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #333',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          backgroundColor: '#111',
        }}>
          <img 
            src="https://raw.githubusercontent.com/streetwalldev/streetwall/main/public/placeholder.png"
            alt="preview"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Кнопка: Telegram */}
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
            marginBottom: '16px',
          }}
        >
          🔔 Notify Me in Telegram
        </a>

        {/* НОВАЯ КНОПКА: Песочница */}
        <a
          href="/spraytest"
          style={{
            padding: '12px 28px',
            background: 'transparent',
            color: '#aaa',
            textDecoration: 'none',
            borderRadius: '4px',
            border: '1px solid #555',
            fontWeight: '500',
            fontSize: '1rem',
            display: 'inline-block',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#fff';
            e.target.style.borderColor = '#888';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#aaa';
            e.target.style.borderColor = '#555';
          }}
        >
          🎨 Try Spray Tool (Sandbox)
        </a>

        <p style={{ marginTop: '24px', fontSize: '0.85rem', opacity: 0.5 }}>
          First 100 artists get: free can, protection, NFT access.
        </p>
      </main>
    </>
  );
}
