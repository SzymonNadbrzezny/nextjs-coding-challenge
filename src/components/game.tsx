"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/providers/userStoreProvider";
import { useSocket } from "@/hooks/useSocket";
import type { SpeedTestData } from "@/lib/socket";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
// Constants
const ROUND_LENGTH = 30;
const BREAK_LENGTH = 10;

// Types
interface SpeedTesterProps {
  sentences: string[];
}

interface TestStats {
  wpm: number;
  accuracy: number;
  streak: number;
}

// Utility functions
const getGradientColor = (timer: number): string => {
  const percentage = 100 - (timer / ROUND_LENGTH) * 100;
  const red = Math.round((percentage / 100) * 255);
  
  return `#${red.toString(16).padStart(2, "0")}0000`;
};

const calculateErrors = (original: string, typed: string): number => {
  const originalWords = original.trim().split(/\s+/);
  const typedWords = (typed).trim().split(/\s+/);
  
  let errors = 0;
  const maxLength = Math.max(originalWords.length, typedWords.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (originalWords[i] !== typedWords[i]) {
      errors++;
    }
  }
  
  return errors;
};

const getRandomSentence = (sentences: string[]): string => {
  const randomIndex = Math.floor(Math.random() * sentences.length);
  return 'test';
};

export default function SpeedTester({ sentences }: SpeedTesterProps) {
  // Timer and test state
  const [timer, setTimer] = useState(ROUND_LENGTH);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isTestOngoing, setIsTestOngoing] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Text input state
  const [typedText, setTypedText] = useState("");
  const [currentSentence, setCurrentSentence] = useState("");
  
  // Performance stats
  const [stats, setStats] = useState<TestStats>({ wpm: 0, accuracy: 0, streak: 0 });
  
  // User data
  const [userId] = useState(() => crypto.randomUUID());
  const username = useUserStore((state) => state.userName);
  const setUsername = useUserStore((state) => state.setUserName);
  
  // Socket connection
  const { 
    isConnected, 
    sendSpeedTestResult, 
    onUserStatsUpdate 
  } = useSocket({ 
    userId, 
    username: username || '', 
    autoConnect: !!username 
  });

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with random sentence
  useEffect(() => {
    if (sentences.length > 0) {
      setCurrentSentence(getRandomSentence(sentences));
    }
  }, [sentences]);

  // Set up socket listeners
  useEffect(() => {
    onUserStatsUpdate((userStats) => {
      console.log("User stats updated:", userStats);
    });
  }, [onUserStatsUpdate]);

  const endRound = useCallback((text:string) => {
    if (!startTime || !isConnected || !username) return;
    
    setIsTestActive(false);
    const endTime = Date.now();
    const timeElapsed = (endTime - startTime) / 1000;
    const totalWords = currentSentence.trim().split(/\s+/).length;
    const errors = calculateErrors(currentSentence, text);
    
    const calculatedWpm = Math.round((totalWords / timeElapsed) * 60);
    const calculatedAccuracy = Math.round(((totalWords - errors) / totalWords) * 100);
    
    // Update streak
    const newStreak = errors === 0 ? stats.streak + 1 : 0;
    
    // Update stats with running averages
    const newStats: TestStats = {
      wpm: stats.wpm === 0 ? calculatedWpm : Math.round((stats.wpm + calculatedWpm) / 2),
      accuracy: stats.accuracy === 0 ? calculatedAccuracy : Math.round((stats.accuracy + calculatedAccuracy) / 2),
      streak: newStreak
    };
    
    setStats(newStats);

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
      streak: newStreak,
    };

    sendSpeedTestResult(testData);
    
    // Prepare for next round
    toast.info(`New sentence in ${BREAK_LENGTH} seconds!`);
    setTimer(BREAK_LENGTH);
    setTypedText("");
    setCurrentSentence(getRandomSentence(sentences));
    
    setTimeout(() => {
      setIsTestActive(true);
      setTimer(ROUND_LENGTH);
      inputRef.current?.focus();
    }, BREAK_LENGTH * 1000);
  }, [startTime, isConnected, currentSentence, typedText, userId, username, stats, sentences]);



  // Timer management
  useEffect(() => {
    if (isTestOngoing) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 0 ) {
            if(isTestActive) endRound(typedText);
            return ROUND_LENGTH;
          }
          return prevTimer - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTestActive, isTestOngoing]);

  const startTest = useCallback(() => {
    if (!username) {
      toast.error("Please enter a username first!");
      return;
    }
    
    setCurrentSentence(getRandomSentence(sentences));
    setIsTestActive(true);
    setIsTestOngoing(true);
    setStartTime(Date.now());
    setTimer(ROUND_LENGTH);
    setTypedText("");
    
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [username, sentences]);

  const stopTest = useCallback(() => {
    setIsTestActive(false);
    setIsTestOngoing(false);
    setTimer(ROUND_LENGTH);
    setTypedText("");
    setStats({ wpm: 0, accuracy: 0, streak: 0 });
  }, []);

  const handleTyping = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTestActive) return;

    const value = e.target.value;
    setTypedText(prev => value);
    
    // Auto-end test if sentence is completed
    if (value.trim() === currentSentence.trim()) {
      endRound(value);
    }
  }, [isTestActive, currentSentence, endRound]);

  // Username input component
  const usernameRef = useRef<HTMLInputElement>(null);
  
  const handleUsernameSubmit = useCallback(() => {
    if (usernameRef.current?.value) {
      setUsername(usernameRef.current.value);
    }else{
      toast.error('Please provide username.')
    }
  }, [setUsername]);

  if (!username) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Enter Your Username</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-row gap-2">
          <Input
            placeholder="Username"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) {
                setUsername(e.currentTarget.value);
              }
            }}
            ref={usernameRef}
          />
          <Button onClick={handleUsernameSubmit}>
            Submit
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardDescription className="flex justify-between items-center">
          <span>WPM: {stats.wpm} | Accuracy: {stats.accuracy}% | Streak: {stats.streak}</span>
        </CardDescription>
        <CardTitle>Speed Typing Test</CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-4">
        <div 
          className={cn(
            "text-lg p-4 border rounded-lg bg-gray-50",
            !isTestActive && "bg-gray-800 text-gray-800 select-none"
          )}
        >
          {currentSentence}
        </div>
        
        <div className="flex flex-row gap-4">
          {!isTestOngoing ? (
            <Button
              onClick={startTest}
              className="px-6 py-2"
              disabled={!currentSentence}
            >
              Start Test
            </Button>
          ) : (
            <Input
              ref={inputRef}
              name="textInput"
              value={typedText}
              onChange={handleTyping}
              placeholder="Start typing..."
              className="text-lg"
              disabled={!isTestActive}
            />
          )}
          
          <Button
            disabled={!isTestOngoing}
            onClick={stopTest}
            variant="destructive"
            className="px-6 py-2"
          >
            Stop Test
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className={isConnected ? "text-green-600" : "text-red-600"}>
            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </span>
        </div>
        
        <div
          className="w-12 h-12 flex justify-center items-center rounded-full border-2 font-mono font-bold"
          style={{ borderColor: getGradientColor(timer) }}
        >
          {timer}
        </div>
      </CardFooter>
    </Card>
  );
}
