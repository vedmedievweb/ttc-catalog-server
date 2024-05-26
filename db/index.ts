import sqlite from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { createTables } from './seeds/createTables';
import { importCatalog } from './seeds/importCatalog';
const sqlite3 = sqlite.verbose();
// Путь к файлу базы данных
const dbPath = path.resolve(__dirname, 'database.sqlite');

// Проверка существования файла базы данных
const dbExists = fs.existsSync(dbPath);

// Создание или открытие базы данных
export const db = new sqlite3.Database(dbPath, (err) => {
	if (err) {
		console.error('Ошибка при открытии базы данных: ' + err.message);
	} else {
		console.log('Соединение с базой данных установлено.');
		if (!dbExists) {
			createTables(db)
				.then(() => {
					console.log('Таблицы созданы');
					importCatalog(db);
				})
				.catch((err) => {
					console.error('Ошибка при создании таблиц:', err.message);
				});
		}
	}
});