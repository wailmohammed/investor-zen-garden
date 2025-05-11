
import {
  LayoutDashboard,
  Settings,
  User,
  CreditCard,
  Mail,
  Calendar,
  HelpCircle,
  LogOut,
  Database,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 z-50 flex h-full w-64 flex-col border-r bg-white transition-transform lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="font-bold text-xl">
            FinanceGPT
          </Link>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={toggleSidebar}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          <Link
            to="/dashboard"
            className={`flex items-center rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 ${
              pathname === "/dashboard" ? "bg-gray-100 font-medium" : ""
            }`}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Link>

          <Link
            to="/admin"
            className={`flex items-center rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 ${
              pathname === "/admin" ? "bg-gray-100 font-medium" : ""
            }`}
          >
            <Settings className="mr-3 h-5 w-5" />
            Admin
          </Link>

          <Link
            to="/payment/crypto"
            className={`flex items-center rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 ${
              pathname === "/payment/crypto" ? "bg-gray-100 font-medium" : ""
            }`}
          >
            <CreditCard className="mr-3 h-5 w-5" />
            Crypto Payment
          </Link>

          <Link
            to="/email-notifications"
            className={`flex items-center rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 ${
              pathname === "/email-notifications" ? "bg-gray-100 font-medium" : ""
            }`}
          >
            <Mail className="mr-3 h-5 w-5" />
            Email Notifications
          </Link>

          <Link
            to="/tasks"
            className={`flex items-center rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 ${
              pathname === "/tasks" ? "bg-gray-100 font-medium" : ""
            }`}
          >
            <Calendar className="mr-3 h-5 w-5" />
            Tasks
          </Link>

          <Link
            to="/brokers"
            className={`flex items-center rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 ${
              pathname === "/brokers" ? "bg-gray-100 font-medium" : ""
            }`}
          >
            <Database className="mr-3 h-5 w-5" />
            Data Integration
          </Link>
        </nav>

        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-8 w-full items-center justify-center gap-2 rounded-md p-0 text-sm font-normal">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline-block">
                  {user?.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b p-4 lg:hidden">
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={toggleSidebar}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="font-semibold">{user?.email}</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
