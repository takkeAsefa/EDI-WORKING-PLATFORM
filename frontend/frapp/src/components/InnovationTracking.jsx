import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, innovationAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Lightbulb, TrendingUp, Users, Target } from 'lucide-react';

const InnovationTracking = () => {
  const { user } = useAuth();
  const [innovations, setInnovations] = useState([]);
  const [innovators, setInnovators]= useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]= useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogOpenForInnovation, setIsDialogOpenForInnovation]=useState(false)
  const [newInnovation, setNewInnovation] = useState({
    innovator: '',
    description: '',
    title: ''
  });
const [newInnovator, setNewInnovator]=useState({

  email:'',
  first_name:'',
  middle_name:'',
  last_name:'',
  sex:'',
  phone_number:'',

})
  useEffect(() => {
    fetchInnovations();
  }, []);

  const fetchInnovations = async () => {
   setLoading(true);
    try {
      const [innovatorResponses, innovationResponses]= await Promise.all([
        userAPI.getInnovators(),
        innovationAPI.getInnovations(),
        // trainingAPI.getTrainingTypes()
      ]);
  
     const extractData = (response) => {
        console.log('API Response:', response); // Log the response for debugging
        // Prioritize response.data.results for paginated data
        if (response && typeof response === 'object' && Array.isArray(response.data?.results)) {
          return response.data.results;
        }
        // Fallback to response.results if data is directly under results (some APIs)
        else if (response && typeof response === 'object' && Array.isArray(response.results)) {
          return response.results;
        }
        // Fallback to response.data if it's a direct array (non-paginated, common for single resources)
        else if (response && typeof response === 'object' && Array.isArray(response.data)) {
          return response.data;
        }
        // Finally, check if the response itself is an array
        else if (Array.isArray(response)) {
          return response;
        }
        // If none of the above, return an empty array to prevent .map() errors
        return [];
      };

      setInnovators(extractData(innovatorResponses));
      setInnovations(extractData(innovationResponses));
      
    } catch (error) {
      setError('Failed to Fetch Innovations');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInnovator= async (e)=>{
    e.preventDefault();
    try {
      await userAPI.createInnovator(newInnovator);
      setIsDialogOpen(false);
      setNewInnovator({
        email:'',
        first_name:'',
        middle_name:'',
        last_name:'',
        sex:'',
        phone_number:'',
      });
      fetchInnovations();
    }
    catch(error){
      setError("Error creating A new innovator")
      console.log('Error Creating Innovator',error)
    }
  }

  const handleCreateInnovation = async (e) => {
    e.preventDefault();
    try {
      await innovationAPI.createInnovation(newInnovation);
      setIsDialogOpenForInnovation(false);
      setNewInnovation({
        innovator: '',
        description: '',
        title: ''
      });
      fetchInnovations();
    } catch (error) {
      console.error('Error creating innovation:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading innovations...</div>
        </div>
      </div>
    );
  }

  // Only admin can access this feature
  if (user?.role === '') {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Innovation tracking is only available to administrators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Admin Access Required</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Please contact your administrator for access to innovation tracking.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
          {/* <div>
            <h1 className="text-3xl font-bold">Innovation Tracking</h1>
            <p className="text-muted-foreground">Track and manage innovation projects and ideas</p>
          </div> */}
          <>
            {( user?.role==='rworker'|| user.role==='staff') && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Innovator
                  </Button>
                </DialogTrigger>
                <DialogContent className="h-120 overflow-y-auto border border-gray-300 rounded-lg p-4">
                  <DialogHeader>
                    <DialogTitle>Register New Innovator</DialogTitle>
                    <DialogDescription>
                      Create a new innovator. Fill in the details below.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateInnovator} className="space-y-4 overflow-y-auto">
                    <>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-2">
                              <Label htmlFor="first_name">First Name</Label>
                              <Input
                                id="first_name"
                                value={newInnovator.first_name}
                                onChange={(e) => setNewInnovator({...newInnovator, first_name: e.target.value})}
                                placeholder="Enter First Name"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="middle_name">Middle Name</Label>
                              <Input
                                id="middle_name"
                                value={newInnovator.middle_name}
                                onChange={(e) => setNewInnovator({...newInnovator, middle_name: e.target.value})}
                                placeholder="Enter Middle Name"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="last_name">GrandFather Name</Label>
                              <Input
                                id="last_name"
                                value={newInnovator.last_name}
                                onChange={(e) => setNewInnovator({...newInnovator, last_name: e.target.value})}
                                placeholder="Enter last Name"
                                required
                              />
                            </div>
                          </div>
                        </>
                      
                    
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type='email'
                              value={newInnovator.email}
                              onChange={(e) => setNewInnovator({...newInnovator, email: e.target.value})}
                              placeholder="enter email"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input
                              id="phone_number"
                              value={newInnovator.phone_number}
                              onChange={(e) => setNewInnovator({...newInnovator, phone_number: e.target.value})}
                              placeholder="Enter Telephone number"
                              required
                            />
                          </div>
                        </div>
                      

                        <div className="space-y-2">
                          <Label htmlFor="sex">Sex</Label>
                          <Select 
                            value={newInnovator.sex} 
                            onValueChange={(value) => setNewInnovator({...newInnovator, sex: value})}
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
                    

                      
                    
                    <DialogFooter>
                      <Button type="submit">Create Innovator</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </>

          <>
            <Dialog open={isDialogOpenForInnovation} onOpenChange={setIsDialogOpenForInnovation}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Innovation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Innovation</DialogTitle>
                  <DialogDescription>
                    Record a new innovation project or idea.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateInnovation} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Innovation Title</Label>
                    <Input
                      id="title"
                      value={newInnovation.title}
                      onChange={(e) => setNewInnovation({...newInnovation, title: e.target.value})}
                      placeholder="Enter innovation title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="innovator">Innovator</Label>
                    <Select 
                      value={newInnovation.innovator} 
                      onValueChange={(value) => setNewInnovation({...newInnovation, innovator: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="select a registered innovator" />
                      </SelectTrigger>
                      <SelectContent>
                        {innovators.map((innovator) => (
                          <SelectItem key={innovator.id} value={innovator.id.toString()}>
                            {innovator.first_name} {innovator.middle_name || 'N/A'} {innovator.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newInnovation.description}
                      onChange={(e) => setNewInnovation({...newInnovation, description: e.target.value})}
                      placeholder="Describe the innovation..."
                      rows={4}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Innovation</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Innovations</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{innovations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{innovations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Innovators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(innovations.map(i => i.innovator)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {innovations.filter(i => {
                const created = new Date(i.created_at || Date.now());
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Innovation Projects</CardTitle>
          <CardDescription>
            A list of all innovation projects and ideas in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {innovations.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No innovations yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start tracking innovations by adding your first project.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-blue-500">Title</TableHead>
                  <TableHead className="text-blue-500">First Name</TableHead>
                  <TableHead className="text-blue-500">Middle Name</TableHead>
                  <TableHead className="text-blue-500">Last Name</TableHead>
                  <TableHead className="text-blue-500">Phone</TableHead>
                  <TableHead className="text-blue-500">Description</TableHead>
                  
                </TableRow>
              </TableHeader>
              <TableBody>
                {innovations.map((innovation) => (
                  <TableRow key={innovation.id}>
                    <TableCell className="font-medium">{innovation.title}</TableCell>
                    <TableCell>
                      {innovation?.innovator_details?.first_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {innovation?.innovator_details?.middle_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {innovation.innovator_details?.last_name|| 'N/A'}
                    </TableCell>
                    <TableCell>
                      {innovation.innovator_details?.phone_number|| 'N/A'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{innovation.description}</TableCell>
                   
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InnovationTracking;