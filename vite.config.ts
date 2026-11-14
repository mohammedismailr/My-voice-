import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import type { IncomingMessage, ServerResponse } from 'http';

function serverlessApiPlugin() {
  return {
    name: 'serverless-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: IncomingMessage & { body?: any; query?: any }, res: ServerResponse & { status?: any; json?: any; send?: any; redirect?: any }, next: () => void) => {
        if (!req.url || !req.url.startsWith('/api')) {
          return next();
        }

        const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = urlObj.pathname;

        // Enhance response object to match VercelResponse
        res.status = (statusCode: number) => {
          res.statusCode = statusCode;
          return res;
        };

        res.json = (data: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        res.send = (data: any) => {
          res.end(data);
          return res;
        };

        // Extract query parameters
        const query: Record<string, string> = {};
        urlObj.searchParams.forEach((val, key) => {
          query[key] = val;
        });
        req.query = query;

        // Parse JSON body for POST/PUT/PATCH
        if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
          const buffers: Buffer[] = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const raw = Buffer.concat(buffers).toString('utf-8');
          try {
            req.body = raw ? JSON.parse(raw) : {};
          } catch {
            req.body = raw;
          }
        }

        try {
          if (pathname === '/api/chat') {
            const chatModule = await server.ssrLoadModule('/api/chat.ts');
            return await chatModule.default(req, res);
          } else if (pathname === '/api/conversations') {
            const convModule = await server.ssrLoadModule('/api/conversations/index.ts');
            return await convModule.default(req, res);
          } else if (pathname.startsWith('/api/conversations/')) {
            const id = pathname.replace('/api/conversations/', '');
            req.query.id = id;
            const convDetailModule = await server.ssrLoadModule('/api/conversations/[id].ts');
            return await convDetailModule.default(req, res);
          } else if (pathname === '/api/health') {
            const healthModule = await server.ssrLoadModule('/api/health.ts');
            return await healthModule.default(req, res);
          }
        } catch (err: any) {
          console.error('[API Middleware Error]:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Server error' }));
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables into process.env for Node serverless API handlers
  const env = loadEnv(mode, process.cwd(), '');
  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }

  // Also parse .env directly if needed
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const k = trimmed.slice(0, eqIdx).trim();
            const v = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[k]) {
              process.env[k] = v;
            }
          }
        }
      });
    }
  } catch (e) {
    console.warn('Could not read .env file directly:', e);
  }

  return {
    plugins: [react(), serverlessApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
    },
  };
});
