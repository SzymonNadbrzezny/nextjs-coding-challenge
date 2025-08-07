"use client";
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeaderboardEntry } from "@/lib/socket";

function SortingButton(
  text: string,
  column: Column<LeaderboardEntry, unknown>
): any {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {text}
      <ArrowDown
        className={cn(
          "ml-2 h-4 w-4 transition",
          column.getIsSorted() === "asc" && "stroke-blue-900 rotate-180"
        )}
      />
    </Button>
  );
}

export const columns: ColumnDef<LeaderboardEntry>[] = [
  {
    accessorKey: "username",
    header: ({ column }) => {
      return SortingButton("User Name", column);
    },
  },
  {
    header: ({ column }) => {
      return SortingButton("Accuracy (%)", column);
    },
    accessorKey: "averageAccuracy",
    cell: ({ row }) => {
      return (
        <div className="text-right">{row.getValue("averageAccuracy")}</div>
      );
    },
  },
  {
    header: ({ column }) => {
      return SortingButton("Words per minute", column);
    },
    accessorKey: "averageWpm",
    cell: ({ row }) => {
      return <div className="text-right">{row.getValue("averageWpm")}</div>;
    },
  },
  {
    header: "Live Progress",
    accessorKey: "progress",
  },
];

export default function DataTable<TData, TValue>({
  columns,
  data,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  // Update sorting query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.append("sorting", JSON.stringify(sorting));
  }, [sorting]);

  return (
    <div className="flex flex-col min-h-8/10 gap-2 p-2">
      <Table className="border h-8/10">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="w-full flex gap-2 items-center justify-center">
        <Button
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
