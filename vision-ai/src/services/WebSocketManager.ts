import { Server, Socket } from 'socket.io';
import { VisualFeedback, WebSocketMessage } from '../../../shared/schemas';

/**
 * @class WebSocketManager
 *
 * Manages WebSocket connections for the Vision AI service, allowing for
 * real-time broadcasting of visual feedback to connected clients (like the Game UI).
 *
 * This is a placeholder for Person B (Vision AI) to implement and integrate
 * with the main server logic in `index.ts`.
 */
export class WebSocketManager {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.initialize();
  }

  private initialize(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`New client connected to Vision AI: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });

      socket.on('request_visual_stream', (data) => {
        // Logic to handle a client's request to start receiving a stream
        console.log(`Client ${socket.id} requested visual stream with data:`, data);
      });
    });
    console.log('Vision AI WebSocketManager initialized.');
  }

  /**
   * Broadcasts visual feedback to all connected clients.
   *
   * @param feedback - The visual feedback object to be sent.
   */
  public broadcastVisualFeedback(feedback: VisualFeedback): void {
    const message: WebSocketMessage = {
      type: 'visual_feedback',
      data: feedback,
      timestamp: Date.now(),
    };
    this.io.emit('visual_feedback', message);
    console.log('Broadcasted visual feedback to clients.');
  }

  /**
   * Sends a message to a specific client.
   *
   * @param socketId - The ID of the socket to send the message to.
   * @param event - The event name.
   * @param data - The data to send.
   */
  public sendMessageToClient(socketId: string, event: string, data: any): void {
    this.io.to(socketId).emit(event, data);
  }

  /**
   * Closes the WebSocket server.
   */
  public close(): void {
    this.io.close(() => {
      console.log('Vision AI WebSocket server closed.');
    });
  }
} 