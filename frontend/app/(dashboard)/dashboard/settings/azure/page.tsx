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
  Cpu,
  Key,
  HardDrive,
  CheckCircle,
} from "lucide-react";

export default function AzureSettingsPage() {
  const [config, setConfig] = useState<AzureServiceConfig | null>(null);
  const [diagnostics, setDiagnostics] = useState<AzureDiagnosticResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [speechRegion, setSpeechRegion] = useState("eastus");
  const [translatorRegion, setTranslatorRegion] = useState("global");

  useEffect(() => {
    async function loadConfig() {
      const status = await getAzureEnvStatus();
      setConfig(status);
      setSpeechRegion(status.speechRegion);
      setTranslatorRegion(status.translatorRegion);
    }
    loadConfig();
  }, []);

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await testAzureConnection();
      setDiagnostics(result);
    } catch (err) {
      console.error("Connection test failed:", err);
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
        // Refresh local config state
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Integration Console
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight -mt-0.5">
            Azure AI Foundation
          </h1>
        </div>

        <button
          type="button"
          onClick={handleTest}
          disabled={testing}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-electric-blue to-accent-purple px-4 py-2 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-102 hover:opacity-95 disabled:opacity-50"
        >
          {testing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />}
          {testing ? "Testing Connection..." : "Test Azure Connection"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Environment Validation & Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Environment Secrets Validation Card */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Environment Variables Check
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Speech Credentials */}
              <div className="rounded-lg border border-white/[0.03] bg-zinc-950/40 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-electric-blue/10 border border-electric-blue/20 text-electric-blue">
                    <Key className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase">AZURE_SPEECH_KEY</span>
                    <span className="text-[9px] text-zinc-500 font-semibold block truncate">Secrets isolated server-side</span>
                  </div>
                </div>
                {config.speechKeyConfigured ? (
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                    Configured
                  </span>
                ) : (
                  <span className="rounded bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[9px] text-red-400 font-bold uppercase tracking-wider">
                    Missing
                  </span>
                )}
              </div>

              {/* Translator Credentials */}
              <div className="rounded-lg border border-white/[0.03] bg-zinc-950/40 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-accent-purple/10 border border-accent-purple/20 text-accent-purple">
                    <Key className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase">AZURE_TRANSLATOR_KEY</span>
                    <span className="text-[9px] text-zinc-500 font-semibold block truncate">Secrets isolated server-side</span>
                  </div>
                </div>
                {config.translatorKeyConfigured ? (
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                    Configured
                  </span>
                ) : (
                  <span className="rounded bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[9px] text-red-400 font-bold uppercase tracking-wider">
                    Missing
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Regional Form Editor */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Service Regional Parameters
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Speech Region Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">Speech Service Target Region</label>
                  <select
                    value={speechRegion}
                    onChange={(e) => setSpeechRegion(e.target.value)}
                    className="h-9 w-full rounded border border-white/[0.06] bg-zinc-950 px-2.5 py-0.5 text-xs text-zinc-300 focus:outline-none"
                  >
                    {SUPPORTED_REGIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Translator Region Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">Translator Target Region</label>
                  <select
                    value={translatorRegion}
                    onChange={(e) => setTranslatorRegion(e.target.value)}
                    className="h-9 w-full rounded border border-white/[0.06] bg-zinc-950 px-2.5 py-0.5 text-xs text-zinc-300 focus:outline-none"
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
                  disabled={saving}
                  className="rounded-lg bg-zinc-800 border border-white/[0.06] px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving settings..." : "Save Regional Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Diagnostics Results & Azure Summary */}
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
                  <p className="rounded bg-zinc-950/60 border border-white/[0.03] p-2.5 text-[10px] text-zinc-400 leading-relaxed">
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
                  <p className="rounded bg-zinc-950/60 border border-white/[0.03] p-2.5 text-[10px] text-zinc-400 leading-relaxed">
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
                <span className="text-zinc-300 font-semibold text-right max-w-[150px] truncate">
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
