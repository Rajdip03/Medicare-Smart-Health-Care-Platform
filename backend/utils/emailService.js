import nodemailer from 'nodemailer'

// Create transporter function (lazy initialization)
const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email credentials not configured in .env file')
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })
}

// Send email verification link
export const sendVerificationEmail = async (email, token, name) => {
  try {
    const transporter = getTransporter()
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification - Medicare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4a90e2; margin: 0;">Medicare</h1>
            <p style="color: #666; margin: 5px 0;">Welcome to Your Health Partner</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello <strong>${name}</strong>,</p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for registering with Medicare! To complete your account setup, please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="display: inline-block; background-color: #4a90e2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 20px; margin-bottom: 10px;">
              Or copy and paste this link in your browser:
            </p>
            <p style="color: #4a90e2; font-size: 12px; word-break: break-all; margin-bottom: 20px;">
              ${verificationLink}
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 20px; margin-bottom: 10px;">
              This link expires in 24 hours.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2025 Medicare. All rights reserved.</p>
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    return { success: true, message: 'Verification email sent' }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, message: error.message }
  }
}

// Send appointment confirmation email
export const sendAppointmentConfirmation = async (opts = {}) => {
  try {
    const transporter = getTransporter()

    const {
      appointmentId,
      toEmail,
      userName,
      userPhone,
      doctorName,
      doctorEmail,
      doctorAddress,
      appointmentDate,
      appointmentTime,
      fees,
      paymentStatus
    } = opts

    const readableDate = appointmentDate ? new Date(appointmentDate).toLocaleDateString('en-IN') : ''

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Appointment Confirmation - Medicare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4a90e2; margin: 0;">Medicare</h1>
            <p style="color: #666; margin: 5px 0;">Your Appointment is Confirmed</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Hello <strong>${userName || ''}</strong>,</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">Your appointment has been successfully booked. Below are the full details:</p>

            <div style="background-color: #f0f4ff; padding: 20px; border-left: 4px solid #4a90e2; margin: 20px 0; border-radius: 4px;">
              ${appointmentId ? `<p style="margin:8px 0;color:#333;"><strong>Appointment ID:</strong> ${appointmentId}</p>` : ''}
              <p style="margin:8px 0;color:#333;"><strong>Doctor:</strong> ${doctorName || ''}</p>
              ${doctorEmail ? `<p style="margin:8px 0;color:#333;"><strong>Doctor Email:</strong> ${doctorEmail}</p>` : ''}
              ${doctorAddress ? `<p style="margin:8px 0;color:#333;"><strong>Clinic Address:</strong> ${doctorAddress}</p>` : ''}
              <p style="margin:8px 0;color:#333;"><strong>Date:</strong> ${readableDate}</p>
              <p style="margin:8px 0;color:#333;"><strong>Time:</strong> ${appointmentTime || ''}</p>
              <p style="margin:8px 0;color:#333;"><strong>Patient Contact:</strong> ${userPhone || ''}</p>
              <p style="margin:8px 0;color:#333;"><strong>Consultation Fee:</strong> ₹${fees || 0}</p>
              <p style="margin:8px 0;color:#333;"><strong>Payment Status:</strong> ${paymentStatus ? 'Paid' : 'Pending'}</p>
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">Please arrive 10 minutes before your scheduled time. To reschedule or cancel, use the "My Appointments" section in your account.</p>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL}/my-appointments" style="display: inline-block; background-color: #4a90e2; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View My Appointments</a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;"><p>© 2025 Medicare. All rights reserved.</p></div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    return { success: true, message: 'Confirmation email sent' }
  } catch (error) {
    console.error('Error sending appointment confirmation:', error)
    return { success: false, message: error.message }
  }
}

// Send lab order confirmation email
export const sendLabOrderConfirmation = async (opts = {}) => {
  try {
    const transporter = getTransporter()

    const {
      orderId,
      toEmail,
      userName,
      patientPhone,
      labTestName,
      scheduleDate,
      notes,
      paymentStatus
    } = opts

    const readableDate = scheduleDate ? new Date(scheduleDate).toLocaleDateString('en-IN') : ''

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Lab Test Booking Confirmation - Medicare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4a90e2; margin: 0;">Medicare</h1>
            <p style="color: #666; margin: 5px 0;">Your Lab Booking is Confirmed</p>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Hello <strong>${userName || ''}</strong>,</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">Your lab test booking has been successfully placed. Below are the full details:</p>

            <div style="background-color: #f0f4ff; padding: 20px; border-left: 4px solid #4a90e2; margin: 20px 0; border-radius: 4px;">
              ${orderId ? `<p style="margin:8px 0;color:#333;"><strong>Order ID:</strong> ${orderId}</p>` : ''}
              <p style="margin:8px 0;color:#333;"><strong>Test:</strong> ${labTestName || ''}</p>
              <p style="margin:8px 0;color:#333;"><strong>Patient Name:</strong> ${userName || ''}</p>
              <p style="margin:8px 0;color:#333;"><strong>Patient Contact:</strong> ${patientPhone || ''}</p>
              <p style="margin:8px 0;color:#333;"><strong>Date:</strong> ${readableDate}</p>
              ${notes ? `<p style="margin:8px 0;color:#333;"><strong>Notes:</strong> ${notes}</p>` : ''}
              <p style="margin:8px 0;color:#333;"><strong>Payment Status:</strong> ${paymentStatus ? 'Paid' : 'Pending'}</p>
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">Please follow any preparation instructions provided for the test. To view or manage your bookings, visit the "My Lab Orders" section of your account.</p>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL}/my-orders" style="display: inline-block; background-color: #4a90e2; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View My Lab Orders</a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;"><p>© 2025 Medicare. All rights reserved.</p></div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Lab confirmation email sent to', toEmail, 'messageId:', info && info.messageId)
    return { success: true, message: 'Lab confirmation email sent', info }
  } catch (error) {
    console.error('Error sending lab confirmation:', error)
    return { success: false, message: error.message }
  }
} 

// Send password reset email

// Send doctor availability notification to followers
export const sendDoctorAvailabilityNotification = async (toEmail, doctorName, available) => {
  try {
    const transporter = getTransporter()
    const status = available ? 'available' : 'unavailable'
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `Doctor ${doctorName} is now ${status} - Medicare`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4a90e2; margin: 0;">Medicare</h1>
            <p style="color: #666; margin: 5px 0;">Doctor Availability Update</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Hello,</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">The doctor <strong>${doctorName}</strong> is now <strong>${status}</strong> for appointments. Visit Medicare to book an appointment.</p>
            <div style="text-align:center; margin: 20px 0;"><a href="${process.env.FRONTEND_URL}/doctors" style="display: inline-block; background-color: #4a90e2; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Doctors</a></div>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;"><p>© 2025 Medicare. All rights reserved.</p></div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    return { success: true, message: 'Availability email sent' }
  } catch (error) {
    console.error('Error sending availability email:', error)
    return { success: false, message: error.message }
  }
}

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const transporter = getTransporter()
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Medicare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4a90e2; margin: 0;">Medicare</h1>
            <p style="color: #666; margin: 5px 0;">Password Reset Request</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello <strong>${name}</strong>,</p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password. Click the button below to set a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; background-color: #4a90e2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #f00; font-size: 12px; margin-top: 20px;">
              This link expires in 1 hour. If you didn't request this, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2025 Medicare. All rights reserved.</p>
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    return { success: true, message: 'Reset email sent' }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, message: error.message }
  }
}
