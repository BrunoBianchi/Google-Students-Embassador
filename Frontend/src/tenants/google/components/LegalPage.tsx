import React, { useState } from "react";
import { ArrowLeft, FileText, ShieldCheck, ExternalLink, AlertCircle, CheckCircle2, Lock, Scale, HelpCircle } from "lucide-react";
import Logo from "./Logo";

type LegalPageProps = { kind?: "terms" | "privacy" };

export const LegalPage: React.FC<LegalPageProps> = ({ kind = "terms" }) => {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">(kind);

  return (
    <main className="min-h-screen bg-[#F8FAFE] px-4 py-6 text-[#1e293b] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        {/* Top Header */}
        <header className="mb-8 flex items-center justify-between">
          <a href="/" aria-label="Voltar ao Hub">
            <Logo size="md" />
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-[#4285F4] transition-colors"
            >
              <ArrowLeft size={16} /> Voltar ao Início
            </a>
            <a
              href="/register"
              className="inline-flex items-center gap-1.5 bg-[#4285F4] hover:bg-[#3367D6] text-white px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-2xs"
            >
              Criar Conta
            </a>
          </div>
        </header>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-6 p-1.5 bg-slate-200/80 rounded-2xl border-2 border-[#1e293b] w-fit shadow-hard-black">
          <button
            onClick={() => setActiveTab("terms")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === "terms"
                ? "bg-white text-[#4285F4] shadow-sm border border-slate-300"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <FileText size={16} />
            <span>Termos de Uso</span>
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === "privacy"
                ? "bg-white text-[#34A853] shadow-sm border border-slate-300"
                : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <ShieldCheck size={16} />
            <span>Política de Privacidade (LGPD)</span>
          </button>
        </div>

        {/* Main Document Article */}
        <article className="overflow-hidden rounded-3xl border-3 border-[#1e293b] bg-white shadow-hard-black">
          <div className="h-2 w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853]" />
          
          <div className="p-6 sm:p-10 lg:p-12">
            
            {/* TERMS OF USE CONTENT */}
            {activeTab === "terms" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#4285F4] border-2 border-[#1e293b] shadow-2xs">
                    <FileText size={24} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#4285F4]">
                      Termos de Serviço &amp; Convivência Comunitária
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#1e293b]">
                      Termos de Uso da Plataforma
                    </h1>
                  </div>
                </div>

                {/* Prominent Independence Disclaimer Alert */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8E1] border-2 border-[#FBBC04] shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs sm:text-sm text-[#78350F] leading-relaxed">
                      <p className="font-black">
                        AVISO LEGAL DE INDEPENDÊNCIA E ISENÇÃO DE VÍNCULO CORPORATIVO:
                      </p>
                      <p>
                        O <strong>Campus Ambassador Hub</strong> é uma plataforma autônoma, voluntária e independente desenvolvida por participantes da comunidade estudantil universitária. 
                        <strong> ESTA PLATAFORMA NÃO É UM PRODUTO OFICIAL, NÃO É OPERADA, NÃO É PATROCINADA E NÃO POSSUI QUALQUER VÍNCULO SOCIETÁRIO, EMPREGATÍCIO, CONTRATUAL OU DE AFILIAÇÃO COM A GOOGLE LLC, AMPLIFICA OU SUAS AFILIADAS.</strong> 
                        Marcas e nomes de terceiros mencionados para fins acadêmicos ou de contexto são de propriedade exclusiva de seus respectivos titulares.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-7 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  <section className="space-y-2">
                    <h2 className="text-base font-black text-[#1e293b] flex items-center gap-2">
                      <Scale size={17} className="text-[#4285F4]" />
                      1. Aceitação dos Termos e Capacidade Jurídica
                    </h2>
                    <p>
                      Ao se cadastrar, navegar, publicar ou utilizar qualquer recurso do Campus Ambassador Hub, você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso e com a nossa Política de Privacidade. O cadastro é permitido a estudantes e interessados a partir de 16 (dezesseis) anos de idade completos, nos termos da legislação brasileira.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-base font-black text-[#1e293b] flex items-center gap-2">
                      <AlertCircle size={17} className="text-[#EA4335]" />
                      2. Responsabilidade Integral por Conteúdos e Atividades Postadas
                    </h2>
                    <p>
                      <strong>Todo e qualquer conteúdo, evento, workshop, material didático, código, texto, link ou mídia postado, enviado ou organizado por você é de sua exclusiva e integral responsabilidade civil e penal.</strong>
                    </p>
                    <p>
                      A plataforma opera exclusivamente como intermediadora tecnológica de hospedagem e compartilhamento comunitário (provedor de aplicações), conforme preconizado pelo <em>Artigo 19 da Lei Federal nº 12.965/2014 (Marco Civil da Internet)</em>. A administração do Hub não realiza controle editorial prévio sobre as postagens dos membros e se isenta de qualquer responsabilidade por opiniões, condutas ou transações de seus usuários.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-base font-black text-[#1e293b] flex items-center gap-2">
                      <Lock size={17} className="text-[#34A853]" />
                      3. Cadastro Voluntário e Segurança das Credenciais
                    </h2>
                    <p>
                      O ingresso na comunidade é estritamente individual e voluntário (100% Opt-in). Você se compromete a fornecer informações verídicas e manter sua senha de acesso em sigilo. É expressamente proibido compartilhar credenciais, tentar invadir contas de outros usuários ou utilizar automações/bots para extrair dados da plataforma sem autorização formal por escrito.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-base font-black text-[#1e293b] flex items-center gap-2">
                      <CheckCircle2 size={17} className="text-[#4285F4]" />
                      4. Código de Conduta e Convivência Comunitária
                    </h2>
                    <p>
                      Para manter um ecossistema seguro e enriquecedor de aprendizado em Inteligência Artificial e desenvolvimento tecnológico, é terminantemente proibido:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                      <li>Praticar qualquer forma de assédio, intimidação, discriminação (por gênero, raça, religião, orientação sexual, nacionalidade ou deficiência) ou discurso de ódio.</li>
                      <li>Publicar conteúdo com intuito de spam, esquemas comerciais ilegais, vírus, malwares ou ataques cibernéticos.</li>
                      <li>Violar direitos autorais, patentes, segredos industriais ou propriedade intelectual de terceiros.</li>
                      <li>Divulgar dados pessoais de terceiros sem consentimento formal prévio (Doxxing).</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-base font-black text-[#1e293b] flex items-center gap-2">
                      <Scale size={17} className="text-[#FBBC04]" />
                      5. Eventos Acadêmicos e Workshops Universitários
                    </h2>
                    <p>
                      Os eventos, palestras, summits e oficinas presenciais ou online cadastrados na plataforma são de iniciativa independente de seus respectivos organizadores ou diretórios acadêmicos. Cada organizador é o único responsável pela reserva de espaços, infraestrutura física, conformidade com os regulamentos de sua respectiva universidade e segurança dos participantes presentes.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-base font-black text-[#1e293b] flex items-center gap-2">
                      <HelpCircle size={17} className="text-slate-500" />
                      6. Moderação, Suspensão e Encerramento de Contas
                    </h2>
                    <p>
                      A equipe de moderação reserva-se o direito de, a seu exclusivo critério, remover conteúdos em desacordo com estes Termos e suspender ou encerrar definitivamente contas infratoras. O usuário também pode solicitar a exclusão irrevogável de sua conta e histórico diretamente através do seu painel de configurações.
                    </p>
                  </section>
                </div>
              </div>
            )}

            {/* PRIVACY POLICY CONTENT */}
            {activeTab === "privacy" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F4EA] text-[#34A853] border-2 border-[#1e293b] shadow-2xs">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#34A853]">
                      Conformidade com a Lei Geral de Proteção de Dados (LGPD)
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#1e293b]">
                      Política de Privacidade de Dados
                    </h1>
                  </div>
                </div>

                {/* Privacy Badge Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#E6F4EA] border-2 border-[#34A853] shadow-sm">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#137333] shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs sm:text-sm text-[#137333] leading-relaxed">
                      <p className="font-black">
                        COMPROMISSO COM A PRIVACIDADE &amp; LEI Nº 13.709/2018 (LGPD):
                      </p>
                      <p>
                        A privacidade dos membros é um pilar fundacional do Campus Ambassador Hub. Coletamos apenas o estritamente indispensável para a identificação acadêmica e conexão voluntária entre estudantes, garantindo transparência, controle e segurança total.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-7 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  <section className="space-y-2">
                    <h2 className="text-base font-black text-[#1e293b] flex items-center gap-2">
                      <Lock size={17} className="text-[#34A853]" />
                      1. Princípio da Minimização e Dados Coletados
                    </h2>
                    <p>
                      Coletamos e processamos exclusivamente os dados fornecidos voluntariamente por você durante a criação da conta e utilização da plataforma:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                      <li><strong>Identificação Básica:</strong> Nome completo, apelido (nome social de exibição) e data de nascimento (para validação de idade mínima legal).</li>
                      <li><strong>Contato &amp; Acesso:</strong> Endereço de e-mail institucional ou pessoal e credenciais criptografadas via algoritmo <em>bcrypt</em>.</li>
                      <li><strong>Vínculo Acadêmico:</strong> Estado, cidade, universidade vinculada e modalidade de participação (Embaixador ou Estudante).</li>
                      <li><strong>Perfil Opcional:</strong> Biografia e links voluntários de redes acadêmicas (LinkedIn, GitHub).</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-base font-black text-[#1e293b] flex items-center gap-2">
                      <Scale size={17} className="text-[#4285F4]" />
                      2. Finalidade e Base Legal do Tratamento
                    </h2>
                    <p>
                      O tratamento de dados pessoais é fundamentado no <em>Art. 7º, V da LGPD</em> (execução de contrato e procedimentos preliminares a pedido do titular) e no <em>Art. 7º, I</em> (consentimento explícito para comunicações e recursos adicionais). As informações são usadas unicamente para:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                      <li>Permitir o login, autenticação e gerenciamento seguro da sua conta.</li>
                      <li>Habilitar a navegação e inscrição em eventos, workshops e cursos de IA no seu campus.</li>
                      <li>Facilitar a conexão voluntária entre líderes estudantis da mesma instituição ou macrorregião.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-base font-black text-[#1e293b] flex items-center gap-2">
                      <CheckCircle2 size={17} className="text-[#EA4335]" />
                      3. Não Comercialização e Não Compartilhamento Abusivo
                    </h2>
                    <p>
                      <strong>O Campus Ambassador Hub não vende, não aluga e não monetiza seus dados pessoais para terceiros, anunciantes, empresas de marketing ou recrutadores externos.</strong> Os dados trafegam exclusivamente através de conexões encriptadas via protocolo SSL/TLS e serviços de infraestrutura essenciais contratados com elevados padrões de conformidade.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-base font-black text-[#1e293b] flex items-center gap-2">
                      <ShieldCheck size={17} className="text-[#34A853]" />
                      4. Seus Direitos como Titular de Dados (Art. 18 da LGPD)
                    </h2>
                    <p>
                      Você tem o direito pleno de, a qualquer momento e de forma facilitada:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                      <li>Confirmar a existência de tratamento e acessar seus dados pessoais.</li>
                      <li>Corrigir dados incompletos, inexatos ou desatualizados via Dashboard.</li>
                      <li>Revogar o consentimento para envio de comunicados não essenciais.</li>
                      <li>Solicitar a eliminação total e definitiva dos seus dados pessoais de nossa base de dados.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h2 className="text-base font-black text-[#1e293b] flex items-center gap-2">
                      <Lock size={17} className="text-[#FBBC04]" />
                      5. Segurança, Armazenamento e Cookies
                    </h2>
                    <p>
                      Utilizamos cookies e armazenamento local (localStorage/sessionStorage) exclusivamente para retenção de sessão autenticada (Tokens JWT) e preferências de navegação técnica. Adotamos medidas de segurança contra injeções SQL, Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF) e ataques de força bruta.
                    </p>
                  </section>
                </div>
              </div>
            )}

            {/* Footer Notice */}
            <div className="mt-10 pt-6 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs sm:text-xs font-bold text-slate-500">
              <p>Última revisão e atualização: Agosto de 2026</p>
              <div className="flex items-center gap-4">
                <a href="/terms" onClick={(e) => { e.preventDefault(); setActiveTab("terms"); }} className="hover:text-[#4285F4] transition-colors underline">Termos</a>
                <a href="/privacy" onClick={(e) => { e.preventDefault(); setActiveTab("privacy"); }} className="hover:text-[#34A853] transition-colors underline">Privacidade</a>
                <a href="/" className="hover:text-slate-800 transition-colors">Voltar ao Hub</a>
              </div>
            </div>

          </div>
        </article>

        <p className="mt-6 text-center text-xs font-medium text-slate-500 max-w-xl mx-auto leading-relaxed">
          Campus Ambassador Hub · Plataforma acadêmica independente mantida por estudantes. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
};

export default LegalPage;
