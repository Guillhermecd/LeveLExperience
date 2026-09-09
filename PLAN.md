# Plano de construção — Kanban gamificado

Produto próprio, multiusuário desde o desenho, backend Java/Spring Boot +
Postgres, frontend React/TypeScript/Vite.

Artefatos que acompanham este plano:

- `V1__initial_schema.sql` — schema Postgres com constraints e índices
- `openapi.yaml` — contrato da API

---

## Decisões travadas

Não reabrir sem motivo novo. Cada uma tem consequência espalhada pelo código.

| # | Decisão | Por quê |
|---|---|---|
| 1 | API de **transições**, não `PUT` do board inteiro | O servidor precisa saber *o que aconteceu* para derivar XP; diff de estado perde a intenção |
| 2 | IDs de card/subtarefa/meta gerados no **cliente** (UUID v4) | Retry de POST não duplica; upsert por ID |
| 3 | XP é **ledger append-only**, não contador | Histograma vira `GROUP BY`, estorno é linha negativa, regra errada é recomputável |
| 4 | XP **derivado no servidor** a partir do estado dele | Cliente nunca envia valor; regra mudada não vira dado corrompido |
| 5 | Idempotência por `Idempotency-Key` + unique constraint no banco | `if` na aplicação não protege sob concorrência |
| 6 | **Postgres**, não Mongo | Ledger vive de constraints, agregação por dia e estorno consistente |
| 7 | `position` como `double`, com rebalanceamento | Mover card = 1 linha alterada, não a coluna inteira |
| 8 | **Online-first** com UI otimista; `localStorage` só cache de leitura | Fila offline é o dobro de trabalho para um requisito não confirmado |
| 9 | `dnd-kit`, não HTML5 DnD | Colunas empilham no celular, e lá arrastar nativo não funciona |
| 10 | Access token curto + **refresh revogável** | Trocar senha precisa invalidar sessão roubada |
| 11 | Cadastro **por convite** no início | Controle de custo e suporte; virar aberto é apagar uma checagem |
| 12 | **404, nunca 403**, para recurso de outro usuário | 403 confirma que o UUID existe |
| 13 | Tokens de CSS-in-JS do ecossistema antd, sem arquivos `.css` | Estilo inline não faz `:hover`, e o design tem hover em quase tudo |
| 14 | Uma branch por fase/etapa; `main` só recebe merge após confirmação | Ver `WORKFLOW.md`. Garantido por proteção de branch no GitHub, não por disciplina |

### Desvios do template BIMD (registrar no README do projeto)

- Backend Spring Boot no lugar de Node/Sails — sobrevive só a camada de
  contrato: `/api/*`, JWT, ISO-8601, `CORS_ORIGINS`, `frontend/dist` + Nginx
- Postgres no lugar de `MONGO_URL`
- Refresh token persistido (o template não tem logout no backend)
- React Hook Form apenas em auth/perfil; edição inline do quadro não usa RHF
- Paleta dark própria do handoff, não as cores BIMD

---

## Serviços locais (Docker)

Herdado do `Main ReadMe.md` (template BIMD), adaptado à combinação deste
projeto — Java/Spring Boot + PostgreSQL, decisão #6.

```sh
docker compose -f docker-compose.dev.yml up -d postgres mailpit
```

