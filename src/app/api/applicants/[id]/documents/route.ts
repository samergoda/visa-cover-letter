import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApplicantDocuments, addDocument, deleteDocument } from "@/lib/applicants";
import { createAdminClient } from "@/lib/supabase/server";
import type { DocumentType } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docs = await getApplicantDocuments(id);
    return NextResponse.json(docs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const documentType = formData.get("document_type") as DocumentType;
    const uploadedBy = formData.get("uploaded_by") as string | null;

    if (!file || !documentType) {
      return NextResponse.json(
        { error: "file and document_type are required" },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const supabase = createAdminClient();
    const fileExt = file.name.split(".").pop();
    const storagePath = `${id}/${documentType}/${Date.now()}_${file.name}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("applicant-documents")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("applicant-documents")
      .getPublicUrl(storagePath);

    const doc = await addDocument(
      {
        applicant_id: id,
        document_type: documentType,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: uploadedBy,
      },
      uploadedBy ?? undefined
    );

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error("POST documents error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { documentId, fileName, performedBy } = await request.json() as {
      documentId: string;
      fileName: string;
      performedBy?: string;
    };

    await deleteDocument(documentId, id, fileName, performedBy);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
