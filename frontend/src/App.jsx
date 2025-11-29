import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (!user) return <Login setUser={setUser} />;

  return (
    <>
      <button
        className="bg-red-600 text-white px-4 py-2 rounded absolute right-5 top-5"
        onClick={logout}
      >
        Logout
      </button>

      {user.role === "admin" ? (
        <AdminDashboard />
      ) : (
        <Dashboard user={user} />
      )}
    </>
  );
};

export default App;
