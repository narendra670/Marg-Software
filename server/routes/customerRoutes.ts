import { Router } from 'express';
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);
router.route('/').get(getCustomers).post(createCustomer);
router.route('/:id').get(getCustomer).put(updateCustomer).delete(authorize('admin'), deleteCustomer);

export default router;
