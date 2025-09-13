import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  CreditCard, 
  Lightbulb, 
  Shield,
  LogOut,
  Home,
  Building
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      case 'trainer':
        return 'bg-green-100 text-green-800';
      case 'rworker':
        return 'bg-purple-100 text-purple-800';
      case 'trainee':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNavigationItems = () => {
    const items = [
      { path: '/dashboard', icon: Home, label: 'Dashboard' },
    ];
    
    if (user?.role === 'admin' || user?.role === 'staff') {
      items.push(
        { path: '/users', icon: Users, label: 'User Management' },
        { path: '/training', icon: GraduationCap, label: 'Training Management' },
        { path: '/contracts', icon: FileText, label: 'Contracts' },
        { path: '/payments', icon: CreditCard, label: 'Payments' },
        { path: '/certificates', icon: FileText, label: 'Certificates' },
        { path: '/innovations', icon: Lightbulb, label: 'Innovations' },
        
      );
    }
    
    if (user?.role === 'admin') {
      items.push(

        { path: '/warranties', icon: Shield, label: 'Warranties' }
      );
    }
    
    if (user?.role === 'trainer') {
      items.push(
        { path: '/training', icon: GraduationCap, label: 'Training' },
        
        { path: '/contracts', icon: FileText, label: 'Contracts' },
        { path: '/payments', icon: CreditCard, label: 'Payments' },
        { path: '/certificates', icon: FileText, label: 'Certificates' },
        
      );
    }
    
    if (user?.role === 'rworker') {
      items.push(
        { path: '/training', icon: GraduationCap, label: 'Regional Training' },
         { path: '/innovations', icon: Lightbulb, label: 'Innovations' }
      );
    }
    
    if (user?.role === 'trainee') {
      items.push(
        { path: '/courses', icon: GraduationCap, label: 'Training Course' },
        { path: '/certificates', icon: FileText, label: 'My Certificates' }
      );
    }
    
    return items;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-500">
                EDI Working...
              </h1>
              <p className="text-sm text-orange-400">
                Welcome back, {user?.first_name} {user?.last_name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={getRoleColor(user?.role)}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </Badge>
              <Button className='border-red-500 text-red-500' variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2 text-red-500 " />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

