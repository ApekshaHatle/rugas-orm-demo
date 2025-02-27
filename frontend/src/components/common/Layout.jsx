import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Toaster } from "react-hot-toast";

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;