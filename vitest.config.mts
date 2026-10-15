import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Resolve "@/…" imports from tsconfig.json.
    tsconfigPaths: true,
    alias: {
      // `server-only` throws outside React Server Components; unit tests import
      // server modules directly, so swap it for an empty module.
      'server-only': fileURLToPath(new URL('./tests/support/empty.ts', import.meta.url)),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
