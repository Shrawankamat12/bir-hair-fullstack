/**
 * One-time migration: local /uploads files  ->  Cloudinary, and fix every path in MongoDB.
 *
 * Usage (run on the machine that has the src/uploads folder, i.e. your PC):
 *   1. Put MONGODB_URI and CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in .env
 *   2. Dry run (changes nothing):   node scripts/migrate-uploads-to-cloudinary.js
 *   3. Real run:                    node scripts/migrate-uploads-to-cloudinary.js --apply
 *
 * Safe to re-run: Cloudinary public_ids are stable, so files are not duplicated.
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

const APPLY = process.argv.includes('--apply');
const UPLOADS_DIR = path.join(__dirname, '..', 'src', 'uploads');

// Matches "/uploads/name.ext" optionally preceded by an absolute origin, anywhere inside a string
// (so it also fixes <img src="..."> inside blog HTML).
const UPLOAD_RE = /(?:https?:\/\/[^\s"'()<>]+)?\/?uploads\/([\w.\-]+\.(?:png|jpe?g|webp|gif|svg))/gi;

const cache = new Map(); // filename -> cloudinary url | null (missing/failed)
const stats = { docsChanged: 0, stringsChanged: 0, filesUploaded: 0, filesMissing: new Set(), failed: [] };

function assertEnv() {
  const miss = ['MONGODB_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].filter((k) => !process.env[k]);
  if (miss.length) {
    console.error('Missing in .env:', miss.join(', '));
    process.exit(1);
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

async function toCloudinary(filename) {
  if (cache.has(filename)) return cache.get(filename);
  const local = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(local)) {
    stats.filesMissing.add(filename);
    cache.set(filename, null);
    return null;
  }
  if (!APPLY) {
    cache.set(filename, `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/bir-hair/${path.parse(filename).name}`);
    return cache.get(filename);
  }
  try {
    const res = await cloudinary.uploader.upload(local, {
      folder: 'bir-hair',
      public_id: path.parse(filename).name, // stable id => re-runs don't duplicate
      overwrite: false,
      resource_type: 'image',
    });
    stats.filesUploaded += 1;
    cache.set(filename, res.secure_url);
    console.log('  uploaded', filename);
  } catch (err) {
    stats.failed.push(`${filename}: ${err.message}`);
    cache.set(filename, null);
  }
  return cache.get(filename);
}

async function fixString(str) {
  const matches = [...str.matchAll(UPLOAD_RE)];
  if (!matches.length) return str;
  let out = str;
  for (const m of matches) {
    const url = await toCloudinary(m[1]);
    if (url) out = out.split(m[0]).join(url);
  }
  return out;
}

const isPlainObject = (v) => v && typeof v === 'object' && v.constructor === Object;

// Returns [{ path: 'gallery.0.url', value: '<new>' }, ...] for every string that needs changing.
async function collectChanges(node, prefix = '', changes = []) {
  if (typeof node === 'string') {
    const fixed = await fixString(node);
    if (fixed !== node) changes.push({ path: prefix, value: fixed });
  } else if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) await collectChanges(node[i], prefix ? `${prefix}.${i}` : `${i}`, changes);
  } else if (isPlainObject(node)) {
    for (const k of Object.keys(node)) {
      if (k === '_id') continue;
      await collectChanges(node[k], prefix ? `${prefix}.${k}` : k, changes);
    }
  }
  return changes;
}

(async () => {
  assertEnv();
  console.log(APPLY ? '*** APPLY MODE — database will be updated ***' : '*** DRY RUN — nothing will be changed (add --apply to execute) ***');
  console.log('Local uploads folder:', UPLOADS_DIR, fs.existsSync(UPLOADS_DIR) ? `(${fs.readdirSync(UPLOADS_DIR).length} files)` : '(NOT FOUND)');

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const collections = (await db.listCollections().toArray()).map((c) => c.name).filter((n) => !n.startsWith('system.'));

  for (const name of collections) {
    const col = db.collection(name);
    let changedInCol = 0;
    for await (const doc of col.find({})) {
      const changes = await collectChanges(doc);
      if (!changes.length) continue;
      changedInCol += 1;
      stats.docsChanged += 1;
      stats.stringsChanged += changes.length;
      if (APPLY) {
        const $set = {};
        changes.forEach((c) => { $set[c.path] = c.value; });
        await col.updateOne({ _id: doc._id }, { $set });
      }
    }
    if (changedInCol) console.log(`[${name}] documents ${APPLY ? 'updated' : 'to update'}: ${changedInCol}`);
  }

  console.log('\n===== SUMMARY =====');
  console.log('Documents', APPLY ? 'updated:' : 'that would be updated:', stats.docsChanged);
  console.log('Image paths', APPLY ? 'replaced:' : 'that would be replaced:', stats.stringsChanged);
  if (APPLY) console.log('Files uploaded to Cloudinary:', stats.filesUploaded);
  if (stats.filesMissing.size) {
    console.log(`\nFiles referenced in DB but NOT found in src/uploads (${stats.filesMissing.size}) — re-upload these from admin:`);
    [...stats.filesMissing].forEach((f) => console.log('  -', f));
  }
  if (stats.failed.length) {
    console.log('\nUpload failures:');
    stats.failed.forEach((f) => console.log('  -', f));
  }
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('Migration failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});