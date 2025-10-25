import fs from "node:fs/promises";
import { logger } from "../logger.js";

const DATABASE_PATH = new URL("../db.json", import.meta.url);

export class Database<T extends Record<string, any[]>> {
  private database: T = {} as T;
  private isReady: Promise<void>;

  constructor() {
    this.isReady = this.initialize();
  }

  private async initialize() {
    try {
      const data = await fs.readFile(DATABASE_PATH, "utf-8");
      this.database = JSON.parse(data);
      logger.info("Database loaded successfully from db.json");
    } catch (error) {
      logger.error(
        "Failed to load database from db.json: " + (error as Error)?.message
      );
      await this.createEmptyDatabase();
    }
  }

  private async createEmptyDatabase() {
    logger.info(
      "Database file 'db.json' not found. Creating a new empty database file."
    );
    await fs.writeFile(DATABASE_PATH, JSON.stringify({}, null, 2));
  }

  private async persist() {
    try {
      await fs.writeFile(DATABASE_PATH, JSON.stringify(this.database, null, 2));
    } catch (error) {
      logger.error("Failed to persist database: " + (error as Error).message);
    }
  }

  async ready() {
    await this.isReady;
  }

  select<K extends keyof T>(table: K): T[K] {
    return this.database?.[table] ?? ([] as unknown as T[K]);
  }

  async insert<K extends keyof T>(table: K, data: T[K][number]) {
    await this.ready();

    if (!Array.isArray(this.database[table])) {
      this.database[table] = [] as unknown as T[K];
    }

    this.database[table].push(data);
    await this.persist();
    return data;
  }
}
