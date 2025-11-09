import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'db.json');

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, {
  subscriptions: [],
  payments: []
});

export async function initDatabase() {
  try {
    await db.read();
    
    // Initialize with default data if database is empty
    if (!db.data) {
      db.data = {
        subscriptions: [],
        payments: []
      };
      await db.write();
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export function getDatabase() {
  return db;
}

export async function closeDatabase() {
  await db.write();
}
