"use client";

import { useState, useDeferredValue } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
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
import { useApplicants, useStatuses } from "@/hooks/use-api";
import type { Applicant } from "@/types";

export default function ApplicantsPage() {
  const router = useRouter();
  const t = useTranslations("ApplicantsPage");
  const queryClient = useQueryClient();

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [bulkStatusId, setBulkStatusId] = useState("");

  // Debounce search with useDeferredValue
  const deferredSearch = useDeferredValue(search);

  const selectedIds = Object.entries(rowSelection)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const { data: statusesData } = useStatuses();
  const statuses = Array.isArray(statusesData) ? statusesData : [];

  const {
    data: applicantsData,
    isLoading,
    refetch: refetchApplicants,
  } = useApplicants({
    search: deferredSearch,
    statusFilter,
    page,
    pageSize: 20,
    sortBy: sorting.length > 0 ? sorting[0].id : undefined,
    sortDir: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined,
  });

  const data = applicantsData ?? {
    data: [],
    meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  };

  const invalidateApplicants = () => {
    void queryClient.invalidateQueries({ queryKey: ["applicants"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/applicants/${id}`, { method: "DELETE" });
      toast.success(t("toasts.deleted"));
      invalidateApplicants();
    } catch {
      toast.error(t("toasts.failedDelete"));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_delete", ids: selectedIds }),
      });
      toast.success(t("toasts.bulkDeleted", { count: selectedIds.length }));
      setRowSelection({});
      invalidateApplicants();
    } catch {
      toast.error(t("toasts.failedBulkDelete"));
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
      toast.success(t("toasts.bulkStatusUpdated", { count: selectedIds.length }));
      setRowSelection({});
      setBulkStatusId("");
      invalidateApplicants();
    } catch {
      toast.error(t("toasts.failedBulkStatus"));
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
      toast.success(t("toasts.exportDownloaded"));
    } catch {
      toast.error(t("toasts.exportFailed"));
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
      header: t("columns.name"),
      cell: ({ row }) => <div className="font-medium">{row.original.full_name}</div>,
    },
    {
      accessorKey: "passport_number",
      header: t("columns.passport"),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.passport_number ?? "—"}</span>
      ),
    },
    {
      accessorKey: "nationality",
      header: t("columns.nationality"),
    },
    {
      accessorKey: "destination_country",
      header: t("columns.destination"),
    },
    {
      accessorKey: "arrival_date",
      header: t("columns.travelDate"),
      cell: ({ row }) =>
        row.original.arrival_date
          ? format(new Date(row.original.arrival_date), "MMM d, yyyy")
          : "—",
    },
    {
      id: "visa_status",
      header: t("columns.status"),
      cell: ({ row }) => <StatusBadge status={row.original.visa_status} />,
    },
    {
      accessorKey: "assigned_employee",
      header: t("columns.assignedTo"),
      cell: ({ row }) => row.original.assigned_employee ?? "—",
    },
    {
      accessorKey: "progress_percentage",
      header: t("columns.progress"),
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
      header: t("columns.created"),
      cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy"),
    },
    {
      accessorKey: "updated_at",
      header: t("columns.updated"),
      cell: ({ row }) => format(new Date(row.original.updated_at), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{t("actions.label")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/applicants/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" /> {t("actions.viewProfile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" /> {t("actions.delete")}
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("actions.deleteTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("actions.deleteDescription", { name: row.original.full_name })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(row.original.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("delete")}
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
      title={t("title")}
      description={t("description", { total: data?.meta?.total ?? 0 })}
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rtl:pl-3 rtl:pr-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("filterPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={() => refetchApplicants()}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                {t("export")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport(false)}>
                {t("exportAll")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport(true)}
                disabled={selectedIds.length === 0}
              >
                {t("exportSelected", { count: selectedIds.length })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild>
            <Link href="/applicants/new">
              <Plus className="h-4 w-4" />
              {t("newApplicant")}
            </Link>
          </Button>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3">
            <Badge variant="secondary">{t("selectedCount", { count: selectedIds.length })}</Badge>

            <Select value={bulkStatusId} onValueChange={setBulkStatusId}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder={t("updateStatusPlaceholder")} />
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
              {t("applyStatus")}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                  {t("deleteSelected")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("bulkDeleteTitle", { count: selectedIds.length })}
                  </AlertDialogTitle>
                  <AlertDialogDescription>{t("bulkDeleteDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("deleteAll")}
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
                      className="px-4 py-3 text-left rtl:text-right font-medium text-muted-foreground"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "flex items-center gap-1 cursor-pointer select-none"
                              : ""
                          }
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
                    {t("noApplicants")}
                    <Link href="/applicants/new" className="text-primary hover:underline">
                      {t("addFirst")}
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
            {t("showing", {
              from: (page - 1) * 20 + 1,
              to: Math.min(page * 20, data?.meta?.total ?? 0),
              total: data?.meta?.total ?? 0,
            })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data?.meta?.totalPages}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
