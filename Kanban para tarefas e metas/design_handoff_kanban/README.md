# Handoff: Kanban pessoal com gamificação

## Overview
Painel único (pensado para ser a página inicial do navegador) que reúne o fluxo de tarefas diárias, as metas de curto e médio prazo, um sistema de XP/níveis, timer de foco e um gráfico de atividade dos últimos 14 dias. Sem backend: todo o estado vive no `localStorage` do navegador.

## About the Design Files
Os arquivos deste pacote são **referências de design escritas em HTML** — protótipos que mostram aparência e comportamento pretendidos, não código de produção para copiar. A tarefa é **recriar estes designs no ambiente já existente do codebase** (React, Vue, Svelte, SwiftUI, nativo…) usando seus padrões e bibliotecas. Se ainda não existe um ambiente, escolha o framework mais adequado (para este caso, um app React ou Svelte de página única, sem servidor, é suficiente) e implemente ali.

`Kanban.dc.html` depende de um runtime de preview (`support.js`) que **não** deve ser portado: ele só existe para renderizar o protótipo. O que importa é a estrutura, os valores visuais e a lógica descrita abaixo.

## Fidelity
**High-fidelity.** Cores, tipografia, espaçamentos, raios e estados estão definidos e devem ser reproduzidos fielmente. A única liberdade esperada é na implementação técnica (componentes, store, drag & drop).

## Screens / Views
Uma única tela, rolagem vertical, fundo `radial-gradient(1200px 600px at 15% -10%, #1B2030 0%, #101117 60%)`, texto `#E8E9EF`, fonte `IBM Plex Sans`, padding `40px 44px 64px`.

### 1. Header
**Purpose**: orientar o dia e mostrar progresso de gamificação.
**Layout**: `flex`, `align-items: flex-end`, `justify-content: space-between`, `gap: 32px`, `flex-wrap: wrap`, `padding-bottom: 28px`, `border-bottom: 1px solid #23262F`.

Bloco esquerdo (coluna, `gap: 8px`):
- Data: 12px, `letter-spacing: .16em`, uppercase, `#7D818F`. Formato: `"Quarta-feira, 2 de setembro"` (dia da semana capitalizado, dia, mês em minúsculas, pt-BR).
- Saudação: `Space Grotesk` 40px/600, `letter-spacing: -.02em`, `#F4F5F8`. `"Bom dia."` (<12h), `"Boa tarde."` (<18h), `"Boa noite."`. Com a prop `nome` preenchida: `"Bom dia, Ana."`.

Bloco direito (`flex`, `gap: 14px`, `flex-wrap: wrap`) — cartões, na ordem:

**a) Painel de foco** (só quando há timer ativo): `min-width: 250px`, padding `14px 18px`, `border: 1px solid #3A2F1E`, `radius: 12px`, `background: linear-gradient(140deg, #241D12 0%, #16181F 70%)`. Linha 1: label "Foco" (11px, `.12em`, uppercase, `#D8A45C`) e relógio `Space Grotesk` 24px/600 `tabular-nums` `#F2C14E` no formato `mm:ss`. Linha 2: título da tarefa, 12.5px, `#C8CAD3`, truncado com ellipsis em uma linha. Linha 3: barra 4px, trilha `#2A2418`, preenchimento `#F2C14E`. Linha 4: dois botões — "Pausar"/"Retomar" (`flex: 1`, fundo `#1F2129`, borda `#3A3F4D`, hover borda+texto `#F2C14E`) e "Encerrar" (borda `#33262A`, hover `#FF7A5C`).

**b) Painel de nível**: `min-width: 288px`, borda `#2F3A1E`, `background: linear-gradient(140deg, #1C2314 0%, #16181F 70%)`. Quadrado 44×44, radius 12, fundo `#C8F169`, texto `#16200A`: número do nível (`Space Grotesk` 18px/700) sobre a palavra "nível" (8px, `.14em`, uppercase, `opacity .7`). Ao lado: patente (`Space Grotesk` 16px/600 `#F4F5F8`) e `"40 / 160 XP"` (12px `#93A86A`). Quando há ganho recente, pílula à direita: fundo `#C8F169`, texto `#16200A`, 12px/600, radius 20px, padding `4px 10px` — `"+20 XP · missão concluída"` ou `"Nível 3!"`, visível 2.2s. Barra 6px: trilha `#23281A`, preenchimento `linear-gradient(90deg, #8FD13F, #C8F169)`, `transition: width 420ms ease`. Rodapé do cartão, 11px `#7D818F`: `"180 XP no total"` à esquerda, `"3 dias seguidos"` / `"sem sequência"` à direita.

