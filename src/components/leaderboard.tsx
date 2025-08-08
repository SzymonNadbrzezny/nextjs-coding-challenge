"use client";

import React, { useEffect, useState } from "react";
import DataTable, { columns } from "./dataTable";
import { LeaderboardEntry, socketManager } from "@/lib/socket";
import { useUserStore } from "@/providers/userStoreProvider";

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const username = useUserStore((state) => state.userName);
  const userId = useUserStore((state) => state.userId);

  useEffect(() => {
    socketManager.connect(userId, username);
    socketManager.onLeaderboardUpdate((data) => {
      setData(() => data);
    });
  }, [userId, username]);
  return <DataTable data={data} columns={columns} />;
}
