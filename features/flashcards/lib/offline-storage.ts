/**
 * Offline storage using IndexedDB
 * Provides persistent cache for flashcards
 */

import { Flashcard } from "../schemas/flashcard.schema";

const DB_NAME = "lexi-flashcards";
const DB_VERSION = 1;
const STORE_NAME = "flashcards";
const METADATA_STORE = "metadata";

interface StorageMetadata {
  key: string;
  lastUpdated: number;
  expiresAt: number;
}

/**
 * Initialize IndexedDB
 */
function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create flashcards store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "flashcard_id" });
      }

      // Create metadata store
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: "key" });
      }
    };
  });
}

/**
 * Save flashcards to offline storage
 */
export async function saveFlashcardsOffline(
  cards: Flashcard[],
  cacheKey: string,
  ttlMs: number = 5 * 60 * 1000, // 5 minutes default
): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction([STORE_NAME, METADATA_STORE], "readwrite");

    // Save flashcards
    const cardsStore = tx.objectStore(STORE_NAME);
    for (const card of cards) {
      await new Promise<void>((resolve, reject) => {
        const req = cardsStore.put(card);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve();
      });
    }

    // Save metadata
    const metadataStore = tx.objectStore(METADATA_STORE);
    const metadata: StorageMetadata = {
      key: cacheKey,
      lastUpdated: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };

    await new Promise<void>((resolve, reject) => {
      const req = metadataStore.put(metadata);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });

    console.debug(`[OfflineStorage] Saved ${cards.length} flashcards`);
  } catch (error) {
    console.error("[OfflineStorage] Failed to save:", error);
    // Don't throw - offline storage is optional
  }
}

/**
 * Load flashcards from offline storage
 */
export async function loadFlashcardsOffline(
  cacheKey: string,
): Promise<Flashcard[] | null> {
  try {
    const db = await getDB();

    // Check metadata
    const metadata = await new Promise<StorageMetadata | undefined>(
      (resolve, reject) => {
        const tx = db.transaction(METADATA_STORE, "readonly");
        const store = tx.objectStore(METADATA_STORE);
        const req = store.get(cacheKey);

        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve(req.result);
      },
    );

    // Check if cache is expired
    if (!metadata || metadata.expiresAt < Date.now()) {
      console.debug("[OfflineStorage] Cache expired or not found");
      return null;
    }

    // Load all flashcards
    const cards = await new Promise<Flashcard[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });

    console.debug(`[OfflineStorage] Loaded ${cards.length} flashcards`);
    return cards;
  } catch (error) {
    console.error("[OfflineStorage] Failed to load:", error);
    return null;
  }
}

/**
 * Clear offline storage
 */
export async function clearOfflineStorage(): Promise<void> {
  try {
    const db = await getDB();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_NAME, METADATA_STORE], "readwrite");

      const cardsReq = tx.objectStore(STORE_NAME).clear();
      const metadataReq = tx.objectStore(METADATA_STORE).clear();

      cardsReq.onerror = () => reject(cardsReq.error);
      metadataReq.onerror = () => reject(metadataReq.error);

      tx.oncomplete = () => resolve();
    });

    console.debug("[OfflineStorage] Cleared");
  } catch (error) {
    console.error("[OfflineStorage] Failed to clear:", error);
  }
}

/**
 * Get offline storage size
 */
export async function getOfflineStorageSize(): Promise<number> {
  try {
    const db = await getDB();

    const count = await new Promise<number>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.count();

      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });

    return count;
  } catch (error) {
    console.error("[OfflineStorage] Failed to get size:", error);
    return 0;
  }
}
