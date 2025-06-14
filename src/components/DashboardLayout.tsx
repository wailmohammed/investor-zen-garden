
import {
  BarChart3,
  Building2,
  DollarSign,
  LayoutDashboard,
  PieChart,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { useState } from "react";
import { useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MainNav } from "@/components/main-nav";
import { NavItem } from "@/types";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, current: location.pathname === '/dashboard' },
    { name: 'Portfolio', href: '/portfolio', icon: PieChart, current: location.pathname === '/portfolio' },
    { name: 'Dividends', href: '/dividends', icon: DollarSign, current: location.pathname === '/dividends' },
    { name: 'Stock Screener', href: '/stock-screening', icon: Search, current: location.pathname === '/stock-screening' },
    { name: 'Brokers', href: '/broker-integration', icon: Building2, current: location.pathname === '/broker-integration' },
    { name: 'Settings', href: '/settings', icon: Settings, current: location.pathname === '/settings' },
  ];

  return (
    <div className="flex h-screen antialiased text-foreground bg-background">
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="p-0">
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-60 border-right p-0">
          <ScrollArea className="py-6 pl-4 pr-2">
            <Link to="/dashboard" className="flex items-center gap-2 px-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/01.png" alt="Your Avatar" />
                <AvatarFallback>YM</AvatarFallback>
              </Avatar>
              <span className="font-bold">YourMoney.ai</span>
            </Link>
            <Separator className="my-6" />
            <MainNav className="px-4" items={navigation} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex h-8 w-full items-center justify-between rounded-md px-2">
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="mt-auto px-4">
              <ThemeToggle />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <div className="hidden md:flex flex-col w-60 border-right">
        <ScrollArea className="py-6 pl-4 pr-2">
          <Link to="/dashboard" className="flex items-center gap-2 px-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/01.png" alt="Your Avatar" />
              <AvatarFallback>YM</AvatarFallback>
            </Avatar>
            <span className="font-bold">YourMoney.ai</span>
          </Link>
          <Separator className="my-6" />
          <MainNav className="px-4" items={navigation} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-8 w-full items-center justify-between rounded-md px-2">
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="mt-auto px-4">
            <ThemeToggle />
          </div>
        </ScrollArea>
      </div>
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
