'use client';

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Head from 'next/head';

export default function CollectiveDrawingPage() {
  const canvasRef = useRef(null);
  const [name, setName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [users, setUsers] = useState({});
  const [drawing, setDrawing] = useState([]); // Added for local state management of drawings
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL);

    socketRef.current.on('user-update', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socketRef.current.on('draw', ({ x, y, color, userId }) => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Update local drawing state
      setDrawing((prevDrawing) => [...prevDrawing, { x, y, color }]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isNameSet) {
      socketRef.current.emit('set-name', name);
    }
  }, [isNameSet, name]);

  const handleMouseMove = (event) => {
    if (!isNameSet) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    socketRef.current.emit('cursor-move', { x, y });
  };

  const handleCanvasClick = (event) => {
    if (!isNameSet) {
      const userName = prompt('Введите ваше имя:');
      if (userName) {
        setName(userName);
        setIsNameSet(true);
      }
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red'; // Example color
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Update local drawing state
    setDrawing((prevDrawing) => [...prevDrawing, { x, y, color: 'red' }]);

    socketRef.current.emit('draw', { x, y, color: 'red' });
  };

  return (
    <>
      <Head>
        <title>Collective Drawing</title>
        <meta name="description" content="Collaborative drawing app" />
      </Head>
      <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
        <header style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите ваше имя"
            style={{ padding: '5px', fontSize: '16px' }}
          />
        </header>
        <canvas
          ref={canvasRef}
          width={1024}
          height={768}
          style={{ display: 'block', margin: '0 auto', background: '#fff' }}
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
        />
        {Object.entries(users).map(([id, user]) => (
          <div
            key={id}
            style={{
              position: 'absolute',
              left: user.x,
              top: user.y,
              transform: 'translate(-50%, -50%)',
              color: 'white',
              pointerEvents: 'none',
            }}
          >
            {user.name}
          </div>
        ))}
      </div>
    </>
  );
}