- **PostgreSQL** em `localhost:5432` — obrigatório no boot do backend
  (`SPRING_DATASOURCE_URL`, decisão #6). Sem ele o backend não sobe.
- **Mailpit** SMTP em `127.0.0.1:1025`, UI em `http://localhost:8025` —
  necessário a partir da Fase 3 (verify-email, forgot/reset password) e usado
  no portão manual da Fase 6 (SPF/DKIM antes de trocar por SMTP real).
  Falha no boot gera apenas warning, como no template.
- **MinIO** — **não incluído** neste projeto: não há feature de upload
  (avatar, anexo) no escopo atual. Se isso mudar, reintroduzir o serviço e a
  seção `S3_*` do `.env` é decisão de produto, registrada aqui antes do
  código.

`docker-compose.dev.yml` mora na raiz do repo, ao lado de `frontend/` e
`backend/`, seguindo a estrutura do template. Variáveis de ambiente do
backend (`SPRING_DATASOURCE_*`, `SMTP_*`, `EMAIL_*`) em `backend/.env`,
derivadas de `backend/.env.example`.

**Pronto quando:** `docker compose up -d postgres mailpit` sobe os dois
serviços e `./mvnw spring-boot:run` conecta sem erro de datasource.

---

## Regras de construção

Valem em todas as fases. Não são preferência de estilo: cada uma tem um custo
concreto quando ignorada.

### Idioma

**O software é escrito em inglês. A interface e a documentação de projeto são
em português.** A fronteira é exata:

| Em inglês | Em português |
|---|---|
| Nomes de pacote, classe, método, variável, arquivo | Texto visível na tela |
| Colunas e tabelas do banco, valores de enum | Mensagens de erro exibidas ao usuário |
| Rotas, campos de JSON, nomes de header | `PLAN.md`, `GATES.md`, `WORKFLOW.md`, `CLAUDE.md` |
| Comentários e Javadoc/JSDoc no código | Corpo de PR e descrição de issue |
| Mensagens de commit | Conteúdo do e-mail transacional |
| Ids e notas dos cenários de teste | |

Colunas do quadro: `backlog`, `today`, `doing`, `done` no código e no banco;
"Backlog", "Hoje", "Em andamento", "Feito" na tela. A tradução vive **numa
camada só** — o dicionário de labels da UI. Nenhum componente compara com
string em português, nenhuma query filtra por `'hoje'`.

Patentes (`Iniciante`, `Aprendiz`, …) são exceção deliberada: são conteúdo de
produto, não identificador. Ficam como estão, inclusive na API.

### Camadas

Organização **por camada**: cada tipo de arquivo no seu diretório. Não é Clean
Architecture de livro — sem ports, adapters, círculos concêntricos ou um mapper
por fronteira. A separação que interessa é a de responsabilidade, e ela é dada
pela camada.

```
backend/src/main/java/br/com/oaksd/kanban/
  controller/     AuthController, ProfileController, BoardController,
                  CardController, SubtaskController, GoalController,
                  FocusSessionController, StatsController
  service/        AuthService, TokenService, InviteService, EmailService,
                  BoardService, CardService, SubtaskService, GoalService,
                  FocusSessionService, XpService, PositionService, StatsService
  repository/     UserRepository, CardRepository, SubtaskRepository,
                  GoalRepository, XpEventRepository, UserStatsRepository,
                  FocusSessionRepository, RefreshTokenRepository,
                  AuthTokenRepository, InviteRepository
  entity/         User, UserStats, Card, Subtask, Goal, XpEvent,
                  FocusSession, RefreshToken, AuthToken, Invite
  dto/
    request/      LoginRequest, RegisterRequest, CreateCardRequest,
                  MoveCardRequest, FinishFocusRequest, ...
    response/     BoardResponse, CardResponse, StatsResponse,
                  XpMutationResponse, MoveResponse, ...
  mapper/         CardMapper, GoalMapper, BoardMapper, StatsMapper
  enums/          BoardColumn, Priority, Tag, GoalScope, XpReason, FocusStatus
  security/       JwtAuthenticationFilter, CurrentUserArgumentResolver
  config/         SecurityConfig, JacksonConfig, CorsConfig, RateLimitConfig
  exception/      GlobalExceptionHandler, NotFoundException,
                  ConflictException, BusinessException
```

Testes espelham a mesma divisão:

```
backend/src/test/java/br/com/oaksd/kanban/
  service/        XpRulesTableTest, CardServiceTest, ...
  controller/     CardControllerTest, ...
  integration/    PhaseGatesIT
  resources/fixtures/xp-rules.json
```

O frontend segue a convenção que o template BIMD já define, que é a mesma ideia:

```
frontend/src/
  api/modules/    unico lugar que fala HTTP — api.ts, types.ts, um arquivo por dominio
  pages/          uma pasta por pagina; componentes exclusivos dela ficam dentro
  components/     componentes compartilhados entre paginas
  hooks/
  reducers/       reducer do quadro e regras de XP
  types/
  theme/          tokens, aplicados pelo ConfigProvider
  router.tsx
```

**Regras de dependência.** São o que dá o isolamento; sem elas a divisão por
camada vira só uma forma de arrumar arquivo. Todas verificáveis por grep, o que
é justamente a vantagem de a camada estar no caminho do arquivo:

- `controller/` importa `service/`, `dto/` e `enums/`. Nunca `repository/`,
  nunca `entity/`.
- `service/` importa `repository/`, `entity/`, `mapper/`, `enums/`. Nunca tipo
  de HTTP (`ResponseEntity`, `HttpServletRequest`) e nunca `controller/`.
- `repository/` não importa `service/`. Todo método que busca recurso de
  usuário recebe `userId` — `findByIdAndUserId`, nunca `findById` puro.
- `entity/` não sai do backend: assinatura de controller só usa `dto/`.
- Componente React nunca chama `fetch`, `axios` ou URL do backend.

**O risco conhecido desta organização** é acoplamento entre domínios, que o
compilador não impede porque está tudo no mesmo pacote: nada trava
`FocusSessionService` de chamar `GoalRepository`. Isso é revisão de PR, não
ferramenta. Se um dia a pasta `service/` passar de umas 20 classes, é sinal de
subdividir por domínio dentro da camada (`service/card/`, `service/xp/`), não
de reorganizar tudo.


### Documentação

Documentar o **porquê**, nunca o **quê**. `// incrementa o contador` acima de
`counter++` é ruído que envelhece; o comentário que importa é o que explica a
decisão que não se lê no código.

Obrigatório:

- **Javadoc/JSDoc em todo método público de service**: o que faz, o que assume
  e o que lança
- **Comentário de decisão** onde o código parece estranho de propósito —
  rebalanceamento de `position`, clamp na leitura do XP, 404 em vez de 403.
  Sem ele, alguém "corrige" o comportamento correto seis meses depois.
- **README por feature** quando a feature tem mais de um fluxo não óbvio
- **`ARCHITECTURE.md`** com o diagrama de camadas e as regras de dependência
- **OpenAPI é a documentação da API**, mantido junto com o código, nunca
  desatualizado em relação aos controllers
- **Toda decisão travada** vive neste arquivo. Mudou? Muda aqui primeiro.

O portão: alguém que abre o repositório sem esta conversa consegue entender
por que o XP é um ledger e por que o move é um endpoint próprio, sem
perguntar.

---


**Entrega:** `openapi.yaml` publicado (SwaggerHub), `V1__initial_schema.sql`
revisado, tabela de cenários de XP em JSON.

A tabela de cenários é o item que quase se esquece e é o mais importante da
fase: `estado inicial + ação → delta esperado`, como dado, não como código.
As regras de XP vão existir duas vezes — no reducer do front (UI otimista) e
no servidor (fonte de verdade). Duas implementações da mesma regra divergem;
é questão de tempo. A mesma tabela roda no Vitest e no JUnit.

Cenários mínimos: conclusão por prioridade (10/20/30), estorno ao sair de
Feito, meta semana (60) e mês (120) com reabertura, subtarefa (+5, sem
estorno), foco (1 XP/min, mínimo 10), dia limpo (+50, uma vez por dia),
XP total nunca negativo, virada de nível (100, depois +60 por nível).

**Pronto quando:** você consegue responder qualquer pergunta de XP olhando o
JSON, sem abrir o protótipo.

---

## Fase 1 — Frontend estático fiel

**Entrega:** o painel inteiro renderizando com dados mock em memória. Sem
persistência, sem rede, sem reducer ainda.

Escopo: header com painéis (foco, nível, contadores), 4 colunas do fluxo,
card com prioridade/etiqueta/subtarefas, seção de metas, gráfico de 14 dias,
footer, modal de foco.

Faça agora, enquanto o design está fresco. Trava os tokens de cor,
tipografia, raio e espaçamento num único lugar.

**Cuidados:**
- Não force componentes do antd onde não cabem. Card, coluna, chip e barra de
  XP são markup próprio; antd entra em `Modal`, inputs e `ConfigProvider`.
- Hover via CSS-in-JS, não `onMouseEnter` com estado.

**Pronto quando:** dá para comparar lado a lado com `Kanban_dc.html` e a
diferença é imperceptível, inclusive nos estados de hover.

---

## Fase 2 — Reducer puro e regras de XP

**Entrega:** `src/features/kanban/reducer.ts` — função pura
`(state, action) => state`, sem React, sem rede.

Roda a tabela de cenários da fase 0 no Vitest. Zero renderização nos testes.

**Pronto quando:** todos os cenários passam e a UI da fase 1 está ligada no
reducer, funcionando de ponta a ponta em memória.

---

## Fase 3 — Backend Spring Boot

**Entrega:** API do `openapi.yaml` implementada.

Ordem interna:
1. Flyway com `V1__initial_schema.sql`. Nunca editar schema de produção à mão.
2. Auth: register com convite, login, refresh com rotação, verify-email,
   forgot/reset. Rate limit por IP e por e-mail no login e no reset.
3. `GET /board` — carregue subtarefas com uma query por `card_id IN (...)`,
   nunca uma por card.
4. Cards, subtarefas, metas, `/move` com liquidação de XP e bônus de dia limpo.
5. Sessões de foco com `started_at` do servidor.
6. `GET /stats`, `GET /me/export`, `DELETE /me`.
7. Seed dos 9 cards de exemplo no `register`, na mesma transação.

**Cuidados que viram bug se ignorados:**
- Jackson com `WRITE_DATES_AS_TIMESTAMPS` desligado, senão o contrato de data
  quebra em silêncio
- Nenhum `findById` puro em entidade de usuário — só `findByIdAndUserId`
- `day` calculado com `users.timezone`, não UTC: em UTC seu dia vira às 21h
- Rebalanceamento de `position` na mesma transação do move, disparado quando o
  gap entre vizinhos fica abaixo de ~0.0001
- Toda liquidação de XP dentro de um único `@Transactional`, sem chamada de
  rede lá dentro

**Pronto quando:** a tabela de cenários passa no JUnit contra o banco real, e
o `xp_total` de `user_stats` bate com o `SUM(delta)` do ledger.

---

## Fase 4 — Integração

**Entrega:** front consumindo a API. Serviços em `src/api/modules`, nenhum
`fetch` em componente.

UI otimista: aplica a mudança pelo reducer na hora, dispara a requisição,
reverte se falhar. O `Idempotency-Key` é gerado **uma vez por ação do
usuário** e reutilizado em retry — se for gerado a cada tentativa, a proteção
não existe. Essa regra mora no wrapper HTTP, não em cada chamada.

Tratar `409` no `/move` recarregando `/board` e reaplicando.

**Pronto quando:** duas abas abertas no mesmo usuário não corrompem o quadro.

---

## Fase 5 — Cache local e polimento

`localStorage` como cache de leitura: pinta o painel instantaneamente no boot
enquanto o `GET /board` responde. Fonte de verdade continua sendo o servidor —
não construa um modo "local sem conta", isso duplica o caminho de escrita e
todo bug passa a ter duas versões.

Aqui entram também as preferências (`name`, `showGoals`) vindas de `/me`.

---

## Fase 6 — Produção

Só depois desta fase a primeira pessoa de fora entra.

- Domínio e HTTPS
- **E-mail transacional** com domínio verificado, SPF e DKIM. SMTP genérico
  cai em spam e o sintoma ("ninguém consegue se cadastrar") aparece semanas
  depois, longe da causa.
- Postgres com `pg_dump` diário para o S3, com retenção — e **uma restauração
  de teste**. Backup nunca restaurado é hipótese, não plano.
- Sentry no front e no back. Sem isso, o modo de falha padrão é: alguém
  arrasta um card, dá 500, desiste, e você nunca fica sabendo.
- CI: lint + build do front, testes do back, migration aplicada em banco limpo

---

## Fora de escopo por enquanto

Cada um destes é fácil de adicionar depois e caro de carregar agora:

- **Ranking / comparação de XP entre usuários** — XP mede quanto você mexeu no
  seu próprio quadro; quem cria 40 cards triviais "ganha" de quem fecha 3
  tarefas difíceis. O ledger no servidor é a fundação caso isso mude.
- **Múltiplos quadros e quadros compartilhados** — migrar `user_id` para
  `board_id` depois é criar a tabela, inserir um board por usuário e backfill;
  roda em segundos com dezenas de usuários. A indireção agora custa uma junção
  em toda query.
- **Offline-first com fila de mutações** — decisão 8; fácil de desfazer para
  cima, difícil para baixo.
- **Billing.**
