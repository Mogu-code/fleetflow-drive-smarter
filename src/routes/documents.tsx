import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/auth-context";
import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { Button } from "@/components/ui/button";
import { documentService } from "@/lib/services";
import type { OCRResult } from "@/types";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  FileText,
  ShieldCheck,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
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
  const [ocrLoading, setOcrLoading] = useState(false);
  const [extractedOcr, setExtractedOcr] = useState<OCRResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSimulateOCR = async () => {
    setOcrLoading(true);
    const res = await documentService.extract("driver_license_scan.pdf");
    setExtractedOcr(res);
    setOcrLoading(false);
  };

  const handleConfirmExtraction = () => {
    setConfirmed(true);
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

          {/* Status Alert Card */}
          <div className="p-6 rounded-2xl bg-surface border border-border flex flex-wrap items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/20 text-success border border-success/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold text-lg text-foreground">Driving License Verification</h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-success/20 text-success border border-success/30">
                    VERIFIED
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  License Number: <strong className="font-mono text-foreground">{user?.licenseNumber || "KA0320180004213"}</strong> • Valid across all 8 hubs.
                </p>
              </div>
            </div>

            <Button onClick={handleSimulateOCR} disabled={ocrLoading} variant="outline" className="gap-2 text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> Re-scan License OCR
            </Button>
          </div>

          {/* OCR Extraction Box */}
          {ocrLoading && (
            <div className="p-6 rounded-2xl bg-surface border border-border text-center space-y-3 animate-pulse">
              <Sparkles className="w-8 h-8 text-primary mx-auto" />
              <div className="font-display font-semibold text-base text-foreground">Running AI OCR License Extraction...</div>
              <p className="text-xs text-muted-foreground">Extracting Name, License Number, DOB, and Expiry Date from scan...</p>
            </div>
          )}

          {extractedOcr && !confirmed && (
            <div className="p-6 rounded-2xl bg-surface border border-primary/40 space-y-4 animate-rise shadow-2xl">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2 font-display font-semibold text-base text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" /> Extracted License Details
                </div>
                <span className="text-xs font-semibold text-success bg-success/20 px-2 py-0.5 rounded">
                  {(extractedOcr.confidence * 100).toFixed(0)}% Confidence
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>Renter Name: <strong className="text-foreground">{extractedOcr.name}</strong></div>
                <div>License Number: <strong className="font-mono text-foreground">{extractedOcr.licenseNumber}</strong></div>
                <div>Date of Birth: <strong className="text-foreground">{extractedOcr.dob}</strong></div>
                <div>Expiration Date: <strong className="text-foreground">{extractedOcr.expiry}</strong></div>
              </div>

              <div className="pt-3 border-t border-border/80 flex justify-end gap-3">
                <Button size="sm" onClick={handleConfirmExtraction} className="gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Confirm & Verify Extracted Data
                </Button>
              </div>
            </div>
          )}

          {confirmed && (
            <div className="p-4 rounded-xl bg-success/20 border border-success/40 text-success text-xs font-semibold flex items-center gap-2 animate-rise">
              <CheckCircle2 className="w-4 h-4" /> Driving credentials confirmed and stored securely in your account vault.
            </div>
          )}

          {/* Document Records Table */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <h3 className="font-display font-semibold text-lg text-foreground">Uploaded Documents Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/80 uppercase text-[10px] text-muted-foreground tracking-wider bg-surface-2/50">
                  <tr>
                    <th className="p-3">Document Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Uploaded Date</th>
                    <th className="p-3">Verification Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr className="hover:bg-surface-2/50 transition-colors">
                    <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" /> Physical Driving License Scan
                    </td>
                    <td className="p-3 text-muted-foreground">Driver KYC</td>
                    <td className="p-3 text-muted-foreground">2024-03-15</td>
                    <td className="p-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-success/20 text-success">Verified</span>
                    </td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="ghost" className="h-7 text-xs">View Document</Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-2/50 transition-colors">
                    <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" /> Aadhaar / Identity Proof
                    </td>
                    <td className="p-3 text-muted-foreground">Identity Proof</td>
                    <td className="p-3 text-muted-foreground">2024-03-15</td>
                    <td className="p-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-success/20 text-success">Verified</span>
                    </td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="ghost" className="h-7 text-xs">View Document</Button>
                    </td>
                  </tr>
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
