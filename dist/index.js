"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const catalog_1 = require("./src/controllers/catalog");
const app = (0, express_1.default)();
const PORT = 3000;
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Routes
app.get('/api/catalog', async (req, res) => {
    try {
        // @ts-ignore
        const query = req.query;
        const limit = query.limit || 10;
        const page = query.page || 1;
        const offset = (page - 1) * limit;
        const allowedSortBy = ['id', 'load_type', 'load_category'];
        const sortColumn = allowedSortBy.includes(query.sortBy) ? query.sortBy : 'id';
        const sortDirection = (query.sortOrder && query.sortOrder.toLowerCase() === 'desc') ? 'DESC' : 'ASC';
        // Filter parameters
        const loadTypeIdsArray = query.load_type_ids ? query.load_type_ids.split(',').map(Number) : [];
        const loadCategoryIdsArray = query.load_category_ids ? query.load_category_ids.split(',').map(Number) : [];
        // Search parameter
        const search = query.search ? query.search.trim() : '';
        const data = await (0, catalog_1.getCatalog)(limit, page, offset, sortColumn, sortDirection, loadTypeIdsArray, loadCategoryIdsArray, search);
        res.json({ message: 'success', data });
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
app.get('/api/catalog/:id', async (req, res) => {
    try {
        // @ts-ignore
        const id = req.query.id;
        const data = await (0, catalog_1.getCatalogItem)(id);
        res.json({ message: 'success', data });
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
app.get('/api/load_data/load_categories', async (req, res) => {
    try {
        const data = await (0, catalog_1.getLoadCategories)();
        res.json({ message: 'success', data });
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
app.get('/api/load_data/load_types', async (req, res) => {
    try {
        const data = await (0, catalog_1.getLoadTypes)();
        res.json({ message: 'success', data });
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on PORT:${PORT}`);
});
