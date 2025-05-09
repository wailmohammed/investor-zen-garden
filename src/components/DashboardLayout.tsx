
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Settings, LayoutDashboard, ChartPie, BarChart, History, Search, User, Mail, Calendar, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const menuItems = [
    { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-2" />, href: "/dashboard" },
    { label: "Portfolio", icon: <ChartPie className="w-5 h-5 mr-2" />, href: "/portfolio" },
    { label: "Market", icon: <BarChart className="w-5 h-5 mr-2" />, href: "/market" },
    { label: "Payments", icon: <History className="w-5 h-5 mr-2" />, href: "/payment/crypto" },
    { label: "Email Notifications", icon: <Mail className="w-5 h-5 mr-2" />, href: "/email-notifications" },
    { label: "Tasks", icon: <Calendar className="w-5 h-5 mr-2" />, href: "/tasks" },
    { label: "Admin", icon: <Settings className="w-5 h-5 mr-2" />, href: "/admin" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200">
          <div className="p-4 space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center p-3 rounded-md text-sm font-medium",
                  isActive(item.href) 
                    ? "bg-finance-blue text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </aside>

        {/* Mobile sidebar */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="fixed top-4 left-4 z-40">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col space-y-4 mt-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center p-3 rounded-md text-sm font-medium",
                      isActive(item.href) 
                        ? "bg-finance-blue text-white" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          {/* User dropdown in top right */}
          <div className="flex justify-end mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  <span>{user?.email?.split('@')[0]}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
};

import { cn } from "@/lib/utils";

export default DashboardLayout;
