#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { fetchReport, fetchSuggestions } from "../lib/api.js";
import { renderReport, renderSuggestions } from "../lib/render.js";
import { c } from "../lib/colors.js";

const VALID_MODES = ["developer-tool", "saas-product", "library-framework", "extension-plugin"];
const DEFAULT_MODE = "developer-tool";

function readVersion() {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(join(here, "..", "package.json"), "utf8"));
    return pkg.version;
  } catch {
    return "0.0.0";
  }
}

function printHelp() {
  const help = `
${c.cyan(c.bold("NameScout"))} — check a name across domains, package registries, code hosts, and plugin marketplaces.

${c.bold("Usage")}
  npx namescout-cli <name> [options]

${c.bold("Options")}
  --mode <mode>      Search mode (default: developer-tool)
                     One of: ${VALID_MODES.join(", ")}
  --suggest          Also generate alternative names
  --count <n>        Number of suggestions when using --suggest (1-20, default 8)
  --json             Output raw JSON instead of formatted report
  --no-color         Disable ANSI colors
  -v, --version      Print version
  -h, --help         Show this help

${c.bold("Examples")}
  npx namescout-cli redis
  npx namescout-cli vidpipe --mode saas-product
  npx namescout-cli my-tool --suggest --count 12
  npx namescout-cli my-tool --json | jq .verdict.score

${c.bold("Environment")}
  NAMESCOUT_API      Override API base URL (default: https://namescout.dev)
  NO_COLOR           Disable colors

${c.dim("Web report: https://namescout.dev")}
`;
  process.stdout.write(`${help.trim()}\n`);
}

function parseArgs(argv) {
  const args = {
    positional: [],
    mode: DEFAULT_MODE,
    json: false,
    help: false,
    version: false,
    suggest: false,
    count: 8,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--version" || arg === "-v") args.version = true;
    else if (arg === "--json") args.json = true;
    else if (arg === "--suggest") args.suggest = true;
    else if (arg === "--no-color") {
      // already handled in colors.js by argv check
    } else if (arg === "--mode") {
      args.mode = argv[++i];
    } else if (arg.startsWith("--mode=")) {
      args.mode = arg.slice(7);
    } else if (arg === "--count") {
      args.count = Number(argv[++i]);
    } else if (arg.startsWith("--count=")) {
      args.count = Number(arg.slice(8));
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      args.positional.push(arg);
    }
  }
  return args;
}

async function main() {
  const argv = process.argv.slice(2);

  let args;
  try {
    args = parseArgs(argv);
  } catch (err) {
    process.stderr.write(`${c.red("Error:")} ${err.message}\n\n`);
    printHelp();
    process.exit(1);
  }

  if (args.help || (argv.length === 0 && !args.version)) {
    printHelp();
    process.exit(0);
  }

  if (args.version) {
    process.stdout.write(`${readVersion()}\n`);
    process.exit(0);
  }

  if (args.positional.length === 0) {
    process.stderr.write(`${c.red("Error:")} missing <name> argument\n\n`);
    printHelp();
    process.exit(1);
  }

  if (args.positional.length > 1) {
    process.stderr.write(`${c.red("Error:")} too many positional arguments\n\n`);
    printHelp();
    process.exit(1);
  }

  if (!VALID_MODES.includes(args.mode)) {
    process.stderr.write(`${c.red("Error:")} invalid mode "${args.mode}". Must be one of: ${VALID_MODES.join(", ")}\n`);
    process.exit(1);
  }

  if (args.suggest && (!Number.isFinite(args.count) || args.count < 1 || args.count > 20)) {
    process.stderr.write(`${c.red("Error:")} --count must be a number between 1 and 20\n`);
    process.exit(1);
  }

  const query = args.positional[0].trim().toLowerCase();
  if (!query) {
    process.stderr.write(`${c.red("Error:")} name cannot be empty\n`);
    process.exit(1);
  }

  let report;
  try {
    report = await fetchReport(query, args.mode);
  } catch (err) {
    process.stderr.write(`${c.red("Error:")} ${err.message}\n`);
    process.exit(1);
  }

  let suggest;
  if (args.suggest) {
    try {
      suggest = await fetchSuggestions(query, args.mode, args.count);
    } catch (err) {
      process.stderr.write(`${c.red("Error:")} ${err.message}\n`);
      process.exit(1);
    }
  }

  if (args.json) {
    const payload = suggest ? { ...report, suggestions: suggest } : report;
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  } else {
    process.stdout.write(renderReport(report));
    if (suggest) process.stdout.write(renderSuggestions(suggest));
  }
}

main();
