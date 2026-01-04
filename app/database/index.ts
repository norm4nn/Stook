import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('nfc.db');

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      surname TEXT,
      phone TEXT,
      links TEXT,
      notes TEXT,
      source TEXT,
      createdAt TEXT
    );
  `);
};