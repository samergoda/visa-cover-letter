"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Plus,
  Search,
  Download,
  Trash2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/applicants/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Applicant, VisaStatus, PaginatedResult } from "@/types";

export default function ApplicantsPage() {
  const router = useRouter();

  const [data, setData] = useState<PaginatedResult<Applicant>>({
    data: [],
    meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  });
  const [statuses, setStatuses] = useState<VisaStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [bulkStatusId, setBulkStatusId] = useState("");

  const selectedIds = Object.entries(rowSelection)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const fetchApplicants = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter && statusFilter !== "all") params.set("status_id", statusFilter);
      params.set("page", String(page));
      params.set("pageSize", "20");
      if (sorting.length > 0) {
        params.set("sortBy", sorting[0].id);
        params.set("sortDir", sorting[0].desc ? "desc" : "asc");
      }

      const res = await fetch(`/api/applicants?${params.toString()}`);
      const result = await res.json() as PaginatedResult<Applicant>;
      setData(result);
    } catch {
      toast.error("Failed to load applicants");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page, sorting]);

  useEffect(() => {
    fetch("/api/settings/statuses")
      .then((r) => r.json())
      .then((d: VisaStatus[]) => setStatuses(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    void fetchApplicants();
  }, [fetchApplicants]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => fetchApplicants(), 400);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/applicants/${id}`, { method: "DELETE" });
      toast.success("Applicant deleted");
      void fetchApplicants();
    } catch {
      toast.error("Failed to delete applicant");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_delete", ids: selectedIds }),
      });
      toast.success(`${selectedIds.length} applicant(s) deleted`);
      setRowSelection({});
      void fetchApplicants();
    } catch {
      toast.error("Bulk delete failed");
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatusId) return;
    try {
      await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_status",
          ids: selectedIds,
          status_id: bulkStatusId,
        }),
      });
      toast.success(`Status updated for ${selectedIds.length} applicant(s)`);
      setRowSelection({});
      setBulkStatusId("");
      void fetchApplicants();
    } catch {
      toast.error("Bulk status update failed");
    }
  };

  const handleExport = async (exportSelected = false) => {
    try {
      const body: Record<string, unknown> = { includeChecklists: true };
      if (exportSelected && selectedIds.length > 0) {
        body.ids = selectedIds;
      }

      const res = await fetch("/api/applicants/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `applicants-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch {
      toast.error("Export failed");
    }
  };

  const columns: ColumnDef<Applicant>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      size: 40,
    },
    {
      accessorKey: "full_name",
      header: "Applicant Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.full_name}</div>
      ),
    },
    {
      accessorKey: "passport_number",
      header: "Passport No.",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.passport_number ?? "—"}</span>
      ),
    },
    {
      accessorKey: "nationality",
      header: "Nationality",
    },
    {
      accessorKey: "destination_country",
      header: "Destination",
    },
    {
      accessorKey: "arrival_date",
      header: "Travel Date",
      cell: ({ row }) =>
        row.original.arrival_date
          ? format(new Date(row.original.arrival_date), "MMM d, yyyy")
          : "—",
    },
    {
      id: "visa_status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.visa_status} />,
    },
    {
      accessorKey: "assigned_employee",
      header: "Assigned To",
      cell: ({ row }) => row.original.assigned_employee ?? "—",
    },
    {
      accessorKey: "progress_percentage",
      header: "Progress",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-[100px]">
          <Progress value={row.original.progress_percentage} className="h-1.5" />
          <span className="text-xs tabular-nums text-muted-foreground">
            {row.original.progress_percentage}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy"),
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ row }) => format(new Date(row.original.updated_at), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/applicants/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" /> View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Applicant?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {row.original.full_name} and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(row.original.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      size: 50,
    },
  ];

  const table = useReactTable({
    data: data.data,
    columns,
    state: { rowSelection, sorting },
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: data?.meta?.totalPages,
  });

  return (
    <DashboardLayout
      title="Applicants"
      description={`${data?.meta?.total} total applicant${data?.meta?.total !== 1 ? "s" : ""}`}
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, passport, nationality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Array.isArray(statuses) && statuses?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={() => fetchApplicants()}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport(false)}>
                Export All
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport(true)}
                disabled={selectedIds.length === 0}
              >
                Export Selected ({selectedIds.length})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild>
            <Link href="/applicants/new">
              <Plus className="h-4 w-4" />
              New Applicant
            </Link>
          </Button>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3">
            <Badge variant="secondary">{selectedIds.length} selected</Badge>

            <Select value={bulkStatusId} onValueChange={setBulkStatusId}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Update status..." />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkStatusUpdate}
              disabled={!bulkStatusId}
            >
              Apply Status
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedIds.length} applicant(s)?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all selected applicants and their data. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border overflow-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-medium text-muted-foreground"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={header.column.getCanSort() ? "flex items-center gap-1 cursor-pointer select-none" : ""}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-muted-foreground/50">
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronsUpDown className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-muted-foreground">
                    No applicants found.{" "}
                    <Link href="/applicants/new" className="text-primary hover:underline">
                      Add the first one.
                    </Link>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/30 cursor-pointer"
                    onClick={() => router.push(`/applicants/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data?.meta?.total)} of {data?.meta?.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data?.meta?.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
