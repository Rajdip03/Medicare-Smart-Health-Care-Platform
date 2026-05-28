import PDFDocument from 'pdfkit'

export const generateAppointmentReceipt = (appointment, stream) => {
  const doc = new PDFDocument({ margin: 40 })
  
  doc.pipe(stream)

  // Professional Header
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#1e40af').text('MEDICARE', { align: 'center' })
  doc.fontSize(10).font('Helvetica').fillColor('#666666').text('Medical Appointment Booking System', { align: 'center' })
  doc.moveDown(0.3)
  
  // Top border line
  doc.strokeColor('#1e40af').lineWidth(2)
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.5)

  // Receipt Header Section
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('PAYMENT RECEIPT', { align: 'center' })
  doc.moveDown(0.3)

  // Receipt Info Box
  const receiptY = doc.y
  doc.fillColor('#f3f4f6').rect(40, receiptY, 515, 50).fill()
  doc.font('Helvetica').fontSize(9).fillColor('#333333')
  doc.text(`Receipt ID: ${appointment._id.toString().slice(-8).toUpperCase()}`, 50, receiptY + 8, { width: 240 })
  doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 300, receiptY + 8, { width: 200 })
  doc.text(`Time: ${new Date().toLocaleTimeString()}`, 50, receiptY + 25, { width: 240 })
  doc.text(`Status: ${appointment.payment ? 'PAID' : 'PENDING'}`, 300, receiptY + 25, { width: 200, continued: false })
  doc.moveDown(1.5)

  // Patient Section
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af').text('PATIENT INFORMATION')
  doc.strokeColor('#1e40af').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.3)
  
  doc.font('Helvetica').fontSize(9).fillColor('#000000')
  doc.text(`Name: ${appointment.userData?.name || 'N/A'}`, { width: 250 })
  doc.text(`Email: ${appointment.userData?.email || 'N/A'}`, { width: 250 })
  doc.text(`Phone: ${appointment.userData?.phone || 'N/A'}`, { width: 250 })
  doc.moveDown(0.5)

  // Doctor Section
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af').text('HEALTHCARE PROVIDER')
  doc.strokeColor('#1e40af').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.3)
  
  doc.font('Helvetica').fontSize(9).fillColor('#000000')
  doc.text(`Doctor: Dr. ${appointment.docData?.name || 'N/A'}`, { width: 250 })
  doc.text(`Specialization: ${appointment.docData?.speciality || 'N/A'}`, { width: 250 })
  doc.text(`Experience: ${appointment.docData?.experience || 'N/A'} years`, { width: 250 })
  doc.moveDown(0.5)

  // Appointment Details Section
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af').text('APPOINTMENT DETAILS')
  doc.strokeColor('#1e40af').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.3)
  
  doc.font('Helvetica').fontSize(9).fillColor('#000000')
  doc.text(`Appointment Date: ${appointment.slotDate}`, { width: 250 })
  doc.text(`Appointment Time: ${appointment.slotTime}`, { width: 250 })
  doc.moveDown(0.8)

  // Payment Summary Section - Table Style
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af').text('PAYMENT SUMMARY')
  doc.strokeColor('#1e40af').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.4)

  const tableTop = doc.y
  const col1X = 50
  const col2X = 450

  // Table Header
  doc.fillColor('#f3f4f6').rect(40, tableTop, 515, 25).fill()
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000')
  doc.text('Description', col1X, tableTop + 7)
  doc.text('Amount', col2X, tableTop + 7, { align: 'right', width: 95 })
  
  // Table Rows
  doc.font('Helvetica').fontSize(9).fillColor('#333333')
  doc.text('Consultation Fee', col1X, tableTop + 32)
  doc.text(`Rs. ${appointment.amount}`, col2X, tableTop + 32, { align: 'right', width: 95 })
  
  doc.text('GST/Tax', col1X, tableTop + 50)
  doc.text('Rs. 0', col2X, tableTop + 50, { align: 'right', width: 95 })

  // Total Row
  doc.fillColor('#1e40af').rect(40, tableTop + 68, 515, 25).fill()
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff')
  doc.text('TOTAL AMOUNT PAID', col1X, tableTop + 75)
  doc.text(`Rs. ${appointment.amount}`, col2X, tableTop + 75, { align: 'right', width: 95 })
  
  doc.moveDown(4.5)

  // Appointment Status
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e40af').text('APPOINTMENT STATUS')
  doc.strokeColor('#1e40af').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.3)
  
  const statusColor = appointment.cancelled ? '#ef4444' : '#10b981'
  doc.fillColor(statusColor).rect(40, doc.y, 515, 30).fill()
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff')
  doc.text(appointment.cancelled ? '✗ APPOINTMENT CANCELLED' : '✓ APPOINTMENT CONFIRMED', 50, doc.y + 8)
  doc.moveDown(1.5)

  // Footer Section
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.4)
  
  doc.fontSize(8).font('Helvetica').fillColor('#666666')
  doc.text('This is an electronically generated receipt. No signature is required.', { align: 'center' })
  doc.text('Thank you for choosing Medicare for your healthcare needs.', { align: 'center' })
  doc.moveDown(0.2)
  
  doc.fontSize(7).fillColor('#999999')
  doc.text('For support, visit: www.medicare.com | Email: support@medicare.com | Contact: +1-800-MEDICARE', { align: 'center' })

  doc.end()
}


