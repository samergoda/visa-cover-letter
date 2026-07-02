"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import type { VisaStatus, ChecklistTemplate } from "@/types";

// ─── Visa Statuses Panel ──────────────────────────────────────────────────────
function VisaStatusesPanel() {
  const [statuses, setStatuses] = useState<VisaStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#6b7280");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6b7280");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const fetch_ = useCallback(async () => {
    const res = await fetch("/api/settings/statuses");
    const data = await res.json() as VisaStatus[];
    setStatuses(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { void fetch_(); }, [fetch_]);

  const handleAdd = async () => {
    if (!newName.trim()) { toast.error("Name is required"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/settings/statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), color: newColor, order_index: statuses.length }),
      });
      if (!res.ok) { const e = await res.json() as { error: string }; toast.error(e.error ?? "Failed"); return; }
      toast.success("Status created");
      setNewName(""); setNewColor("#6b7280"); setShowAdd(false);
      void fetch_();
    } finally { setAdding(false); }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) { toast.error("Name is required"); return; }
    await fetch(`/api/settings/statuses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), color: editColor }),
    });
    toast.success("Status updated");
    setEditingId(null);
    void fetch_();
  };

  const handleToggleActive = async (status: VisaStatus) => {
    await fetch(`/api/settings/statuses/${status.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !status.is_active }),
    });
    void fetch_();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/settings/statuses/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Cannot delete — status may be in use"); return; }
    toast.success("Status deleted");
    void fetch_();
  };

  const handleMove = async (index: number, dir: -1 | 1) => {
    const newArr = [...statuses];
    const target = index + dir;
    if (target < 0 || target >= newArr.length) return;
    [newArr[index], newArr[target]] = [newArr[target], newArr[index]];
    setStatuses(newArr);
    await fetch("/api/settings/statuses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", orderedIds: newArr.map((s) => s.id) }),
    });
  };

  if (isLoading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
          <Plus className="mr-2 h-4 w-4" /> Add Status
        </Button>
      </div>

      {showAdd && (
        <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <h3 className="text-sm font-semibold">New Status</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5 flex-1 min-w-[160px]">
              <Label htmlFor="new-status-name">Name</Label>
              <Input id="new-status-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Under Review" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-status-color">Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" id="new-status-color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded border p-0.5" />
                <span className="text-sm font-mono text-muted-foreground">{newColor}</span>
              </div>
            </div>
            <Button size="sm" onClick={handleAdd} disabled={adding}>
              {adding ? "Creating..." : <><Check className="mr-1.5 h-4 w-4" />Create</>}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}><X className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <div className="divide-y rounded-lg border">
        {statuses.map((status, i) => (
          <div key={status.id} className={`flex items-center gap-3 px-4 py-3 ${!status.is_active ? "opacity-50" : ""}`}>
            {/* Reorder */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button onClick={() => handleMove(i, -1)} disabled={i === 0} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20" aria-label="Move up">
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleMove(i, 1)} disabled={i === statuses.length - 1} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20" aria-label="Move down">
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Color dot */}
            <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: status.color }} />

            {/* Name / edit */}
            {editingId === status.id ? (
              <div className="flex flex-1 items-center gap-2 flex-wrap">
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 w-44" />
                <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="h-8 w-10 cursor-pointer rounded border p-0.5" />
                <Button size="sm" onClick={() => handleEdit(status.id)}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium">{status.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={status.is_active}
                    onCheckedChange={() => handleToggleActive(status)}
                    aria-label={`Toggle ${status.name}`}
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingId(status.id); setEditName(status.name); setEditColor(status.color); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete &ldquo;{status.name}&rdquo;?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone. Applicants with this status will lose it.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(status.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </div>
        ))}
        {statuses.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No statuses configured.</p>
        )}
      </div>
    </div>
  );
}

