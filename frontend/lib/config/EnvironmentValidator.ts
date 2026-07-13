export interface DiagnosticsReport {
  success: boolean;
  missingVariables: string[];
  warnings: string[];
  details: Record<string, "Configured" | "Missing" | "Invalid">;
}

export class EnvironmentValidator {
  private static REQUIRED_ENV = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ];

  private static AZURE_ENV = [
    "NEXT_PUBLIC_AZURE_SPEECH_REGION",
    "NEXT_PUBLIC_AZURE_TRANSLATION_REGION"
  ];

  static validate(): DiagnosticsReport {
    const missingVariables: string[] = [];
    const warnings: string[] = [];
    const details: Record<string, "Configured" | "Missing" | "Invalid"> = {};

    // 1. Check required Supabase keys
    this.REQUIRED_ENV.forEach((key) => {
      const value = process.env[key] || process.env[`NEXT_PUBLIC_${key}`];
      if (!value) {
        missingVariables.push(key);
        details[key] = "Missing";
      } else {
        details[key] = "Configured";
      }
    });

    // 2. Check Azure keys (if missing, emit warnings since we support offline static fallbacks)
    this.AZURE_ENV.forEach((key) => {
      const value = process.env[key] || process.env[`NEXT_PUBLIC_${key}`];
      if (!value) {
        warnings.push(key);
        details[key] = "Missing";
      } else {
        details[key] = "Configured";
      }
    });

    return {
      success: missingVariables.length === 0,
      missingVariables,
      warnings,
      details,
    };
  }
}