export const generateLabOrderReceipt = (labOrder, labTest, userData, stream) => {
  const doc = new PDFDocument({ margin: 40 })
  
  doc.pipe(stream)

  // Professional Header
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#1e40af').text('MEDICARE', { align: 'center' })
  doc.fontSize(10).font('Helvetica').fillColor('#666666').text('Laboratory Test Booking & Management', { align: 'center' })
  doc.moveDown(0.3)
  
  // Top border line
  doc.strokeColor('#1e40af').lineWidth(2)
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.5)

  // Receipt Header Section
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('LAB TEST RECEIPT', { align: 'center' })
  doc.moveDown(0.3)

  // Receipt Info Box
  const receiptY = doc.y
  doc.fillColor('#f3f4f6').rect(40, receiptY, 515, 50).fill()
  doc.font('Helvetica').fontSize(9).fillColor('#333333')
  doc.text(`Receipt ID: ${labOrder._id.toString().slice(-8).toUpperCase()}`, 50, receiptY + 8, { width: 240 })
  doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 300, receiptY + 8, { width: 200 })
  doc.text(`Time: ${new Date().toLocaleTimeString()}`, 50, receiptY + 25, { width: 240 })
  doc.text(`Status: ${labOrder.payment ? 'PAID' : 'PENDING'}`, 300, receiptY + 25, { width: 200, continued: false })
  doc.moveDown(1.5)

  // Patient Section
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af').text('PATIENT INFORMATION')
  doc.strokeColor('#1e40af').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.3)
  
  doc.font('Helvetica').fontSize(9).fillColor('#000000')
  doc.text(`Name: ${userData?.name || labOrder.patientName || 'N/A'}`, { width: 250 })
  doc.text(`Email: ${userData?.email || 'N/A'}`, { width: 250 })
  doc.text(`Phone: ${userData?.phone || labOrder.patientPhone || 'N/A'}`, { width: 250 })
  doc.moveDown(0.5)

  // Lab Test Section
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af').text('LAB TEST DETAILS')
  doc.strokeColor('#1e40af').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.3)
  
  doc.font('Helvetica').fontSize(9).fillColor('#000000')
  doc.text(`Test Name: ${labTest?.name || 'N/A'}`, { width: 515 })
  doc.text(`Description: ${labTest?.description || 'N/A'}`, { width: 515 })
  doc.text(`Sample Type: ${labTest?.sampleType || 'N/A'}`, { width: 250 })
  doc.text(`Preparation Required: ${labTest?.preparation || 'N/A'}`, { width: 250 })
  doc.moveDown(0.5)

  // Booking Details Section
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af').text('BOOKING DETAILS')
  doc.strokeColor('#1e40af').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.3)
  
  doc.font('Helvetica').fontSize(9).fillColor('#000000')
  const scheduleDate = new Date(labOrder.scheduleDate)
  const formattedDate = scheduleDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const formattedTime = scheduleDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  doc.text(`Scheduled Date: ${formattedDate}`, { width: 250 })
  doc.text(`Scheduled Time: ${formattedTime}`, { width: 250 })
  doc.text(`Booking Status: ${labOrder.status.charAt(0).toUpperCase() + labOrder.status.slice(1)}`, { width: 250 })
  doc.moveDown(0.8)

  // Payment Summary Section - Table Style
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e40af').text('PAYMENT SUMMARY')
  doc.strokeColor('#1e40af').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.4)

  const tableTop = doc.y
  const col1X = 50
  const col2X = 450

  // Table Header
  doc.fillColor('#f3f4f6').rect(40, tableTop, 515, 25).fill()
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000')
  doc.text('Description', col1X, tableTop + 7)
  doc.text('Amount', col2X, tableTop + 7, { align: 'right', width: 95 })
  
  // Table Rows
  doc.font('Helvetica').fontSize(9).fillColor('#333333')
  doc.text('Lab Test Fee', col1X, tableTop + 32)
  doc.text(`Rs. ${labTest?.price || 0}`, col2X, tableTop + 32, { align: 'right', width: 95 })
  
  doc.text('GST/Tax', col1X, tableTop + 50)
  doc.text('Rs. 0', col2X, tableTop + 50, { align: 'right', width: 95 })

  // Total Row
  doc.fillColor('#1e40af').rect(40, tableTop + 68, 515, 25).fill()
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff')
  doc.text('TOTAL AMOUNT PAID', col1X, tableTop + 75)
  doc.text(`Rs. ${labTest?.price || 0}`, col2X, tableTop + 75, { align: 'right', width: 95 })
  
  doc.moveDown(4.5)

  // Test Status
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e40af').text('TEST STATUS')
  doc.strokeColor('#1e40af').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.3)
  
  const statusColor = '#10b981'
  doc.fillColor(statusColor).rect(40, doc.y, 515, 30).fill()
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff')
  doc.text('✓ BOOKING CONFIRMED - PAYMENT RECEIVED', 50, doc.y + 8)
  doc.moveDown(1.5)

  // Important Notes
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e40af').text('IMPORTANT NOTES')
  doc.strokeColor('#1e40af').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.3)
  
  doc.font('Helvetica').fontSize(8).fillColor('#333333')
  doc.text('• Please arrive 10 minutes before your scheduled appointment time.', { width: 515 })
  doc.text('• Bring a valid ID and this receipt to the lab.', { width: 515 })
  doc.text('• Follow all pre-test preparation instructions as mentioned above.', { width: 515 })
  if (labOrder.notes) {
    doc.text(`• Special Notes: ${labOrder.notes}`, { width: 515 })
  }
  doc.moveDown(0.5)

  // Footer Section
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke()
  doc.moveDown(0.4)
  
  doc.fontSize(8).font('Helvetica').fillColor('#666666')
  doc.text('This is an electronically generated receipt. No signature is required.', { align: 'center' })
  doc.text('Thank you for choosing Medicare for your laboratory testing needs.', { align: 'center' })
  doc.moveDown(0.2)
  
  doc.fontSize(7).fillColor('#999999')
  doc.text('For support, visit: www.medicare.com | Email: support@medicare.com | Contact: +1-800-MEDICARE', { align: 'center' })

  doc.end()
}
