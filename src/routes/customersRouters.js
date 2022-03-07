import { Router } from 'express';
import { getCustomerById, getCustomers, postCustomer, putCustomer } from '../controllers/customersControllers.js';

const customersRouters = Router();

customersRouters.get('/customers', getCustomers);
customersRouters.get('/customers/:id', getCustomerById);
customersRouters.post('/customers', postCustomer);
customersRouters.put('/customers/:id', putCustomer);

export default customersRouters;