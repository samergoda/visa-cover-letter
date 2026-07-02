import { createAdminClient } from "@/lib/supabase/server";
import type { ChecklistTemplate, VisaStatus } from "@/types";

// ============================================================
// Visa Statuses
// ============================================================

export async function getVisaStatuses(): Promise<VisaStatus[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("visa_statuses")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as VisaStatus[]) ?? [];
}

export async function createVisaStatus(
  status: Pick<VisaStatus, "name" | "color" | "order_index">
): Promise<VisaStatus> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("visa_statuses").insert(status).select().single();

  if (error) throw new Error(error.message);
  return data as VisaStatus;
}

export async function updateVisaStatus(
  id: string,
  updates: Partial<Pick<VisaStatus, "name" | "color" | "order_index" | "is_active">>
): Promise<VisaStatus> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("visa_statuses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as VisaStatus;
}

export async function deleteVisaStatus(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("visa_statuses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderVisaStatuses(orderedIds: string[]): Promise<void> {
  const supabase = createAdminClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("visa_statuses").update({ order_index: index }).eq("id", id)
    )
  );
}

// ============================================================
// Checklist Templates
// ============================================================

export async function getChecklistTemplates(): Promise<ChecklistTemplate[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("checklist_templates")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as ChecklistTemplate[]) ?? [];
}

export async function createChecklistTemplate(
  template: Pick<ChecklistTemplate, "name" | "description" | "order_index">
): Promise<ChecklistTemplate> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("checklist_templates")
    .insert(template)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ChecklistTemplate;
}

export async function updateChecklistTemplate(
  id: string,
  updates: Partial<Pick<ChecklistTemplate, "name" | "description" | "order_index" | "is_active">>
): Promise<ChecklistTemplate> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("checklist_templates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ChecklistTemplate;
}

export async function deleteChecklistTemplate(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("checklist_templates").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderChecklistTemplates(orderedIds: string[]): Promise<void> {
  const supabase = createAdminClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("checklist_templates").update({ order_index: index }).eq("id", id)
    )
  );
}
