import { Server, Socket } from 'socket.io';

interface FeedbackMessage {
  type: string;
  data: any;
  timestamp: number;
}

export class WebSocketManager {
  private io: Server;
  private clients: Map<string, Socket> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  addClient(socket: Socket) {
    this.clients.set(socket.id, socket);
    console.log(`Client ${socket.id} connected. Total clients: ${this.clients.size}`);
  }

  removeClient(socketId: string) {
    this.clients.delete(socketId);
    console.log(`Client ${socketId} disconnected. Total clients: ${this.clients.size}`);
  }

  startSession(socketId: string, data: any) {
    console.log(`Starting session for client ${socketId}`);
  }

  broadcastFeedback(feedback: FeedbackMessage) {
    this.io.emit('visual_feedback', feedback);
  }
} 