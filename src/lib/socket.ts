import { io, Socket } from "socket.io-client";

export interface SpeedTestData {
  userId: string;
  username: string;
  wpm: number;
  accuracy: number;
  totalWords: number;
  totalErrors: number;
  timeElapsed: number;
  sentenceId: number;
  streak: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  averageWpm: number;
  averageAccuracy: number;
  totalTests: number;
  bestWpm: number;
  bestAccuracy: number;
  lastTestDate: string;
}

class SocketManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private currentUserId: string | null = null;
  private currentUsername: string | null = null;

  connect(userId: string, username: string) {
    // Avoid reconnecting if already connected with the same user
    if (
      this.socket &&
      this.isConnected &&
      this.currentUserId === userId &&
      this.currentUsername === username
    ) {
      return this.socket;
    }

    this.currentUserId = userId;
    this.currentUsername = username;

    this.socket = io("http://localhost:3000", {
      query: { userId, username },
    });

    this.socket.on("connect", () => {
      console.log(`Connected to WebSocket server as ${username}`);
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      this.isConnected = false;
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUserId = null;
      this.currentUsername = null;
    }
  }

  sendSpeedTestResult(data: SpeedTestData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("speed-test-result", data);
    }
  }

  onLeaderboardUpdate(callback: (leaderboard: LeaderboardEntry[]) => void) {
    if (this.socket) {
      this.socket.on("leaderboard-update", callback);
    }
  }

  onUserStatsUpdate(callback: (stats: any) => void) {
    if (this.socket) {
      this.socket.on("user-stats-update", callback);
    }
  }

  requestLeaderboard() {
    if (this.socket && this.isConnected) {
      this.socket.emit("request-leaderboard");
    }
  }

  requestUserStats(userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit("request-user-stats", { userId });
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

export const socketManager = new SocketManager();
