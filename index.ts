import express from 'express';
import cors from 'cors';
import {
	getCatalog,
	getCatalogItem,
	getLoadCategories,
	getLoadTypes
} from "./src/controllers/catalog";


const app = express();
const PORT = 3000;


// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get('/api/catalog', async (req, res) => {
	try {
		// @ts-ignore
		const query: {
			limit: number;
			page: number;
			sortBy: string;
			sortOrder: string;
			load_type_ids?: string;
			load_category_ids?: string;
			search?: string;
		} = req.query;
		const limit: number = query.limit || 10;
		const page: number = query.page || 1;
		const offset: number = (page - 1) * limit;
		const allowedSortBy = ['id', 'load_type', 'load_category'];
		const sortColumn = allowedSortBy.includes(query.sortBy) ? query.sortBy : 'id';
		const sortDirection = (query.sortOrder && query.sortOrder.toLowerCase() === 'desc') ? 'DESC' : 'ASC';
		
		// Filter parameters
		const loadTypeIdsArray = query.load_type_ids ? query.load_type_ids.split(',').map(Number) : [];
		const loadCategoryIdsArray = query.load_category_ids ? query.load_category_ids.split(',').map(Number) : [];
		
		// Search parameter
		const search = query.search ? query.search.trim() : '';
		const data = await getCatalog(limit, page, offset, sortColumn, sortDirection, loadTypeIdsArray, loadCategoryIdsArray, search);
		res.json({ message: 'success', data })
	} catch(error) {
		res.status(500).json({ error });
	}
});

app.get('/api/catalog/:id', async (req, res) => {
	try {
		// @ts-ignore
		const id: string = req.query.id;
		const data = await getCatalogItem(id);
		res.json({ message: 'success', data })
	} catch (error) {
		res.status(500).json({ error });
	}
});

app.get('/api/load_data/load_categories', async (req, res) => {
	try {
		const data = await getLoadCategories();
		res.json({ message: 'success', data })
	} catch (error) {
		res.status(500).json({ error });
	}
});

app.get('/api/load_data/load_types', async (req, res) => {
	try {
		const data = await getLoadTypes();
		res.json({ message: 'success', data })
	} catch (error) {
		res.status(500).json({ error });
	}
});

app.get('/api/check', (req, res) => {
	res.json({ message: 'server is okay!' })
});

app.listen(PORT, () => {
	console.log(`Server is running on PORT:${PORT}`);
});