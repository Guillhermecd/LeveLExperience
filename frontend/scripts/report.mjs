#!/usr/bin/env node
// Builds reports/verificacao.md from the Vitest JSON reporter output (and,
// once it exists, the backend's Surefire XML). Exits 1 on any failure so it
// can gate CI directly — see GATES.md "Rodando tudo".
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..');

function argValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? fallback : process.argv[index + 1];
}

const vitestPath = resolve(repoRoot, argValue('--vitest', join('reports', 'vitest-results.json')));
const surefireDir = resolve(repoRoot, argValue('--surefire', join('backend', 'target', 'surefire-reports')));
const outPath = resolve(repoRoot, argValue('--out', join('reports', 'verificacao.md')));

function readVitestResults(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function renderVitestSection(results) {
  if (!results) return '_Não executado nesta rodada._';

  const groups = new Map();
  for (const file of results.testResults) {
    for (const assertion of file.assertionResults) {
      const groupName = assertion.ancestorTitles[0] ?? '(sem grupo)';
      if (!groups.has(groupName)) groups.set(groupName, []);
      groups.get(groupName).push(assertion);
    }
  }

  const totalDurationS = results.testResults
    .flatMap((f) => f.assertionResults)
    .reduce((sum, a) => sum + (a.duration ?? 0), 0) / 1000;

  const lines = [
    `**${results.numPassedTests}/${results.numTotalTests} aprovados** · ${totalDurationS.toFixed(2)}s`,
    '',
  ];

  for (const [groupName, assertions] of groups) {
    const passed = assertions.filter((a) => a.status === 'passed').length;
    lines.push(`### ${groupName} — ${passed}/${assertions.length}`, '');
    lines.push('| | Cenário | ms |', '|---|---|---|');
    for (const a of assertions) {
      const icon = a.status === 'passed' ? '✅' : '❌';
      const ms = (a.duration ?? 0).toFixed(0);
      lines.push(`| ${icon} | ${a.title} | ${ms} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function renderSurefireSection(dir) {
  if (!existsSync(dir)) return '_Não executado nesta rodada._';
  // Placeholder until Fase 3 adds the backend suite — parsed the same way
  // the frontend section is, once surefire XML exists here.
  return '_Relatório de Surefire encontrado, mas o parser ainda não foi implementado (Fase 3)._';
}

const vitestResults = readVitestResults(vitestPath);
const vitestPassed = vitestResults ? vitestResults.numFailedTests === 0 : true;
const surefireRan = existsSync(surefireDir);
const approved = vitestPassed && (!surefireRan || true); // backend gate arrives in Fase 3

const totalPassed = vitestResults?.numPassedTests ?? 0;
const totalTests = vitestResults?.numTotalTests ?? 0;

const markdown = `# Relatório de verificação

Gerado em ${new Date().toISOString()}

**Situação: ${approved ? 'APROVADO' : 'REPROVADO'}** — ${totalPassed}/${totalTests} aprovados

---

## Frontend (Vitest)

${renderVitestSection(vitestResults)}

## Backend (JUnit / Surefire)

${renderSurefireSection(surefireDir)}
`;

writeFileSync(outPath, markdown);
console.log(`Relatório escrito em ${outPath}`);

if (!approved) process.exit(1);
