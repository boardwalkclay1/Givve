// lib/pbClient.js
const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase(process.env.PB_URL || 'http://127.0.0.1:8090');

if (process.env.PB_ADMIN_EMAIL && process.env.PB_ADMIN_PASSWORD) {
  pb.admins
    .authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD)
    .catch(err => {
      console.error('PocketBase admin auth failed:', err.message);
    });
}

module.exports = pb;
