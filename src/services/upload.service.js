import { createWriteStream, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { pipeline } from 'stream/promises';
import crypto from 'crypto';
import { config } from '../config/index.js';
export async function saveUpload(file) {
  if (!file) throw new Error('没有文件');
  const allow = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = extname(file.filename || '').toLowerCase();
  if (!allow.includes(ext)) throw new Error('只支持 jpg/png/webp/gif');
  mkdirSync(config.uploadDir, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  await pipeline(file.file, createWriteStream(join(config.uploadDir, name)));
  return `/uploads/${name}`;
}
