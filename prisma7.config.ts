import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Direct (unpooled) connection — Prisma Migrate needs session-level features
    // (advisory locks) that a transaction-mode pooler like Supabase's Supavisor
    // doesn't support. The app's runtime client uses the pooled DATABASE_URL
    // instead, via the driver adapter in src/lib/prisma.ts.
    url: env("DIRECT_URL"),
  },
});
