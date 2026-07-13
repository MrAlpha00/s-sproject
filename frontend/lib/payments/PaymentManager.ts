import { PaymentProvider } from "./PaymentProvider";
import { MockPaymentProvider } from "./MockPaymentProvider";

export class PaymentManager {
  private static providers: Map<string, PaymentProvider> = new Map();
  private static activeProviderKey = "mock";

  static {
    // Register the mock provider as default
    this.providers.set("mock", new MockPaymentProvider());
  }

  static registerProvider(key: string, provider: PaymentProvider) {
    this.providers.set(key, provider);
  }

  static setActiveProvider(key: string) {
    if (!this.providers.has(key)) {
      throw new Error(`Payment provider with key "${key}" is not registered.`);
    }
    this.activeProviderKey = key;
  }

  static getActiveProvider(): PaymentProvider {
    const provider = this.providers.get(this.activeProviderKey);
    if (!provider) {
      // Fallback
      const fallback = new MockPaymentProvider();
      this.providers.set("mock", fallback);
      return fallback;
    }
    return provider;
  }
}
