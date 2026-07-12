export interface AzureResponse {
  success: boolean;
  message: string;
  code?: string;
}

export interface AzureServiceConfig {
  speechKeyConfigured: boolean;
  speechRegion: string;
  translatorKeyConfigured: boolean;
  translatorRegion: string;
  translatorEndpoint: string;
}

export interface AzureDiagnosticResult {
  speechResult: AzureResponse;
  translatorResult: AzureResponse;
  lastChecked: string;
  sdkVersion: string;
  authType: string;
  quotaTier: string;
}
