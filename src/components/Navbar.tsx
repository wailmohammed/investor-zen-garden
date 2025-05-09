
import { Button } from "@/components/ui/button";
import { Search, User, Mail, Calendar, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-finance-blue font-bold text-xl">InvestorZen</span>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link to="/dashboard" className="text-gray-700 hover:text-finance-blue px-3 py-2 text-sm font-medium">Dashboard</Link>
              <Link to="/portfolio" className="text-gray-700 hover:text-finance-blue px-3 py-2 text-sm font-medium">Portfolio</Link>
              <Link to="/payment/crypto" className="text-gray-700 hover:text-finance-blue px-3 py-2 text-sm font-medium">Payments</Link>
              
              {/* New links for our features */}
              {user && (
                <>
                  <Link to="/email-notifications" className="text-gray-700 hover:text-finance-blue px-3 py-2 text-sm font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    <span>Emails</span>
                  </Link>
                  <Link to="/tasks" className="text-gray-700 hover:text-finance-blue px-3 py-2 text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Tasks</span>
                  </Link>
                </>
              )}
              
              {user && <Link to="/admin" className="text-gray-700 hover:text-finance-blue px-3 py-2 text-sm font-medium">Admin</Link>}
            </nav>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="flex items-center md:ml-6">
                <button className="p-1 rounded-full text-gray-500 hover:text-finance-blue focus:outline-none">
                  <Search className="h-5 w-5" />
                </button>
                <div className="ml-4">
                  {user ? (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-700">{user.email}</span>
                      <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
                    </div>
                  ) : (
                    <>
                      <Button variant="outline" className="mr-2" onClick={() => navigate("/login")}>Sign In</Button>
                      <Button className="bg-finance-blue hover:bg-blue-700" onClick={() => navigate("/signup")}>Sign Up</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center md:hidden">
              <button className="p-2 rounded-md text-gray-500 hover:text-finance-blue focus:outline-none">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
