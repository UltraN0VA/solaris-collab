import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SolarisLandingPage from './pages/Auth/landingpage';
import LoginPage from './pages/Auth/loginpage';
import RegisterPage from './pages/Auth/registerpage';
import ForgotPage from './pages/Auth/forgotpage';
import Dashboard from "./pages/Dashboard_Layout/dashboard";
import SetupAccount from './pages/Customer/setupacc';

// Admin Pages
import AdminDashboard from './pages/Admin/dashboard';
import SiteAssessment from './pages/Admin/siteassessment';
import Project from './pages/Admin/project';
import Billing from './pages/Admin/billing';
import IoTDevice from './pages/Admin/iotdevice';
import Reports from './pages/Admin/reports';
import UserManagement from './pages/Admin/usermanagement';
import Settings from './pages/Admin/settings';

// Customer Pages
import CustomerDashboard from './pages/Customer/dashboard';
import ScheduleAssessment from './pages/Customer/scheduleassessment';
import MyProject from './pages/Customer/myproject';
import Quotation from './pages/Customer/quotation';
import SystemPerformance from './pages/Customer/systemperformance';
import CustomerReports from './pages/Customer/reports';
import Supports from './pages/Customer/supports';
import CustomerProfile from './pages/Customer/profile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SolarisLandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgotpassword" element={<ForgotPage />} />
        
        {/* Setup Route - Outside Dashboard */}
        <Route path="/setup" element={<SetupAccount />} />
        
        {/* Dashboard Layout with Nested Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          {/* Admin Routes */}
          <Route index element={<AdminDashboard />} />
          <Route path="siteassessment" element={<SiteAssessment />} />
          <Route path="project" element={<Project />} />
          <Route path="billing" element={<Billing />} />
          <Route path="iotdevice" element={<IoTDevice />} />
          <Route path="reports" element={<Reports />} />
          <Route path="usermanagement" element={<UserManagement />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Customer Routes */}
          <Route path="customerdashboard" element={<CustomerDashboard />} />
          <Route path="schedule" element={<ScheduleAssessment />} />
          <Route path="customerproject" element={<MyProject />} />
          <Route path="customerbilling" element={<Quotation />} />
          <Route path="performance" element={<SystemPerformance />} />
          <Route path="customerreports" element={<CustomerReports />} />
          <Route path="support" element={<Supports />} />
          <Route path="customerprofile" element={<CustomerProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;