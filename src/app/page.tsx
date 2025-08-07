import SpeedTester from "@/components/game";
import Leaderboard from "@/components/leaderboard";
import Image from "next/image";

export default function Home() {
  const testData = [
    {
      userName: "John Doe",
      accuracy: 0.95,
      wpm: 100,
      words: "adsad",
    },
    {
      userName: "Jane Doe",
      accuracy: 0.92,
      wpm: 90,
      words: "asdad",
    },
    {
      userName: "Alex Smith",
      accuracy: 0.98,
      wpm: 110,
      words: "sadas",
    },
    {
      userName: "Emily Johnson",
      accuracy: 0.93,
      wpm: 95,
      words: "dasad",
    },
    {
      userName: "Michael Brown",
      accuracy: 0.96,
      wpm: 105,
      words: "sadas",
    },
    {
      userName: "John Doe",
      accuracy: 0.95,
      wpm: 100,
      words: "adsad",
    },
    {
      userName: "Jane Doe",
      accuracy: 0.92,
      wpm: 90,
      words: "asdad",
    },
    {
      userName: "Alex Smith",
      accuracy: 0.98,
      wpm: 110,
      words: "sadas",
    },
    {
      userName: "Emily Johnson",
      accuracy: 0.93,
      wpm: 95,
      words: "dasad",
    },
    {
      userName: "Michael Brown",
      accuracy: 0.96,
      wpm: 105,
      words: "sadas",
    },
    {
      userName: "John Doe",
      accuracy: 0.95,
      wpm: 100,
      words: "adsad",
    },
    {
      userName: "Jane Doe",
      accuracy: 0.92,
      wpm: 90,
      words: "asdad",
    },
    {
      userName: "Alex Smith",
      accuracy: 0.98,
      wpm: 110,
      words: "sadas",
    },
    {
      userName: "Emily Johnson",
      accuracy: 0.93,
      wpm: 95,
      words: "dasad",
    },
    {
      userName: "Michael Brown",
      accuracy: 0.96,
      wpm: 105,
      words: "sadas",
    },
    {
      userName: "Sarah Lee",
      accuracy: 0.91,
      wpm: 85,
      words: "asdad",
    },
    {
      userName: "David Davis",
      accuracy: 0.97,
      wpm: 115,
      words: "adasd",
    },
    {
      userName: "Jessica Taylor",
      accuracy: 0.94,
      wpm: 100,
      words: "sadas",
    },
    {
      userName: "Kevin White",
      accuracy: 0.99,
      wpm: 120,
      words: "adasd",
    },
    {
      userName: "Lisa Nguyen",
      accuracy: 0.92,
      wpm: 90,
      words: "asdad",
    },
  ];
  return (
    <main className="p-20 w-full flex flex-row gap-[32px] row-start-2 items-center sm:items-start">
      <div className="flex w-full flex-col gap-2">
        <SpeedTester />
      </div>
      <div className="w-full flex-1/3 ">
        <Leaderboard data={testData} />
      </div>
    </main>
  );
}
