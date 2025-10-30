import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  dts: true,
  outExtension() {
    return { js: ".mjs" };
  },
});
