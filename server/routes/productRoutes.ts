import { Router } from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);
router.route('/').get(getProducts).post(createProduct);
router.route('/:id').get(getProduct).put(updateProduct).delete(authorize('admin'), deleteProduct);

export default router;
