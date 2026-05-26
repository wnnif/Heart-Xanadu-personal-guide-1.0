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
  if (Number(file.file?.bytesRead || 0) > config.maxUploadBytes) throw new Error('文件过大');
  mkdirSync(config.uploadDir, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  let written = 0;
  file.file.on('data', chunk => {
    written += chunk.length;
    if (written > config.maxUploadBytes) file.file.destroy(new Error('文件过大'));
  });
  await pipeline(file.file, createWriteStream(join(config.uploadDir, name), { flags: 'wx' }));
  return `/uploads/${name}`;
}
