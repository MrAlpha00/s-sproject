export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface CustomerPortalSession {
  url: string;
}

export interface PaymentInvoice {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "open" | "uncollectible" | "void";
  invoiceUrl: string | null;
}

export interface PaymentProvider {
  createCheckout(
    organizationId: string,
    planId: string,
    billingCycle: "monthly" | "yearly",
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession>;

  cancelSubscription(subscriptionId: string): Promise<boolean>;

  resumeSubscription(subscriptionId: string): Promise<boolean>;

  createInvoice(
    organizationId: string,
    amount: number,
    description: string
  ): Promise<PaymentInvoice>;

  getCustomerPortal(organizationId: string, returnUrl: string): Promise<CustomerPortalSession>;

  validateWebhook(payload: any, signature: string): Promise<boolean>;
}
