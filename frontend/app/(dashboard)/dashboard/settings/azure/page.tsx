"use client";

import { useState, useEffect } from "react";
import {
  getAzureEnvStatus,
  testAzureConnection,
  saveAzureSettings,
} from "./actions";
import { AzureServiceConfig, AzureDiagnosticResult } from "@/lib/azure/types";
import { SUPPORTED_REGIONS } from "@/lib/azure/constants";
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Server,
  RefreshCw,
  Key,
  Cloud,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function AzureSettingsPage() {
  const [config, setConfig] = useState<AzureServiceConfig | null>(null);
  const [diagnostics, setDiagnostics] = useState<AzureDiagnosticResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [speechRegion, setSpeechRegion] = useState("eastus");
  const [translatorRegion, setTranslatorRegion] = useState("global");

  // Track connection health states: "Pending" | "Connected" | "Failed"
  const [speechConnectionState, setSpeechConnectionState] = useState<"Pending" | "Connected" | "Failed">("Pending");
  const [translatorConnectionState, setTranslatorConnectionState] = useState<"Pending" | "Connected" | "Failed">("Pending");

  useEffect(() => {
    async function loadConfig() {
      try {
        const status = await getAzureEnvStatus();
        setConfig(status);
        setSpeechRegion(status.speechRegion);
        setTranslatorRegion(status.translatorRegion);
      } catch (err) {
        console.error("Failed to load environment configuration:", err);
      }
    }
    loadConfig();
  }, []);

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await testAzureConnection();
      setDiagnostics(result);

      // Map to status indicators (Connected / Failed)
      if (result.speechResult.success) {
        setSpeechConnectionState("Connected");
      } else {
        setSpeechConnectionState("Failed");
      }

      if (result.translatorResult.success) {
        setTranslatorConnectionState("Connected");
      } else {
        setTranslatorConnectionState("Failed");
      }
    } catch (err) {
      console.error("Connection test failed:", err);
      setSpeechConnectionState("Failed");
      setTranslatorConnectionState("Failed");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await saveAzureSettings({ speechRegion, translatorRegion });
      if (result.success) {
        alert("Azure settings updated successfully in metadata repository.");
        const status = await getAzureEnvStatus();
        setConfig(status);
      } else {
        alert(`Failed to save: ${result.message}`);
      }
    } catch (err: any) {
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="flex h-48 items-center justify-center text-zinc-500 text-sm">
        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
        Loading Azure configurations...
      </div>
    );
  }

  // Determine if both/any parameters are completely missing
  const isAzureNotConfigured = !config.speechKeyConfigured && !config.translatorKeyConfigured;

  // Connection status pill style helpers
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Connected":
        return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      case "Failed":
        return "text-red-400 border-red-500/20 bg-red-500/5";
      case "Azure Not Configured":
        return "text-amber-400 border-amber-500/20 bg-amber-500/5";
      case "Pending":
      default:
        return "text-zinc-400 border-white/[0.06] bg-zinc-900/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Integration Console
          </span>
          <h2 className="text-lg font-bold text-white tracking-tight -mt-0.5">
            Azure Cognitive AI
          </h2>
        </div>

        <button
          type="button"
          onClick={handleTest}
          disabled={testing || isAzureNotConfigured}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-electric-blue to-accent-purple px-4 py-2 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-102 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />}
          {testing ? "Testing Connection..." : "Test Azure Connection"}
        </button>
      </div>

      {/* Missing Settings Alert Banner */}
      {isAzureNotConfigured && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Azure Not Configured</h4>
            <p className="text-[11px] text-zinc-400 leading-normal">
              To utilize speech recognition and live synthesizers, define <code className="text-amber-300 font-mono">AZURE_SPEECH_KEY</code> and <code className="text-amber-300 font-mono">AZURE_TRANSLATOR_KEY</code> in your project environment secrets.
            </p>
          </div>
        </div>
      )}

      {/* Main Azure Settings Panels */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services Status Overview */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Service Credentials & Health
            </h3>

            <div className="space-y-3.5">
              {/* Azure Speech */}
              <div className="rounded-lg border border-white/[0.03] bg-zinc-950/40 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-electric-blue/10 border border-electric-blue/20 text-electric-blue shrink-0">
                    <Cloud className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-white block">Azure Speech Service</span>
                    <span className="text-[9px] text-zinc-500 font-medium block truncate">
                      {config.speechKeyConfigured ? `Region: ${speechRegion}` : "Key variables missing"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    getStatusStyle(config.speechKeyConfigured ? speechConnectionState : "Azure Not Configured")
                  }`}>
                    {config.speechKeyConfigured ? speechConnectionState : "Azure Not Configured"}
                  </span>
                </div>
              </div>

              {/* Azure Translator */}
              <div className="rounded-lg border border-white/[0.03] bg-zinc-950/40 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-accent-purple/10 border border-accent-purple/20 text-accent-purple shrink-0">
                    <Cloud className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-white block">Azure AI Translator</span>
                    <span className="text-[9px] text-zinc-500 font-medium block truncate">
                      {config.translatorKeyConfigured ? `Endpoint: ${config.translatorEndpoint}` : "Key variables missing"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    getStatusStyle(config.translatorKeyConfigured ? translatorConnectionState : "Azure Not Configured")
                  }`}>
                    {config.translatorKeyConfigured ? translatorConnectionState : "Azure Not Configured"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Parameters */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Regional Parameters Settings
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase block">Speech Target Region</label>
                  <select
                    value={speechRegion}
                    onChange={(e) => setSpeechRegion(e.target.value)}
                    disabled={isAzureNotConfigured}
                    className="h-8.5 w-full rounded border border-white/[0.06] bg-zinc-950 px-2.5 py-0.5 text-xs text-zinc-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {SUPPORTED_REGIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase block">Translator Target Region</label>
                  <select
                    value={translatorRegion}
                    onChange={(e) => setTranslatorRegion(e.target.value)}
                    disabled={isAzureNotConfigured}
                    className="h-8.5 w-full rounded border border-white/[0.06] bg-zinc-950 px-2.5 py-0.5 text-xs text-zinc-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {SUPPORTED_REGIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/[0.04]">
                <button
                  type="submit"
                  disabled={saving || isAzureNotConfigured}
                  className="rounded-lg bg-zinc-800 border border-white/[0.06] px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving settings..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Diagnostics Summary Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Connection Test Diagnostics */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Diagnostic Connection Results
            </h3>

            {diagnostics ? (
              <div className="space-y-4">
                {/* Speech SDK Check */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase">
                    <span>Azure Speech Service</span>
                    {diagnostics.speechResult.success ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-extrabold">
                        <CheckCircle className="h-3 w-3" /> SUCCESS
                      </span>
                    ) : (
                      <span className="text-red-400 font-extrabold">FAILED</span>
                    )}
                  </div>
                  <p className="rounded bg-zinc-950/60 border border-white/[0.03] p-2.5 text-[10px] text-zinc-400 leading-relaxed font-medium">
                    {diagnostics.speechResult.message}
                  </p>
                </div>

                {/* Translator API Check */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase">
                    <span>Azure AI Translator</span>
                    {diagnostics.translatorResult.success ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-extrabold">
                        <CheckCircle className="h-3 w-3" /> SUCCESS
                      </span>
                    ) : (
                      <span className="text-red-400 font-extrabold">FAILED</span>
                    )}
                  </div>
                  <p className="rounded bg-zinc-950/60 border border-white/[0.03] p-2.5 text-[10px] text-zinc-400 leading-relaxed font-medium">
                    {diagnostics.translatorResult.message}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-white/[0.06] p-6 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
                <Server className="h-6 w-6 text-zinc-600" />
                <p>Click "Test Azure Connection" to execute server-side connectivity validation.</p>
              </div>
            )}
          </div>

          {/* Azure Resources Summary */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Azure Resources Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-white/[0.02] pb-2">
                <span className="text-zinc-500 font-medium">Authentication</span>
                <span className="text-zinc-300 font-semibold text-right max-w-[150px] truncate">
                  Isolated API Keys
                </span>
              </div>

              <div className="flex justify-between border-b border-white/[0.02] pb-2">
                <span className="text-zinc-500 font-medium">SDK Integration</span>
                <span className="text-zinc-300 font-semibold">
                  Aether-v1.37 (Mocked)
                </span>
              </div>

              <div className="flex justify-between border-b border-white/[0.02] pb-2">
                <span className="text-zinc-500 font-medium">Quotas Assigned</span>
                <span className="text-zinc-300 font-semibold text-right max-w-[150px] truncate text-[11px]">
                  Speech S0 / Trans S1
                </span>
              </div>

              <div className="flex justify-between pb-1">
                <span className="text-zinc-500 font-medium">Last Checked</span>
                <span className="text-electric-blue font-bold">
                  {diagnostics ? diagnostics.lastChecked.split(",")[1]?.trim() || diagnostics.lastChecked : "Never"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
