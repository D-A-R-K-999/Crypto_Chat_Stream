import { io, Socket } from 'socket.io-client';

export type SocketEvents = {
  // Server events
  connect: () => void;
  disconnect: () => void;
  error: (data: { message: string }) => void;
  user_list_update: (users: Record<string, string>) => void;
  new_private_message: (data: { from: string; message: string }) => void;
  
  // Client events
  register: (data: { username: string; public_key: string }) => void;
  private_message: (data: { to: string; message: string }) => void;
};

class SocketService {
  private socket: Socket | null = null;
  private serverUrl = 'http://localhost:5000'; // Update this to match your server

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Event emission helpers
  register(username: string, publicKey: string): void {
    this.socket?.emit('register', { username, public_key: publicKey });
  }

  sendPrivateMessage(to: string, message: string): void {
    this.socket?.emit('private_message', { to, message });
  }
}

export const socketService = new SocketService();