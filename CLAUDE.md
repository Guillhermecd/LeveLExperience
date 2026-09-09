# Instruções do projeto

Kanban gamificado — produto próprio. Backend Java/Spring Boot + Postgres,
frontend React/TypeScript/Vite.

Leia antes de agir: `PLAN.md` (fases e decisões travadas), `GATES.md`
(portões de aceite), `WORKFLOW.md` (fluxo de branches).

## Git — regra dura

**Nunca integre nada na `main` sem confirmação explícita nesta conversa.**

Ao começar uma fase ou etapa, crie a branch antes de escrever código:

```sh
git switch -c fase/<n>-<nome>
```

Ao terminar, **pare e pergunte**. Apresente o que foi entregue, o resultado
de `reports/verificacao.md` e os itens manuais pendentes do `GATES.md`.
Só depois do aval abra o PR.

Sem confirmação, nunca: push para `main`, merge, merge de PR, `--force`,
rebase de branch publicada, tag, release, deploy.

Push na própria branch de trabalho é livre.

## Idioma

**Código em inglês. Interface em português.**

Em inglês: pacote, classe, método, variável, arquivo, tabela e coluna do banco,
valor de enum, rota, campo de JSON, header, comentário, Javadoc/JSDoc,
mensagem de commit, id e nota de cenário de teste.

Em português: texto na tela, mensagem de erro exibida ao usuário, `PLAN.md`,
`GATES.md`, `WORKFLOW.md`, este arquivo, corpo de PR, e-mail transacional.

Colunas do quadro são `backlog`, `today`, `doing`, `done` no código e no banco.
"Hoje" e "Em andamento" só existem no dicionário de labels da UI. Nenhuma query
filtra por string em português.

## Camadas

Organização **por camada**: `controller/`, `service/`, `repository/`,
`entity/`, `dto/request`, `dto/response`, `mapper/`, `enums/`, `security/`,
`config/`, `exception/`. Testes espelham: `service/`, `controller/`,
`integration/`.

- Controller: HTTP, validação de entrada, tradução de erro. Não decide nada.
  Importa `service/`, `dto/`, `enums/`. **Nunca** `repository/` nem `entity/`.
- Service: regra de negócio e transação. **Nunca** `ResponseEntity`,
  `HttpServletRequest` ou qualquer tipo de HTTP.
- Repository: acesso a dados. Todo método de recurso de usuário recebe
  `userId` — `findByIdAndUserId`, nunca `findById` puro.
- Entity nunca sai do backend: assinatura de controller só usa DTO.

Frontend segue a convenção do template BIMD: `api/modules/` é o único lugar que
fala HTTP, `pages/` com uma pasta por página, `components/` para o
compartilhado, `theme/` para tokens.

Nada no compilador impede um service chamar o repository de outro domínio —
isso é revisão. Se `service/` passar de ~20 classes, subdivida dentro da camada
(`service/card/`), não reorganize tudo.

## Documentação

Documente o porquê, nunca o quê. Javadoc/JSDoc em todo método público de
service. Comentário de decisão onde o código parece estranho de propósito
(rebalanceamento de `position`, clamp na leitura do XP, 404 em vez de 403) —
sem ele alguém "corrige" o comportamento correto depois.

## Decisões que não se reabrem sem conversa

Estão na tabela do `PLAN.md`. As que mais aparecem no dia a dia:

- API de transições, não `PUT` do board inteiro
- IDs de card/subtarefa/meta gerados no cliente
- XP é ledger append-only, derivado no servidor — o cliente nunca envia valor
- Idempotência por `Idempotency-Key` + unique constraint no banco
- 404, nunca 403, para recurso de outro usuário
- Nenhum `findById` puro em entidade de usuário — só `findByIdAndUserId`
- Sem arquivos `.css`; tokens em um lugar só, hover via CSS-in-JS
- Nenhum `fetch`/`axios` fora de `src/api/modules`

Se a implementação exigir mudar uma delas, isso é conversa antes do código,
não uma linha no diff.

## Regras de XP

A especificação é `xp-rules.json`, consumida pelos testes do front e do back.

**Nunca edite a tabela para um teste passar.** Se o seu código discorda dela,
foi o código que divergiu. Mudança de regra é decisão de produto: pergunte,
altere a tabela, e as duas suítes quebram juntas de propósito.

## Commits

Conventional Commits, em inglês, escopo pelo módulo:

```
feat(xp): add card transition reducer
test(gates): idempotency under ten concurrent requests
fix(board): use the user timezone for the event day
```

Commits pequenos. Um commit que toca front, back e migration ao mesmo tempo
é difícil de reverter quando quebra.

## Antes de pedir revisão

```sh
cd frontend && npm run lint && npm run build && npm run test:report
cd backend  && ./mvnw test
```
