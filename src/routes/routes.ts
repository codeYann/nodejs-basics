import type { Route } from "./types/Route.js";
import { userRoutes } from "./user-routes.js";
import { taskRoutes } from "./task-routes.js";

export const routes: Route[] = [...userRoutes, ...taskRoutes];