// ─── Checklist Templates Panel ─────────────────────────────────────────────
function ChecklistPanel() {
  const [items, setItems] = useState<ChecklistTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const fetch_ = useCallback(async () => {
    const res = await fetch("/api/settings/checklists");
    const data = await res.json() as ChecklistTemplate[];
    setItems(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { void fetch_(); }, [fetch_]);

  const handleAdd = async () => {
    if (!newName.trim()) { toast.error("Name is required"); return; }
    setAdding(true);
    try {
      const res = await fetch("/api/settings/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || null, order_index: items.length }),
      });
      if (!res.ok) { const e = await res.json() as { error: string }; toast.error(e.error ?? "Failed"); return; }
      toast.success("Checklist item created");
      setNewName(""); setNewDesc(""); setShowAdd(false);
      void fetch_();
    } finally { setAdding(false); }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) { toast.error("Name is required"); return; }
    await fetch(`/api/settings/checklists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), description: editDesc.trim() || null }),
    });
    toast.success("Item updated");
    setEditingId(null);
    void fetch_();
  };

  const handleToggleActive = async (item: ChecklistTemplate) => {
    await fetch(`/api/settings/checklists/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !item.is_active }),
    });
    void fetch_();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/settings/checklists/${id}`, { method: "DELETE" });
    toast.success("Item deleted");
    void fetch_();
  };

  const handleMove = async (index: number, dir: -1 | 1) => {
    const newArr = [...items];
    const target = index + dir;
    if (target < 0 || target >= newArr.length) return;
    [newArr[index], newArr[target]] = [newArr[target], newArr[index]];
    setItems(newArr);
    await fetch("/api/settings/checklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", orderedIds: newArr.map((s) => s.id) }),
    });
  };

  if (isLoading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      {showAdd && (
        <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <h3 className="text-sm font-semibold">New Checklist Item</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-cl-name">Name <span className="text-destructive">*</span></Label>
              <Input id="new-cl-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Passport Received" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-cl-desc">Description (optional)</Label>
              <Input id="new-cl-desc" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Short description" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={adding}>
              {adding ? "Creating..." : <><Check className="mr-1.5 h-4 w-4" />Create</>}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}><X className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <div className="divide-y rounded-lg border">
        {items.map((item, i) => (
          <div key={item.id} className={`flex items-start gap-3 px-4 py-3 ${!item.is_active ? "opacity-50" : ""}`}>
            {/* Reorder */}
            <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
              <button onClick={() => handleMove(i, -1)} disabled={i === 0} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20" aria-label="Move up">
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleMove(i, 1)} disabled={i === items.length - 1} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20" aria-label="Move down">
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Content / edit */}
            {editingId === item.id ? (
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 w-48" placeholder="Name" />
                <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="h-8 flex-1 min-w-[160px]" placeholder="Description" />
                <Button size="sm" onClick={() => handleEdit(item.id)}><Check className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.name}</p>
                  {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={item.is_active ? "default" : "outline"} className="text-xs">
                    {item.is_active ? "Active" : "Disabled"}
                  </Badge>
                  <Switch
                    checked={item.is_active}
                    onCheckedChange={() => handleToggleActive(item)}
                    aria-label={`Toggle ${item.name}`}
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingId(item.id); setEditName(item.name); setEditDesc(item.description ?? ""); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete &ldquo;{item.name}&rdquo;?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove the checklist item from all new applicants. Existing applicant checklists won&apos;t be affected.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No checklist items configured.</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  return (
    <DashboardLayout
      title="General Settings"
      description="Configure visa statuses and checklist templates."
    >
      <div className="max-w-3xl space-y-6">
        <Tabs defaultValue="statuses">
          <TabsList>
            <TabsTrigger value="statuses">Visa Statuses</TabsTrigger>
            <TabsTrigger value="checklist">Checklist Items</TabsTrigger>
          </TabsList>

          <TabsContent value="statuses" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Visa Statuses</CardTitle>
                <CardDescription>
                  Create and manage the statuses applicants can be assigned. Disable a status to hide it from dropdowns without losing existing data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VisaStatusesPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Checklist Templates</CardTitle>
                <CardDescription>
                  Items in this list are automatically added to every new applicant. Reorder them using the arrows. Disabling an item removes it from future applicants only.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChecklistPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
