// app/spraytest/page.js
'use client';

import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

export default function CollectiveDrawingPage() {
  const canvasRef = useRef(null);
  const [name, setName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [users, setUsers] = useState({});
  const [drawing, setDrawing] = useState([]);
  const socketRef = useRef(null);

  // Инициализация Socket.IO только в браузере
  useEffect(() => {
    // Проверка, что мы в браузере
    if (typeof window === 'undefined') return;

    // Динамический импорт socket.io-client
    let SocketIO;
    import('socket.io-client').then((module) => {
      SocketIO = module.default || module;
      const socket = SocketIO(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
      socketRef.current = socket;

      socket.on('user-update', (updatedUsers) => {
        setUsers(updatedUsers);
      });

      socket.on('draw', ({ x, y, color }) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        setDrawing(prev => [...prev, { x, y, color }]);
      });

      return () => {
        socket.disconnect();
      };
    }).catch(err => {
      console.error('Socket.IO failed to load:', err);
    });
  }, []);

  useEffect(() => {
    if (isNameSet && socketRef.current) {
      socketRef.current.emit('set-name', name);
    }
  }, [isNameSet, name]);

  const handleMouseMove = (event) => {
    if (!isNameSet || !socketRef.current) return;
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
    ctx.fillStyle = '#ff3366';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();

    setDrawing(prev => [...prev, { x, y, color: '#ff3366' }]);
    
    if (socketRef.current) {
      socketRef.current.emit('draw', { x, y, color: '#ff3366' });
    }
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
            placeholder="Ваше имя"
            style={{ padding: '5px', fontSize: '16px' }}
          />
        </header>
        <canvas
          ref={canvasRef}
          width={1024}
          height={768}
          style={{ display: 'block', margin: '0 auto', background: '#111' }}
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
              color: '#fff',
              pointerEvents: 'none',
              fontSize: '12px',
              textShadow: '0 0 4px #000',
            }}
          >
            {user.name}
          </div>
        ))}
      </div>
    </>
  );
}
