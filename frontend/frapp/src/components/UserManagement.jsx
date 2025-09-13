import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, departmentAPI } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, UserCircleIcon,UserPlus, Building,
  Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const UserManagement = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [rworkers, setRworkers] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [activeTab, setActiveTab] = useState('staff'); // Track which tab is active
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    phone_number: '',
    role: 'trainee',
    sex: '',
    password: '',
    password_confirm: '',
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Number of users per page
  const [totalUsers, setTotalUsers] = useState(2);

  

  // Reset currentPage when activeTab or filterRole changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterRole]);

  useEffect(() => {
    fetchData();
  }, [currentPage, filterRole, activeTab]); // Refetch data when currentPage, filterRole, or activeTab changes

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Pass pagination parameters to API calls
      const params = {
        page: currentPage,
        limit: usersPerPage,
        search: searchTerm, // Add search term to backend params
        role: filterRole === 'all' ? undefined : filterRole, // Only send role if not 'all'
      };
      
      // Fetch data based on active tab
      if (activeTab === 'staff' && user?.role === 'admin') {
        const result = await userAPI.getStaff();
        const extractedData = extractData(result);
        setStaff(extractedData);
      } else if (activeTab === 'trainers' && (user?.role === 'admin' || user?.role === 'staff')) {
        const result = await userAPI.getTrainers();
        const extractedData = extractData(result);
        setTrainers(extractedData);
      } else if (activeTab === 'rworkers' && (user?.role === 'admin' || user?.role === 'staff')) {
        const result = await userAPI.getRworkers();
        const extractedData = extractData(result);
        setRworkers(extractedData);
      } else if (activeTab === 'trainees' && (user?.role === 'admin' || user?.role === 'staff')) {
        const result = await userAPI.getTrainees();
        const extractedData = extractData(result);
        setTrainees(extractedData);
      }
      
      // Always fetch departments if needed (departments don't need pagination)
      if (user?.role === 'admin' || user?.role === 'staff') {
        const deptResult = await departmentAPI.getDepartments();
        setDepartments(extractData(deptResult, false)); // false means don't set totalUsers
      }
      
    } catch (error) {
      setError('Failed to fetch user data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractData = (result, setTotal = true) => {
    if (Array.isArray(result?.data?.results)) {
      if (result.data.count !== undefined && setTotal) {
        setTotalUsers(result.data.count);
      }
      return result.data.results;
    } else if (Array.isArray(result?.results)) {
      if (result.count !== undefined && setTotal) {
        setTotalUsers(result.count);
      }
      return result.results;
    } else if (Array.isArray(result?.data)) {
      if (setTotal) {
        setTotalUsers(result.data.length); 
      }
      return result.data;
    } else if (Array.isArray(result)) {
      if (setTotal) {
        setTotalUsers(result.length);
      }
      return result;
    }
    return [];
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      if (newUser.password !== newUser.password_confirm) {
        setError("Passwords don't match");
        return;
      }
      await userAPI.createUser(newUser);
      setIsDialogOpen(false);
      setNewUser({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        phone_number: '',
        role: 'trainee',
        sex:'',
        password: '',
        password_confirm: '',
      });
      fetchData();
    } catch (error) {
      setError('username or email already exist! create other');
      console.error('Error creating user:', error);
    }
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      case 'trainer':
        return 'bg-pink-100 text-green-800';
      case 'rworker':
        return 'bg-purple-100 text-purple-800';
      case 'trainee':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';


      case 'male':
        return 'bg-blue-100 text-blue-800';
      case 'female':
        return 'bg-pink-100 text-pink-800';

       
    }
  };

  const UserTable = ({ users, title }) => {
    const filteredUsers = searchTerm ? users.filter(user =>
      (user.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) : users;
      // Pagination logic of trainingSessions
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>
            Manage {title.toLowerCase()} in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-blue-500">First Name</TableHead>
                <TableHead className="text-blue-500">Last Name</TableHead>
                <TableHead className="text-blue-500">Username</TableHead>
                <TableHead className="text-blue-500">Email</TableHead>
                <TableHead className="text-blue-500">Phone</TableHead>
                <TableHead className="text-blue-500">Sex</TableHead>
                <TableHead className="text-blue-500">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.first_name || 'N/A'}
                  </TableCell>
                  <TableCell>{user.last_name || 'N/A'}</TableCell>
                  <TableCell>{user.username || 'N/A'}</TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>{user.phone_number || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user?.sex)}>
                      {(user.sex?.charAt(0).toUpperCase() + user.sex?.slice(1)).toString()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  

  if (loading) {
    return (
      <div className="flex items-center justify-center p-1">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-blue-500">Users</h1>
          {/* <p className="text-gray-600">Manage users and their roles in the system</p> */}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select 
            value={filterRole} 
            onValueChange={(value) => setFilterRole(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="trainer">Trainer</SelectItem>
              <SelectItem value="rworker">Regional Worker</SelectItem>
              <SelectItem value="trainee">Trainee</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the training system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={newUser.first_name}
                      onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middle_name">Middle Name</Label>
                    <Input
                      id="middle_name"
                      value={newUser.middle_name}
                      onChange={(e) => setNewUser({...newUser, middle_name: e.target.value})}
                      
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={newUser.last_name}
                      onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={newUser.phone_number}
                      onChange={(e) => setNewUser({...newUser, phone_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={newUser.role} 
                      onValueChange={(value) => setNewUser({...newUser, role: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {user?.role === 'admin' && (
                          <SelectItem value="staff">Staff</SelectItem>
                        )}
                        {(user?.role === 'admin' || user?.role === 'staff') && (
                          <>
                            <SelectItem value="trainer">Trainer</SelectItem>
                            <SelectItem value="rworker">Regional Worker</SelectItem>
                          </>
                        )}
                        <SelectItem value="trainee">Trainee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sex">Sex</Label>
                    <Select 
                      value={newUser.sex} 
                      onValueChange={(value) => setNewUser({...newUser, sex: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password_confirm">Confirm Password</Label>
                    <Input
                      id="password_confirm"
                      type="password"
                      value={newUser.password_confirm}
                      onChange={(e) => setNewUser({...newUser, password_confirm: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create User</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {user?.role === 'admin' && (
            <TabsTrigger  className="text-blue-500" value="staff">Staff</TabsTrigger>
          )}
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <>
              <TabsTrigger  className="text-blue-500" value="trainers">Trainers</TabsTrigger>
              <TabsTrigger  className="text-blue-500"value="rworkers">Regional Workers</TabsTrigger>
              <TabsTrigger  className="text-blue-500" value="trainees">Trainees</TabsTrigger>
            </>
          )}
        </TabsList>

        {user?.role === 'admin' && (
          <TabsContent value="staff">
            <UserTable users={staff} title="Staff Members" />
          </TabsContent>
        )}

        {(user?.role === 'admin' || user?.role === 'staff') && (
          <>
            <TabsContent className="text-blue-500" value="trainers">
              <UserTable  users={trainers} title="Trainers" />
            </TabsContent>
            <TabsContent value="rworkers">
              <UserTable users={rworkers} title="Regional Workers" />
            </TabsContent>
            <TabsContent value="trainees">
              <UserTable users={trainees} title="Trainees" />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default UserManagement;

