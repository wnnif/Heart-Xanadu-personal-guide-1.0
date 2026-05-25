import { buildApp } from './app.js';
import { config } from './config/index.js';

const app = await buildApp();
await app.listen({ host: config.host, port: config.port });
console.log(`Server running on http://${config.host}:${config.port}`);
