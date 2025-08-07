"use client";
import { useState, useEffect } from "react";
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

export default function SpeedTester() {
  const [timer, setTimer] = useState(roundLength);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          return roundLength;
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <Card className=" w-full ">
        <CardHeader>
          <CardDescription className="justify-self-end">
            {"WPM: XXX\t\t-\t\tAccuracy: XX%"}
          </CardDescription>
          <CardTitle>Twój tekst:</CardTitle>
        </CardHeader>
        <CardContent>
          <p>asdasdasdasdasd</p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <div
            className="w-4 h-4 relative flex justify-center items-center rounded-full p-4 border"
            style={{ borderColor: getGradientColor(timer) }}
          >
            {timer}
          </div>
        </CardFooter>
      </Card>
      <Input name='textInput' />
    </>
  );
}