**c) Em aberto**: `min-width: 124px`, borda `#23262F`, fundo `#16181F`. Label 11px `.12em` uppercase `#7D818F`; número `Space Grotesk` 26px/600 `#F4F5F8`.

**d) Tarefas feitas**: borda `#2F3A1E`, fundo `#1A2013`, label `#93A86A`, número `#C8F169`. Conta apenas cartões na coluna **Feito**.

**e) Metas batidas**: borda `#3D3060`, fundo `#1C1730`, label `#9F86D6`, número `#B98CFF`. Conta apenas metas marcadas como concluídas (semana + mês). Os dois contadores são propositalmente independentes.

### 2. Fluxo diário
**Purpose**: mover tarefas do dia entre estados.
**Layout**: título de seção (`Space Grotesk` 15px/600, `.1em`, uppercase, `#9AA0B0`) + régua `1px #21242D` ocupando o resto da linha. Grid: `repeat(auto-fit, minmax(260px, 1fr))`, `gap: 18px`, `align-items: start`.

Colunas: **Backlog / Ideias**, **Hoje**, **Em andamento**, **Feito**.
Cada coluna: fundo `#15171E`, borda `1px #22252E`, radius 16, padding `16px 14px 14px`, `min-height: 260px`, coluna flex com `gap: 12px`. Cabeçalho: nome (`Space Grotesk` 14px/600 `#E8E9EF`) e contador (12px `tabular-nums` `#6D7180`, fundo `#1C1F27`, radius 20, padding `3px 9px`). Rodapé: botão "+ Adicionar" (`margin-top: auto`, borda tracejada `#2C3040`, radius 10, padding `9px 10px`, 13px `#7D818F`; hover borda e texto `#C8F169`).

**Cartão de tarefa**: fundo `#1B1E26`, borda `1px #272B36`, radius 12, padding `12px 12px 11px`, `cursor: grab`, coluna flex `gap: 9px`; hover borda `#3A4050` e fundo `#1F232C`.
- Linha do título: bolinha de prioridade 9×9 (`margin-top: 5px`) — baixa `#4A505F`, média `#F2C14E`, alta `#FF7A5C`; clique cicla; hover `scale(1.35)`. Título 14px/1.45 `#DFE1E8`, `word-break: break-word`, `text-wrap: pretty`. Botão `×` 15px `#565B6A`, hover `#FF7A5C`.
- Duplo clique no título abre `textarea` inline (3 linhas, fundo `#14161C`, borda `#3C4250`, radius 8, padding 8, 14px): Enter salva, Shift+Enter quebra linha, Esc cancela, blur salva.
- Linha de chips (`flex`, `gap: 7px`, `flex-wrap: wrap`), todos radius 20, padding `3px 9px`, 11px:
  - Etiqueta cíclica: **Trabalho** (borda `#24405E`, fundo `#16283B`, texto `#7FC0FF`), **Pessoal** (`#3A4A20` / `#232D14` / `#C8F169`), **Saúde** (`#4D3122` / `#2E1D15` / `#FF9F6C`), **Estudo** (`#3D3060` / `#241D38` / `#B98CFF`), e o estado vazio "etiqueta" (borda tracejada `#303541`, texto `#5F6472`, hover `#9AA0B0` / `#454B5A`). O clique avança para a próxima e depois volta a vazio.
  - Contador de subtarefas: `"2/3 subtarefas"` ou `"+ subtarefa"` quando não há nenhuma. Borda `#2A2F3B`, texto `#8B909F`, hover `#C8F169`. Alterna a lista.
  - `"▶ foco"` alinhado à direita (`margin-left: auto`), mesmos tokens do chip anterior com hover `#F2C14E`. Quando o cartão é o alvo do timer, o chip é substituído por um selo estático `"em foco"` (borda `#4D3F1C`, fundo `#241D12`, texto `#F2C14E`).
