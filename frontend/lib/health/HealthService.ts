import { createClient } from "@/supabase/client";
import { testAzureConnection } from "@/app/(dashboard)/dashboard/settings/azure/actions";

export interface HealthReport {
  status: "healthy" | "degraded" | "unhealthy";
  uptimeSeconds: number;
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
  services: {
    supabase: "Connected" | "Disconnected";
    azureSpeech: "Connected" | "Disconnected";
    azureTranslator: "Connected" | "Disconnected";
    database: "Connected" | "Disconnected";
  };
  timestamp: string;
}

const startTime = Date.now();

export class HealthService {
  static async check(): Promise<HealthReport> {
    const supabase = createClient();
    const services = {
      supabase: "Connected" as const,
      azureSpeech: "Connected" as const,
      azureTranslator: "Connected" as const,
      database: "Connected" as const,
    };

    // 1. Supabase Check
    try {
      const { error } = await supabase.from("organizations").select("id").limit(1);
      if (error) {
        services.supabase = "Disconnected";
        services.database = "Disconnected";
      }
    } catch (e) {
      services.supabase = "Disconnected";
      services.database = "Disconnected";
    }

    // 2. Azure Connection Check
    try {
      const res = await testAzureConnection();
      services.azureSpeech = res.speechResult.success ? "Connected" : "Disconnected";
      services.azureTranslator = res.translatorResult.success ? "Connected" : "Disconnected";
    } catch (e) {
      services.azureSpeech = "Disconnected";
      services.azureTranslator = "Disconnected";
    }

    const isDegraded = Object.values(services).some((s) => s === "Disconnected");
    const status = isDegraded ? "degraded" : "healthy";

    // 3. Memory statistics
    let heapUsedMB = 0;
    let heapTotalMB = 0;
    let rssMB = 0;

    if (typeof process !== "undefined" && typeof process.memoryUsage === "function") {
      const mem = process.memoryUsage();
      heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
      heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
      rssMB = Math.round(mem.rss / 1024 / 1024);
    }

    return {
      status,
      uptimeSeconds: Math.round((Date.now() - startTime) / 1000),
      memory: {
        heapUsedMB,
        heapTotalMB,
        rssMB,
      },
      services,
      timestamp: new Date().toISOString(),
    };
  }
}
