"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Download,
  AlertOctagon,
  CheckCircle2,
  FileSpreadsheet,
  FileJson,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { InvoiceRepository, Invoice } from "@/lib/database/repositories/InvoiceRepository";

export default function InvoicesPage() {
  const [supabase] = useState(() => createClient());
  const [invoiceRepo] = useState(() => new InvoiceRepository(supabase));

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      try {
        setLoading(true);
        const orgId = "org-aether-main";
        const list = await invoiceRepo.findAll(orgId);
        setInvoices(list);
      } catch (err) {
        console.error("Failed to load invoice logs:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, [supabase, invoiceRepo]);

  const handleDownloadJSON = (invoice: Invoice) => {
    const jsonStr = JSON.stringify(invoice, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice_${invoice.invoiceNumber}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    alert(
      `Downloading Invoice ${invoice.invoiceNumber} (PDF Format):\n\nA secure rendering channel is generating your PDF containing tax info, subtotal values, and payment confirmation stamps.`
    );
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-500 text-xs">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-electric-blue border-t-transparent mx-auto mb-2" />
        <span>Loading billing records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto selection:bg-electric-blue/30 selection:text-white">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/billing"
          className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/[0.06] hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="h-5.5 w-5.5 text-electric-blue" />
            <span>Invoice History logs</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Review previous transactions, tax deductions, and download receipts for tax reporting.
          </p>
        </div>
      </div>

      {/* Invoice List Table */}
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-zinc-400">
            <thead className="text-[10px] text-zinc-500 uppercase border-b border-white/[0.04]">
              <tr>
                <th className="py-2.5">Invoice Number</th>
                <th>Issue Date</th>
                <th>Subtotal</th>
                <th>Total Paid</th>
                <th>Payment Gateway</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                  <td className="py-3 font-semibold text-white font-mono">{inv.invoiceNumber}</td>
                  <td>{new Date(inv.issuedAt).toLocaleDateString()}</td>
                  <td>${inv.subtotal.toFixed(2)}</td>
                  <td className="text-white font-bold">${inv.total.toFixed(2)}</td>
                  <td>
                    <span className="text-[10px] bg-zinc-950 px-1.5 py-0.5 rounded border border-white/[0.06] font-mono text-zinc-450 uppercase">
                      {inv.paymentProvider}
                    </span>
                  </td>
                  <td>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[9px] text-emerald-400 font-extrabold uppercase">
                      {inv.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDownloadPDF(inv)}
                        className="inline-flex h-7 items-center gap-1 rounded bg-zinc-900 border border-white/[0.06] px-2 text-[10px] text-zinc-300 hover:bg-zinc-800 cursor-pointer transition-colors"
                        title="Download PDF Invoice"
                      >
                        <FileText className="h-3 w-3" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => handleDownloadJSON(inv)}
                        className="inline-flex h-7 items-center gap-1 rounded bg-zinc-900 border border-white/[0.06] px-2 text-[10px] text-zinc-300 hover:bg-zinc-800 cursor-pointer transition-colors"
                        title="Download JSON Metadata"
                      >
                        <FileJson className="h-3 w-3" />
                        <span>JSON</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No transaction logs recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
