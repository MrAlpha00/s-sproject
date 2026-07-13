"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  ArrowLeft,
  Info,
  Calendar,
  User,
  Database,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { ActivityLogRepository, ActivityLog } from "@/lib/database/repositories/ActivityLogRepository";

export default function ActivityLogPage() {
  const [supabase] = useState(() => createClient());
  const [logRepo] = useState(() => new ActivityLogRepository(supabase));

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const orgId = "org-aether-main";
        const list = await logRepo.findAll(orgId);
        setLogs(list);
      } catch (err) {
        console.error("Failed to load activity logs:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, [supabase, logRepo]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const list = await logRepo.findAll("org-aether-main");
      setLogs(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs
  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.fullName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEntity = entityFilter === "ALL" || l.entity === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto selection:bg-electric-blue/30 selection:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/team"
            className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/[0.06] hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <History className="h-5.5 w-5.5 text-electric-blue" />
              <span>Audit Activity Logs</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Review chronological security trails and administrative configuration updates.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex h-8 items-center gap-1.5 rounded bg-zinc-900 border border-white/[0.06] px-3 text-xs text-zinc-300 hover:bg-zinc-800 cursor-pointer transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-550">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, user or object..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-zinc-950 border border-white/[0.06] focus:border-electric-blue focus:outline-none text-xs text-zinc-200"
          />
        </div>

        <div className="flex rounded-lg border border-white/[0.06] bg-zinc-950 p-[2px] text-[10px]">
          {["ALL", "Team", "Event", "Voice", "Subscription", "Settings"].map((entity) => (
            <button
              key={entity}
              onClick={() => setEntityFilter(entity)}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                entityFilter === entity ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-white"
              }`}
            >
              {entity === "ALL" ? "All Objects" : entity}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4">
        {loading ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            <div className="h-5 w-5 border-2 border-electric-blue border-t-transparent animate-spin rounded-full mx-auto mb-2" />
            <span>Loading security audits...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-zinc-400">
              <thead className="text-[10px] text-zinc-500 uppercase border-b border-white/[0.04]">
                <tr>
                  <th className="py-2.5">User</th>
                  <th>Action</th>
                  <th>Object</th>
                  <th>Details & Context</th>
                  <th className="text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                    <td className="py-3.5 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-zinc-950 border border-white/[0.06] flex items-center justify-center text-electric-blue text-[9px] font-bold">
                        {log.fullName ? log.fullName.substring(0, 2).toUpperCase() : "US"}
                      </div>
                      <span className="font-bold text-white">{log.fullName || "Operator"}</span>
                    </td>
                    <td>
                      <span className="font-semibold text-zinc-350">{log.action}</span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 rounded bg-zinc-950 border border-white/[0.06] px-2 py-0.5 text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
                        {log.entity}
                      </span>
                    </td>
                    <td>
                      <pre className="font-mono text-[9px] text-zinc-500 truncate max-w-[280px]" title={JSON.stringify(log.metadata)}>
                        {JSON.stringify(log.metadata)}
                      </pre>
                    </td>
                    <td className="text-right font-mono text-[10px] text-zinc-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      No matching audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
