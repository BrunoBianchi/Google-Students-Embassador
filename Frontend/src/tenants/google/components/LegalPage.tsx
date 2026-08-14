import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";

type LegalPageProps = { kind: "terms" | "privacy" };

const content = {
  terms: {
    eyebrow: "GSA Brasil Hub · legal",
    title: "Termos de Uso",
    description: "Regras claras para que a comunidade seja útil, respeitosa e segura para todos.",
    icon: FileText,
    sections: [
      ["1. Aceitação", "Ao criar uma conta ou usar o Google Student Ambassador Hub, você concorda com estes Termos de Uso e com a Política de Privacidade. O Hub é um projeto acadêmico independente e não possui vínculo, patrocínio ou endosso da Google LLC."],
      ["2. Conta e segurança", "Você deve fornecer informações verdadeiras, manter sua senha em sigilo e confirmar seu e-mail. A conta é pessoal; não compartilhe credenciais nem use dados de outra pessoa."],
      ["3. Convivência", "Use eventos, fóruns e grupos de forma respeitosa. Não publique conteúdo ilegal, discriminatório, ofensivo, spam, dados pessoais de terceiros ou material que viole direitos autorais. Administradores e moderadores podem remover conteúdo e limitar acessos para proteger a comunidade."],
      ["4. Conteúdo e participação", "Você continua responsável pelo que publica. Ao compartilhar conteúdo no Hub, concede uma licença não exclusiva para exibi-lo dentro da plataforma, exclusivamente para operar e divulgar a comunidade conforme suas configurações de privacidade."],
      ["5. Eventos e organizações", "Organizadores são responsáveis pela precisão das informações dos eventos e pelo cumprimento das leis aplicáveis. A presença em um evento não cria vínculo com universidades, empresas ou a Google LLC."],
      ["6. Alterações e contato", "Podemos atualizar estes termos para melhorar segurança, funcionamento ou adequação legal. Mudanças relevantes serão comunicadas no Hub ou por e-mail a quem autorizou comunicações. Dúvidas podem ser encaminhadas pelos canais oficiais do projeto."],
    ],
  },
  privacy: {
    eyebrow: "GSA Brasil Hub · privacidade",
    title: "Política de Privacidade",
    description: "Transparência sobre os dados necessários para conectar sua comunidade universitária.",
    icon: ShieldCheck,
    sections: [
      ["1. Dados que tratamos", "Coletamos dados de cadastro, como nome, e-mail, cidade, universidade, tipo de participação, foto e informações opcionais de perfil. Também tratamos o conteúdo que você publica, preferências de e-mail e dados técnicos mínimos necessários para segurança e funcionamento."],
      ["2. Como usamos", "Usamos esses dados para criar e proteger sua conta, mostrar seu perfil e participação em eventos, fóruns e grupos, prevenir abuso, responder a solicitações e enviar comunicações que você autorizou."],
      ["3. Comunicações", "A confirmação de conta, a recuperação de senha e avisos de segurança são essenciais. Atualizações de eventos, fóruns e novidades são opcionais: no cadastro você escolhe recebê-las ou não, e cada e-mail inclui uma opção de descadastro por categoria."],
      ["4. Compartilhamento", "Dados públicos do perfil e publicações aparecem conforme a funcionalidade escolhida por você. Não vendemos dados pessoais. Podemos utilizar provedores necessários para operar o serviço, como hospedagem, banco de dados e envio transacional de e-mail, sob obrigações de segurança."],
      ["5. Retenção e segurança", "Mantemos dados enquanto sua conta existir ou pelo período necessário para cumprir obrigações legítimas. Aplicamos controles de acesso, tokens temporários e senhas armazenadas com hash; nenhum sistema, porém, é absolutamente imune a riscos."],
      ["6. Seus direitos", "Você pode solicitar acesso, correção, eliminação ou informações sobre o tratamento de seus dados pelos canais oficiais do projeto, observadas as limitações legais e de segurança. Esta política foi atualizada em 14 de agosto de 2026."],
    ],
  },
} as const;

const LegalPage = ({ kind }: LegalPageProps) => {
  const page = content[kind];
  const Icon = page.icon;
  return <main className="min-h-screen bg-[#f7f9fd] px-4 py-6 text-[#1e293b] sm:px-6 sm:py-10">
    <div className="mx-auto max-w-3xl">
      <header className="mb-8 flex items-center justify-between"><a href="/" aria-label="Voltar ao Hub"><img src="/logo.png" alt="Google Student Ambassador" className="h-9 w-auto" /></a><a href="/register" className="inline-flex items-center gap-2 text-sm font-black hover:text-[#4285f4]"><ArrowLeft size={17} /> Criar conta</a></header>
      <article className="overflow-hidden rounded-3xl border-3 border-[#1e293b] bg-white shadow-hard-black">
        <div className="grid h-2 grid-cols-4"><span className="bg-[#4285f4]" /><span className="bg-[#ea4335]" /><span className="bg-[#fbbc04]" /><span className="bg-[#34a853]" /></div>
        <div className="p-6 sm:p-10"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ebf3fe] text-[#4285f4]"><Icon size={25} /></div><p className="mt-6 text-xs font-black uppercase tracking-[0.14em] text-[#4285f4]">{page.eyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{page.title}</h1><p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">{page.description}</p><div className="mt-9 space-y-7">{page.sections.map(([heading, body]) => <section key={heading}><h2 className="text-base font-black">{heading}</h2><p className="mt-2 text-sm leading-7 text-slate-600">{body}</p></section>)}</div></div>
      </article>
      <p className="mt-8 text-center text-xs font-medium text-slate-500">Google Student Ambassador Hub · Projeto acadêmico independente.</p>
    </div>
  </main>;
};

export default LegalPage;
