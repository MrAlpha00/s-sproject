import { SupabaseClient } from "@supabase/supabase-js";

export interface Invoice {
  id: string;
  organizationId: string;
  subscriptionId: string | null;
  invoiceNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: "paid" | "open" | "uncollectible" | "void";
  paymentProvider: string;
  issuedAt: string;
  paidAt: string | null;
}

const fallbackInvoices: Invoice[] = [
  {
    id: "inv-001",
    organizationId: "org-aether-main",
    subscriptionId: "sub-starter-01",
    invoiceNumber: "INV-2026-001",
    subtotal: 29.00,
    tax: 0.00,
    total: 29.00,
    currency: "USD",
    status: "paid",
    paymentProvider: "mock",
    issuedAt: "2026-07-01T00:00:00Z",
    paidAt: "2026-07-01T00:05:00Z"
  },
  {
    id: "inv-002",
    organizationId: "org-aether-main",
    subscriptionId: "sub-starter-01",
    invoiceNumber: "INV-2026-002",
    subtotal: 29.00,
    tax: 0.00,
    total: 29.00,
    currency: "USD",
    status: "paid",
    paymentProvider: "mock",
    issuedAt: "2026-06-01T00:00:00Z",
    paidAt: "2026-06-01T00:02:00Z"
  }
];

export class InvoiceRepository {
  constructor(private supabase: SupabaseClient) {}

  private isLocalStorageAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getFallback(): Invoice[] {
    if (!this.isLocalStorageAvailable()) return fallbackInvoices;
    const cached = localStorage.getItem("aethervox_fallback_invoices");
    return cached ? JSON.parse(cached) : fallbackInvoices;
  }

  private saveFallback(list: Invoice[]) {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem("aethervox_fallback_invoices", JSON.stringify(list));
    }
  }

  async findAll(organizationId?: string): Promise<Invoice[]> {
    try {
      let query = this.supabase.from("invoices").select("*");
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      const { data, error } = await query;

      if (error) {
        if (error.code === "42P01") {
          let list = this.getFallback();
          if (organizationId) {
            list = list.filter((i) => i.organizationId === organizationId);
          }
          return list;
        }
        return [];
      }

      return data.map(this.mapToEntity);
    } catch (err) {
      console.warn("InvoiceRepository.findAll failed, using fallback:", err);
      let list = this.getFallback();
      if (organizationId) {
        list = list.filter((i) => i.organizationId === organizationId);
      }
      return list;
    }
  }

  async create(invoice: Omit<Invoice, "id">): Promise<Invoice> {
    const payload = this.mapToDatabase(invoice);
    
    try {
      const { data, error } = await this.supabase
        .from("invoices")
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === "42P01") {
          const created: Invoice = {
            ...invoice,
            id: `inv-${Math.random().toString(36).substring(2, 9)}`,
          };
          const list = this.getFallback();
          list.push(created);
          this.saveFallback(list);
          return created;
        }
        throw error;
      }

      return this.mapToEntity(data);
    } catch (err) {
      console.warn("InvoiceRepository.create failed, using fallback:", err);
      const created: Invoice = {
        ...invoice,
        id: `inv-${Math.random().toString(36).substring(2, 9)}`,
      };
      const list = this.getFallback();
      list.push(created);
      this.saveFallback(list);
      return created;
    }
  }

  private mapToEntity(data: any): Invoice {
    return {
      id: data.id,
      organizationId: data.organization_id,
      subscriptionId: data.subscription_id,
      invoiceNumber: data.invoice_number,
      subtotal: Number(data.subtotal),
      tax: Number(data.tax),
      total: Number(data.total),
      currency: data.currency || "USD",
      status: data.status,
      paymentProvider: data.payment_provider,
      issuedAt: data.issued_at,
      paidAt: data.paid_at,
    };
  }

  private mapToDatabase(inv: Omit<Invoice, "id">): Record<string, any> {
    return {
      organization_id: inv.organizationId,
      subscription_id: inv.subscriptionId,
      invoice_number: inv.invoiceNumber,
      subtotal: inv.subtotal,
      tax: inv.tax,
      total: inv.total,
      currency: inv.currency,
      status: inv.status,
      payment_provider: inv.paymentProvider,
      issued_at: inv.issuedAt,
      paid_at: inv.paidAt,
    };
  }
}
