# Fluxo de trabalho com Git

## Regra

Toda fase ou etapa começa numa branch nova. Nada é integrado à `main` sem
confirmação explícita do Guilherme, na conversa, antes do merge.

Isso vale para sessões de Claude Code também — ver `CLAUDE.md` na raiz.

## Nomes de branch

```
fase/0-contrato
fase/1-front-estatico
fase/2-reducer
fase/3-backend
fase/4-integracao
fase/5-cache-local
fase/6-producao
```

Etapa dentro de uma fase grande (a 3 tem sete blocos) ganha branch própria a
partir da branch da fase, não da `main`:

```
fase/3-backend/scaffold
fase/3-backend/auth
fase/3-backend/cards-e-move
fase/3-backend/foco
```

**Cuidado com o git:** uma ref não pode ser folha (`fase/3-backend`) e
diretório (`fase/3-backend/auth`) ao mesmo tempo — o git recusa criar a
segunda enquanto a primeira existir. Por isso a própria fase 3 não vira uma
branch com esse nome nu; a primeira etapa (scaffold) já nasce com nome
aninhado (`fase/3-backend/scaffold`), nunca `fase/3-backend` sozinho.

**Etapas encadeiam, não são irmãs.** Cada etapa nasce da etapa anterior, não
de `fase/3-backend/scaffold` direto — `cards-e-move` precisa do `User`, do
`SecurityConfig` e do `@CurrentUser` que `auth` construiu; `foco` vai
precisar do que `cards-e-move` construir. Confirmar a base antes de criar a
branch (`git switch <etapa-anterior> && git switch -c <nova-etapa>`), não
assumir que a base é sempre a raiz da fase.

Correção fora de fase:

```
fix/nome-curto
chore/nome-curto
```

## Ciclo

1. **Abrir a branch** a partir da base correta, com o working tree limpo.

   ```sh
   git switch main && git pull
   git switch -c fase/2-reducer
   ```

2. **Trabalhar em commits pequenos**, Conventional Commits em inglês:

   ```
   feat(xp): add card transition reducer
   test(xp): wire the scenario table to the reducer
   fix(xp): reversal no longer starts a streak
   ```

3. **Rodar os portões da fase** (`GATES.md`) e gerar o relatório:

   ```sh
   cd frontend && npm run test:report
   ```

4. **Parar e pedir confirmação.** Apresentar:
   - o que a fase entregou, em três linhas
   - o resultado do `reports/verificacao.md` (aprovados / falhando)
   - os itens manuais do `GATES.md` que ainda dependem de conferência humana
   - o que ficou de fora e vira dívida nomeada

5. **Só após o "pode subir"**, abrir o PR e integrar:

   ```sh
   git push -u origin fase/2-reducer
   gh pr create --fill
   ```

## O que NUNCA acontece sem confirmação

- `git push` para `main`
- `git merge` na `main`, local ou remoto
- merge de PR
- `git push --force` em qualquer branch
- `git rebase` de branch já publicada
- tag ou release
- deploy

Push na própria branch de trabalho é livre — é o backup do trabalho em
andamento, não integração.

## Portão de merge

Um PR só é apresentado para confirmação quando:

- [ ] `reports/verificacao.md` está APROVADO, sem falha
- [ ] os itens manuais do `GATES.md` daquela fase estão marcados
- [ ] o relatório está anexado ou colado no corpo do PR
- [ ] nenhuma decisão do `PLAN.md` foi alterada sem estar registrada lá

Se a fase precisou mudar uma decisão travada do `PLAN.md`, isso é assunto de
conversa antes do PR, não uma linha escondida no diff.

## Proteção no GitHub (o que realmente garante)

Este documento descreve a intenção; a proteção abaixo é o que impede o erro.
Configure em Settings → Branches → Add rule, para `main`:

- Require a pull request before merging
- Block force pushes
- Do not allow bypassing the above settings (senão a regra não vale para você,
  que é justamente quem vai errar às 23h)
- Require status checks to pass — assim que houver CI

Com isso, `git push origin main` é recusado pelo servidor. A regra deixa de
depender de disciplina.
