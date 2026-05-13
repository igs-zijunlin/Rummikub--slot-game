import { defineConfig } from 'vite';
import { execSync } from 'child_process';

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
const buildTime = new Date().toISOString().replace('T', ' ').slice(0, 16);

export default defineConfig({
  base: '/Rummikub--slot-game/',
  server: { port: 3000 },
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
});
