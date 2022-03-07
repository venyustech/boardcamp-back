import { Router } from 'express';
import { getCategories, postCategory } from '../controllers/categoriesControllers.js';

const categoriesRouters = Router();

categoriesRouters.get('/categories', getCategories);
categoriesRouters.post('/categories', postCategory);


export default categoriesRouters;