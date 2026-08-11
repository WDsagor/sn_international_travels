import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Clients from "./pages/Clients";
import Users from "./pages/Users";
import Layout from "./components/Layouts";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/share/ProtectedRoute";
import AllClientList from "./pages/AllClientsList";
import Passports from "./pages/Passports";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/clients" element={<AllClientList />} />
            <Route path="/clients/:id?" element={<Clients />} />
            <Route path="/passports&visa" element={<Passports />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
