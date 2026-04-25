import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const androidLocalPath = path.join(root, "android app", "local.properties");
const iosConfigDir = path.join(root, "ios app", "Config");
const iosLocalPath = path.join(iosConfigDir, "Local.xcconfig");

function parseEnv(contents) {
  const values = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const separator = line.indexOf("=");
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function requireValue(values, key) {
  const value = values[key];
  if (!value) {
    throw new Error(`Missing ${key} in .env.local`);
  }
  return value;
}

function upsertProperties(filePath, nextValues) {
  const existing = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf8").split(/\r?\n/)
    : [];
  const seen = new Set();
  const lines = existing.map((line) => {
    const match = line.match(/^([^#=\s][^=]*)=/);
    if (!match) return line;
    const key = match[1].trim();
    if (!(key in nextValues)) return line;
    seen.add(key);
    return `${key}=${nextValues[key]}`;
  });

  for (const [key, value] of Object.entries(nextValues)) {
    if (!seen.has(key)) lines.push(`${key}=${value}`);
  }

  fs.writeFileSync(filePath, `${lines.filter((line, index) => line || index < lines.length - 1).join("\n")}\n`);
}

function xcconfigValue(value) {
  return value.replaceAll("://", ":$(SLASH)$(SLASH)");
}

if (!fs.existsSync(envPath)) {
  throw new Error(".env.local not found");
}

const env = parseEnv(fs.readFileSync(envPath, "utf8"));
const nativeValues = {
  SUPABASE_URL: requireValue(env, "NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_ANON_KEY: requireValue(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  STRIPE_PK: env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "",
  SITE_URL: env.NEXT_PUBLIC_SITE_URL || "https://g-rgabriellaromeo.vercel.app",
};

upsertProperties(androidLocalPath, nativeValues);

fs.mkdirSync(iosConfigDir, { recursive: true });
fs.writeFileSync(
  iosLocalPath,
  [
    "SLASH = /",
    `SUPABASE_URL = ${xcconfigValue(nativeValues.SUPABASE_URL)}`,
    `SUPABASE_ANON_KEY = ${nativeValues.SUPABASE_ANON_KEY}`,
    `WEB_API_BASE_URL = ${xcconfigValue(nativeValues.SITE_URL)}`,
    "",
  ].join("\n"),
);

console.log("Native iOS and Android environment files synced from .env.local.");
