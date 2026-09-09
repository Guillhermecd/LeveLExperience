# Portões de aceite por fase

Uma fase está pronta quando o comando da coluna "verificação" passa **e** os
itens manuais estão conferidos. Sem isso, "pronto" é opinião.

Nem tudo é automatizável, e forçar automação onde ela não cabe produz teste
frágil que você acaba ignorando. Fidelidade visual e entrega de e-mail são
verificação humana; o resto é máquina.

---

## Fase 0 — Contrato

| # | Verificação | Como |
|---|---|---|
| 0.1 | Tabela de XP carrega e não tem id duplicado | `npm test` (front) |
| 0.2 | Tabela de níveis bate com a fórmula | `npm test` |
| 0.3 | OpenAPI é válido | `npx @redocly/cli lint openapi.yaml` |
| 0.4 | Schema aplica em banco limpo | `docker run postgres` + `psql -f V1__initial_schema.sql` |
| 0.5 | Schema é idempotente na segunda aplicação | Flyway em container recriado |
| 0.6 | Descrições do OpenAPI traduzidas para inglês | revisão do arquivo |

**Manual:** a progressão de níveis parece boa? Nível 5 exige 760 XP — cerca de
25 tarefas de prioridade alta. Se achar lento, ajuste o multiplicador 60 agora,
não depois de acumular histórico.

---

## Fase 1 — Frontend estático

| # | Verificação | Como |
|---|---|---|
| 1.1 | Build passa sem erro de tipo | `npm run build` |
| 1.2 | Lint limpo | `npm run lint` |
| 1.3 | Nenhum arquivo `.css` criado | `find src -name '*.css' \| wc -l` → 0 |
| 1.4 | Nenhuma cor fora do arquivo de tokens | `grep -rE '#[0-9a-fA-F]{6}' src --exclude=tokens.ts` → vazio |
| 1.5 | Nenhum `onMouseEnter` para hover | `grep -r onMouseEnter src` → vazio |

**Manual (comparar com `Kanban_dc.html` lado a lado):**

- [ ] Header: painel de nível, contadores em aberto / feitas / metas
- [ ] Painel de foco só aparece com timer ativo
- [ ] Quatro colunas com contador e botão "+ Adicionar"
- [ ] Card: bolinha de prioridade cicla, etiqueta cicla, chip de subtarefas
- [ ] Duplo clique abre textarea; Enter salva, Shift+Enter quebra, Esc cancela
- [ ] Metas: duas colunas, barra de progresso, checkbox
- [ ] Gráfico de 14 dias com o dia de hoje em gradiente
- [ ] Modal de foco: 4 atalhos, campo numérico, Enter inicia, Esc cancela
- [ ] Hover em card, chip, botão e checkbox
- [ ] Em 380px de largura as colunas empilham sem quebrar

---

## Fase 2 — Reducer

| # | Verificação | Como |
|---|---|---|
| 2.1 | 37 cenários da tabela passam contra o **seu** reducer | `npm test` após trocar o import em `xpRules.spec.ts` |
| 2.2 | Invariantes (total ≥ 0, delta ≠ 0, nível derivável) | idem |
| 2.3 | Reducer é puro | `expect(state).toBe(anterior)` em ação sem efeito |
| 2.4 | Relatório gerado | `npm run test:report` |

**Portão real:** você trocou o import e a suíte ficou verde **sem editar a
tabela**. Se precisou mudar um número no JSON para passar, foi o reducer que
divergiu — a tabela é a especificação, não o registro do que o código faz.

---

## Fase 3 — Backend

| # | Verificação | Como |
|---|---|---|
| 3.1 | Mesma tabela de XP passa no Java | `XpRulesTableTest` |
| 3.2 | Idempotência sob concorrência (10 threads) | `PhaseGatesIT$Idempotencia` |
| 3.3 | Recurso alheio devolve 404 | `PhaseGatesIT$Isolamento` |
| 3.4 | Exclusão em cascata não deixa órfão | idem |
| 3.5 | Move altera 1 linha; rebalanceamento funciona | `PhaseGatesIT$Ordenacao` |
| 3.6 | Uma sessão de foco ativa por usuário | `PhaseGatesIT$Foco` |
| 3.7 | XP de foco vem do relógio do servidor | idem |
| 3.8 | `user_stats` bate com `SUM(delta)` | `PhaseGatesIT$Ledger` |
| 3.9 | Transação atômica: falha não deixa XP órfão | idem |
| 3.10 | Dia do evento usa o fuso do usuário | idem |
| 3.11 | Migration aplica em banco limpo no CI | job dedicado |
| 3.12 | Datas serializadas como ISO, nunca epoch | `jsonPath("$.createdAt").value(matchesPattern(ISO))` |

