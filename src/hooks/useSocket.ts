import { useEffect, useState, useCallback } from "react";
import {
  socketManager,
  type LeaderboardEntry,
  type SpeedTestData,
} from "@/lib/socket";

interface UseSocketOptions {
  userId: string;
  username: string;
  autoConnect?: boolean;
}

interface UseSocketReturn {
  isConnected: boolean;
  socketManager: any;
  sendSpeedTestResult: (data: SpeedTestData) => void;
  requestLeaderboard: () => void;
  requestUserStats: (userId: string) => void;
  onLeaderboardUpdate: (callback: (data: LeaderboardEntry[]) => void) => void;
  onUserStatsUpdate: (callback: (stats: any) => void) => void;
}

export const useSocket = ({
  userId,
  username,
  autoConnect = true,
}: UseSocketOptions): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (autoConnect && userId && username) {
      const socket = socketManager.connect(userId, username);

      socket.on("connect", () => setIsConnected(true));
      socket.on("disconnect", () => setIsConnected(false));
      socket.on("error", () => setIsConnected(false));

      setIsConnected(socketManager.isSocketConnected());

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("error");
      };
    }
  }, [userId, username, autoConnect]);

  const sendSpeedTestResult = useCallback((data: SpeedTestData) => {
    socketManager.sendSpeedTestResult(data);
  }, []);

  const requestLeaderboard = useCallback(() => {
    socketManager.requestLeaderboard();
  }, []);

  const requestUserStats = useCallback((userId: string) => {
    socketManager.requestUserStats(userId);
  }, []);

  const onLeaderboardUpdate = useCallback(
    (callback: (data: LeaderboardEntry[]) => void) => {
      socketManager.onLeaderboardUpdate(callback);
    },
    []
  );

  const onUserStatsUpdate = useCallback((callback: (stats: any) => void) => {
    socketManager.onUserStatsUpdate(callback);
  }, []);

  return {
    socketManager,
    isConnected,
    sendSpeedTestResult,
    requestLeaderboard,
    requestUserStats,
    onLeaderboardUpdate,
    onUserStatsUpdate,
  };
};
