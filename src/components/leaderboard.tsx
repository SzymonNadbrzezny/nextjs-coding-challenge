import React from "react";
import DataTable, { columns } from "./dataTable";

export default function Leaderboard({ data }: { data: any }) {
  return <DataTable data={data} columns={columns} />;
}
