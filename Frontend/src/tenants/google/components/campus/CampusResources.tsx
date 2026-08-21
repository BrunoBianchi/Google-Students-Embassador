import React, { useState, useEffect } from "react";
import { useCampus } from "../../../../contexts/CampusContext";
import { authApi, type CampusResourceItem } from "../../../../services/auth";
import CampusAccessGate from "./CampusAccessGate";
import {
  BookOpen,
  Sparkles,
  FileText,
  Lock,
  ExternalLink,
  CheckCircle2,
  Copy,
  ArrowRight,
} from "lucide-react";

export default function CampusResources() {
  const { campus, membership } = useCampus();
  const [resources, setResources] = useState<CampusResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!campus) return;
    authApi.getCampusResources(campus.slug)
      .then((res) => setResources(res.resources))
      .catch(() => setResources([]))
      .finally(() => setLoading(false));
  }, [campus]);

  if (!campus) return null;

  const isMember = membership?.isMember ?? false;

  // Strict Privacy Check: If non-member, ONLY display the clean access gate!
  if (!isMember) {
    return (
      <div className="py-4">
        <CampusAccessGate
          featureTitle="Cofre de Prompts & Recursos da Comunidade"
          featureDescription="Tenha acesso aos materiais exclusivos compartilhados por estudantes e embaixadores da sua universidade."
        />
      </div>
    );
  }

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const samplePrompts = [
    {
      id: "prompt-1",
      title: "Tutor Socrático para Conceitos Complexos",
      category: "Estudos Teóricos",
      prompt: `Atue como um professor universitário socrático especialista em [CONCEITO/MATÉRIA]. Não me dê a resposta final de imediato. Em vez disso, faça-me uma pergunta orientadora e divida a explicação em 3 etapas progressivas. Se eu errar, aponte onde meu raciocínio divergiu com base em fundamentos teóricos.`,
    },
    {
      id: "prompt-2",
      title: "Tabela Conceitual Comparativa com Rigor",
      category: "Revisão Bibliográfica",
      prompt: `Analise as abordagens de [TEMA A] e [TEMA B]. Gere uma tabela Markdown contendo as colunas: 1. Dimensão de Análise, 2. Abordagem A, 3. Abordagem B, 4. Vantagens Críticas, 5. Limitações Metodológicas. Ao final, liste 3 perguntas não respondidas pela literatura.`,
    },
    {
      id: "prompt-3",
      title: "Simulação de Banca Examinadora Anti-Alucinação",
      category: "Pesquisa & TCC",
      prompt: `Assuma a persona de um membro avaliador rigoroso de banca acadêmica na área de [ÁREA]. Analise a tese a seguir: "[INSERIR RESUMO]". Aponte 3 possíveis fragilidades metodológicas e sugira 2 experimentos de validação para reforçar a robustez dos resultados.`,
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <span className="text-2xs font-mono font-black uppercase text-[#4285F4] tracking-wider">
          Biblioteca Acadêmica
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1e293b]">Recursos &amp; Materiais de Estudo</h2>
        <p className="text-xs sm:text-sm text-[#475569] font-medium mt-0.5 max-w-2xl leading-relaxed">
          Prompts calibrados, guias metodológicos e ferramentas práticas organizadas para a comunidade da {campus.name}.
        </p>
      </div>

      {/* Curated Resources */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#475569]">
          Guias e Toolkits Disponíveis
        </h3>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm font-bold bg-white rounded-3xl border-3 border-[#1e293b] shadow-hard-black">
            Carregando recursos...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {resources.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xs font-mono font-black text-[#4285F4] uppercase bg-[#E8F0FE] border border-[#4285F4] px-2.5 py-0.5 rounded-lg">
                      {item.category}
                    </span>
                    {item.isCampusExclusive && (
                      <span className="px-2.5 py-0.5 rounded-full text-2xs font-black bg-[#FFF8E1] text-[#B45309] border border-[#FBBC04] flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Exclusivo
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-black text-[#1e293b] mb-2">{item.title}</h4>
                  <p className="text-xs text-[#475569] font-medium leading-relaxed">{item.description}</p>
                </div>

                <a
                  href={item.url}
                  className="mt-6 pt-4 border-t-2 border-slate-100 flex items-center gap-1 text-xs font-black text-[#4285F4] hover:underline"
                >
                  Abrir material
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prompt Vault Cards */}
      <div className="space-y-4 pt-4 border-t-2 border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#475569]">
            Cofre de Prompts Calibrados para Universitários
          </h3>
          <a href="/students" className="text-xs font-black text-[#4285F4] hover:underline flex items-center gap-1">
            Ver todos no Guia do Estudante
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {samplePrompts.map((p) => (
            <div key={p.id} className="p-6 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all flex flex-col justify-between">
              <div>
                <span className="text-2xs font-black text-[#B45309] uppercase block mb-1">
                  {p.category}
                </span>
                <h4 className="text-sm font-black text-[#1e293b] mb-3">{p.title}</h4>
                <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-300 font-mono text-2xs text-[#1e293b] leading-relaxed">
                  {p.prompt}
                </div>
              </div>

              <button
                onClick={() => handleCopyPrompt(p.prompt, p.id)}
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-[#1e293b] text-xs font-black text-[#1e293b] shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedId === p.id ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853]" />
                    <span className="text-[#34A853]">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    Copiar Prompt
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
