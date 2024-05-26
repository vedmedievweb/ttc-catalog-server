import { db } from '../../db';

// Получение всех элементов
export const getCatalog = async (
	limit: number,
	page: number,
	offset: number,
	sortColumn: string,
	sortDirection: string,
	loadTypeIdsArray: number[],
	loadCategoryIdsArray: number[],
	search: string
) => {
	const searchQuery = search ? `%${search}%` : '%';
	let filterConditions: string[] = [];
	let filterParams: any[] = [];
	
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
		db.get(countQuery, filterParams, (err, countResult: { total: number }) => {
			if (err) {
				reject(err);
			}
			
			db.all(dataQuery, [...filterParams, limit, offset], (err, rows) => {
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
	})
};

export const getCatalogItem = (id: string) => {
	let query = `
      SELECT catalog.id, catalog.load_category_id, catalog.load_type_id, catalog.images, catalog.industry_images, catalog.special_remarks, catalog.supporting_info,
             load_category.name as load_category, load_type.name as load_type
      FROM catalog
               JOIN load_category ON catalog.load_category_id = load_category.id
               JOIN load_type ON catalog.load_type_id = load_type.id
      WHERE catalog.id = ?
  `;
	
	return new Promise((resolve, reject) => {
		db.get(query, [id], (err, rows) => {
			if (err) {
				reject(err);
			}
			resolve(rows);
		});
	})
}

export const getLoadTypes = async () => {
	const query = 'SELECT id, name FROM load_type ORDER BY name ASC';
	return new Promise((resolve, reject) => {
		db.all(query, [], (err, rows) => {
			if (err) {
				reject(err);
			}
			resolve(rows);
		});
	})
}

export const getLoadCategories = async () => {
	const query = 'SELECT id, name FROM load_category ORDER BY name ASC';
	return new Promise((resolve, reject) => {
		db.all(query, [], (err, rows) => {
			if (err) {
				reject(err);
			}
			resolve(rows);
		});
	})
}