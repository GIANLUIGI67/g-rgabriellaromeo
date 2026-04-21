import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

function resolveDataPath(fileName) {
  return path.join(dataDir, fileName);
}

export async function ensureDataFile(fileName, fallback = []) {
  const filePath = resolveDataPath(fileName);
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2));
  }
  return filePath;
}

export async function readJsonFile(fileName, fallback = []) {
  const filePath = await ensureDataFile(fileName, fallback);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(fileName, value) {
  const filePath = await ensureDataFile(fileName, Array.isArray(value) ? [] : {});
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
  return filePath;
}
