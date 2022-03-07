import { Router } from 'express';
import { deleteRental, getRentals, postRental, returnRental } from '../controllers/rentalsControllers';

const rentalsRouters = Router();

rentalsRouters.get('/rentals', getRentals);
rentalsRouters.post('/rentals', postRental);
rentalsRouters.post('/rentals/:id/return', returnRental);
rentalsRouters.delete('/rentals/:id', deleteRental);

export default rentalsRouters;