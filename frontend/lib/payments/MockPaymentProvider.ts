import {
  PaymentProvider,
  CheckoutSession,
  CustomerPortalSession,
  PaymentInvoice,
} from "./PaymentProvider";

export class MockPaymentProvider implements PaymentProvider {
  constructor() {}

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async createCheckout(
    organizationId: string,
    planId: string,
    billingCycle: "monthly" | "yearly",
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession> {
    await this.delay(500); // simulate API roundtrip

    // Build simulated checkout landing url passing query parameters
    const mockSessionId = `mock_checkout_${Math.random().toString(36).substring(2, 9)}`;
    const url = `${successUrl}?session_id=${mockSessionId}&plan_id=${planId}&cycle=${billingCycle}`;
    
    return {
      url,
      sessionId: mockSessionId,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    await this.delay(400);
    console.log(`MockPaymentProvider: Subscription ${subscriptionId} cancelled successfully.`);
    return true;
  }

  async resumeSubscription(subscriptionId: string): Promise<boolean> {
    await this.delay(400);
    console.log(`MockPaymentProvider: Subscription ${subscriptionId} resumed successfully.`);
    return true;
  }

  async createInvoice(
    organizationId: string,
    amount: number,
    description: string
  ): Promise<PaymentInvoice> {
    await this.delay(300);
    
    return {
      id: `mock_inv_${Math.random().toString(36).substring(2, 9)}`,
      amount,
      currency: "USD",
      status: "paid",
      invoiceUrl: "#",
    };
  }

  async getCustomerPortal(organizationId: string, returnUrl: string): Promise<CustomerPortalSession> {
    await this.delay(300);
    return {
      url: `${returnUrl}?portal_open=true`,
    };
  }

  async validateWebhook(payload: any, signature: string): Promise<boolean> {
    await this.delay(100);
    // Simple mock signature check
    return signature === "mock_signature_key";
  }
}
