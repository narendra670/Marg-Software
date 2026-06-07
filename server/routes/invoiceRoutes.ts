import { Router } from 'express';
import {
  getInvoices,
  getInvoice,
  createInvoice,
  deleteInvoice,
  getDashboardStats,
  getSalesReport,
  getCustomerInvoices,
} from '../controllers/invoiceController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);
router.get('/dashboard', getDashboardStats);
router.get('/reports', getSalesReport);
router.get('/customer/:customerId', getCustomerInvoices);
router.route('/').get(getInvoices).post(createInvoice);
router.route('/:id').get(getInvoice).delete(deleteInvoice);

export default router;
