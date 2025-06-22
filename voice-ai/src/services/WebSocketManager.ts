import { Server, Socket } from 'socket.io';
import { WebSocketMessage } from '../../../shared/schemas';

export class WebSocketManager {
  private io: Server;
  private clients: Map<string, Socket> = new Map();
  private sessions: Map<string, any> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  addClient(socket: Socket): void {
    this.clients.set(socket.id, socket);
    console.log(`Client ${socket.id} connected. Total clients: ${this.clients.size}`);
  }

  removeClient(socketId: string): void {
    this.clients.delete(socketId);
    console.log(`Client ${socketId} disconnected. Total clients: ${this.clients.size}`);
  }

  startSession(socketId: string, sessionData: any): void {
    this.sessions.set(socketId, {
      ...sessionData,
      startTime: Date.now(),
      socketId
    });
    console.log(`Session started for client ${socketId}`);
  }

  endSession(socketId: string): void {
    this.sessions.delete(socketId);
    console.log(`Session ended for client ${socketId}`);
  }

  broadcastFeedback(message: WebSocketMessage): void {
    this.io.emit('feedback', message);
    console.log(`Broadcasted feedback to ${this.clients.size} clients`);
  }

  sendToClient(socketId: string, message: WebSocketMessage): void {
    const client = this.clients.get(socketId);
    if (client) {
      client.emit('feedback', message);
      console.log(`Sent feedback to client ${socketId}`);
    } else {
      console.warn(`Client ${socketId} not found`);
    }
  }

  broadcastToSession(sessionId: string, message: WebSocketMessage): void {
    // Find all clients in the same session
    for (const [socketId, session] of this.sessions.entries()) {
      if (session.sessionId === sessionId) {
        this.sendToClient(socketId, message);
      }
    }
  }

  getConnectedClients(): number {
    return this.clients.size;
  }

  getActiveSessions(): number {
    return this.sessions.size;
  }

  getSessionInfo(socketId: string): any {
    return this.sessions.get(socketId);
  }
} 