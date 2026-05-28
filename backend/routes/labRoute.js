import express from 'express'
import { addLabTest, updateLabTest, deleteLabTest, listLabTests, listAllLabTests, getLabTest, bookLabTest, getUserLabOrders, getAllLabOrders, updateOrderStatus, cancelUserLabOrder, paymentLabOrderRazorpay, verifyLabOrderPayment, downloadLabOrderReceipt } from '../controllers/labController.js'
import authUser from '../middlewares/authUser.js'
import authAdmin from '../middlewares/authAdmin.js'

const labRouter = express.Router()

// Public: list tests and get test
labRouter.get('/list', listLabTests)

// Admin: list all tests
labRouter.get('/list-all', authAdmin, listAllLabTests)

// Public: get test by id (should be after other routes)
// NOTE: keep any param routes like '/:id' after more specific routes to avoid collisions

// User: book and view orders
labRouter.post('/book', authUser, bookLabTest)
labRouter.get('/my-orders', authUser, getUserLabOrders)
labRouter.post('/cancel', authUser, cancelUserLabOrder)
labRouter.post('/payment-razorpay', authUser, paymentLabOrderRazorpay)
labRouter.post('/verify-payment', authUser, verifyLabOrderPayment)
labRouter.get('/download-receipt/:orderId', authUser, downloadLabOrderReceipt)

// Admin: CRUD and view all orders
labRouter.post('/add', authAdmin, addLabTest)
labRouter.put('/update/:id', authAdmin, updateLabTest)
labRouter.delete('/delete/:id', authAdmin, deleteLabTest)
labRouter.get('/orders/all', authAdmin, getAllLabOrders)
labRouter.put('/orders/status/:id', authAdmin, updateOrderStatus)

// Public: get test by id (placed after other routes to avoid matching 'list' or 'my-orders')
labRouter.get('/:id', getLabTest)

export default labRouter;
