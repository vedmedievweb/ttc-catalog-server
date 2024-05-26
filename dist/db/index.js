"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const createTables_1 = require("./seeds/createTables");
const importCatalog_1 = require("./seeds/importCatalog");
const sqlite3 = sqlite3_1.default.verbose();
// Путь к файлу базы данных
const dbPath = path_1.default.resolve(__dirname, 'database.sqlite');
// Проверка существования файла базы данных
const dbExists = fs_1.default.existsSync(dbPath);
// Создание или открытие базы данных
exports.db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка при открытии базы данных: ' + err.message);
    }
    else {
        console.log('Соединение с базой данных установлено.');
        if (!dbExists) {
            (0, createTables_1.createTables)(exports.db)
                .then(() => {
                console.log('Таблицы созданы');
                (0, importCatalog_1.importCatalog)(exports.db);
            })
                .catch((err) => {
                console.error('Ошибка при создании таблиц:', err.message);
            });
        }
    }
});
