// Almacenamiento local de canciones (IndexedDB) — todo offline
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Song } from "./types";

interface SingDB extends DBSchema {
  songs: {
    key: string;
    value: Song;
    indexes: { "by-createdAt": number };
  };
}

let dbPromise: Promise<IDBPDatabase<SingDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<SingDB>("ingles-cantando", 1, {
      upgrade(db) {
        const store = db.createObjectStore("songs", { keyPath: "id" });
        store.createIndex("by-createdAt", "createdAt");
      },
    });
  }
  return dbPromise;
};

export const saveSong = async (song: Song): Promise<void> => {
  const db = await getDB();
  await db.put("songs", song);
};

export const getSong = async (id: string): Promise<Song | undefined> => {
  const db = await getDB();
  return db.get("songs", id);
};

export const listSongs = async (): Promise<Song[]> => {
  const db = await getDB();
  const all = await db.getAllFromIndex("songs", "by-createdAt");
  return all.reverse();
};

export const deleteSong = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete("songs", id);
};

export const updateSong = async (
  id: string,
  patch: Partial<Song>
): Promise<Song | undefined> => {
  const db = await getDB();
  const existing = await db.get("songs", id);
  if (!existing) return undefined;
  const next = { ...existing, ...patch };
  await db.put("songs", next);
  return next;
};
