"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoadCategories = exports.getLoadTypes = exports.getCatalogItem = exports.getCatalog = void 0;
const db_1 = require("../../db");
// Получение всех элементов
const getCatalog = async (limit, page, offset, sortColumn, sortDirection, loadTypeIdsArray, loadCategoryIdsArray, search) => {
    const searchQuery = search ? `%${search}%` : '%';
    let filterConditions = [];
    let filterParams = [];
    if (loadTypeIdsArray.length > 0) {
        filterConditions.push(`lt.id IN (${loadTypeIdsArray.map(() => '?').join(',')})`);
        filterParams = filterParams.concat(loadTypeIdsArray);
    }
    if (loadCategoryIdsArray.length > 0) {
        filterConditions.push(`lc.id IN (${loadCategoryIdsArray.map(() => '?').join(',')})`);
        filterParams = filterParams.concat(loadCategoryIdsArray);
    }
    filterConditions.push(`(c.special_remarks LIKE ? OR c.supporting_info LIKE ? OR lc.name LIKE ? OR lt.name LIKE ?)`);
    filterParams.push(searchQuery, searchQuery, searchQuery, searchQuery);
    const filterQuery = filterConditions.length > 0 ? `WHERE ${filterConditions.join(' AND ')}` : '';
    const dataQuery = `
      SELECT
          c.id AS id,
          lc.name AS load_category,
          lt.name AS load_type,
          c.images,
          c.industry_images,
          c.special_remarks,
          c.supporting_info
      FROM catalog c
               LEFT JOIN load_category lc ON c.load_category_id = lc.id
               LEFT JOIN load_type lt ON c.load_type_id = lt.id
          ${filterQuery}
      ORDER BY ${sortColumn === 'id' ? 'c.id' : sortColumn} ${sortDirection}
          LIMIT ? OFFSET ?
	`;
    const countQuery = `
      SELECT COUNT(*) as total
      FROM catalog c
      LEFT JOIN load_category lc ON c.load_category_id = lc.id
      LEFT JOIN load_type lt ON c.load_type_id = lt.id
      ${filterQuery}
  `;
    // Execute the query
    return new Promise((resolve, reject) => {
        db_1.db.get(countQuery, filterParams, (err, countResult) => {
            if (err) {
                reject(err);
            }
            db_1.db.all(dataQuery, [...filterParams, limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve({
                    data: rows,
                    total: countResult.total,
                    page: parseInt(String(page), 10),
                    limit: parseInt(String(limit), 10),
                    sortBy: sortColumn,
                    sortOrder: sortDirection
                });
            });
        });
    });
};
exports.getCatalog = getCatalog;
const getCatalogItem = (id) => {
    let query = `
      SELECT
          c.id AS id,
          lc.name AS load_category,
          lt.name AS load_type,
          c.images,
          c.industry_images,
          c.special_remarks,
          c.supporting_info
      FROM catalog c
         	LEFT JOIN load_category lc ON c.load_category_id = lc.id
         	LEFT JOIN load_type lt ON c.load_type_id = lt.id
			WHERE catalog.id = ${id}
  `;
    return new Promise((resolve, reject) => {
        db_1.db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
};
exports.getCatalogItem = getCatalogItem;
const getLoadTypes = async () => {
    const query = 'SELECT id, name FROM load_type';
    return new Promise((resolve, reject) => {
        db_1.db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
};
exports.getLoadTypes = getLoadTypes;
const getLoadCategories = async () => {
    const query = 'SELECT id, name FROM load_category';
    return new Promise((resolve, reject) => {
        db_1.db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
};
exports.getLoadCategories = getLoadCategories;
