import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/infra/server.ts'],
  outDir: 'dist',
  format: ['cjs'],
  clean: true,
  minify: true,
  sourcemap: true,
  target: 'node18',
  dts: true,
  bundle: true,
  skipNodeModulesBundle: true,
  external: ['@prisma/client'],
  noExternal: [],
  tsconfig: './tsconfig.json',
  onSuccess: 'echo "Build successful!"',
});
