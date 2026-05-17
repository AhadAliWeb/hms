import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Auth
import Login        from '../pages/auth/Login';
import Unauthorized from '../pages/Unauthorized';

// Admin Layout + Pages
import AdminLayout    from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import DoctorList     from '../pages/admin/doctors/DoctorList';
import DoctorCreate   from '../pages/admin/doctors/DoctorCreate';
import DoctorEdit     from '../pages/admin/doctors/DoctorEdit';
import PatientList    from '../pages/admin/patients/PatientList';
import PatientCreate  from '../pages/admin/patients/PatientCreate';
import PatientEdit    from '../pages/admin/patients/PatientEdit';
import WardList       from '../pages/admin/wards/WardList';
import BedList        from '../pages/admin/wards/BedList';
import MedicineList   from '../pages/admin/medicines/MedicineList';
import LabTestList    from '../pages/admin/labTests/LabTestList';
import AuditLogList   from '../pages/admin/auditLogs/AuditLogList';

// Doctor Layout + Pages
import DoctorLayout  from '../layouts/DoctorLayout';
import DoctorDashboard   from '../pages/doctor/Dashboard';
import AppointmentList   from '../pages/doctor/appointments/AppointmentList';
import MedicalRecordList from '../pages/doctor/medicalRecords/MedicalRecordList';
import MedicalRecordCreate from '../pages/doctor/medicalRecords/MedicalRecordCreate';
import PrescriptionList  from '../pages/doctor/prescriptions/PrescriptionList';
import PrescriptionCreate  from '../pages/doctor/prescriptions/PrescriptionCreate';
import LabOrderList  from '../pages/doctor/labOrders/LabOrderList';
import LabOrderCreate from '../pages/doctor/labOrders/LabOrderCreate';

// Receptionist
import ReceptionistLayout  from '../layouts/ReceptionistLayout';
import ReceptionistPatientList from '../pages/receptionist/patients/PatientList';
import ReceptionistPatientCreate       from '../pages/receptionist/patients/PatientCreate';
import ReceptionistAppointmentList     from '../pages/receptionist/appointments/AppointmentList';
import AppointmentCreate   from '../pages/receptionist/appointments/AppointmentCreate';
import AdmissionList       from '../pages/receptionist/admissions/AdmissionList';
import AdmissionCreate     from '../pages/receptionist/admissions/AdmissionCreate';

// Nurse
import NurseLayout        from '../layouts/NurseLayout';
import NurseDashboard     from '../pages/nurse/Dashboard';
import WardPatients       from '../pages/nurse/WardPatients';

// Pharmacist
import PharmacistLayout      from '../layouts/PharmacistLayout';
import PharmacistPrescriptionList      from '../pages/pharmacist/prescriptions/PrescriptionList';
import PharmacistMedicineList          from '../pages/pharmacist/medicines/MedicineList';
import LowStockList          from '../pages/pharmacist/medicines/LowStockList';

//Accountant
import AccountantLayout from '../layouts/AccountantLayout';
import AccountantDashboard from '../pages/accountant/Dashboard';
import InvoiceList from '../pages/accountant/invoices/InvoiceList';

//Patient
import PatientLayout         from '../layouts/PatientLayout';
import PatientAppointments   from '../pages/patient/appointments/PatientAppointmentList';
import PatientMedicalRecords from '../pages/patient/medicalRecords/PatientMedicalRecordList';
import PatientPrescriptions  from '../pages/patient/prescriptions/PatientPrescriptionList';
import PatientLabResults     from '../pages/patient/labResults/PatientLabResultList';
import PatientInvoices       from '../pages/patient/invoices/PatientInvoiceList';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"        element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/"             element={<Navigate to="/login" replace />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index                      element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"           element={<AdminDashboard />} />
        <Route path="doctors"             element={<DoctorList />} />
        <Route path="doctors/create"      element={<DoctorCreate />} />
        <Route path="doctors/:id/edit"    element={<DoctorEdit />} />
        <Route path="patients"            element={<PatientList />} />
        <Route path="patients/create"     element={<PatientCreate />} />
        <Route path="patients/:id/edit"   element={<PatientEdit />} />
        <Route path="wards"               element={<WardList />} />
        <Route path="wards/:wardId/beds"  element={<BedList />} />
        <Route path="medicines"           element={<MedicineList />} />
        <Route path="lab-tests"           element={<LabTestList />} />
        <Route path="audit-logs"          element={<AuditLogList />} />
      </Route>

      {/* Doctor */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={["Doctor"]}>
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard"              element={<DoctorDashboard />} />
        <Route path="appointments"           element={<AppointmentList />} />
        <Route path="medical-records"        element={<MedicalRecordList />} />
        <Route path="medical-records/create/:appointmentId/:patientId" element={<MedicalRecordCreate />} />
        <Route path="prescriptions"          element={<PrescriptionList />} />
        <Route path="prescriptions/create"   element={<PrescriptionCreate />} />
        <Route path="lab-orders"             element={<LabOrderList />} />
        <Route path="lab-orders/create"      element={<LabOrderCreate />} />
      </Route>

      {/* Receptionist */}
      <Route
        path="/receptionist"
        element={
          <ProtectedRoute allowedRoles={['Receptionist']}>
            <ReceptionistLayout />
          </ProtectedRoute>
        }
      >
        {/* Patients */}
        <Route path="patients"          element={<ReceptionistPatientList />} />
        <Route path="patients/register" element={<ReceptionistPatientCreate />} />

        {/* Appointments */}
        <Route path="appointments"      element={<ReceptionistAppointmentList />} />
        <Route path="appointments/book" element={<AppointmentCreate />} />

        {/* Admissions */}
        <Route path="admissions"        element={<AdmissionList />} />
        <Route path="admissions/admit"  element={<AdmissionCreate />} />

        {/* Default redirect */}
        <Route index element={<Navigate to="appointments" replace />} />
      </Route>
      

      {/* Nurse */}
      <Route
        path="/nurse"
        element={
          <ProtectedRoute allowedRoles={['Nurse']}>
            <NurseLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<NurseDashboard />} />
        <Route path="admissions"   element={<AdmissionList />} />
        <Route path="ward-patients" element={<WardPatients />} />
      </Route>

      {/* Pharmacist */}
      <Route
        path="/pharmacist"
        element={
          <ProtectedRoute allowedRoles={['Pharmacist']}>
            <PharmacistLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="prescriptions" replace />} />
        <Route path="prescriptions" element={<PharmacistPrescriptionList />} />
        <Route path="medicines"     element={<PharmacistMedicineList />} />
        <Route path="low-stock"     element={<LowStockList />} />
      </Route>

      {/* Accountant */}
      <Route
        path="/accountant"
        element={
          <ProtectedRoute allowedRoles={['Accountant']}>
            <AccountantLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/accountant/dashboard" replace />} />
        <Route path="dashboard" element={<AccountantDashboard />} />
        <Route path="invoices" element={<InvoiceList />} />
      </Route>

      {/* Patient */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        {/* Default redirect to appointments */}
        <Route index element={<Navigate to="/patient/appointments" replace />} />
      
        <Route path="appointments"    element={<PatientAppointments />} />
        <Route path="medical-records" element={<PatientMedicalRecords />} />
        <Route path="prescriptions"   element={<PatientPrescriptions />} />
        <Route path="lab-results"     element={<PatientLabResults />} />
        <Route path="invoices"        element={<PatientInvoices />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
