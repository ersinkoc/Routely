import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  site: 'https://routely.oxog.dev',
  base: '/routely',
  build: {
    format: 'directory',
  },
});
