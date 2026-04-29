const { LowSync }      = require('lowdb');
const { JSONFileSync } = require('lowdb/node');
const path = require('path');

const dbPath  = path.join(__dirname, 'db.json');
const adapter = new JSONFileSync(dbPath);
const db      = new LowSync(adapter, {
  contacts: [], articles: [], gallery: [], subscribers: []
});

db.read();
['contacts','articles','gallery','subscribers'].forEach(k => {
  if (!db.data[k]) db.data[k] = [];
});
db.write();

module.exports = db;
