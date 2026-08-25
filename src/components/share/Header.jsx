import { Menu, X, Bell } from "lucide-react";

import snLogo from "../../assets/images/SN-logo.png";

const Header = ({ isOpen, setIsOpen }) => {
  const user = localStorage.getItem("user");
  const userData = JSON.parse(user);
  // console.log(userData?.fullName);
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-2">
          {/* <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-200">

            SN
          </div> */}
          <img className="w-8" src={snLogo} alt="logo" />
          <span className="text-lg font-bold text-blue-600 hidden sm:block uppercase">
            International Travels
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 relative rounded-full hover:bg-gray-50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="h-6 w-px bg-gray-200 hidden sm:block" />
        <div className="flex items-center gap-2.5 p-1.5 rounded-lg">
          <div className="w-8 h-8 relative rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs">
            {userData?.fullName?.charAt(0)}
            <span
              className={`absolute top-0 right-0 w-2 h-2 ${userData?.status === "active" ? " bg-green-600" : " bg-red-600"} rounded-full`}
            />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xx font-bold text-gray-900 leading-none">
              {userData?.fullName}
            </p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
              {userData?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
