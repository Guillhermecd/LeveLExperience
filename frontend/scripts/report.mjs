#!/usr/bin/env node
// Builds reports/verificacao.md from the Vitest JSON reporter output (and,
// once it exists, the backend's Surefire XML). Exits 1 on any failure so it
// can gate CI directly — see GATES.md "Rodando tudo".
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
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

// One JUnit XML per test class (TEST-<FQCN>.xml) — grouped by class, same
// shape as the Vitest section above so the two read the same at a glance.
function readSurefireResults(dir) {
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) => f.startsWith('TEST-') && f.endsWith('.xml'));
  if (files.length === 0) return null;

  const groups = new Map();
  const testcaseRegex = /<testcase name="([^"]+)"[^>]*time="([^"]+)"[^>]*?(?:\/>|>([\s\S]*?)<\/testcase>)/g;

  for (const file of files) {
    const xml = readFileSync(join(dir, file), 'utf-8');
    const suiteMatch = xml.match(/<testsuite[^>]*name="([^"]+)"/);
    const groupName = suiteMatch ? suiteMatch[1].split('.').pop() : file;
    if (!groups.has(groupName)) groups.set(groupName, []);
    let match;
    while ((match = testcaseRegex.exec(xml))) {
      const [, name, time, inner] = match;
      const failed = Boolean(inner) && /<failure|<error/.test(inner);
      groups.get(groupName).push({ name, durationMs: Number(time) * 1000, passed: !failed });
    }
  }

  return groups;
}

function renderSurefireSection(groups) {
  if (!groups) return '_Não executado nesta rodada._';

  const allCases = [...groups.values()].flat();
  const passed = allCases.filter((c) => c.passed).length;
  const totalDurationS = allCases.reduce((sum, c) => sum + c.durationMs, 0) / 1000;

  const lines = [`**${passed}/${allCases.length} aprovados** · ${totalDurationS.toFixed(2)}s`, ''];
  for (const [groupName, cases] of groups) {
    const groupPassed = cases.filter((c) => c.passed).length;
    lines.push(`### ${groupName} — ${groupPassed}/${cases.length}`, '');
    lines.push('| | Cenário | ms |', '|---|---|---|');
    for (const c of cases) {
      lines.push(`| ${c.passed ? '✅' : '❌'} | ${c.name} | ${c.durationMs.toFixed(0)} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

const vitestResults = readVitestResults(vitestPath);
const vitestPassed = vitestResults ? vitestResults.numFailedTests === 0 : true;
const surefireGroups = readSurefireResults(surefireDir);
const surefireCases = surefireGroups ? [...surefireGroups.values()].flat() : [];
const surefirePassed = surefireCases.every((c) => c.passed);
const approved = vitestPassed && surefirePassed;

const totalPassed = (vitestResults?.numPassedTests ?? 0) + surefireCases.filter((c) => c.passed).length;
const totalTests = (vitestResults?.numTotalTests ?? 0) + surefireCases.length;

const markdown = `# Relatório de verificação

Gerado em ${new Date().toISOString()}

**Situação: ${approved ? 'APROVADO' : 'REPROVADO'}** — ${totalPassed}/${totalTests} aprovados

---

## Frontend (Vitest)

${renderVitestSection(vitestResults)}

## Backend (JUnit / Surefire)

${renderSurefireSection(surefireGroups)}
`;

writeFileSync(outPath, markdown);
console.log(`Relatório escrito em ${outPath}`);

if (!approved) process.exit(1);
