import mongoose from 'mongoose'
import LabTest from '../models/labTestModel.js'
import LabOrder from '../models/labOrderModel.js'
import User from '../models/userModel.js'
import razorpay from 'razorpay'
import { sendLabOrderConfirmation } from '../utils/emailService.js'
import { generateLabOrderReceipt } from '../utils/receiptGenerator.js'

// Initialize Razorpay instance
const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY
})

export const addLabTest = async (req, res) => {
  try {
    const { name, description, price, sampleType, preparation, available, image } = req.body;
    const test = await LabTest.create({ name, description, price, sampleType, preparation, available, image });
    return res.status(201).send({ success: true, message: 'Lab test added', test });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: error.message });
  }
}

export const updateLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const test = await LabTest.findByIdAndUpdate(id, update, { new: true });
    if (!test) return res.status(404).send({ success: false, message: 'Lab test not found' });
    return res.send({ success: true, message: 'Lab test updated', test });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: error.message });
  }
}

export const deleteLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await LabTest.findByIdAndDelete(id);
    if (!test) return res.status(404).send({ success: false, message: 'Lab test not found' });
    return res.send({ success: true, message: 'Lab test deleted' });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: error.message });
  }
}

export const listLabTests = async (req, res) => {
  try {
    const tests = await LabTest.find({ available: true }).sort({ name: 1 });
    return res.send({ success: true, tests });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: error.message });
  }
}

export const getLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await LabTest.findById(id);
    if (!test) return res.status(404).send({ success: false, message: 'Lab test not found' });
    return res.send({ success: true, test });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: error.message });
  }
}

export const listAllLabTests = async (req, res) => {
  try {
    const tests = await LabTest.find().sort({ name: 1 });
    return res.send({ success: true, tests });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: error.message });
  }
}

export const bookLabTest = async (req, res) => {
  try {
    const { labTestId, scheduleDate, patientName, patientPhone, notes } = req.body;
    const userId = req.body.userId;

    const test = await LabTest.findById(labTestId);
    if (!test) return res.status(404).send({ success: false, message: 'Lab test not found' });

    const order = await LabOrder.create({ userId, labTestId, scheduleDate, patientName, patientPhone, notes });

    // Send confirmation email (failure should not block the booking response)
    try {
      const user = userId ? await User.findById(userId).select('name email phone') : null;
      const toEmail = (user && user.email) ? user.email : (req.body.email || '');
      const userName = (user && user.name) ? user.name : (patientName || '');
      console.log('Attempting to send lab confirmation email', { toEmail, userId, orderId: order._id, labTestId });
      if (!toEmail) console.warn('No recipient email resolved for lab order', order._id);
      const emailResult = await sendLabOrderConfirmation({
        orderId: order._id,
        toEmail,
        userName,
        patientPhone: patientPhone || (user && user.phone) || '',
        labTestName: test.name,
        scheduleDate,
        notes,
        paymentStatus: !!req.body.paymentStatus
      });
      console.log('Lab email result:', emailResult);
    } catch (emailErr) {
      console.error('Error sending lab booking email:', emailErr);
    }

    return res.status(201).send({ success: true, message: 'Lab test booked', order });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: error.message });
  }
}

export const getUserLabOrders = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) return res.status(401).send({ success: false, message: 'Not authorized' });
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send({ success: false, message: 'Invalid user id' });

    const orders = await LabOrder.find({ userId }).populate('labTestId');
    return res.send({ success: true, orders });
  } catch (error) {
    console.error('getUserLabOrders error:', error && error.stack ? error.stack : error);
    return res.status(500).send({ success: false, message: 'Internal server error retrieving user lab orders' });
  }
}

export const getAllLabOrders = async (req, res) => {
  try {
    // limit fields returned for safety
    const orders = await LabOrder.find().populate('labTestId').populate({ path: 'userId', select: 'name email' }).lean();
    return res.send({ success: true, orders });
  } catch (error) {
    console.error('getAllLabOrders error:', error && error.stack ? error.stack : error);
    if (error && (error.name === 'CastError' || (error.message && error.message.includes('Cast to ObjectId')))) {
      return res.status(400).send({ success: false, message: 'Invalid id in query or data' });
    }
    return res.status(500).send({ success: false, message: 'Internal server error retrieving lab orders' });
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['booked','completed','cancelled'].includes(status)) return res.status(400).send({ success: false, message: 'Invalid status' });
    const order = await LabOrder.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).send({ success: false, message: 'Order not found' });
    return res.send({ success: true, message: 'Order updated', order });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: error.message });
  }
}

export const cancelUserLabOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.body.userId;
    if (!orderId) return res.status(400).send({ success: false, message: 'Missing orderId' });
    const order = await LabOrder.findById(orderId);
    if (!order) return res.status(404).send({ success: false, message: 'Order not found' });
    if (order.userId.toString() !== userId) return res.status(403).send({ success: false, message: 'Not authorized' });
    if (order.status === 'cancelled') return res.status(400).send({ success: false, message: 'Order already cancelled' });
    order.status = 'cancelled';
    await order.save();
    return res.send({ success: true, message: 'Lab order cancelled', order });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: 'Internal server error' });
  }
}

// API to create payment order for lab order
const paymentLabOrderRazorpay = async (req, res) => {
  try {
    const { orderId } = req.body
    const userId = req.body.userId

    const labOrder = await LabOrder.findById(orderId).populate('labTestId')

    if (!labOrder || labOrder.userId.toString() !== userId) {
      return res.json({ success: false, message: 'Lab order not found or not authorized' })
    }

    if (labOrder.payment) {
      return res.json({ success: false, message: 'Payment already completed for this order' })
    }

    if (labOrder.status !== 'booked') {
      return res.json({ success: false, message: 'Order is not in payable state' })
    }

    const options = {
      amount: labOrder.labTestId.price * 100, // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: orderId
    }

    const order = await instance.orders.create(options)
    res.json({ success: true, order })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to verify lab order payment
const verifyLabOrderPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    const userId = req.body.userId

    // Verify signature (basic verification - in production use proper crypto verification)
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.json({ success: false, message: 'Payment verification failed' })
    }

    // Mark lab order as paid
    const labOrder = await LabOrder.findById(orderId)
    if (!labOrder || labOrder.userId.toString() !== userId) {
      return res.json({ success: false, message: 'Order not found or not authorized' })
    }

    // Update payment status
    await LabOrder.findByIdAndUpdate(orderId, { payment: true })

    res.json({ success: true, message: 'Payment verified and lab order confirmed' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to download lab order receipt
const downloadLabOrderReceipt = async (req, res) => {
  try {
    const { orderId } = req.params
    const userId = req.body.userId

    const labOrder = await LabOrder.findById(orderId).populate('labTestId userId')

    if (!labOrder) {
      return res.status(404).json({ success: false, message: 'Lab order not found' })
    }

    if (labOrder.userId._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this receipt' })
    }

    if (!labOrder.payment) {
      return res.status(400).json({ success: false, message: 'Payment not completed for this order' })
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="lab_receipt_${orderId}.pdf"`)

    generateLabOrderReceipt(labOrder, labOrder.labTestId, labOrder.userId, res)

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export { paymentLabOrderRazorpay, verifyLabOrderPayment, downloadLabOrderReceipt }
