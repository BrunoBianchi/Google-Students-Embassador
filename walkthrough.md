# Walkthrough: Restauração do Tema Visual Original

Todos os componentes do frontend foram restaurados para o **tema claro com design neo-brutalista lúdico inspirado no ecossistema Google**, exatamente conforme a imagem enviada.

---

## 🎨 Elementos Visuais Restaurados

1. **Página Principal (`studentembassador.com` / `MAIN`)**:
   - Fundo claro `#FAFAFE` com micro-padrão sutil de pontos.
   - Stickers 3D flutuantes com animação suave (`/smiley.png`, `/sparkle.png`, `/heart.png`, `/chat.png`, `/levels.png`).
   - Tag de destaque inclinada em amarelo: `✦ PLATAFORMA INDEPENDENTE DA COMUNIDADE DE EMBAIXADORES ✦` com `shadow-hard-black`.
   - Título principal com bloco azul inclinado: `Todos os Embaixadores.` / `Uma só Plataforma.`.
   - Botões principais no estilo neo-brutalista com bordas escuras e sombras sólidas deslocadas (`border-3 border-[#1e293b] shadow-hard-black`).
   - Pílulas coloridas de destaques rápidos com ícones temáticos.
   - Janela de demonstração interativa em tempo real com os 3 pontos de janela estilo macOS (vermelho, amarelo e verde) e cards de prévia.
   - Barra de ticker / marquee contínua com aviso institucional independente.
   - Seções:
     - *"A sua comunidade começa perto de você"* com cards 2x2 coloridos (Azul, Vermelho, Verde, Amarelo).
     - *"O que você precisa para fazer a comunidade acontecer"* em grid de 6 cards brancos com ícones coloridos.
     - *"Veja como a Comunidade Interage no Dia a Dia"* com abas de feed, eventos e fóruns.
     - *"Como Funciona a Sua Jornada no Hub"* com passos 01 a 04.
     - Banner CTA final em azul vibrante com botão amarelo de ação.
     - Rodapé completo com a faixa multicolorida no topo.

2. **Cabeçalho Global do Ecossistema (`GlobalEcosystemHeader.tsx`)**:
   - Barra em fundo branco com borda `#1e293b` e sombra sutil.
   - Seletor de hubs do ecossistema com botões em estilo de pílula clara (Azul para Início, Amarelo para Campuses, Vermelho para Eventos, Verde para Connect).
   - Acesso direto ao Guia de IA e perfil autenticado com avatar e botão de logout.

3. **Portal de Campuses (`CampusDirectory.tsx` e `CampusLayout.tsx`)**:
   - Fundo claro com stickers flutuantes.
   - Cards brancos com borda `#1e293b`, `shadow-hard-black` e pontos coloridos estilo macOS.
   - Filtros de macrorregião (Sudeste, Sul, Nordeste, Centro-Oeste, Norte) e estados.
   - Badges coloridas de contagem de membros, embaixadores e eventos por campus.
   - Todas as abas do campus (`/events`, `/workshops`, `/resources`, `/gemini`, `/about`) no mesmo padrão visual claro.

4. **Portal de Eventos Globais (`EventsPortal.tsx`)**:
   - Fundo claro e título inclinado em destaque.
   - Abas *Próximos*, *Calendário (Mês)* e *Anteriores* no estilo de pílula clara com bordas contrastantes.
   - Cards de eventos com tags de categoria coloridas.

5. **Portal Connect & Comunidade (`ConnectPortal.tsx` e `AmbassadorProfileView.tsx`)**:
   - Diretório de embaixadores com fotos de perfil, badges de embaixador, tags de universidade e botões de reconhecimento com curtidas.
   - Exploração por macrorregiões brasileiras com cores de destaque.
   - Mural de comunicados oficiais em cards brancos destacados.

---

## 🧪 Validação e Testes

- **Testes Unitários e de Integração**: 12/12 testes passando com 100% de sucesso (`bun test`).
- **Build de Produção Frontend**: `bun run build` executado e compilado com 0 erros.
