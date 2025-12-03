// apps/jan-2026/app/layout.js
export default function JanuaryLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>StreetWall Art — January 2026</title>
      </head>
      <body style={{ margin: 0, overflowX: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