- Lista de subtarefas (expandida): `border-top: 1px solid #262A34`, itens com `gap: 7px`. Caixa 14×14 radius 4 — aberta: borda `#3D4453`, transparente, hover borda `#C8F169`; concluída: fundo e borda `#C8F169` com `✓` 10px/700 `#16200A`. Texto 13px/1.4 `#C2C5CF`; concluído `#6D7180` com `line-through`. `×` por item (13px `#4D525F`, hover `#FF7A5C`). Campo "Nova subtarefa… Enter" ao final: fundo `#14161C`, borda `#2C3140`, radius 8, padding `7px 9px`, 13px; Enter adiciona, Esc fecha.

### 3. Metas
**Purpose**: acompanhar objetivos de curto e médio prazo.
**Layout**: mesma régua de seção; grid `repeat(auto-fit, minmax(340px, 1fr))`, `gap: 18px`. Colunas **Esta semana** e **Este mês**: fundo transparente, borda `1px #2B303C`, radius 16, padding `18px 16px 14px`, `min-height: 200px`.
Cabeçalho: título `Space Grotesk` 17px/600 `#F4F5F8` e `"1/3 concluídas"` (ou `"sem metas"`) 12px `#7D818F`. Barra 4px: trilha `#1E2129`, preenchimento `#C8F169`, largura = concluídas/total.
**Cartão de meta**: fundo `#15171E`, borda `1px #262A34`, radius 12, padding `13px 13px 12px`, linha flex `gap: 12px`, hover borda `#3A4050`. Caixa 18×18 radius 5 — aberta: borda `#3D4453`, hover borda `#C8F169` + fundo `#222A15`; concluída: fundo/borda `#C8F169`, `✓` 12px/700 `#16200A`. Título 14.5px/1.45 `#DFE1E8`; quando concluído, `#6D7180` + `line-through`. Duplo clique edita (mesmo padrão do fluxo). Botão `×` igual ao das tarefas. Rodapé: "+ Adicionar meta".
A seção inteira pode ser oculta pela prop `mostrarMetas`.

### 4. Últimos 14 dias
**Purpose**: mostrar consistência.
Régua de seção com resumo à direita: `"320 XP nas duas últimas semanas"` (12px `#7D818F`). Contêiner: fundo `#15171E`, borda `1px #22252E`, radius 16, padding `20px 20px 14px`, `flex`, `align-items: flex-end`, `gap: 10px`.
Cada dia (`flex: 1`, coluna, `gap: 8px`, centralizado): valor de XP acima (10.5px `tabular-nums` `#6D7180`, vazio quando 0); área da barra 92px de altura com a barra alinhada ao fundo (`min-height: 3px`, `border-radius: 6px 6px 3px 3px`, altura = xp/max onde `max = Math.max(50, ...xp)`) — hoje `linear-gradient(180deg, #C8F169, #8FD13F)`, dias anteriores `#2D3342`; inicial do dia da semana abaixo (11px `#5F6472`, `D S T Q Q S S`). `title` do dia: `"2/9 · 40 XP · 3 concluídas"`.

### 5. Footer
`flex`, `space-between`, `gap: 20px`, `flex-wrap: wrap`, 12px `#5F6472`, `margin-top: 40px`. Texto: `Arraste até Feito para ganhar XP (10 / 20 / 30 conforme a prioridade) · metas 60 e 120 · subtarefa +5 · foco 1 XP/min · zerar a coluna Hoje +50` (com "Feito" em `#93A86A`/600). Botão "Limpar concluídos": borda `#24272F`, radius 8, padding `7px 12px`, hover borda e texto `#FF7A5C`. Remove os cartões da coluna Feito e as metas concluídas.

### 6. Modal de sessão de foco
Abre ao clicar em "▶ foco"; o timer **nunca** começa sem essa escolha.
Overlay: `position: fixed; inset: 0`, `background: rgba(8,9,13,.74)`, centralizado, padding 24; clique no overlay cancela.
Caixa: `max-width: 420px`, fundo `#171A22`, borda `1px #2B303C`, radius 18, padding `26px 26px 22px`, `box-shadow: 0 30px 80px rgba(0,0,0,.55)`, coluna `gap: 20px`; clique interno não propaga.
- Label "Sessão de foco" (11px, `.14em`, uppercase, `#D8A45C`) e título da tarefa (`Space Grotesk` 20px/600, `-.01em`, `#F4F5F8`).
- Grid de 4 atalhos (`15`, `25`, `45`, `60`): fundo `#1C1F27`, borda `#2F3441`, radius 10, padding `12px 0`, `Space Grotesk` 15px/600 `#DFE1E8`, hover borda e texto `#F2C14E`. Clique inicia imediatamente.
- Campo numérico (`min 1`, `max 180`, autofocus) + rótulo "minutos": fundo `#14161C`, borda `#2F3441`, radius 10, padding `11px 12px`, 15px. Enter inicia, Esc cancela.
- Rodapé: nota "1 XP por minuto, mínimo 10" (11.5px `#5F6472`); "Cancelar" (transparente, borda `#2B303C`, texto `#8B909F`, hover `#FF7A5C`) e "Iniciar" (fundo/borda `#F2C14E`, texto `#241D12`, 13px/600, radius 10, padding `9px 18px`, hover `#FFD47A`).

