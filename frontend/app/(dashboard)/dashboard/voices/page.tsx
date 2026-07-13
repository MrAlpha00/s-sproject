"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  Play,
  Square,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Volume2,
  Star,
  Mic,
  Activity,
  Check,
  Settings,
  Languages,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { VoiceService, AzureVoiceInfo } from "@/lib/voice/VoiceService";
import { VoiceProfileRepository } from "@/lib/database/repositories/VoiceProfileRepository";
import { SavedVoiceProfile } from "@/lib/database/types";
import { SpeechSynthesisService } from "@/lib/azure/services/SpeechSynthesisService";
import { AZURE_LANGUAGES } from "@/lib/azure/constants";

export default function VoicesPage() {
  const [supabase] = useState(() => createClient());
  const [voiceService] = useState(() => new VoiceService());
  const [profileRepo] = useState(() => new VoiceProfileRepository(supabase));

  // Voice list states
  const [voices, setVoices] = useState<AzureVoiceInfo[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<AzureVoiceInfo[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState("all");

  // Profile states
  const [profiles, setProfiles] = useState<SavedVoiceProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<SavedVoiceProfile | null>(null);

  // Modal / Dialog Form states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileLang, setNewProfileLang] = useState("en-US");
  const [newProfileVoice, setNewProfileVoice] = useState("");
  
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameTargetId, setRenameTargetId] = useState("");
  const [renameValue, setRenameValue] = useState("");

  // Preview Audio States
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const previewSynthesizerRef = useRef<SpeechSynthesisService | null>(null);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingVoices(true);
        const list = await voiceService.loadVoices();
        setVoices(list);
        setFilteredVoices(list);

        // Prepopulate first voice
        if (list.length > 0) {
          setNewProfileVoice(list[0].name);
        }
      } catch (err) {
        console.error("Failed to load voices:", err);
      } finally {
        setLoadingVoices(false);
      }

      try {
        setLoadingProfiles(true);
        // Determine organization context
        const { data: userRes } = await supabase.auth.getUser();
        let orgId = "org-aether-main";
        if (userRes?.user?.id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("organization_id")
            .eq("id", userRes.user.id)
            .maybeSingle();
          if (profile?.organization_id) {
            orgId = profile.organization_id;
          }
        }

        const profileList = await profileRepo.findAll(orgId);
        setProfiles(profileList);
        if (profileList.length > 0) {
          const def = profileList.find((p) => p.isDefault) || profileList[0];
          setSelectedProfile(def);
        }
      } catch (err) {
        console.error("Failed to load voice profiles:", err);
      } finally {
        setLoadingProfiles(false);
      }
    }

    loadData();

    return () => {
      stopPreview();
    };
  }, [supabase, voiceService, profileRepo]);

  // Apply filters whenever search parameters update
  useEffect(() => {
    async function applyFilters() {
      const results = await voiceService.filterVoices({
        search: searchQuery,
        language: selectedLang,
        gender: selectedGender,
        provider: selectedProvider,
      });
      setFilteredVoices(results);
    }
    applyFilters();
  }, [searchQuery, selectedLang, selectedGender, selectedProvider, voices, voiceService]);

  // Play Preview synthesized voice sample
  const startPreview = async (voice: AzureVoiceInfo) => {
    if (previewingVoice) {
      stopPreview();
    }

    try {
      setPreviewingVoice(voice.name);
      
      const synth = new SpeechSynthesisService("", "eastus"); // Token will load dynamically inside speak()
      previewSynthesizerRef.current = synth;

      // Curate preview message based on target locale
      let sampleText = "Hello! This is a preview of the AetherVOX neural synthesizer voice. Let me know what you think!";
      if (voice.locale.startsWith("hi")) {
        sampleText = "नमस्ते! यह ऐथरवॉक्स न्यूरल वॉयस सिंथेसाइज़र का एक पूर्वावलोकन है।";
      } else if (voice.locale.startsWith("te")) {
        sampleText = "నమస్కారం! ఇది ఈథర్‌వాక్స్ న్యూరల్ వాయిస్ సింథసైజర్ యొక్క ప్రివ్యూ.";
      } else if (voice.locale.startsWith("es")) {
        sampleText = "¡Hola! Esta es una vista previa del sintetizador de voz neural de AetherVOX.";
      } else if (voice.locale.startsWith("zh")) {
        sampleText = "你好！这是 AetherVOX 神经语音合成器的预览。";
      }

      await synth.speak(
        sampleText,
        voice.name,
        voice.locale,
        null, // default speaker output
        () => console.log("Preview started playing"),
        () => {
          console.log("Preview finished playing");
          setPreviewingVoice(null);
        }
      );
    } catch (err) {
      console.error("Voice preview failed:", err);
      alert("Failed to play voice preview. Ensure speech token configurations are active.");
      setPreviewingVoice(null);
    }
  };

  const stopPreview = () => {
    if (previewSynthesizerRef.current) {
      previewSynthesizerRef.current.stop();
      previewSynthesizerRef.current = null;
    }
    setPreviewingVoice(null);
  };

  // Profile CRUD Actions
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    try {
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes?.user?.id || "usr-admin-001";
      
      let orgId = "org-aether-main";
      if (userRes?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", userRes.user.id)
          .maybeSingle();
        if (profile?.organization_id) {
          orgId = profile.organization_id;
        }
      }

      const voiceData = voices.find((v) => v.name === newProfileVoice);

      const created = await profileRepo.create({
        organizationId: orgId,
        profileName: newProfileName.trim(),
        provider: voiceData?.provider || "azure",
        language: newProfileLang,
        voiceName: newProfileVoice,
        gender: voiceData?.gender?.toLowerCase() || "neutral",
        style: "conversational",
        isDefault: profiles.length === 0, // Make first profile default
        createdBy: userId,
      });

      setProfiles((prev) => [...prev, created]);
      setSelectedProfile(created);
      setIsCreateOpen(false);
      setNewProfileName("");
    } catch (err) {
      console.error("Failed to create voice profile:", err);
      alert("Failed to save voice profile.");
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voice profile?")) return;

    try {
      const ok = await profileRepo.delete(id);
      if (ok) {
        setProfiles((prev) => prev.filter((p) => p.id !== id));
        if (selectedProfile?.id === id) {
          setSelectedProfile(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete profile:", err);
    }
  };

  const handleSetDefault = async (id: string, orgId: string) => {
    try {
      const ok = await profileRepo.setDefault(id, orgId);
      if (ok) {
        setProfiles((prev) =>
          prev.map((p) => ({
            ...p,
            isDefault: p.id === id,
          }))
        );
        if (selectedProfile?.id === id) {
          setSelectedProfile((prev) => prev ? { ...prev, isDefault: true } : null);
        }
      }
    } catch (err) {
      console.error("Failed to set default profile:", err);
    }
  };

  const triggerRename = (profile: SavedVoiceProfile) => {
    setRenameTargetId(profile.id);
    setRenameValue(profile.profileName);
    setIsRenameOpen(true);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameValue.trim() || !renameTargetId) return;

    try {
      const updated = await profileRepo.update(renameTargetId, {
        profileName: renameValue.trim(),
      });

      setProfiles((prev) =>
        prev.map((p) => (p.id === renameTargetId ? updated : p))
      );
      if (selectedProfile?.id === renameTargetId) {
        setSelectedProfile(updated);
      }
      setIsRenameOpen(false);
      setRenameTargetId("");
      setRenameValue("");
    } catch (err) {
      console.error("Failed to rename profile:", err);
    }
  };

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto selection:bg-electric-blue/30 selection:text-white">
      {/* Header Banner */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Mic className="h-5.5 w-5.5 text-electric-blue" />
          <span>Voice Configurations & Profiles</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Browse dynamic Azure Neural Voices, preview speech synthetics, and save reusable profile mappings for your translation events.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Reusable Profiles Console */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 space-y-4 shadow-inner">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Voice Profiles</span>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="h-7 px-2.5 rounded bg-electric-blue hover:bg-electric-blue/90 text-black font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus className="h-3 w-3" />
                <span>CREATE</span>
              </button>
            </div>

            {loadingProfiles ? (
              <div className="py-10 text-center text-xs text-zinc-500">Loading saved profiles...</div>
            ) : profiles.length === 0 ? (
              <div className="py-10 text-center text-xs text-zinc-500">No custom voice profiles created yet.</div>
            ) : (
              <div className="space-y-2.5">
                {profiles.map((prof) => {
                  const isActive = selectedProfile?.id === prof.id;

                  return (
                    <div
                      key={prof.id}
                      onClick={() => setSelectedProfile(prof)}
                      className={`group rounded-lg border p-3 flex items-center justify-between cursor-pointer transition-all ${
                        isActive
                          ? "bg-electric-blue/5 border-electric-blue/40"
                          : "bg-zinc-950/40 border-white/[0.04] hover:bg-zinc-900/30"
                      }`}
                    >
                      <div className="space-y-1 max-w-[70%]">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white tracking-tight truncate">
                            {prof.profileName}
                          </h4>
                          {prof.isDefault && (
                            <span className="rounded bg-electric-blue/10 px-1 py-0.5 text-[8px] text-electric-blue font-extrabold">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {getLanguageLabel(prof.language)} • {prof.voiceName.split("-").slice(-1)}
                        </p>
                      </div>

                      {/* Hover Actions */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!prof.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefault(prof.id, prof.organizationId);
                            }}
                            className="p-1 text-zinc-400 hover:text-electric-blue rounded bg-zinc-900 border border-white/[0.06]"
                            title="Set Default"
                          >
                            <Star className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerRename(prof);
                          }}
                          className="p-1 text-zinc-400 hover:text-white rounded bg-zinc-900 border border-white/[0.06]"
                          title="Rename"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProfile(prof.id);
                          }}
                          className="p-1 text-zinc-400 hover:text-red-400 rounded bg-zinc-900 border border-white/[0.06]"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Neural Voices Browser Grid (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filters panel */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4 space-y-3.5">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search voices by name, language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded border border-white/[0.06] bg-zinc-950/60 pl-9 pr-3 text-xs text-zinc-300 placeholder:text-zinc-550 focus:outline-none focus:border-electric-blue/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Language Filter */}
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-zinc-500 uppercase block">Language Locale</span>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="h-8 w-full rounded border border-white/[0.06] bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="all">All Languages</option>
                  {AZURE_LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label.split(" (")[0]}</option>
                  ))}
                </select>
              </div>

              {/* Gender Filter */}
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-zinc-500 uppercase block">Gender</span>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="h-8 w-full rounded border border-white/[0.06] bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>

              {/* Provider Filter */}
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-zinc-500 uppercase block">Provider</span>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="h-8 w-full rounded border border-white/[0.06] bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="all">All Providers</option>
                  <option value="azure">Azure Cognitive</option>
                  <option value="elevenlabs">ElevenLabs</option>
                </select>
              </div>
            </div>
          </div>

          {/* Voices Grid */}
          {loadingVoices ? (
            <div className="py-20 text-center text-xs text-zinc-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-electric-blue border-t-transparent mx-auto mb-2" />
              <span>Loading Azure Neural voices registry...</span>
            </div>
          ) : filteredVoices.length === 0 ? (
            <div className="py-20 text-center text-xs text-zinc-500 border border-dashed border-white/[0.06] rounded-xl">
              No matching neural voices found. Try adjusting filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredVoices.slice(0, 30).map((v) => { // Cap to 30 for performance rendering
                const isPlaying = previewingVoice === v.name;

                return (
                  <div
                    key={v.name}
                    className="rounded-lg border border-white/[0.04] bg-zinc-950/30 p-4 flex flex-col justify-between gap-4 shadow-sm hover:border-white/[0.08] transition-all relative overflow-hidden"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">
                          {getLanguageLabel(v.locale)}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                            v.gender === "Female"
                              ? "text-purple-400 bg-purple-500/10"
                              : "text-blue-400 bg-blue-500/10"
                          }`}>
                            {v.gender}
                          </span>
                          <span className="rounded bg-zinc-900 border border-white/[0.06] px-1 py-0.5 text-[8px] text-zinc-400 font-bold uppercase">
                            {v.provider}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xs font-bold text-white mt-1 truncate" title={v.name}>
                        {v.displayName}
                      </h3>
                      <p className="text-[10px] text-zinc-550 truncate font-mono">
                        {v.name}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/[0.03] pt-3.5 mt-0.5">
                      <div className="text-[9px] text-zinc-500 space-y-0.5 font-mono">
                        <div>Rate: {v.sampleRateHertz}Hz</div>
                        <div>Status: Active</div>
                      </div>

                      {/* Play Preview */}
                      {isPlaying ? (
                        <button
                          onClick={stopPreview}
                          className="h-7 w-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-white/[0.08] flex items-center justify-center cursor-pointer transition-all"
                        >
                          <Square className="h-3 w-3 fill-current" />
                        </button>
                      ) : (
                        <button
                          onClick={() => startPreview(v)}
                          className="h-7 w-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-electric-blue border border-white/[0.08] flex items-center justify-center cursor-pointer transition-all"
                        >
                          <Play className="h-3 w-3 fill-current pl-0.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dialog: Create Reusable Profile Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/[0.08] bg-zinc-950 p-5 space-y-4 shadow-xl">
            <div className="border-b border-white/[0.06] pb-2">
              <h3 className="text-sm font-bold text-white">Create Voice Profile</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Save a configuration profile to map language to voice.</p>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Profile Name</label>
                <input
                  type="text"
                  placeholder="e.g. Conference Hall A, Hindi Male"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="h-8.5 w-full rounded border border-white/[0.08] bg-zinc-900 px-3 text-xs focus:outline-none focus:border-electric-blue/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Target Language</label>
                  <select
                    value={newProfileLang}
                    onChange={(e) => setNewProfileLang(e.target.value)}
                    className="h-8.5 w-full rounded border border-white/[0.08] bg-zinc-900 px-2 text-xs focus:outline-none"
                  >
                    {AZURE_LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label.split(" (")[0]}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Assign Voice</label>
                  <select
                    value={newProfileVoice}
                    onChange={(e) => setNewProfileVoice(e.target.value)}
                    className="h-8.5 w-full rounded border border-white/[0.08] bg-zinc-900 px-2 text-xs focus:outline-none"
                  >
                    {voices
                      .filter((v) => v.locale === newProfileLang || v.locale.startsWith(newProfileLang))
                      .map((v) => (
                        <option key={v.name} value={v.name}>{v.displayName}</option>
                      ))}
                    {voices.filter((v) => v.locale === newProfileLang || v.locale.startsWith(newProfileLang)).length === 0 && (
                      <option value="en-US-AvaMultilingualNeural">Ava (Fallback)</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-8 px-3 rounded border border-white/[0.06] hover:bg-zinc-900 text-[11px] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-3 rounded bg-electric-blue hover:bg-electric-blue/90 text-black font-bold text-[11px] cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog: Rename Modal */}
      {isRenameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/[0.08] bg-zinc-950 p-5 space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-white">Rename Voice Profile</h3>
            </div>

            <form onSubmit={handleRenameSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">New Profile Name</label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="h-8.5 w-full rounded border border-white/[0.08] bg-zinc-900 px-3 text-xs focus:outline-none focus:border-electric-blue/40"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setIsRenameOpen(false)}
                  className="h-8 px-3 rounded border border-white/[0.06] hover:bg-zinc-900 text-[11px] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-3 rounded bg-electric-blue hover:bg-electric-blue/90 text-black font-bold text-[11px] cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getLanguageLabel(code: string) {
  const match = AZURE_LANGUAGES.find((l) => l.value === code);
  return match ? match.label.split(" (")[0] : code;
}
