import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "./pages/Landing";
import AdminSignup from "./pages/admin/AdminSignup";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import ApprovalRules from "./pages/admin/ApprovalRules";
import EmployeeSignup from "./pages/employee/EmployeeSignup";
import EmployeeLogin from "./pages/employee/EmployeeLogin";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import NewClaim from "./pages/employee/NewClaim";
import ViewClaim from "./pages/employee/ViewClaim";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ReviewClaim from "./pages/manager/ReviewClaim";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<EmployeeManagement />} />
          <Route path="/admin/approval-rules" element={<ApprovalRules />} />
          <Route path="/employee/signup" element={<EmployeeSignup />} />
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/new-claim" element={<NewClaim />} />
          <Route path="/employee/claim/:id" element={<ViewClaim />} />
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/review/:id" element={<ReviewClaim />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
