"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Calendar,
  Clock,
  Download,
  AlertOctagon,
  Users,
  Volume2,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Languages,
  DollarSign,
  Radio,
  FileSpreadsheet,
  FileJson,
  FileText,
  Server,
  Play,
  RotateCcw,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import {
  AnalyticsRepository,
  MessageMetrics,
} from "@/lib/database/repositories/AnalyticsRepository";
import {
  UsageRepository,
  UsageSummary,
} from "@/lib/database/repositories/UsageRepository";
import {
  EventStatisticsRepository,
  EventStat,
} from "@/lib/database/repositories/EventStatisticsRepository";
import {
  SystemHealthRepository,
  SystemHealthReport,
} from "@/lib/database/repositories/SystemHealthRepository";
import { AnalyticsService } from "@/lib/analytics/AnalyticsService";
import { AZURE_LANGUAGES } from "@/lib/azure/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function AnalyticsPage() {
  const [supabase] = useState(() => createClient());
  const [analyticsService] = useState(() => new AnalyticsService());
  const [analyticsRepo] = useState(() => new AnalyticsRepository(supabase));
  const [usageRepo] = useState(() => new UsageRepository(supabase));
  const [eventRepo] = useState(() => new EventStatisticsRepository(supabase));
  const [healthRepo] = useState(() => new SystemHealthRepository(supabase));

  // Date Range Filters
  const [filterRange, setFilterRange] = useState<"today" | "yesterday" | "7days" | "30days">("7days");
  
  // States
  const [metrics, setMetrics] = useState<MessageMetrics | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [eventHistory, setEventHistory] = useState<EventStat[]>([]);
  const [health, setHealth] = useState<SystemHealthReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Live Simulation state
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [liveListeners, setLiveListeners] = useState(148);
  const [livePeak, setLivePeak] = useState(256);
  const [liveProcessed, setLiveProcessed] = useState(840);
  const [liveCost, setLiveCost] = useState(12.45);
  const [liveMinutes, setLiveMinutes] = useState(380);

  // Live Chart Datasets (sliding queues)
  const [messagesPerMinuteData, setMessagesPerMinuteData] = useState([12, 18, 15, 22, 28, 30, 24, 32, 40, 36]);
  const [audienceGrowthData, setAudienceGrowthData] = useState([45, 60, 72, 90, 110, 134, 142, 140, 145, 148]);
  const [pipelineLatencyData, setPipelineLatencyData] = useState([380, 420, 390, 405, 435, 410, 395, 415, 400, 385]);

  // Load Initial Aggregates
  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const orgId = "org-aether-main";

        const msgMetrics = await analyticsRepo.getAggregateMetrics(orgId);
        setMetrics(msgMetrics);

        const apiUsage = await usageRepo.getUsageSummary(orgId);
        setUsage(apiUsage);

        const history = await eventRepo.getEventHistory(orgId);
        setEventHistory(history);

        const report = await healthRepo.getHealthReport();
        setHealth(report);
      } catch (err) {
        console.error("Failed loading dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [supabase, analyticsRepo, usageRepo, eventRepo, healthRepo]);

  // Live Updates Simulator loop (Supabase Realtime emulation)
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(async () => {
      // Simulate live activity increment
      setLiveListeners((prev) => {
        const next = prev + (Math.random() > 0.5 ? Math.floor(Math.random() * 4) : -Math.floor(Math.random() * 3));
        const bounded = Math.max(10, next);
        if (bounded > livePeak) setLivePeak(bounded);
        return bounded;
      });

      setLiveProcessed((prev) => prev + Math.floor(Math.random() * 2) + 1);
      setLiveCost((prev) => Math.round((prev + 0.005) * 100) / 100);
      setLiveMinutes((prev) => prev + 1);

      // Append chart queues
      setMessagesPerMinuteData((prev) => [...prev.slice(1), Math.floor(Math.random() * 25) + 15]);
      setAudienceGrowthData((prev) => [...prev.slice(1), liveListeners]);
      setPipelineLatencyData((prev) => [...prev.slice(1), Math.floor(Math.random() * 80) + 380]);

      // Dynamic Health Check ping
      try {
        const report = await healthRepo.getHealthReport();
        setHealth(report);
      } catch (e) {}
    }, 4500);

    return () => clearInterval(interval);
  }, [isLiveMode, liveListeners, livePeak, healthRepo]);

  // Exporters
  const handleExportJSON = () => {
    if (!metrics || !usage) return;
    const jsonStr = analyticsService.compileJSONReport(metrics, usage, eventHistory, health);
    triggerDownload(jsonStr, "aethervox_analytics_report.json", "application/json");
  };

  const handleExportCSV = () => {
    if (!metrics || !usage) return;
    const csvStr = analyticsService.compileCSVReport(metrics, usage, eventHistory);
    triggerDownload(csvStr, "aethervox_analytics_report.csv", "text/csv");
  };

  const handleExportPDF = () => {
    alert(
      "Enterprise Report PDF Export:\n\nA PDF containing visual vector graphs, billing statements, and organizational compliance sheets has been compiled. In production, this routes to a secure LaTeX/headless chrome compilation microservice."
    );
  };

  const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getLanguageLabel = (code: string) => {
    const match = AZURE_LANGUAGES.find((l) => l.value === code);
    return match ? match.label.split(" (")[0] : code;
  };

  // Helper Custom Smooth Bezier Curve SVG Ploter
  const renderAreaChart = (data: number[], color = "#00d4ff", fillGradient = "url(#blue-grad)") => {
    const width = 460;
    const height = 110;
    const padding = 10;
    
    if (data.length === 0) return null;
    const maxX = data.length - 1;
    const minY = Math.min(...data) * 0.9;
    const maxY = Math.max(...data) * 1.1 || 1;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    let pathD = "";
    data.forEach((val, idx) => {
      const x = padding + (idx / maxX) * chartWidth;
      const y = padding + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;
      if (idx === 0) {
        pathD = `M ${x} ${y}`;
      } else {
        const prevX = padding + ((idx - 1) / maxX) * chartWidth;
        const prevY = padding + chartHeight - ((data[idx - 1] - minY) / (maxY - minY)) * chartHeight;
        const cpX1 = prevX + (x - prevX) / 2;
        const cpY1 = prevY;
        const cpX2 = prevX + (x - prevX) / 2;
        const cpY2 = y;
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
      }
    });

    const fillD = `${pathD} L ${padding + chartWidth} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="purple-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Fill Area */}
        <path d={fillD} fill={fillGradient} />
        
        {/* Stroke Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        
        {/* Dots */}
        {data.map((val, idx) => {
          const x = padding + (idx / maxX) * chartWidth;
          const y = padding + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="2.5"
              fill="#18181b"
              stroke={color}
              strokeWidth="1.5"
              className="hover:r-[4px] transition-all cursor-pointer"
            />
          );
        })}
      </svg>
    );
  };

  const getSystemStatusStyles = (status: string) => {
    if (status === "Connected") return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    return "text-red-400 border-red-500/20 bg-red-500/5";
  };

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto selection:bg-electric-blue/30 selection:text-white">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Enterprise Console</span>
            <span className={`inline-flex items-center gap-1 rounded bg-electric-blue/10 border border-electric-blue/20 px-1.5 py-0.5 text-[9px] text-electric-blue font-semibold uppercase ${isLiveMode ? "animate-pulse" : ""}`}>
              {isLiveMode ? "● Live Monitoring Active" : "Historical Summary"}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight -mt-0.5">Analytics & Usage Reporting</h1>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Ranges */}
          <div className="flex rounded-lg border border-white/[0.06] bg-zinc-950 p-[2px] text-xs">
            <button
              onClick={() => setFilterRange("today")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                filterRange === "today" ? "bg-zinc-900 text-white" : "text-zinc-450 hover:text-white"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilterRange("7days")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                filterRange === "7days" ? "bg-zinc-900 text-white" : "text-zinc-450 hover:text-white"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setFilterRange("30days")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                filterRange === "30days" ? "bg-zinc-900 text-white" : "text-zinc-450 hover:text-white"
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Exporters */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-zinc-900 border border-white/[0.06] px-3 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Export CSV"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-zinc-900 border border-white/[0.06] px-3 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Export JSON"
            >
              <FileJson className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-zinc-900 border border-white/[0.06] px-3 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Export PDF"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`h-8 w-8 rounded flex items-center justify-center border cursor-pointer transition-all ${
                isLiveMode
                  ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/25"
                  : "bg-zinc-950 border-white/[0.06] text-zinc-400 hover:text-white"
              }`}
              title={isLiveMode ? "Pause Live Feed" : "Start Live Feed"}
            >
              <Radio className={`h-4 w-4 ${isLiveMode ? "animate-pulse" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Event Broadcasts", val: isLiveMode ? "1 Live Event" : "0 Active", icon: Radio, col: "text-electric-blue" },
          { label: "Connected Audience", val: isLiveMode ? `${liveListeners} listeners` : "0 Listeners", icon: Users, col: "text-purple-400" },
          { label: "Transcripts Processed", val: isLiveMode ? liveProcessed.toLocaleString() : (metrics?.totalMessages || 0).toLocaleString(), icon: Activity, col: "text-emerald-400" },
          { label: "Minutes Translated", val: isLiveMode ? `${liveMinutes} min` : `${usage?.speechMinutes || 0} min`, icon: Clock, col: "text-amber-400" },
        ].map((item, idx) => (
          <div key={idx} className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4.5 space-y-2 relative overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 h-16 w-16 bg-white/[0.02] rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{item.label}</span>
              <item.icon className={`h-4.5 w-4.5 ${item.col}`} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{item.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Languages Channels Active", val: "3 target feeds", icon: Languages, col: "text-pink-400" },
          { label: "End-to-End Pipeline Latency", val: isLiveMode ? `${pipelineLatencyData[pipelineLatencyData.length - 1]} ms` : `${analyticsService.calculateOverallPipelineLatency(metrics?.avgRecognitionLatency || 140, metrics?.avgTranslationLatency || 180, metrics?.avgSynthesisLatency || 220)} ms`, icon: Cpu, col: "text-cyan-400" },
          { label: "Est. Billing Cost (USD)", val: isLiveMode ? `$${liveCost}` : `$${usage?.estimatedCost || 0.00}`, icon: DollarSign, col: "text-emerald-500" },
          { label: "Cognitive STS Calls Today", val: isLiveMode ? "2,480 pings" : `${usage?.apiRequestsCount || 0} calls`, icon: Server, col: "text-zinc-400" },
        ].map((item, idx) => (
          <div key={idx} className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4.5 space-y-2 relative overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 h-16 w-16 bg-white/[0.02] rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{item.label}</span>
              <item.icon className={`h-4.5 w-4.5 ${item.col}`} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{item.val}</h3>
          </div>
        ))}
      </div>

      {/* Main Charts Matrix */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart 1: Messages / Transcripts Per Minute */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Translation Load</h3>
              <p className="text-[10px] text-zinc-500">Transcripts processed per minute (real-time rolling queue)</p>
            </div>
            <span className="text-xs font-bold font-mono text-electric-blue">
              {messagesPerMinuteData[messagesPerMinuteData.length - 1]} / min
            </span>
          </div>
          <div className="h-28 flex items-end">
            {renderAreaChart(messagesPerMinuteData, "#00d4ff", "url(#blue-grad)")}
          </div>
        </div>

        {/* Chart 2: Audience Flow Graph */}
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Audience Growth & Flow</h3>
              <p className="text-[10px] text-zinc-500">Live listeners connections (Supabase Presence Presence counts)</p>
            </div>
            <span className="text-xs font-bold font-mono text-purple-400">
              Peak: {livePeak}
            </span>
          </div>
          <div className="h-28 flex items-end">
            {renderAreaChart(audienceGrowthData, "#c084fc", "url(#purple-grad)")}
          </div>
        </div>
      </div>

      {/* Core Operational Panels (Grid columns) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Panel 1: System Health (Connected pings & Latencies) */}
        <div className="lg:col-span-1 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
          <div className="border-b border-white/[0.04] pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live System Health</h3>
            <p className="text-[10px] text-zinc-500">Active status verification and connection delay check</p>
          </div>

          {health ? (
            <div className="space-y-3.5 text-xs">
              {[
                { name: "Supabase Service", node: health.supabase },
                { name: "Azure Speech Cognitive", node: health.azureSpeech },
                { name: "Azure Translator V3", node: health.azureTranslator },
                { name: "Azure Neural TTS Engine", node: health.azureSynthesis },
                { name: "Web Audio Playback Context", node: health.audioEngine },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="text-zinc-400 font-semibold">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-500 font-mono">{item.node.latency}ms</span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${getSystemStatusStyles(item.node.status)}`}>
                      <span className={`h-1 w-1 rounded-full ${item.node.status === "Connected" ? "bg-emerald-400 shadow-[0_0_6px_#10b981]" : "bg-red-400"}`} />
                      <span>{item.node.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-zinc-500 text-xs">Pinging hardware interfaces...</div>
          )}
        </div>

        {/* Panel 2: Cost Projections & Usage Panel */}
        <div className="lg:col-span-1 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
          <div className="border-b border-white/[0.04] pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Billing & Cost Estimates</h3>
            <p className="text-[10px] text-zinc-500">Azure Cognitive and synthesis character usage expenditures</p>
          </div>

          {usage ? (
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-450">Speech Transcriptions</span>
                <span className="text-zinc-200 font-bold">{isLiveMode ? liveMinutes : usage.speechMinutes} mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-450">Text Translations</span>
                <span className="text-zinc-200 font-bold">{usage.translationCharacters.toLocaleString()} chars</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-450">TTS Audio Synthesized</span>
                <span className="text-zinc-200 font-bold">{usage.synthesisCharacters.toLocaleString()} chars</span>
              </div>
              
              <div className="border-t border-white/[0.04] pt-3 flex justify-between items-center">
                <span className="text-zinc-400 font-bold">Estimated Cost (USD)</span>
                <span className="text-electric-blue font-extrabold text-sm font-mono">
                  ${isLiveMode ? liveCost : usage.estimatedCost}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px] text-zinc-500 border-t border-white/[0.02] pt-2.5">
                <div>
                  <span className="block uppercase font-bold text-zinc-650">Speech Rate</span>
                  <span className="text-zinc-400">$0.016 / min</span>
                </div>
                <div>
                  <span className="block uppercase font-bold text-zinc-650">TTS Rate</span>
                  <span className="text-zinc-400">$16.00 / M chars</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-zinc-500 text-xs">Summing character limits...</div>
          )}
        </div>

        {/* Panel 3: Active Event Details */}
        <div className="lg:col-span-1 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
          <div className="border-b border-white/[0.04] pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Event Profile</h3>
            <p className="text-[10px] text-zinc-500">Live operational specs of the currently running session</p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-450">Event Name</span>
              <span className="text-zinc-200 font-bold truncate max-w-[170px]">Global AI Keynote 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-450">Active Voice Profile</span>
              <span className="text-zinc-200 font-bold">AetherVOX Multilingual</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-450">Languages Feeds</span>
              <span className="text-zinc-200 font-bold">es-ES, zh-CN, hi-IN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-450">Session Status</span>
              <span className="rounded bg-electric-blue/10 border border-electric-blue/20 px-2 py-0.5 text-[9px] text-electric-blue font-extrabold uppercase">
                {isLiveMode ? "Broadcasting" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Latency Diagnostics & Event History */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Latency Analytics */}
        <div className="lg:col-span-1 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
          <div className="border-b border-white/[0.04] pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Latency Analytics</h3>
            <p className="text-[10px] text-zinc-500">Delay distributions (ms) across operational pipelines</p>
          </div>

          <div className="space-y-3.5 text-xs">
            {[
              { name: "Speech Recognition", avg: 140, min: 110, max: 210 },
              { name: "Text Translation", avg: 180, min: 140, max: 290 },
              { name: "TTS Audio Synthesis", avg: 220, min: 180, max: 340 },
              { name: "Streaming Transport", avg: 45, min: 30, max: 90 },
            ].map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-semibold">{item.name}</span>
                  <span className="text-[10px] font-bold font-mono text-zinc-200">{item.avg} ms avg</span>
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                  <span>Min: {item.min}ms</span>
                  <span>Max: {item.max}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event History */}
        <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
          <div className="border-b border-white/[0.04] pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Broadcast Event History</h3>
            <p className="text-[10px] text-zinc-500">Historical performance sheets of previous events</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-zinc-400">
              <thead className="text-[10px] text-zinc-500 uppercase border-b border-white/[0.04]">
                <tr>
                  <th className="py-2.5">Event Name</th>
                  <th>Duration</th>
                  <th>Audience</th>
                  <th>Messages</th>
                  <th>Avg Delay</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {eventHistory.map((evt) => (
                  <tr key={evt.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 font-semibold text-white truncate max-w-[150px]">{evt.name}</td>
                    <td>{evt.durationMinutes} min</td>
                    <td>{evt.peakAudience} peak</td>
                    <td>{evt.totalMessages}</td>
                    <td className="font-mono">{evt.avgDelayMs}ms</td>
                    <td>
                      <span className="rounded bg-zinc-900 border border-white/[0.06] px-2 py-0.5 text-[9px] text-zinc-450 uppercase font-semibold">
                        {evt.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {eventHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">No event logs recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
