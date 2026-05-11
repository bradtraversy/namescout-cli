import { c } from "./colors.js";

const categoryLabels = {
  domain: "Domains",
  package: "Package registries",
  code: "Code hosting",
  marketplace: "Marketplaces",
  distribution: "Distribution",
};

const categoryOrder = ["domain", "package", "code", "marketplace", "distribution"];

const statusIcon = {
  available: c.green("✓"),
  taken: c.red("✗"),
  similar: c.yellow("~"),
  unknown: c.gray("?"),
};

const statusLabel = {
  available: c.green("available"),
  taken: c.red("taken"),
  similar: c.yellow("similar"),
  unknown: c.gray("unknown"),
};

function pad(s, width) {
  const stripped = s.replace(/\x1b\[[0-9;]*m/g, "");
  if (stripped.length >= width) return s;
  return s + " ".repeat(width - stripped.length);
}

function scoreBlock(score, label) {
  let tone;
  if (score >= 80) tone = c.green;
  else if (score >= 55) tone = c.yellow;
  else tone = c.red;
  return `${c.bold("Score")}  ${tone(c.bold(`${score} / 100`))}   ${tone(label)}`;
}

export function renderReport(report) {
  const lines = [];
  lines.push("");
  lines.push(`${c.cyan(c.bold("NameScout"))} ${c.dim("·")} checking ${c.bold(`"${report.query}"`)} ${c.dim(`(${report.mode})`)}`);
  lines.push("");
  lines.push(scoreBlock(report.verdict.score, report.verdict.label));
  lines.push("");

  for (const category of categoryOrder) {
    const checks = report.checks.filter((check) => check.category === category);
    if (checks.length === 0) continue;
    lines.push(c.bold(c.cyan(categoryLabels[category].toUpperCase())));
    const surfaceWidth = Math.max(...checks.map((check) => check.surface.length)) + 2;
    for (const check of checks) {
      const icon = statusIcon[check.status] ?? statusIcon.unknown;
      const surface = pad(check.surface, surfaceWidth);
      const status = pad(statusLabel[check.status] ?? statusLabel.unknown, 12);
      const note = c.dim(check.note ?? "");
      lines.push(`  ${icon}  ${surface}${status}${note}`);
    }
    lines.push("");
  }

  if (report.verdict.recommendedActions?.length) {
    lines.push(c.bold(c.cyan("NEXT STEPS")));
    for (const action of report.verdict.recommendedActions) {
      lines.push(`  ${c.green("→")} ${action}`);
    }
    lines.push("");
  }

  const url = `https://namescout.dev/?q=${encodeURIComponent(report.query)}&mode=${encodeURIComponent(report.mode)}`;
  lines.push(c.dim(`Full report: ${url}`));
  lines.push("");

  return lines.join("\n");
}

export function renderSuggestions(suggest) {
  const lines = [];
  lines.push("");
  const sourceLabel = suggest.source === "llm" ? "AI-generated" : "Templated";
  lines.push(`${c.bold(c.cyan("SUGGESTED ALTERNATIVES"))} ${c.dim(`(${sourceLabel})`)}`);
  for (const name of suggest.suggestions) {
    lines.push(`  ${c.green("•")} ${c.bold(name)}`);
  }
  lines.push("");
  lines.push(c.dim(`Re-run on any of these: namescout <name>`));
  lines.push("");
  return lines.join("\n");
}
