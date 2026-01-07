import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("nfc.db");

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS contacts (
      tag_id TEXT PRIMARY KEY,
      name TEXT,
      surname TEXT,
      phone TEXT,
      links TEXT,
      notes TEXT,
      source TEXT,
      createdAt TEXT,

      stook_count INTEGER NOT NULL DEFAULT 0,
      last_stooked_at TEXT
    );

    CREATE TABLE IF NOT EXISTS shared_contacts (
      from_tag_id TEXT,
      tag_id TEXT,
      name TEXT,
      surname TEXT,
      createdAt TEXT,
      PRIMARY KEY (from_tag_id, tag_id),
      FOREIGN KEY (from_tag_id) REFERENCES contacts(tag_id),
      FOREIGN KEY (tag_id) REFERENCES contacts(tag_id)
    );
  `);
};
