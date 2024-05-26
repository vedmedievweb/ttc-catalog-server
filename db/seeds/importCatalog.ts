import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import async from 'async';
import type { Database } from "sqlite3";

// Путь к CSV файлу
const csvFilePath = path.resolve(__dirname, 'data/catalog.csv');
type CVSRow = {
	id: string;
	Load_Category_name: string;
	Load_Type_name: string;
	example_1: string;
	example_2: string;
	industry_reference_1: string;
	industry_reference_2: string;
	special_remarks: string;
	supporting_info: string;
}

// Функция для получения или создания ID по имени из таблицы
function getOrCreateIdByName(db: Database, tableName: string, name: string, callback: (err: Error | null, value: number) => void) {
	db.get(`SELECT id FROM ${tableName} WHERE name = ?`, [name], (err, row: { id: number }) => {
		if (err) {
			callback(err, 0);
		} else if (row) {
			callback(null, row.id);
		} else {
			db.run(`INSERT INTO ${tableName} (name) VALUES (?)`, [name], function(err) {
				if (err) {
					callback(err, 0);
				} else {
					callback(null, this.lastID);
				}
			});
		}
	});
}

// Функция для вставки данных в таблицу catalog
function insertCatalogItem(
	db: Database,
	item: {
		id: number;
		loadCategoryId: number;
		loadTypeId: number;
		images: string | null;
		industryImages: string | null;
		specialRemarks: string | null;
		supportingInfo: string | null;
	},
	callback: (err: Error | null) => void
) {
	const { id, loadCategoryId, loadTypeId, images, industryImages, specialRemarks, supportingInfo } = item;
	db.run(
		`INSERT INTO catalog (id, load_category_id, load_type_id, images, industry_images, special_remarks, supporting_info)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
		[id, loadCategoryId, loadTypeId, images, industryImages, specialRemarks, supportingInfo],
		(err) => {
			if (err) {
				console.error(`Ошибка при вставке записи с ID ${id}:`, err.message);
				callback(err);
			} else {
				callback(null);
			}
		}
	);
}

// Функция для обработки одной строки CSV файла
function processRow(
	db: Database,
	row: CVSRow,
	callback: (err: Error | null) => void
) {
	const {
		id,
		Load_Category_name,
		Load_Type_name,
		example_1,
		example_2,
		industry_reference_1,
		industry_reference_2,
		special_remarks,
		supporting_info
	} = row;
	// Преобразование данных
	const images = [example_1, example_2].filter(Boolean);
	const industryImages = [industry_reference_1, industry_reference_2].filter(Boolean);
	
	// Получение или создание ID для load_category и load_type
	getOrCreateIdByName(db, 'load_category', Load_Category_name, (err, loadCategoryId) => {
		if (err) {
			console.error('Ошибка при получении или создании load_category_id:', err.message);
			callback(err);
			return;
		}
		
		getOrCreateIdByName(db, 'load_type', Load_Type_name, (err, loadTypeId) => {
			if (err) {
				console.error('Ошибка при получении или создании load_type_id:', err.message);
				callback(err);
				return;
			}
			
			// Вставка записи в таблицу catalog
			insertCatalogItem(db, {
				id: parseInt(id, 10),
				loadCategoryId,
				loadTypeId,
				images: images.length > 0 ? JSON.stringify(images) : null,
				industryImages: industryImages.length > 0 ? JSON.stringify(industryImages) : null,
				specialRemarks: special_remarks || null,
				supportingInfo: supporting_info || null
			}, callback);
		});
	});
}

// Функция для импорта каталога
export function importCatalog(db: Database) {
	const queue = async.queue((row: CVSRow, callback: (err: Error | null) => void) => {
		processRow(db, row, callback);
	}, 1); // Обработка одной строки за раз
	
	fs.createReadStream(csvFilePath)
		.pipe(csv({
			separator: ';', // Указываем разделитель
			headers: ['id', 'Load_Category_name', 'Load_Type_name', 'example_1', 'example_2', 'industry_reference_1', 'industry_reference_2', 'special_remarks', 'supporting_info']
		}))
		.on('data', (row) => {
			queue.push(row, (err) => {
				if (err) {
					console.error('Ошибка при обработке строки:', err.message);
				}
			});
		})
		.on('end', () => {
			queue.drain(() => {
				console.log('Импорт каталога завершен.');
			});
		});
}