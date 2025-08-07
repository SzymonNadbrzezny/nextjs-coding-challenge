"use client";
import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import {
  socketManager,
  type SpeedTestData,
  type LeaderboardEntry,
} from "@/lib/socket";
import { Button } from "./ui/button";

const roundLength = 30;
const getGradientColor = (timer: number) => {
  // Calculate percentage (timeLength = 100%, 0 seconds = 0%)
  const percentage = 100 - (timer / roundLength) * 100;
  // Interpolate from black (#000000) to red (#FF0000)
  const red = Math.round((percentage / 100) * 255);
  const green = 0;
  const blue = 0;

  return `#${red.toString(16).padStart(2, "0")}${green
    .toString(16)
    .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
};

export default function SpeedTester({ sentences }: { sentences: any }) {
  const [timer, setTimer] = useState(roundLength);
  const [isTestActive, setIsTestActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [typedText, setTypedText] = useState("");
  const [currentSentence, setCurrentSentence] = useState("");
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * sentences.length);
    setCurrentSentence(sentences[randomIndex]);
  }, []);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userId] = useState(() => crypto.randomUUID());
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Connect to WebSocket on component mount
  useEffect(() => {
    if (username) {
      socketManager.connect(userId, username);
      setIsConnected(true);

      // Set up event listeners
      socketManager.onLeaderboardUpdate((data) => {
        setLeaderboard(data);
      });

      socketManager.onUserStatsUpdate((stats) => {
        console.log("User stats updated:", stats);
      });

      // Request initial leaderboard
      socketManager.requestLeaderboard();
    }

    return () => {
      socketManager.disconnect();
    };
  }, [userId, username]);

  useEffect(() => {
    if (isTestActive) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 0) {
            endTest();
            return roundLength;
          }
          return prevTimer - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTestActive]);

  const startTest = () => {
    if (!username) {
      alert("Please enter a username first!");
      return;
    }
    setIsTestActive(true);
    setStartTime(Date.now());
    setTimer(roundLength);
    setTypedText("");
    setWpm(0);
    setAccuracy(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const endTest = () => {
    if (!startTime || !isConnected) return;

    setIsTestActive(false);
    const endTime = Date.now();
    const timeElapsed = (endTime - startTime) / 1000;
    const totalWords = currentSentence.trim().split(/\s+/).length;
    const errors = calculateErrors(currentSentence, typedText);
    const calculatedWpm = Math.round((totalWords / timeElapsed) * 60);
    const calculatedAccuracy = Math.round(
      ((totalWords - errors) / totalWords) * 100
    );

    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);

    // Send results via WebSocket
    const testData: SpeedTestData = {
      userId,
      username,
      wpm: calculatedWpm,
      accuracy: calculatedAccuracy,
      totalWords,
      totalErrors: errors,
      timeElapsed,
      sentenceId: 1,
    };

    socketManager.sendSpeedTestResult(testData);
  };

  const calculateErrors = (original: string, typed: string): number => {
    const originalWords = original.trim().split(/\s+/);
    const typedWords = typed.trim().split(/\s+/);
    let errors = 0;
    let mask = "";
    for (
      let i = 0;
      i < Math.max(originalWords.length, typedWords.length);
      i++
    ) {
      if (originalWords[i] !== typedWords[i]) {
        errors++;
      }
    }
    return errors;
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTestActive) return;

    const value = e.target.value;
    setTypedText(value);
    calculateErrors(currentSentence, value);
    // Auto-end test if sentence is completed
    if (value.trim() === currentSentence.trim()) {
      endTest();
    }
  };

  const usernameRef = useRef<HTMLInputElement>(null);
  if (!username) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Enter Your Username</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-row gap-2">
          <Input
            placeholder="Username"
            onKeyDown={(e) =>
              e.key === "Enter" ? setUsername(e.currentTarget.value) : e.key
            }
            ref={usernameRef}
          />
          <Button
            onClick={() => {
              if (usernameRef.current && usernameRef.current.value) {
                setUsername(usernameRef.current.value);
              }
            }}
          >
            Submit
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardDescription className="justify-self-end">
            {`WPM: ${wpm}\t\t-\t\tAccuracy: ${accuracy}%`}
          </CardDescription>
          <CardTitle>Your text:</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">{currentSentence}</p>
          {!isTestActive ? (
            <button
              onClick={startTest}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Start Test
            </button>
          ) : (
            <Input
              ref={inputRef}
              name="textInput"
              value={typedText}
              onChange={handleTyping}
              placeholder="Start typing..."
              className="text-lg"
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-600">
            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </div>
          <div
            className="w-8 h-8 relative flex justify-center items-center rounded-full p-2 border"
            style={{ borderColor: getGradientColor(timer) }}
          >
            {timer}
          </div>
        </CardFooter>
      </Card>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <Card className="w-full mt-4">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.userId}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{index + 1}</span>
                    <span>{entry.username}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {entry.averageWpm.toFixed(1)} WPM
                    </p>
                    <p className="text-sm text-gray-600">
                      {entry.averageAccuracy.toFixed(1)}% accuracy
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
