# Prescription Upload & Download Feature Documentation

## Overview
This document describes the new prescription management feature added to the Medicare project. Doctors can now upload PDF prescriptions for their patients, and patients can view and download them.

## Feature Components

### Backend

#### 1. **Prescription Model** (`/backend/models/prescriptionModel.js`)
- Stores prescription data in MongoDB
- Fields:
  - `appointmentId`: Reference to the appointment
  - `doctorId`: ID of the doctor who uploaded the prescription
  - `userId`: ID of the patient
  - `prescriptionFile`: File path of the uploaded PDF
  - `fileName`: Original name of the prescription file
  - `uploadedAt`: Timestamp of upload
  - `doctorName`: Name of the doctor (cached for display)
  - `userName`: Name of the patient (cached for display)
  - `notes`: Optional additional notes from the doctor

#### 2. **Prescription Controller** (`/backend/controllers/prescriptionController.js`)

Functions available:
- **uploadPrescription**: Doctor uploads a prescription PDF for an appointment
- **getUserPrescriptions**: Get all prescriptions for a specific patient
- **getPrescriptionByAppointment**: Get prescription for a specific appointment
- **downloadPrescription**: Download prescription file
- **getDoctorPrescriptions**: Get all prescriptions uploaded by a specific doctor
- **deletePrescription**: Delete a prescription (doctor only)

#### 3. **API Routes**

**Doctor Routes** (`/backend/routes/doctorRoute.js`):
```
POST /api/doctor/upload-prescription
- Headers: dtoken (doctor auth token)
- Body: appointmentId, docId, notes
- File: prescription (PDF only)
- Response: prescription data on success

POST /api/doctor/prescriptions
- Headers: dtoken (doctor auth token)
- Body: docId
- Response: all prescriptions uploaded by doctor

POST /api/doctor/delete-prescription
- Headers: dtoken (doctor auth token)
- Body: prescriptionId, docId
- Response: success message
```

**User Routes** (`/backend/routes/userRoute.js`):
```
POST /api/user/prescriptions
- Headers: token (user auth token)
- Body: userId
- Response: all prescriptions for the patient

POST /api/user/prescription-by-appointment
- Headers: token (user auth token)
- Body: appointmentId
- Response: prescription for specific appointment (if exists)

GET /api/user/download-prescription/:prescriptionId
- Headers: token (user auth token)
- Response: PDF file download
```

### Frontend

#### 1. **Doctor Dashboard** - Prescription Upload
Location: `/admin/src/pages/Doctor/DoctorAppointments.jsx`

Features:
- View all appointments
- **Upload Prescription** button for each appointment
- Modal dialog for file selection
- Optional notes field
- Real-time file validation (PDF only)

State Management:
- `uploadingId`: Track which appointment is uploading
- `prescriptionFile`: Store selected file
- `notes`: Store doctor's notes
- `showUploadModal`: Modal visibility
- `selectedAppointment`: Current selected appointment

#### 2. **Patient Dashboard** - Prescription Download
Location: `/frontend/src/pages/MyAppointments.jsx`

Features:
- **View Prescription** button for each appointment
- Fetches prescription if available
- **Download Prescription** button appears after prescription is loaded
- Responsive design for mobile and desktop
- Loading states during fetch/download

State Management:
- `prescriptions`: Cache prescription data by appointment ID
- `loadingPrescription`: Track loading state by appointment ID

## Installation & Setup

### Prerequisites
- Node.js and npm installed
- MongoDB database running
- Project already initialized with Express and React

### Backend Setup

1. **Install multer (if not already installed)**:
```bash
cd backend
npm install multer
```

2. **Import Prescription Model** in `server.js`:
```javascript
import prescriptionModel from './models/prescriptionModel.js'
```

3. **Update Routes** in `server.js`:
```javascript
// Routes already updated in doctorRoute.js and userRoute.js
```

4. **Create uploads directory** (if not exists):
```bash
mkdir -p uploads
```

### Frontend Setup

1. **Doctor Admin Panel** - No additional dependencies needed
   - Uses existing axios and context API
   - Modal UI uses Tailwind CSS

2. **Patient Frontend** - No additional dependencies needed
   - Uses existing axios and context API
   - Download uses browser's native download capability

## Usage Guide

### For Doctors

1. Navigate to **Appointments** section
2. Find the patient's appointment
3. Click **Upload Prescription** button
4. In the modal dialog:
   - Select a PDF file from your computer
   - (Optional) Add notes for the patient
   - Click **Upload** button
5. Success message will appear

### For Patients

1. Go to **My Appointments** page
2. Find the completed appointment
3. Click **View Prescription** button
4. If doctor has uploaded a prescription:
   - The prescription details will be displayed
   - A **Download Prescription** button appears
   - Click to download the PDF to your device

