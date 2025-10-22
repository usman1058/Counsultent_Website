import { Server } from 'socket.io';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join different rooms based on user type
    socket.on('join-room', (room: string) => {
      socket.join(room);
      console.log(`Client ${socket.id} joined room: ${room}`);
    });

    // Handle real-time notifications
    socket.on('send-notification', (notification: {
      type: 'info' | 'success' | 'warning' | 'error';
      title: string;
      message: string;
      room?: string;
    }) => {
      const targetRoom = notification.room || 'all';
      io.to(targetRoom).emit('notification', {
        ...notification,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      });
    });

    // Handle contact form submissions (real-time updates for admin)
    socket.on('contact-submitted', (data: {
      name: string;
      email: string;
      purpose: string;
    }) => {
      // Notify admin users
      io.to('admin').emit('new-contact', {
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      });
    });

    // Handle lucky draw entries
    socket.on('lucky-draw-entry', (data: {
      name: string;
      country: string;
    }) => {
      // Notify admin users
      io.to('admin').emit('new-lucky-draw-entry', {
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      });
      
      // Update participant count for all users
      const participantCount = io.sockets.sockets.size;
      io.emit('participant-count-updated', {
        count: participantCount,
        timestamp: new Date().toISOString()
      });
    });

    // Handle messages
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only the client who send the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Update participant count
      const participantCount = io.sockets.sockets.size;
      io.emit('participant-count-updated', {
        count: participantCount,
        timestamp: new Date().toISOString()
      });
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to Study Abroad with Hadi Real-time System!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });

    // Send current participant count
    const participantCount = io.sockets.sockets.size;
    socket.emit('participant-count-updated', {
      count: participantCount,
      timestamp: new Date().toISOString()
    });
  });
};