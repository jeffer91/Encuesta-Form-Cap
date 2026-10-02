import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  preview: {
    functions: {
      itsqmetdocentes: {
        name: "ITSQMET Docentes API",
        source: "api/index.ts"
      }
    }
  }
});
