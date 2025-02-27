import logo1 from "../../assets/logo1.png";
import { MdHomeFilled, MdDashboard, MdShoppingCart, MdInventory, MdPeople, MdAnalytics } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Sidebar = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="md:flex-[2_2_0] w-32 max-w-64 ml-0 pl-6 min-w-[220px]">
      <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-gray-200 w-20 md:w-full bg-[#2C3E50] shadow-lg">
        {/* Logo */}
        <Link to="/" className="flex justify-center items-center pr-8">
          <img
            src={logo1}
            alt="Logo"
            className="w-36 h-32 rounded-full transition-transform duration-300 hover:scale-105"
          />
        </Link>

        {/* Navigation Links */}
        <ul className="flex flex-col gap-4 mt-4">
          {/* Dashboard */}
          <li className="flex justify-center md:justify-start">
            <Link
              to="/"
              className={`flex gap-3 items-center ${isActive('/') ? 'bg-[#34495E]' : 'hover:bg-[#34495E]'} text-white transition-all rounded-lg duration-300 py-2 pl-3 pr-5 max-w-fit cursor-pointer`}
            >
              <MdDashboard className="w-6 h-6 text-blue-200" />
              <span className="text-lg hidden md:block">Dashboard</span>
            </Link>
          </li>

          {/* Orders */}
          <li className="flex justify-center md:justify-start">
            <Link
              to="/orders"
              className={`flex gap-3 items-center ${isActive('/orders') ? 'bg-[#34495E]' : 'hover:bg-[#34495E]'} text-white transition-all rounded-lg duration-300 py-2 pl-3 pr-5 max-w-fit cursor-pointer`}
            >
              <MdShoppingCart className="w-6 h-6 text-green-200" />
              <span className="text-lg hidden md:block">Orders</span>
            </Link>
          </li>

          {/* Customers */}
          <li className="flex justify-center md:justify-start">
            <Link
              to="/customers"
              className={`flex gap-3 items-center ${isActive('/customers') ? 'bg-[#34495E]' : 'hover:bg-[#34495E]'} text-white transition-all rounded-lg duration-300 py-2 pl-3 pr-5 max-w-fit cursor-pointer`}
            >
              <MdPeople className="w-6 h-6 text-yellow-200" />
              <span className="text-lg hidden md:block">Customers</span>
            </Link>
          </li>

          {/* Products */}
          <li className="flex justify-center md:justify-start">
            <Link
              to="/products"
              className={`flex gap-3 items-center ${isActive('/products') ? 'bg-[#34495E]' : 'hover:bg-[#34495E]'} text-white transition-all rounded-lg duration-300 py-2 pl-3 pr-5 max-w-fit cursor-pointer`}
            >
              <MdInventory className="w-6 h-6 text-purple-200" />
              <span className="text-lg hidden md:block">Products</span>
            </Link>
          </li>
        </ul>

        {/* Profile Section */}
        {authUser && (
          <Link
            to={`/profile/${authUser.username}`}
            className="mt-auto mb-10 flex gap-2 items-center transition-all duration-300 hover:bg-[#3E5360] py-2 px-4 rounded-lg shadow-sm"
          >
            <div className="avatar hidden md:inline-flex">
              <div className="w-8 rounded-full">
                <img src={authUser?.profileImg || "/avatar-placeholder.png"} alt="Profile" />
              </div>
            </div>
            <div className="flex justify-between flex-1">
              <div className="hidden md:block">
                <p className="text-white font-bold text-sm truncate">{authUser?.fullName}</p>
                <p className="text-gray-400 text-sm">@{authUser?.username}</p>
              </div>
              <BiLogOut
                className="w-5 h-5 text-red-300 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
              />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;