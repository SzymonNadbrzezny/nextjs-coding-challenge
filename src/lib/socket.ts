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

  connect(userId: string, username: string) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io("http://localhost:3000", {
      query: {
        userId,
        username,
      },
    });

    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      this.isConnected = false;
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
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