## Interactions & Behavior
- **Drag & drop**: cartões são arrastáveis (HTML5 DnD no protótipo). Soltar sobre uma coluna move para o fim; soltar sobre outro cartão insere antes dele (reordenação dentro da coluna e entre colunas). Colunas e cartões precisam de `onDragOver` com `preventDefault` e `dropEffect = 'move'`.
- **Edição inline**: duplo clique no título. Enter salva, Shift+Enter nova linha, Esc descarta, blur salva. Título vazio é descartado.
- **Adicionar**: o botão da coluna abre um `textarea` inline no fim da lista, com placeholder "Nova tarefa… Enter para salvar" (metas: "Nova meta… Enter para salvar"). Apenas uma coluna em modo de adição por vez; abrir a edição fecha a adição.
- **Prioridade**: clique na bolinha cicla baixa → média → alta → baixa.
- **Etiqueta**: clique no chip cicla sem etiqueta → Trabalho → Pessoal → Saúde → Estudo → sem etiqueta.
- **Timer**: intervalo de 1s; decrementa só quando `running`. Ao chegar a zero: limpa o timer, credita XP (1/min, mínimo 10) e incrementa o contador de pomodoros do cartão. Pausar congela; Encerrar descarta sem XP. Apenas um timer ativo por vez.
- **Ganho de XP** aparece como pílula no painel de nível por 2.2s (substituída por `"Nível N!"` quando o ganho cruza um nível).
- **Bônus de dia limpo**: quando a coluna **Hoje** fica vazia após concluir uma tarefa que estava nela, +50 XP, no máximo uma vez por dia (guardado em `bonusDay`).
- **Responsivo**: os grids usam `auto-fit`/`minmax`, então as colunas empilham naturalmente em telas estreitas. Sem breakpoints explícitos.
- Sem estados de carregamento, erro ou validação — não há rede. Persistência é síncrona.

## State Management
Estado único do painel (no protótipo, estado de um componente; num app real, um store — Zustand/Pinia/`useReducer` — com persistência em `localStorage`).

```
cards: Array<{
  id: string,           // 'c' + Date.now()
  col: 'backlog' | 'hoje' | 'andamento' | 'feito' | 'semana' | 'mes',
  title: string,
  pri: 0 | 1 | 2,       // baixa, média, alta
  tag: -1 | 0 | 1 | 2 | 3,
  subs: Array<{ t: string, d: boolean }>,
  done?: boolean,       // usado só nas colunas de meta
  poms?: number         // sessões de foco concluídas
}>

meta: {
  xp: number,
  streak: number,
  lastDay: string | null,   // 'YYYY-M-D' do último dia com XP positivo
  bonusDay: string | null,  // dia em que o bônus de dia limpo foi pago
  hist: { [dia: string]: { xp: number, done: number } }
}

focus: { id: string, left: number, total: number, running: boolean } | null
pick:  string | null      // id do cartão aguardando escolha de duração
pickMin: string           // valor do campo do modal, default '25'
adding: string | null     // id da coluna em modo de adição
draft: string
editing: string | null    // id do cartão em edição
editDraft: string
expanded: string | null   // id do cartão com subtarefas abertas
subDraft: string
gain: string | null       // texto da pílula de XP
```

**Chaves de `localStorage`**: `kanban.dc.v1` (array de cards) e `kanban.dc.meta.v1` (objeto meta). Gravar a cada mutação. Ler na inicialização com `try/catch`; se ausente ou inválido, usar o seed de exemplo (9 cartões distribuídos pelas seis colunas).

