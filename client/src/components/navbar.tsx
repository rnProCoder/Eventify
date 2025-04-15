import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, ChevronDown, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-gray-900">EventHub</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <a className={`text-gray-700 hover:text-primary font-medium ${location === '/' ? 'text-primary' : ''}`}>
              Home
            </a>
          </Link>
          <Link href="/events">
            <a className={`text-gray-700 hover:text-primary font-medium ${location.startsWith('/events') ? 'text-primary' : ''}`}>
              Events
            </a>
          </Link>
          {user && (
            <Link href="/create-event">
              <a className={`text-gray-700 hover:text-primary font-medium ${location === '/create-event' ? 'text-primary' : ''}`}>
                Create Event
              </a>
            </Link>
          )}
          {user && (
            <Link href="/dashboard">
              <a className={`text-gray-700 hover:text-primary font-medium ${location === '/dashboard' ? 'text-primary' : ''}`}>
                Dashboard
              </a>
            </Link>
          )}
        </div>
        
        {user ? (
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-sm focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-gray-700 hidden sm:inline">{user.firstName} {user.lastName}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/dashboard">
                  <DropdownMenuItem>
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button variant="ghost" className="text-primary hover:text-primary-dark font-medium">
                Log In
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-primary hover:bg-primary-dark text-white font-medium shadow-sm transition duration-150 ease-in-out">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-3 border-t border-gray-200">
          <Link href="/">
            <a className="block py-2 text-gray-700 hover:text-primary font-medium">
              Home
            </a>
          </Link>
          <Link href="/events">
            <a className="block py-2 text-gray-700 hover:text-primary font-medium">
              Events
            </a>
          </Link>
          {user && (
            <Link href="/create-event">
              <a className="block py-2 text-gray-700 hover:text-primary font-medium">
                Create Event
              </a>
            </Link>
          )}
          {user && (
            <Link href="/dashboard">
              <a className="block py-2 text-gray-700 hover:text-primary font-medium">
                Dashboard
              </a>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
