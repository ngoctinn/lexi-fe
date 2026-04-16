#!/usr/bin/env node

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_CATEGORY = "scarlab-solid-oval";
const DEFAULT_STYLE = "All Assets";
const DEFAULT_OUT_DIR = "public/icons/iamvector/scarlab-solid-oval";
const DEFAULT_BASE_URL = "https://iamvector.com";

const options = parseArgs(process.argv.slice(2));
const outDir = path.resolve(process.cwd(), options.outDir ?? DEFAULT_OUT_DIR);
const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
const category = options.category ?? DEFAULT_CATEGORY;
const style = options.style ?? DEFAULT_STYLE;

await run();

async function run() {
  if (options.clean) {
    await rm(outDir, { recursive: true, force: true });
  }

  await mkdir(outDir, { recursive: true });

  const manifest = {
    source: {
      provider: "iamvector",
      category,
      style,
      pageUrl: `${baseUrl}/all-icons/${category}`,
    },
    downloadedAt: new Date().toISOString(),
    icons: [],
  };

  const seenIds = new Set();
  const usedFileNames = new Set();

  let page = 1;
  let pageSize = null;
  let totalSaved = 0;

  while (true) {
    const data = await fetchPage({ baseUrl, category, style, page });
    const icons = data?.icons?.recommended ?? [];

    if (icons.length === 0) {
      break;
    }

    if (pageSize === null) {
      pageSize = icons.length;
    }

    for (const icon of icons) {
      const uniqueKey = String(icon.id ?? icon._id ?? icon.slug ?? icon.title);
      if (seenIds.has(uniqueKey)) {
        continue;
      }
      seenIds.add(uniqueKey);

      const fileName = makeFileName(icon, usedFileNames);
      const filePath = path.join(outDir, fileName);
      const svg = normalizeSvg(icon.svgString ?? "");

      await writeFile(filePath, svg, "utf8");

      manifest.icons.push({
        id: icon.id,
        title: icon.title,
        slug: icon.slug,
        fileName,
        license: icon.license,
        licenseOwner: icon.license_owner,
        licenseLink: icon.license_link,
      });

      totalSaved += 1;
    }

    if (pageSize !== null && icons.length < pageSize) {
      break;
    }

    page += 1;
  }

  await writeFile(
    path.join(outDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Downloaded ${totalSaved} icons to ${path.relative(process.cwd(), outDir)}`,
  );
}

async function fetchPage({ baseUrl, category, style, page }) {
  const url = new URL("/search-v2-icons", baseUrl);
  url.searchParams.set("category", category);
  url.searchParams.set("page", String(page));
  url.searchParams.set("style", style);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url.toString()}: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

function makeFileName(icon, usedFileNames) {
  const baseName = slugify(
    icon.slug || icon.title || String(icon.id || "icon"),
  );
  const fileName = `${baseName || "icon"}.svg`;

  if (!usedFileNames.has(fileName)) {
    usedFileNames.add(fileName);
    return fileName;
  }

  const fallbackName = `${baseName || "icon"}-${icon.id || icon._id || "copy"}.svg`;
  usedFileNames.add(fallbackName);
  return fallbackName;
}

function normalizeSvg(svgString) {
  let svg = String(svgString).trim().replace(/\r\n?/g, "\n");

  svg = svg.replace(/^<\?xml[\s\S]*?\?>\s*/i, "");
  svg = svg.replace(/<!--\s*Uploaded to: SVG Repo[\s\S]*?-->\s*/i, "");
  svg = svg.replace(/<rect\b[^>]*fill=(['\"])white\1[^>]*\/>\s*/gi, "");
  svg = svg.replace(/\swidth=(['\"])800px\1/i, "");
  svg = svg.replace(/\sheight=(['\"])800px\1/i, "");
  svg = svg.replace(/fill=(['\"])(#323232|#000000)\1/gi, 'fill="currentColor"');
  svg = svg.replace(
    /stroke=(['\"])(#323232|#000000)\1/gi,
    'stroke="currentColor"',
  );

  return `${svg.trim()}\n`;
}

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseArgs(argv) {
  const options = {
    clean: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--clean") {
      options.clean = true;
      continue;
    }

    if (arg === "--category") {
      options.category = argv[++index];
      continue;
    }

    if (arg === "--style") {
      options.style = argv[++index];
      continue;
    }

    if (arg === "--out" || arg === "--out-dir") {
      options.outDir = argv[++index];
      continue;
    }

    if (arg === "--base-url") {
      options.baseUrl = argv[++index];
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(
    `Usage: node scripts/download-iamvector-icons.mjs [options]\n\nOptions:\n  --category <slug>   Icon category slug (default: ${DEFAULT_CATEGORY})\n  --style <name>      Style filter from iamvector (default: ${DEFAULT_STYLE})\n  --out <path>        Output directory (default: ${DEFAULT_OUT_DIR})\n  --base-url <url>    Source base URL (default: ${DEFAULT_BASE_URL})\n  --clean             Remove the output directory before writing\n  -h, --help          Show this help message`,
  );
}
