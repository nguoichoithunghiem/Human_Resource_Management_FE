import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import EmployeeList from "./pages/Employee/EmployeeList";
import PositionList from "./pages/Position/PositionList";
import DepartmentList from "./pages/Department/DepartmentList";
import ContractList from "./pages/Contract/ContractList";
import AttendanceList from "./pages/Attendance/AttendanceList";
import UserList from "./pages/User/UserList";
import LeaveList from "./pages/Leave/LeaveList";
import PayrollList from "./pages/Payroll/PayrollList";
import RoleList from "./pages/Role/RoleList";
import SalaryHistoryList from "./pages/SalaryHistory/SalaryHistoryList";
import AnnouncementList from "./pages/Announcement/AnnouncementList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EmployeeList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/positions"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PositionList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DepartmentList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contracts"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ContractList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendances"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AttendanceList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UserList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <MainLayout>
                <LeaveList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payrolls"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PayrollList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <MainLayout>
                <RoleList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/salaryHistories"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SalaryHistoryList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AnnouncementList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
