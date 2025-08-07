import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server, Socket } from 'socket.io';

// In-memory storage for speed test data
interface User {
  id: string;
  username: string;
  createdAt: string;
}

interface SpeedTestRecord {
  id: string;
  userId: string;
  username: string;
  wpm: number;
  accuracy: number;
  totalWords: number;
  totalErrors: number;
  timeElapsed: number;
  sentenceId: number;
  createdAt: string;
}

interface UserStats {
  userId: string;
  username: string;
  averageWpm: number;
  averageAccuracy: number;
  totalTests: number;
  bestWpm: number;
  bestAccuracy: number;
  lastTestDate: string;
}

// In-memory database
const users = new Map<string, User>();
const speedTestRecords = new Map<string, SpeedTestRecord>();

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Prepare the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create Socket.IO server
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;
    const username = socket.handshake.query.username as string;
    
    console.log(`User connected: ${username} (${userId})`);

    // Store user if not exists
    if (userId && username && !users.has(userId)) {
      users.set(userId, {
        id: userId,
        username,
        createdAt: new Date().toISOString()
      });
    }

    // Handle speed test results
    socket.on('speed-test-result', (data: any) => {
      const record: SpeedTestRecord = {
        id: crypto.randomUUID(),
        userId: data.userId,
        username: data.username,
        wpm: data.wpm,
        accuracy: data.accuracy,
        totalWords: data.totalWords,
        totalErrors: data.totalErrors,
        timeElapsed: data.timeElapsed,
        sentenceId: data.sentenceId,
        createdAt: new Date().toISOString()
      };

      speedTestRecords.set(record.id, record);
      console.log(`Speed test result saved: ${data.username} - ${data.wpm} WPM, ${data.accuracy}% accuracy`);

      // Broadcast updated leaderboard to all clients
      const leaderboard = getLeaderboard();
      console.log(leaderboard)
      io.emit('leaderboard-update', leaderboard);

      // Send updated stats to the user
      const userStats = getUserStats(data.userId);
      if (userStats) {
        socket.emit('user-stats-update', userStats);
      }
    });

    // Handle leaderboard requests
    socket.on('request-leaderboard', () => {
      const leaderboard = getLeaderboard();
      socket.emit('leaderboard-update', leaderboard);
    });

    // Handle user stats requests
    socket.on('request-user-stats', (data: { userId: string }) => {
      const userStats = getUserStats(data.userId);
      if (userStats) {
        socket.emit('user-stats-update', userStats);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${username} (${userId})`);
    });
  });

  // Helper functions
  function getLeaderboard(): UserStats[] {
    const userStatsMap = new Map<string, UserStats>();

    // Calculate stats for each user
    for (const record of speedTestRecords.values()) {
      const existing = userStatsMap.get(record.userId);
      
      if (existing) {
        existing.totalTests++;
        existing.averageWpm = (existing.averageWpm * (existing.totalTests - 1) + record.wpm) / existing.totalTests;
        existing.averageAccuracy = (existing.averageAccuracy * (existing.totalTests - 1) + record.accuracy) / existing.totalTests;
        existing.bestWpm = Math.max(existing.bestWpm, record.wpm);
        existing.bestAccuracy = Math.max(existing.bestAccuracy, record.accuracy);
        existing.lastTestDate = record.createdAt;
      } else {
        userStatsMap.set(record.userId, {
          userId: record.userId,
          username: record.username,
          averageWpm: record.wpm,
          averageAccuracy: record.accuracy,
          totalTests: 1,
          bestWpm: record.wpm,
          bestAccuracy: record.accuracy,
          lastTestDate: record.createdAt
        });
      }
    }

    // Convert to array and sort by average WPM
    return Array.from(userStatsMap.values())
      .sort((a, b) => b.averageWpm - a.averageWpm)
      .slice(0, 10);
  }

  function getUserStats(userId: string): UserStats | null {
    const userRecords = Array.from(speedTestRecords.values())
      .filter(record => record.userId === userId);

    if (userRecords.length === 0) return null;

    const totalWpm = userRecords.reduce((sum, record) => sum + record.wpm, 0);
    const totalAccuracy = userRecords.reduce((sum, record) => sum + record.accuracy, 0);
    const bestWpm = Math.max(...userRecords.map(record => record.wpm));
    const bestAccuracy = Math.max(...userRecords.map(record => record.accuracy));
    const lastTestDate = userRecords
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt;

    return {
      userId,
      username: userRecords[0].username,
      averageWpm: totalWpm / userRecords.length,
      averageAccuracy: totalAccuracy / userRecords.length,
      totalTests: userRecords.length,
      bestWpm,
      bestAccuracy,
      lastTestDate
    };
  }

  server.listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running on port ${port}`);
    console.log(`> Speed tester WebSocket server ready`);
  });
});
