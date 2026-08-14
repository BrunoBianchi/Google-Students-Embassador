import React from 'react';

const tiers = [
  {
    category: "O Explorador (Bronze)",
    points: 600,
    physical: "R$ 100 e-voucher + Diário Premium",
    digital: "Badge Digital Oficial"
  },
  {
    category: "O Navegador (Prata)",
    points: 1200,
    physical: "R$ 100 e-voucher + Mochila GSA",
    digital: "Badge Digital Oficial"
  }
];

const highPerformers = [
  {
    title: "Prêmio O Catalisador (Celestial):",
    desc: <>Os <strong>primeiros 10</strong> embaixadores a atingirem <strong>4.200 pontos</strong> recebem um <strong>Pixel Phone 10a</strong>.</>
  },
  {
    title: "Destaque na Criação de Conteúdo:",
    desc: <>Reels com mais de <strong>1M de views</strong> ganham a chance de destaque na <strong>página oficial do Google Brasil</strong>.</>
  },
  {
    title: "Reconhecimento de Destaques Mensais:",
    desc: <>Embaixadores com as <strong>Melhores Histórias</strong> mensais podem ser destacados nas <strong>redes sociais oficiais do Google</strong>.</>
  },
  {
    title: "Vencedor Mensal de Teste de Produto:",
    desc: <>A <strong>melhor submissão</strong> mensal de testes de produto ganha um <strong>Pixel 10a</strong>.</>
  }
];

const RewardsSection: React.FC = () => {
  return (
    <section id="rewards" className="relative max-w-6xl mx-auto px-4 my-16">
      
      {/* Tiered Reward Structure Card */}
      <div className="bg-[#4285F4] rounded-3xl overflow-hidden border-3 border-[#1e293b] shadow-hard-black text-white mb-16 relative">
        
        {/* Floating elements inside card using images from /public */}
        <div className="absolute -left-4 top-1/3 hidden lg:block drop-shadow-2xl z-20 hover:scale-110 transition-transform cursor-pointer">
          <img src="/heart.png" alt="Heart" className="w-20 h-20 object-contain -rotate-12 filter drop-shadow-[0_10px_20px_rgba(234,67,53,0.3)]" />
        </div>

        <div className="absolute right-6 -top-6 hidden lg:block drop-shadow-2xl z-20 hover:scale-110 transition-transform cursor-pointer">
          <img src="/levels.png" alt="Levels" className="w-20 h-20 object-contain rotate-6 filter drop-shadow-[0_10px_20px_rgba(251,188,4,0.3)]" />
        </div>

        <div className="pt-12 pb-8 px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FBBC04] text-[#1e293b] font-black text-xs px-3.5 py-1 rounded-md border-2 border-[#1e293b] shadow-sm -rotate-1 mb-4 uppercase tracking-wider">
            <img src="/levels.png" alt="Levels" className="w-4 h-4 object-contain" />
            <span>RECOMPENSAS & NÍVEIS</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-3 tracking-tight leading-tight text-white">
            Estrutura de Recompensas por Nível
          </h2>
          <p className="text-blue-100 font-bold max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Níveis de progressão baseados no total de pontos acumulados durante o programa.
          </p>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="border-t-3 border-b-3 border-[#1e293b] bg-[#1e293b] text-xs font-black uppercase tracking-wider text-white">
                <th className="py-4 px-6">Categoria do Nível</th>
                <th className="py-4 px-6 border-l-2 border-slate-700">Pontos</th>
                <th className="py-4 px-6 border-l-2 border-slate-700">E-Vouchers & Recompensas Físicas</th>
                <th className="py-4 px-6 border-l-2 border-slate-700">Recompensas Digitais</th>
              </tr>
            </thead>
            <tbody className="bg-white text-gray-800 font-extrabold text-sm">
              {tiers.map((tier, idx) => (
                <tr key={idx} className={idx !== tiers.length - 1 ? "border-b-2 border-gray-200" : ""}>
                  <td className="py-5 px-6 text-[#1e293b]">{tier.category}</td>
                  <td className="py-5 px-6 text-[#4285F4] border-l-2 border-gray-200">{tier.points}</td>
                  <td className="py-5 px-6 text-[#1e293b] border-l-2 border-gray-200">{tier.physical}</td>
                  <td className="py-5 px-6 text-[#34A853] border-l-2 border-gray-200">{tier.digital}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* High-Performer Rewards */}
      <div className="bg-white rounded-3xl p-8 md:p-12 border-3 border-[#1e293b] shadow-hard-black relative">
        
        {/* Floating Smiley */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 hidden lg:block z-20 hover:scale-110 transition-transform cursor-pointer">
          <img src="/smiley.png" alt="Smiley" className="w-20 h-20 object-contain filter drop-shadow-[0_10px_20px_rgba(251,188,4,0.3)]" />
        </div>

        <div className="inline-flex items-center gap-2 bg-[#EA4335] text-white font-black text-xs px-3.5 py-1 rounded-md border-2 border-[#1e293b] shadow-sm -rotate-1 mb-4 uppercase tracking-wider">
          <img src="/sparkle.png" alt="Sparkle" className="w-4 h-4 object-contain" />
          <span>DESTAQUES ESPECIAIS</span>
        </div>

        <h3 className="text-3xl md:text-4xl font-black mb-3 tracking-tight text-[#1e293b]">
          Recompensas Exclusivas de Alto Desempenho
        </h3>
        <p className="text-gray-700 mb-8 text-sm md:text-base max-w-2xl leading-relaxed font-bold">
          Incentivos especiais para os embaixadores com melhor desempenho em pilares de engajamento específicos.
        </p>

        <ul className="space-y-4 max-w-2xl">
          {highPerformers.map((item, idx) => (
            <li key={idx} className="flex items-start bg-[#FAF9F6] p-4 rounded-2xl border-2 border-[#1e293b] shadow-xs">
              <span className="text-[#4285F4] mr-3 mt-0.5 text-lg font-black">•</span>
              <div>
                <span className="font-extrabold text-[#4285F4] text-sm block mb-1">{item.title}</span>
                <span className="text-gray-700 leading-relaxed text-xs sm:text-sm font-medium">{item.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </section>
  );
};

export default RewardsSection;
