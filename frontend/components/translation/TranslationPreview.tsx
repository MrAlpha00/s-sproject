"use client";

import { MessageSquare, Languages, Disc, Play } from "lucide-react";

export function TranslationPreview() {
  const mockTranscripts = [
    {
      id: "1",
      speaker: "Presenter",
      originalText: "Hello and welcome to the AetherVOX annual conference. Today, we are showcasing our sub-second real-time speech translation and voice synthesis engine.",
      lang: "English (US)",
      translations: [
        { lang: "Spanish (ES)", text: "Hola y bienvenidos a la conferencia anual de AetherVOX. Hoy, estamos presentando nuestro motor de síntesis de voz y traducción de voz en tiempo real en menos de un segundo.", latency: "115ms" },
        { lang: "Mandarin (ZH)", text: "您好，欢迎来到 AetherVOX 年会。今天，我们将展示我们的亚秒级实时语音翻译和语音合成引擎。", latency: "130ms" },
        { lang: "French (FR)", text: "Bonjour et bienvenue à la conférence annuelle d'AetherVOX. Aujourd'hui, nous présentons notre moteur de synthèse vocale et de traduction vocale en temps réel en moins d'une seconde.", latency: "105ms" }
      ]
    },
    {
      id: "2",
      speaker: "Presenter",
      originalText: "By combining low-latency neural pipelines with high-fidelity voice cloning, we ensure that speakers retain their unique identity in fifty languages.",
      lang: "English (US)",
      translations: [
        { lang: "Spanish (ES)", text: "Al combinar canalizaciones neuronales de baja latencia con clonación de voz de alta fidelidad, nos aseguramos de que los hablantes conserven su identidad única en cincuenta idiomas.", latency: "120ms" },
        { lang: "Mandarin (ZH)", text: "通过将低延迟神经管道与高保真语音克隆相结合，我们确保演讲者能够以五十种语言保留其独特身份。", latency: "145ms" },
        { lang: "French (FR)", text: "En combinant des pipelines neuronaux à faible latence avec un clonage vocal haute fidélité, nous veillons à ce que les locuteurs conservent leur identité unique dans cinquante langues.", latency: "110ms" }
      ]
    }
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 flex flex-col h-[400px]">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Live Translation Preview
        </h3>
        
        <div className="flex items-center gap-2">
          <span className="flex h-1.5 w-1.5 rounded-full bg-zinc-600" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Preview Buffer Mode</span>
        </div>
      </div>

      {/* Scrolling Transcript Window */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
        {mockTranscripts.map((block) => (
          <div key={block.id} className="space-y-3.5 border-b border-white/[0.03] pb-4 last:border-b-0 last:pb-0">
            {/* Input Speech Section */}
            <div className="flex gap-2.5 items-start">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-electric-blue/10 border border-electric-blue/20 text-electric-blue mt-0.5">
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{block.speaker}</span>
                  <span className="text-[9px] text-zinc-500 font-medium">({block.lang})</span>
                </div>
                <p className="text-xs text-zinc-200 mt-1 leading-relaxed font-medium">
                  {block.originalText}
                </p>
              </div>
            </div>

            {/* Translated Output Channels */}
            <div className="pl-8 space-y-2.5">
              {block.translations.map((translation) => (
                <div key={translation.lang} className="flex gap-2.5 items-start bg-zinc-950/30 border border-white/[0.02] rounded-lg p-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent-purple/10 border border-accent-purple/20 text-accent-purple">
                    <Languages className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{translation.lang}</span>
                      <div className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-400 uppercase">
                        <Disc className="h-2.5 w-2.5 animate-pulse" />
                        <span>Voice Out ({translation.latency})</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {translation.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