**Regras de XP**
| Ação | XP |
|---|---|
| Tarefa movida para Feito | 10 (baixa) / 20 (média) / 30 (alta) |
| Tarefa retirada de Feito | mesmo valor, negativo |
| Meta da semana concluída | +60 (reabrir: −60) |
| Meta do mês concluída | +120 (reabrir: −120) |
| Subtarefa marcada | +5 (desmarcar não desconta) |
| Sessão de foco concluída | 1 por minuto, mínimo 10 |
| Coluna Hoje zerada | +50, uma vez por dia |

XP total nunca fica negativo (`Math.max(0, …)`). Toda mudança de XP também soma no `hist[hoje].xp`; conclusões incrementam `hist[hoje].done`.

**Níveis**: nível 1 exige 100 XP; cada nível seguinte exige `100 + (nível − 1) × 60`, acumulativo. Patentes por nível: Iniciante, Aprendiz, Focado, Constante, Estrategista, Disciplinado, Veterano, Mestre, Lenda (do nível 9 em diante permanece Lenda).

**Sequência (streak)**: no primeiro XP positivo do dia, se `lastDay` for ontem, `streak + 1`; caso contrário `streak = 1`. `lastDay = hoje`.

## Design Tokens
**Cores**
- Fundo: `#101117`; gradiente do topo `#1B2030`
- Superfícies: `#15171E`, `#16181F`, `#171A22`, `#1B1E26`, `#1C1F27`, `#14161C` (campos)
- Bordas: `#21242D`, `#22252E`, `#23262F`, `#262A34`, `#272B36`, `#2B303C`, `#2C3040` (tracejada), `#2F3441`, `#3C4250`, `#3D4453`
- Texto: `#F4F5F8` (títulos), `#E8E9EF` (corpo), `#DFE1E8` (cartões), `#C2C5CF` (subtarefas), `#9AA0B0`, `#8B909F`, `#7D818F`, `#6D7180`, `#5F6472`, `#565B6A` (ícones)
- Verde-limão (XP, concluído): `#C8F169`, `#8FD13F`, `#93A86A`, superfícies `#1A2013`, `#232D14`, `#222A15`, `#23281A`, borda `#2F3A1E`, texto sobre limão `#16200A`
- Âmbar (foco): `#F2C14E`, `#FFD47A`, `#D8A45C`, superfícies `#241D12`, `#2A2418`, bordas `#3A2F1E`, `#4D3F1C`, `#3A3F4D`
- Violeta (metas / Estudo): `#B98CFF`, `#9F86D6`, superfícies `#1C1730`, `#241D38`, borda `#3D3060`
- Coral (destrutivo / alta prioridade): `#FF7A5C`, `#FF9F6C`, superfícies `#2E1D15`, bordas `#33262A`, `#4D3122`
- Azul (Trabalho): `#7FC0FF`, fundo `#16283B`, borda `#24405E`
- Cinza neutro (prioridade baixa): `#4A505F`; barras `#2D3342`, `#1E2129`

**Tipografia**
- Títulos e números: `Space Grotesk` 400/500/600/700
- Corpo: `IBM Plex Sans` 400/500/600
- Escala: 40 / 26 / 24 / 21 / 20 / 17 / 16 / 15 / 14.5 / 14 / 13 / 12.5 / 12 / 11.5 / 11 / 10.5 / 8 px
- Números sempre com `font-variant-numeric: tabular-nums`

**Espaçamento**: 4, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 24, 26, 28, 32, 36, 40, 44, 48, 64 px
**Raios**: 4, 5, 6, 8, 9, 10, 12, 16, 18 px; 20px em pílulas; 50% na bolinha de prioridade
**Sombras**: apenas no modal — `0 30px 80px rgba(0,0,0,.55)`
**Transições**: barra de XP `width 420ms ease`; bolinha de prioridade `transform` no hover
**Grids**: fluxo `minmax(260px, 1fr)`, metas `minmax(340px, 1fr)`, gap 18px

## Assets
Nenhuma imagem ou ícone externo. Os únicos glifos usados são `+`, `×`, `✓` e `▶`, escritos como texto. Fontes vêm do Google Fonts (`Space Grotesk`, `IBM Plex Sans`) — substituir pelo carregamento de fontes do codebase.

## Files
- `Kanban.dc.html` — o protótipo completo (marcação, estilos inline e lógica). Referência visual e comportamental.
- `support.js` — runtime do ambiente de preview. **Não portar**; incluído apenas para que o HTML abra no navegador.

## Props expostas no protótipo
- `nome` (string, default `""`) — usado na saudação.
- `mostrarMetas` (boolean, default `true`) — oculta a seção de Metas.
