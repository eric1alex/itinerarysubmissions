import { defineConfig } from 'astro/config';
import db from '@astrojs/db';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [
    db({
      studio: false, // Use local DB for now, will enable Studio in production
    })
  ],
});
