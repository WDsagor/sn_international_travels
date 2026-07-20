import React, { useState } from "react";
import Header from "./share/Header";
import Sidebar from "./share/Sidebar";

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // ১. w-full এবং min-h-screen নিশ্চিত করুন যাতে পুরো স্ক্রিন কাভার করে
    <div className="min-h-screen w-full bg-gray-50 text-gray-800 font-sans antialiased flex flex-col">
      {/* হেডার কম্পোনেন্ট */}
      <Header isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* --- MAIN BODY CONTAINER --- */}
      {/* ২. এখানে flex flex-row বা শুধু flex এবং w-full নিশ্চিত করুন। কোনো justify-between রাখা যাবে না */}
      <div className="pt-16 flex flex-1 w-full relative">
        {/* সাইডবার কম্পোনেন্ট */}
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

        {/* --- CONTENT WORKSPACE --- */}
        {/* ৩. flex-1 এবং bg-white বা bg-gray-50 দিয়ে দিন যাতে দুই পাশের কালো ভাব চলে যায় */}
        <main className="flex-1 w-full bg-gray-50 p-4 md:p-6 lg:p-8 min-w-0 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
