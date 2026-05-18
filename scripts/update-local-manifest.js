#!/usr/bin/env node

/**
 * Copies the repo's manifest.xml to the user's local Word add-in manifest path.
 * The target path is read from the LOCAL_MANIFEST_PATH variable in .env.
 *
 * Usage:
 *   node scripts/update-local-manifest.js
 *   npm run update-manifest
 */

const fs = require("fs");
const path = require("path");

// Load .env file manually (no external deps needed)
function loadEnv(envPath) {
  try {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch (err) {
    // .env file may not exist
  }
}

const rootDir = path.resolve(__dirname, "..");
loadEnv(path.join(rootDir, ".env"));

const localManifestPath = process.env.LOCAL_MANIFEST_PATH;

if (!localManifestPath) {
  console.error("Error: LOCAL_MANIFEST_PATH is not set.");
  console.error("Add it to your .env file, e.g.:");
  console.error(
    '  LOCAL_MANIFEST_PATH="~/Library/Containers/com.microsoft.Word/Data/Documents/wef/manifest.xml"'
  );
  process.exit(1);
}

// Expand ~ to home directory
const expandedPath = localManifestPath.startsWith("~")
  ? path.join(process.env.HOME || "", localManifestPath.slice(1))
  : localManifestPath;

const sourcePath = path.join(rootDir, "manifest.xml");

if (!fs.existsSync(sourcePath)) {
  console.error(`Error: Source manifest not found at ${sourcePath}`);
  process.exit(1);
}

// Ensure target directory exists
const targetDir = path.dirname(expandedPath);
if (!fs.existsSync(targetDir)) {
  console.log(`Creating directory: ${targetDir}`);
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.copyFileSync(sourcePath, expandedPath);
console.log(`Manifest copied to: ${expandedPath}`);
