# namescout-cli

Check whether a project, package, or product name is available across domains, package registries, code hosts, and plugin marketplaces — from your terminal.

```bash
npx namescout-cli redis
```

```
NameScout · checking "redis" (developer-tool)

Score  11 / 100   Name collision risk

DOMAINS
  ✗  redis.com  taken       DNS records found
  ✓  redis.dev  available   No DNS record found
  ...

PACKAGE REGISTRIES
  ✗  npm        taken       Exact npm package exists
  ...

NEXT STEPS
  → Buy redis.dev first
  → Pick a package-name variant
  → Review GitHub namespace collision

Full report: https://namescout.dev/?q=redis&mode=developer-tool
```

## Install

No install needed:

```bash
npx namescout-cli <name>
```

Or install globally:

```bash
npm install -g namescout-cli
namescout <name>
```

## Usage

```
namescout <name> [options]
```

### Options

| Option            | Description                                        |
| ----------------- | -------------------------------------------------- |
| `--mode <mode>`   | Search mode (default: `developer-tool`)            |
| `--json`          | Output raw JSON instead of the formatted report    |
| `--no-color`      | Disable ANSI colors                                |
| `-v, --version`   | Print version                                      |
| `-h, --help`      | Show help                                          |

### Modes

- `developer-tool` — package registries first
- `saas-product` — domains and brand surfaces first
- `library-framework` — package and GitHub collisions first
- `extension-plugin` — marketplaces and publisher names first

### Examples

```bash
# Default scan
npx namescout-cli vidpipe

# Different mode
npx namescout-cli my-app --mode saas-product

# Pipe JSON to jq
npx namescout-cli my-tool --json | jq .verdict.score
```

## Environment

| Variable         | Description                                                           |
| ---------------- | --------------------------------------------------------------------- |
| `NAMESCOUT_API`  | Override the API base URL (default: `https://namescout.dev`)          |
| `NO_COLOR`       | Disable ANSI colors                                                   |

## Requirements

- Node.js 18 or newer

## Why

Naming a project means checking npm, PyPI, GitHub, Docker Hub, six TLDs, VS Code Marketplace, Homebrew, crates.io, and a dozen other surfaces. NameScout runs them all in one shot and tells you which collisions matter for what you're building.

## Web

Same product as the CLI, with a richer report and shareable URLs: [namescout.dev](https://namescout.dev).

## License

MIT