## File Upload Configuration

### Multer Configuration (`/backend/middlewares/multer.js`)
Currently configured for:
- Disk storage (files saved in `uploads/` folder)
- Original filename preservation
- No file size restrictions (can be added if needed)

### To Limit File Size (Optional)
Update multer configuration in `prescriptionController.js`:
```javascript
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files allowed'), false)
    }
  }
})
```

## Database Schema Reference

### Prescription Collection
```javascript
{
  _id: ObjectId,
  appointmentId: String (required),
  doctorId: String (required),
  userId: String (required),
  prescriptionFile: String (required), // file path
  fileName: String (required),
  uploadedAt: Number (required), // timestamp
  doctorName: String (required),
  userName: String (required),
  notes: String (optional),
  __v: Number
}
```

## Error Handling

The feature includes comprehensive error handling:
- Missing required fields validation
- Appointment ownership verification
- File existence checks
- User/Doctor verification
- Authentication checks (authDoctor, authUser middleware)

## UI/UX Features

### Doctor Side (Upload)
- Clean modal interface
- File preview with validation
- Loading state during upload
- Success/error toast notifications
- Disabled upload button when no file selected

### Patient Side (Download)
- "View Prescription" button to check availability
- Loading state while fetching
- Conditional "Download Prescription" button display
- Responsive button layout
- Toast notifications for success/error

## Security Considerations

1. **Authentication**: All endpoints require valid tokens
2. **Authorization**: Doctors can only upload for their own appointments
3. **Validation**: File type checking for PDF files
4. **Ownership Verification**: Users can only download their own prescriptions
5. **File Access**: File downloads go through backend verification

## Future Enhancements

1. **Cloudinary Integration**: Store files in cloud instead of disk
2. **File Size Limits**: Implement maximum file size restrictions
3. **File Compression**: Compress PDFs before storage
4. **Prescription History**: Archive old prescriptions
5. **Digital Signature**: Add doctor's digital signature to prescriptions
6. **Email Notification**: Auto-email prescription to patient
7. **Multiple Prescriptions**: Support multiple prescriptions per appointment
8. **Expiry Tracking**: Track prescription expiry dates
9. **Prescription Templates**: Create prescription templates for doctors
10. **Analytics**: Track prescription upload/download statistics

## Troubleshooting

### Issue: File upload fails
- Ensure `uploads/` directory exists and has write permissions
- Check file is valid PDF format
- Verify appointment ID is correct
- Confirm authentication token is valid

### Issue: Download fails
- Ensure file exists in uploads directory
- Check user has authorization to download
- Verify prescriptionId is correct
- Check browser download settings

### Issue: Prescription not found
- Confirm doctor has uploaded prescription
- Check appointment ID matches
- Verify user authentication

## Code Examples

### Upload Prescription from Frontend
```javascript
const handleUploadPrescription = async (appointmentId) => {
  const formData = new FormData()
  formData.append('appointmentId', appointmentId)
  formData.append('docId', doctorData._id)
  formData.append('prescription', prescriptionFile)
  formData.append('notes', notes)

  const { data } = await axios.post(
    backendUrl + '/api/doctor/upload-prescription',
    formData,
    { headers: { dtoken: dToken, 'Content-Type': 'multipart/form-data' } }
  )
}
```

### Download Prescription from Frontend
```javascript
const downloadPrescription = async (prescriptionId, fileName) => {
  const response = await axios.get(
    backendUrl + `/api/user/download-prescription/${prescriptionId}`,
    { headers: { token }, responseType: 'blob' }
  )
  
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
}
```

## API Response Examples

### Successful Upload
```json
{
  "success": true,
  "message": "Prescription uploaded successfully",
  "prescription": {
    "_id": "65d1234567890",
    "appointmentId": "65a9876543210",
    "doctorId": "65a1234567890",
    "userId": "65b9876543210",
    "prescriptionFile": "/uploads/prescription_filename.pdf",
    "fileName": "prescription_filename.pdf",
    "uploadedAt": 1708123456789,
    "doctorName": "Dr. Smith",
    "userName": "John Doe",
    "notes": "Take medicine twice daily"
  }
}
```

### Get Prescription
```json
{
  "success": true,
  "prescription": {
    "_id": "65d1234567890",
    "appointmentId": "65a9876543210",
    "fileName": "prescription_filename.pdf",
    "doctorName": "Dr. Smith",
    "uploadedAt": 1708123456789,
    "notes": "Take medicine twice daily"
  }
}
```

## Support & Maintenance

For issues or questions:
1. Check the troubleshooting section
2. Review error messages in browser console
3. Check backend server logs
4. Verify all required files are present
5. Ensure MongoDB is running and connected

---

**Feature Added**: January 2026
**Last Updated**: January 15, 2026
