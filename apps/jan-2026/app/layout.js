export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>StreetWall Art — January 2026</title>
      </head>
      <body style={{ margin: 0, background: '#000', color: '#fff' }}>
        {children}
      </body>
    </html>
  );
}
