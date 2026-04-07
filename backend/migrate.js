const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ethical_gps.db');

db.serialize(() => {
  db.run("ALTER TABLE users ADD COLUMN name TEXT", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log("Column 'name' already exists.");
      } else {
        console.error("Migration error:", err.message);
      }
    } else {
      console.log("Migration successful: added 'name' column to 'users' table.");
    }
  });
});

db.close();
