import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/auth-context";
import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { Button } from "@/components/ui/button";
import { documentService } from "@/lib/services";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  ShieldCheck,
  Upload,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Loader2
} from "lucide-react";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Driving License & Document Vault — FleetFlow" },
      {
        name: "description",
        content: "Manage your uploaded driving credentials, identity documents, and OCR verification status.",
      },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const { data: documents, isPending: loadingDocs } = useQuery<any[]>({
    queryKey: ["documents"],
    queryFn: () => documentService.list() as Promise<any[]>,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentService.upload(file, "Driving License", "User License Upload"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setFile(null);
    },
  });

  const processOcrMutation = useMutation({
    mutationFn: (id: string) => documentService.processOCR(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0] || null);
    }
  };

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Customer", "Salesperson", "Mechanic", "Manager"]}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-10 space-y-8">
          <div className="border-b border-border/80 pb-6">
            <Eyebrow>DOCUMENT VAULT</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
              Driving Credentials & KYC
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage driving license verification, document status, and automated OCR extraction.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <h3 className="font-display font-semibold text-lg text-foreground">Upload New Document</h3>
            <div className="flex items-center gap-4">
              <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="text-sm" />
              <Button onClick={handleUpload} disabled={!file || uploadMutation.isPending} size="sm">
                {uploadMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Upload Document
              </Button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <h3 className="font-display font-semibold text-lg text-foreground">Uploaded Documents Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Uploaded</th>
                    <th className="p-3">OCR Status</th>
                    <th className="p-3">Extracted Details</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loadingDocs ? (
                    <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
                  ) : documents?.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" /> {doc.title}
                      </td>
                      <td className="p-3 text-muted-foreground">{doc.kind}</td>
                      <td className="p-3 text-muted-foreground">{doc.uploaded_at}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          doc.ocr_status === 'Processed' ? 'bg-success/20 text-success' : 
                          doc.ocr_status === 'Processing' ? 'bg-amber-500/20 text-amber-500' : 'bg-muted text-muted-foreground'
                        }`}>{doc.ocr_status}</span>
                      </td>
                      <td className="p-3 text-muted-foreground text-[10px]">
                        {doc.extracted_name && <div>Name: {doc.extracted_name}</div>}
                        {doc.extracted_document_number && <div>Doc #: {doc.extracted_document_number.substring(0,4)}****</div>}
                        {doc.extracted_date_of_birth && <div>DOB: {doc.extracted_date_of_birth}</div>}
                        {!doc.extracted_name && !doc.extracted_document_number && <span>-</span>}
                      </td>
                      <td className="p-3 text-right">
                        {doc.ocr_status === "Not processed" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => processOcrMutation.mutate(doc.id)} disabled={processOcrMutation.isPending}>
                            {processOcrMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />} Process OCR
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {documents?.length === 0 && (
                     <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No documents uploaded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </ProtectedRoute>
  );
}
