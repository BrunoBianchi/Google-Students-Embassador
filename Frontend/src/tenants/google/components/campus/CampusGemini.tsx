import React, { useState } from "react";
import { useCampus } from "../../../../contexts/CampusContext";
import CampusAccessGate from "./CampusAccessGate";
import {
  Sparkles,
  Cpu,
  ShieldAlert,
  Terminal,
  Zap,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export default function CampusGemini() {
  const { campus, membership } = useCampus();
  const [activeTab, setActiveTab] = useState<"architecture" | "prompting" | "antihallucination">("architecture");

  if (!campus) return null;

  const isMember = membership?.isMember ?? false;

  // Strict Privacy Check: If non-member, ONLY display the clean access gate!
  if (!isMember) {
    return (
      <div className="py-4">
        <CampusAccessGate
          featureTitle="Hub de IA & Gemini do Campus"
          featureDescription="O acesso aos simuladores e laboratórios de IA específicos da sua universidade requer e-mail institucional confirmado."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-lg text-2xs font-mono font-black uppercase tracking-wider bg-[#E6F4EA] text-[#137333] border-2 border-[#34A853]">
            Inteligência Artificial Acadêmica
          </span>
          <span className="text-2xs text-slate-500 font-mono font-bold">· Campus {campus.slug.toUpperCase()}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1e293b]">Hub de IA &amp; Gemini Universitário</h2>
        <p className="text-xs sm:text-sm text-[#475569] font-medium mt-0.5 max-w-2xl leading-relaxed">
          Aprenda o funcionamento real de modelos de linguagem (LLMs), domine o rigor metodológico anti-alucinação e participe dos grupos de estudo locais.
        </p>
      </div>

      {/* Interactive Subtabs in Light Theme */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border-3 border-[#1e293b] shadow-hard-black w-fit">
        <button
          onClick={() => setActiveTab("architecture")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "architecture"
              ? "bg-[#34A853] text-white border border-[#1e293b] shadow-2xs"
              : "text-slate-700 hover:text-[#1e293b]"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Arquitetura Transformer
        </button>
        <button
          onClick={() => setActiveTab("prompting")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "prompting"
              ? "bg-[#4285F4] text-white border border-[#1e293b] shadow-2xs"
              : "text-slate-700 hover:text-[#1e293b]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Engenharia de Prompts
        </button>
        <button
          onClick={() => setActiveTab("antihallucination")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === "antihallucination"
              ? "bg-[#EA4335] text-white border border-[#1e293b] shadow-2xs"
              : "text-slate-700 hover:text-[#1e293b]"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Rigor Anti-Alucinação
        </button>
      </div>

      {/* Tab Content 1: Architecture */}
      {activeTab === "architecture" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] border-2 border-[#34A853] text-[#34A853] flex items-center justify-center shadow-2xs">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#1e293b]">Mecanismo de Auto-Atenção</h3>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              O Self-Attention calcula pesos matemáticos entre cada token do texto, permitindo relacionar conceitos distantes no contexto de um artigo.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F0FE] border-2 border-[#4285F4] text-[#4285F4] flex items-center justify-center shadow-2xs">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#1e293b]">Espaço Vetorial de Embeddings</h3>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              Palavras e sentenças são convertidas em vetores densos multidimensionais, nos quais proximidade geométrica representa afinidade semântica.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8E1] border-2 border-[#FBBC04] text-[#B45309] flex items-center justify-center shadow-2xs">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#1e293b]">Janela de Contexto Expandida</h3>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              A arquitetura do Gemini permite analisar teses completas, livros didáticos e repositórios inteiros de código em uma única inferência.
            </p>
          </div>
        </div>
      )}

      {/* Tab Content 2: Prompting */}
      {activeTab === "prompting" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border-3 border-[#EA4335] shadow-hard-black space-y-3">
            <span className="text-2xs font-mono font-black text-[#EA4335] uppercase">
              ❌ Prompt Vago (Resultados genéricos)
            </span>
            <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-300 font-mono text-xs text-[#C5221F]">
              "Me ajude a estudar para a prova de cálculo."
            </div>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              Sem especificar a disciplina, o nível de profundidade e o formato de saída, o modelo gera dicas superficiais sem valor acadêmico.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border-3 border-[#34A853] shadow-hard-black space-y-3">
            <span className="text-2xs font-mono font-black text-[#137333] uppercase">
              ✅ Prompt Calibrado (Com contexto e restrições)
            </span>
            <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-300 font-mono text-xs text-[#137333]">
              "Atue como monitor de Cálculo Diferencial. Crie 3 exercícios sobre Integrais por Partes progressivos, fornecendo apenas a resposta final oculta e orientando o primeiro passo de resolução."
            </div>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              Define a persona, tema restrito, progressão pedagógica e formato de interação claro.
            </p>
          </div>
        </div>
      )}

      {/* Tab Content 3: Anti-hallucination */}
      {activeTab === "antihallucination" && (
        <div className="p-8 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-6">
          <div>
            <h3 className="text-xl font-black text-[#1e293b] mb-2">Protocolo de Validação Cruzada para TCC e Artigos</h3>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              Para tarefas com alto rigor científico, aplique técnicas consagradas para mitigar alucinações:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-300 space-y-2">
              <div className="font-black text-[#137333] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
                1. Grounding por Contexto
              </div>
              <p className="text-[#475569] font-medium leading-relaxed">
                Forneça o PDF ou trecho do artigo como contexto primário e exija que as respostas citem os parágrafos originais.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-300 space-y-2">
              <div className="font-black text-[#137333] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
                2. Chain-of-Verification
              </div>
              <p className="text-[#475569] font-medium leading-relaxed">
                Instrua o modelo a formular perguntas de verificação sobre suas próprias afirmações antes de emitir a resposta conclusiva.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-300 space-y-2">
              <div className="font-black text-[#137333] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
                3. Temperatura Reduzida
              </div>
              <p className="text-[#475569] font-medium leading-relaxed">
                Utilize valores baixos de temperatura (0.0 a 0.2) via API quando a tarefa exigir fidelidade a dados factuais e fórmulas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Guide Link */}
      <div className="p-8 rounded-3xl bg-[#FFF8E1] border-3 border-[#FBBC04] shadow-hard-black flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-base font-black text-[#1e293b] mb-1">Quer aprofundar seu conhecimento em IA?</h4>
          <p className="text-xs text-[#475569] font-medium">
            Acesse o Guia Completo do Estudante com infográficos, fórmulas e materiais didáticos avançados.
          </p>
        </div>
        <a
          href="/students"
          className="px-6 py-3 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-black text-xs border-2 border-[#1e293b] shadow-hard-black transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          Acessar Guia do Estudante &amp; IA
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
