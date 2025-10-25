import type { User } from "../entitties/User.js";
import { Database } from "./database.js";

export const database = new Database<{ users: User[] }>();
