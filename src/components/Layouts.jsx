import React, { useState } from "react";
import Header from "./share/Header";
import Sidebar from "./share/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-800 font-sans antialiased flex flex-col">
      <Header isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="pt-16 flex flex-1 w-full relative">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

        <main className="flex-1 w-full bg-gray-50 p-4 md:p-6 lg:p-8 min-w-0 min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
