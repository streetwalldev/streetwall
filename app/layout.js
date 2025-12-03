// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>StreetWall Art</title>
        <meta name="description" content="A living digital graffiti wall. Launching January 1, 2026." />
        <link rel="icon" href="/favicon.ico" />
        {/* Plausible Analytics — опционально */}
        <script
          defer
          data-domain="streetwall.art"
          src="https://plausible.io/js/script.js"
        ></script>
      </head>
      <body style={{ margin: 0, background: '#000', color: '#fff' }}>
        {children}
      </body>
    </html>
  );
}
