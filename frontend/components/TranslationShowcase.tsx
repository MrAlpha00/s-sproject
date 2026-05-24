"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RefreshCw, Layers, Sparkles, Languages, Volume2 } from "lucide-react";
import { Button } from "./ui/button";

interface Scenario {
  id: string;
  title: string;
  sourceText: string;
  translations: {
    es: string; // Spanish
    zh: string; // Mandarin
    ja: string; // Japanese
    de: string; // German
  };
  speaker: string;
  role: string;
}

export default function TranslationShowcase() {
  const scenarios: Scenario[] = [
    {
      id: "keynote",
      title: "Enterprise Keynote Launch",
      speaker: "Sarah Jenkins",
      role: "VP of Product, AetherVOX",
      sourceText: "Welcome global attendees. Today we are launching our unified translation nodes, allowing teams to deliver high-fidelity voice-cloned keynotes into fifty languages with sub-second delay.",
      translations: {
        es: "Bienvenidos a los asistentes globales. Hoy estamos lanzando nuestros nodos de traducción unificados, lo que permite a los equipos ofrecer discursos clonados por voz en cincuenta idiomas con un retraso inferior al segundo.",
        zh: "欢迎全球与会者。今天，我们推出了统一的翻译节点，允许团队以亚秒级延迟将高保真语音克隆主题演讲交付给五十种语言。",
        ja: "グローバルな参加者の皆さん、歓迎します。本日、私たちは統一された翻訳ノードを発表します。これにより、チームはサブ秒の遅延で、50の言語にわたって忠実度の高い音声ク隆されたキーノートを配信できるようになります。",
        de: "Willkommen an alle globalen Teilnehmer. Heute bringen wir unsere vereinheitlichten Übersetzungsknoten auf den Markt. Damit können Teams stimmgeklonte Keynotes mit einer Verzögerung von unter einer Sekunde in fünfzig Sprachen übertragen.",
      },
    },
    {
      id: "esports",
      title: "Global Esports Broadcast",
      speaker: "Marcus 'Tonic' Chen",
      role: "Lead Caster, Pro Gaming League",
      sourceText: "The crowd goes wild as team Aether secures the final objective! This has been a historic series, and the tactical execution on display is absolutely breathtaking for fans worldwide.",
      translations: {
        es: "¡La multitud se vuelve loca mientras el equipo Aether asegura el objetivo final! Esta ha sido una serie histórica, y la ejecución táctica en exhibición es absolutamente impresionante para los fanáticos de todo el mundo.",
        zh: "当以太（Aether）团队锁定最终目标时，全场观众为之疯狂！这是一次历史性的系列赛，展示出来的战术执行力对于全世界的粉丝来说绝对是惊心动魄的。",
        ja: "チームAetherが最終目的を確保すると、群衆は熱狂します！これは歴史的なシリーズであり、展示されている戦術的な実行は世界中のファンにとって絶対に息をのむほど素晴らしいものです。",
        de: "Das Publikum tobt, als Team Aether das letzte Ziel sichert! Das war eine historische Serie, und die hier gezeigte taktische Ausführung ist für Fans weltweit absolut atemberaubend.",
      },
    },
    {
      id: "webinar",
      title: "Medical Tech Symposium",
      speaker: "Dr. Elena Rostova",
      role: "Chief Surgical Researcher",
      sourceText: "By combining neural robotic interfaces with high-definition digital streams, specialists from Kyoto and Berlin successfully operated together, overcoming geographical friction.",
      translations: {
        es: "Al combinar interfaces robóticas neuronales con transmisiones digitales de alta definición, los especialistas de Kioto y Berlín operaron juntos con éxito, superando la fricción geográfica.",
        zh: "通过将神经机器人接口与高清晰度数字流相结合，来自京都和柏林的专家成功地合作运营，克服了地理摩擦。",
        ja: "ニューラル・ロボット・インターフェースと高精細デジタル・ストリームを組み合わせることで、京都とベルリンの専門家が共同で手術を行うことに成功し、地理的な摩擦を克服しました。",
        de: "Durch die Kombination von neuronalen Roboterschnittstellen mit hochauflösenden digitalen Streams konnten Spezialisten aus Kyoto und Berlin erfolgreich zusammen operieren und geografische Hürden überwinden.",
      },
    },
  ];

  const [activeScenario, setActiveScenario] = useState<Scenario>(scenarios[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [typedSource, setTypedSource] = useState("");
  const [typedTranslations, setTypedTranslations] = useState({ es: "", zh: "", ja: "", de: "" });
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeLang, setActiveLang] = useState<"es" | "zh" | "ja" | "de">("es");
  const [audioLatency, setAudioLatency] = useState(1.42);

  const animationInterval = useRef<NodeJS.Timeout | null>(null);

  const startSimulator = () => {
    if (isPlaying) {
      resetSimulator();
      return;
    }

    setIsPlaying(true);
    setIsTranslating(true);
    setTypedSource("");
    setTypedTranslations({ es: "", zh: "", ja: "", de: "" });

    const sourceWords = activeScenario.sourceText.split(" ");
    let currentWordIndex = 0;

    // Simulate real-time word-by-word speaking and translating
    animationInterval.current = setInterval(() => {
      if (currentWordIndex < sourceWords.length) {
        // Add words to source text
        setTypedSource((prev) => (prev ? prev + " " + sourceWords[currentWordIndex] : sourceWords[currentWordIndex]));
        
        // Simulating the 1.2s delay for translations
        setTimeout(() => {
          const ratio = (currentWordIndex + 1) / sourceWords.length;
          
          const esWords = activeScenario.translations.es.split(" ");
          const zhWords = activeScenario.translations.zh.split(" ");
          const jaWords = activeScenario.translations.ja.split(" ");
          const deWords = activeScenario.translations.de.split(" ");

          const esCount = Math.floor(esWords.length * ratio);
          const zhCount = Math.floor(zhWords.length * ratio);
          const jaCount = Math.floor(jaWords.length * ratio);
          const deCount = Math.floor(deWords.length * ratio);

          setTypedTranslations({
            es: esWords.slice(0, esCount).join(" "),
            zh: zhWords.slice(0, zhCount).join(" "),
            ja: jaWords.slice(0, jaCount).join(" "),
            de: deWords.slice(0, deCount).join(" "),
          });

          setAudioLatency(Number((1.1 + Math.random() * 0.35).toFixed(2)));
        }, 1200);

        currentWordIndex++;
      } else {
        // Speech complete
        clearInterval(animationInterval.current!);
        setIsTranslating(false);
      }
    }, 220); // Speaking pace
  };

  const resetSimulator = () => {
    if (animationInterval.current) {
      clearInterval(animationInterval.current);
    }
    setIsPlaying(false);
    setIsTranslating(false);
    setTypedSource("");
    setTypedTranslations({ es: "", zh: "", ja: "", de: "" });
    setAudioLatency(1.42);
  };

  useEffect(() => {
    resetSimulator();
  }, [activeScenario]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (animationInterval.current) clearInterval(animationInterval.current);
    };
  }, []);

  const waveformHeights = useMemo(
    () => Array.from({ length: 48 }, (_, i) => `${15 + Math.sin(i * 0.5 + Math.PI * 0.25) * 80}%`),
    []
  );

  return (
    <section id="showcase" className="relative py-28 px-6 bg-black/35 border-t border-b border-white/[0.04] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[35%] left-[5%] w-[350px] h-[350px] bg-electric-blue/5 rounded-full blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-[35%] right-[5%] w-[350px] h-[350px] bg-accent-purple/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-xs font-semibold text-accent-purple mb-4">
            <Languages className="w-3.5 h-3.5" />
            Live Event Sandbox
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Realtime Translation Showcase
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Select a live scenario below, trigger the simulator, and experience sub-second neural translation.
          </p>
        </div>

        {/* Showcase Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: Control Console (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
            <div className="glass-panel border-white/[0.05] rounded-2xl p-6 flex flex-col flex-1">
              <h3 className="text-sm uppercase font-bold tracking-widest text-zinc-500 mb-4">
                1. Select Live Broadcast
              </h3>
              
              {/* Scenario Toggles */}
              <div className="flex flex-col gap-3 flex-1 justify-start">
                {scenarios.map((scen) => (
                  <button
                    key={scen.id}
                    onClick={() => {
                      if (!isPlaying) setActiveScenario(scen);
                    }}
                    disabled={isPlaying}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-4 ${
                      activeScenario.id === scen.id
                        ? "bg-electric-blue/[0.04] border-electric-blue/40 shadow-[0_0_15px_rgba(0,212,255,0.05)]"
                        : "bg-zinc-950/40 border-white/[0.04] hover:bg-zinc-900/40 hover:border-white/[0.1] disabled:opacity-50"
                    }`}
                  >
                    <div className="pt-0.5">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        activeScenario.id === scen.id ? "border-electric-blue" : "border-zinc-700"
                      }`}>
                        {activeScenario.id === scen.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-electric-blue" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-0.5">{scen.title}</h4>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Speaker: {scen.speaker}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Ingest Control Button */}
              <div className="mt-8 border-t border-white/[0.06] pt-6">
                <Button
                  onClick={startSimulator}
                  className={`w-full py-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                    isPlaying
                      ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                      : "bg-gradient-to-r from-electric-blue to-accent-purple text-white shadow-[0_0_20px_rgba(0,212,255,0.15)] hover:shadow-[0_0_25px_rgba(0,212,255,0.3)]"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 fill-red-400" />
                      Stop Simulator
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-white" />
                      Start Realtime Ingestion
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right panel: Active Stream Dashboard (8 Columns) */}
          <div className="lg:col-span-8 glass-panel border-white/[0.05] rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Soft ambient light */}
            <div className="absolute -top-[10%] -left-[10%] w-[250px] h-[250px] bg-electric-blue/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Dashboard header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.05] pb-4 mb-6 gap-3 z-10">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Active Neural Processing Node</h3>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase">
                    Channel: {activeScenario.id.toUpperCase()}_STAGE_A
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                <div className="bg-zinc-950 border border-white/[0.05] px-3 py-1 rounded-md text-zinc-400 font-mono">
                  Engine: <span className="text-white font-bold">Aether_V3</span>
                </div>
                <div className="bg-zinc-950 border border-white/[0.05] px-3 py-1 rounded-md text-zinc-400 font-mono">
                  Ear Latency: <span className="text-electric-blue font-bold">{audioLatency}s</span>
                </div>
              </div>
            </div>

            {/* Live Audio Source Channel Output */}
            <div className="bg-zinc-950/80 rounded-xl border border-white/[0.04] p-5 mb-5 z-10">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-electric-blue/10 flex items-center justify-center">
                    <Volume2 className="w-3.5 h-3.5 text-electric-blue" />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Speaker Audio Stream (English)</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-600">48kHz Mono Buffer</span>
              </div>
              
              {/* Typewriter Speech Output */}
              <div className="min-h-[48px] text-zinc-200 text-sm leading-relaxed mb-4">
                {typedSource ? (
                  <span className="relative">
                    {typedSource}
                    {isTranslating && (
                      <span className="inline-block w-1.5 h-3.5 bg-electric-blue ml-0.5 animate-pulse" />
                    )}
                  </span>
                ) : (
                  <span className="text-zinc-600 italic">Waiting for voice input stream... Click 'Start Realtime Ingestion' to feed audio.</span>
                )}
              </div>

              {/* Reactive Waveform when playing */}
              <div className="h-5 flex items-center gap-[2px] justify-start opacity-70">
                {waveformHeights.map((height, i) => (
                  <span
                    key={i}
                    className="w-[3px] rounded-full transition-all duration-300"
                    style={{
                      height: isPlaying ? height : "15%",
                      backgroundColor: isPlaying ? "var(--electric-blue)" : "var(--border)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Translated Output Nodes */}
            <div className="z-10 flex flex-col gap-4">
              {/* Language switcher tabs */}
              <div className="flex border-b border-white/[0.05] pb-2">
                {[
                  { code: "es", name: "Spanish (ES)" },
                  { code: "zh", name: "Mandarin (ZH)" },
                  { code: "ja", name: "Japanese (JA)" },
                  { code: "de", name: "German (DE)" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setActiveLang(lang.code as "es" | "zh" | "ja" | "de")}
                    className={`px-4 py-1.5 text-xs font-semibold border-b-2 -mb-2.5 transition-all duration-200 ${
                      activeLang === lang.code
                        ? "text-electric-blue border-electric-blue"
                        : "text-zinc-500 border-transparent hover:text-zinc-300"
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              {/* Display Active Translated Language Content */}
              <div className="bg-zinc-950/40 rounded-xl border border-white/[0.03] p-5 min-h-[110px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                  <Languages className="w-5 h-5 text-zinc-800 pointer-events-none" />
                </div>
                
                <div className="text-zinc-200 text-sm leading-relaxed mb-4">
                  {typedTranslations[activeLang] ? (
                    <span>
                      {typedTranslations[activeLang]}
                      {isTranslating && (
                        <span className="inline-block w-1.5 h-3.5 bg-accent-purple ml-0.5 animate-pulse" />
                      )}
                    </span>
                  ) : (
                    <span className="text-zinc-600 italic">Waiting for translated neural packets...</span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 text-[10px] text-zinc-500 font-mono">
                  <span>Synthesized voice: ON (High Precision)</span>
                  <div className="flex items-center gap-2">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>AUDIO OUTREADY</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
