import { promises as fs } from 'fs';
import path from 'path';

const logPath = path.join(process.cwd(), 'public', 'data', 'admin-log.json');

export async function POST(request) {
  try {
    const nuovoLog = await request.json();
    const data = await fs.readFile(logPath, 'utf-8').catch(() => '[]');
    const logs = JSON.parse(data);

    logs.push(nuovoLog);
    await fs.writeFile(logPath, JSON.stringify(logs, null, 2));

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Errore salvataggio log' }), { status: 500 });
  }
}