**Manual:**

- [ ] `grep -rn "findById(" src/main` — nenhum resultado em entidade de usuário

---

## Fase 4 — Integração

| # | Verificação | Como |
|---|---|---|
| 4.1 | Nenhum `fetch`/`axios` fora de `src/api/modules` | `grep -rn "fetch(\|axios" src --exclude-dir=api` → vazio |
| 4.2 | `Idempotency-Key` gerado no wrapper, não nos componentes | `grep -rn "Idempotency-Key" src` → só `api.ts` |
| 4.3 | Retry reusa a chave | teste do wrapper com `fetch` mockado falhando uma vez |
| 4.4 | Falha de rede reverte a UI otimista | teste com `fetch` rejeitando |
| 4.5 | 409 no move recarrega o board | idem |

**Manual:**

- [ ] Duas abas abertas, arrastar em ambas: nenhuma perde card
- [ ] Desligar o backend no meio de um drag: card volta ao lugar, com aviso

---

## Fase 5 — Cache local

| # | Verificação | Como |
|---|---|---|
| 5.1 | `localStorage` corrompido não quebra o boot | teste com JSON inválido na chave |
| 5.2 | Cache nunca é fonte de verdade | `grep` por escrita de cache fora do handler de resposta |

---

## Fase 6 — Produção

| # | Verificação | Como |
|---|---|---|
| 6.1 | Migration aplica em banco vazio | job de CI |
| 6.2 | `pg_dump` restaura em container limpo | script de restore, mensal |
| 6.3 | Erro 500 chega no Sentry | disparo proposital |
| 6.4 | Rate limit do login dispara | 20 tentativas seguidas → 429 |

**Manual:**

- [ ] E-mail de verificação chega na **caixa de entrada** do Gmail, não no spam
- [ ] SPF e DKIM validados em mail-tester ou equivalente
- [ ] Restauração de backup testada ao menos uma vez, com o resultado anotado

---

## Portões de idioma e estrutura (toda fase)

| # | Verificação | Como |
|---|---|---|
| L.1 | Nenhum identificador em português no código | `grep -rnE '\b(cartao|meta|usuario|senha|tarefa|coluna)\b' src` → vazio |
| L.2 | Nenhum acento em arquivo de código | `grep -rlP '[À-ÿ]' src --include='*.ts' --include='*.java'` → só arquivos de label da UI |
| L.3 | Nenhuma query filtra por string em português | `grep -rn "'hoje'\|'feito'\|'andamento'" src` → vazio |
| L.4 | Controller não importa `repository` nem `entity` | `grep -rn "\.repository\.\|\.entity\." src/main/java/**/controller/` → vazio |
| L.5 | Service não conhece HTTP | `grep -rn "ResponseEntity\|HttpServlet\|@RequestMapping" src/main/java/**/service/` → vazio |
| L.6 | Repository não importa service | `grep -rn "\.service\." src/main/java/**/repository/` → vazio |
| L.7 | Nenhum `findById` puro em recurso de usuário | `grep -rn "findById(" src/main/java` → vazio |
| L.8 | Entity não aparece em assinatura de Controller | revisão do diff |
| L.9 | Todo método público de service tem Javadoc | checkstyle |

As quatro primeiras são baratas porque a camada está no caminho do arquivo —
é a vantagem prática da organização por camada. O que ela **não** pega é
acoplamento entre domínios (um service chamando o repository de outro): isso
é revisão de PR, e o sinal de alerta é a pasta `service/` passar de ~20
classes.

## Encerramento de qualquer fase

Além dos itens específicos acima, toda fase termina igual (ver `WORKFLOW.md`):

- [ ] Trabalho feito em branch própria, nunca direto na `main`
- [ ] `reports/verificacao.md` APROVADO, anexado ao PR
- [ ] Itens manuais da fase conferidos
- [ ] Nenhuma decisão do `PLAN.md` alterada sem registro
- [ ] Portões de idioma e estrutura (L.1–L.8) verdes
- [ ] Decisões não óbvias comentadas no código, não só no PR
- [ ] **Confirmação explícita do Guilherme antes do merge**

## Rodando tudo

```sh
# front
cd frontend && npm run test:report

# back
cd backend && ./mvnw test

# relatório consolidado
node frontend/scripts/report.mjs \
  --vitest reports/vitest-results.json \
  --surefire backend/target/surefire-reports \
  --out reports/verificacao.md
```

O script sai com código 1 se houver falha — use direto no CI.
