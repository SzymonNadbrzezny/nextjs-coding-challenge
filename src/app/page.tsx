import SpeedTester from "@/components/game";
import Leaderboard from "@/components/leaderboard";
import sentences from "@/lib/sentences.json";

export default function Home() {
  return (
    <main className="p-8 w-full flex flex-col lg:flex-row gap-8 items-start">
      <div className="w-full flex-col gap-2">
        <SpeedTester sentences={sentences} />
      </div>
      <div className="flex-1/3">
        <Leaderboard />
      </div>
    </main>
  );
}
