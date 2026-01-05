import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("nfc.db");

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag_id TEXT UNIQUE,
      name TEXT,
      surname TEXT,
      phone TEXT,
      links TEXT,
      notes TEXT,
      source TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS shared_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag_id TEXT,
      name TEXT,
      surname TEXT,
      from_tag_id TEXT,
      createdAt TEXT
    );
  `);
};
