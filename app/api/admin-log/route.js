import { jsonResponse, requireAdmin } from '../../lib/serverAuth';
import { readJsonFile, writeJsonFile } from '../../lib/serverData';

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const nuovoLog = await request.json();
    const logs = await readJsonFile('admin-log.json', []);
    logs.push(nuovoLog);
    await writeJsonFile('admin-log.json', logs);

    return jsonResponse({ status: 'ok' }, 200);
  } catch (error) {
    return jsonResponse({ error: 'Errore salvataggio log' }, 500);
  }
}
