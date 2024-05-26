"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTables = void 0;
const createTables = (db) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`
	        CREATE TABLE IF NOT EXISTS load_category (
	            id INTEGER PRIMARY KEY AUTOINCREMENT,
	            name TEXT NOT NULL UNIQUE
	        )
	    `, (err) => {
                if (err)
                    return reject(err);
            });
            db.run(`
          CREATE TABLE IF NOT EXISTS load_type (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL UNIQUE
          )
      `, (err) => {
                if (err)
                    return reject(err);
            });
            db.run(`
        CREATE TABLE IF NOT EXISTS catalog (
            id INTEGER PRIMARY KEY,
            load_category_id INTEGER,
            load_type_id INTEGER,
            images TEXT,
            industry_images TEXT,
            special_remarks TEXT,
            supporting_info TEXT,
            FOREIGN KEY (load_category_id) REFERENCES load_category (id),
            FOREIGN KEY (load_type_id) REFERENCES load_type (id)
        )
      `, (err) => {
                if (err)
                    return reject(err);
                resolve(true);
            });
        });
    });
};
exports.createTables = createTables;
