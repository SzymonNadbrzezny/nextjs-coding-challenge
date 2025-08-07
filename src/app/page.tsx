import SpeedTester from "@/components/game";
import Leaderboard from "@/components/leaderboard";

import sentences from "@/lib/sentences.json";
export default function Home() {

  return (
    <main className="p-20 w-full flex flex-row gap-[32px] row-start-2 items-center sm:items-start">
      <div className="flex w-full flex-col gap-2">
        <SpeedTester sentences={sentences}/>
      </div>
      <div className="w-full flex-1/3 ">
        <Leaderboard />
      </div>
    </main>
  );
}
