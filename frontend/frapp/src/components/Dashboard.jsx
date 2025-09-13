import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import getNavigationItems from './Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  CreditCard, 
  Lightbulb, 
  Shield,
  LogOut,
  User,
  Link
} from 'lucide-react';
import { redirect } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();

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

  const getAvailableFeatures = () => {
    const features = [];
    
    if (user?.role === 'admin') {
      features.push(
        { icon: Users, title: 'User Management', description: 'Manage staff members and system users' },
        { icon: GraduationCap, title: 'Training Management', description: 'Oversee all training programs' },
        { icon: FileText, title: 'Contract Management', description: 'Manage training contracts' },
        { icon: CreditCard, title: 'Payment Management', description: 'Handle payment approvals' },
        { icon: Lightbulb, title: 'Innovation Tracking', description: 'Track innovation projects' },
        { icon: Shield, title: 'Warranty Management', description: 'Manage warranty records' }
      );
    } else if (user?.role === 'staff') {
      features.push(
        { icon: Users, title: 'Register Users', description: 'Register trainers and regional workers' },
        { icon: GraduationCap, title: 'Training Management', description: 'Manage training programs' },
        { icon: FileText, title: 'Contract Management', description: 'Create and manage contracts' },
        { icon: Lightbulb, title: 'Innovation Tracking', description: 'Track innovation projects' },
        { icon: CreditCard, title: 'Payment Approval', description: 'Approve payment requests' }
      );
    } else if (user?.role === 'trainer') {
      features.push(
        { icon: GraduationCap, title: 'My Training Sessions', description: 'Manage your training sessions' },
        { icon: Users, title: 'Training Applications', description: 'Review training applications' },
        { icon: Lightbulb, title: 'Innovation Tracking', description: 'Track innovation projects' },
        { icon: FileText, title: 'Certificates', description: 'Issue training certificates' }
      );
    } else if (user?.role === 'rworker') {
      features.push(
        { icon: GraduationCap, title: 'Regional Training', description: 'Manage regional training programs' },
        { icon: Lightbulb, title: 'Innovation Tracking', description: 'Track innovation projects' },
        // { icon: CreditCard, title: 'Payment Requests', description: 'Submit payment requests' }
      );
    } else if (user?.role === 'trainee') {
      features.push(
        { icon: GraduationCap, title: 'Available Training', description: 'Browse available training programs' },
        { icon: FileText, title: 'My Certificates', description: 'View your certificates' },
        { icon: User, title: 'Profile', description: 'Manage your profile' }
      );
    }
    
    return features;
  };

  const features = getAvailableFeatures();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-0 py-0">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>
                Access your training management tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 text-ornage-500 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg text-ornage-500 ">{feature.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-gray-600">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Training
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">56</div>
              <p className="text-xs text-gray-600">+8% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Certificates Issued
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">789</div>
              <p className="text-xs text-gray-600">+15% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-gray-600">-5% from last month</p>
            </CardContent>
          </Card>
        </div> */}
      </main>
    </div>
  );
};

export default Dashboard;

