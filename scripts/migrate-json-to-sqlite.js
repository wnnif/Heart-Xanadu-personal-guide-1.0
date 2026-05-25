import { migrate } from '../src/db/index.js';
migrate();
console.log('JSON data migrated into SQLite if database was empty.');
