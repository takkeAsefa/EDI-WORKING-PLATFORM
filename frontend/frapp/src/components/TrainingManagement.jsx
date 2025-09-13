import React, { useMemo,useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentAPI, trainingAPI } from '../lib/api';
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
import { GraduationCap, Plus, Calendar, MapPin, User, CheckCircle,CircleArrowOutDownRightIcon, ChevronLeft,ChevronRight, XCircle, Loader2, Search } from 'lucide-react';

const TrainingManagement = () => {
  const { user } = useAuth();
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [applications, setApplications] = useState([]);
  // const [certificates, setCertificates] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterType, setFilterType] = useState('all');

  const [loading, setLoading] = useState(true);
  const [isDisabled, setIsDisabled]= useState(false);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTraining, setNewTraining] = useState({
    training_id: '',
    training_type: '',
    given_by_name:'',
    given_date: '',
    end_date: '',
    given_by_name:'',
    given_location: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // certificatesRes
      const [sessionsRes, typesRes, applicationsRes, ] = await Promise.all([
        trainingAPI.getTrainingSessions(),
        trainingAPI.getTrainingTypes(),
        trainingAPI.getApplications(),
        // trainingAPI.getCertificates(),
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

      setTrainingSessions(extractData(sessionsRes));
      setTrainingTypes(extractData(typesRes));
      setApplications(extractData(applicationsRes));
      // setCertificates(extractData(certificatesRes));
    } catch (error) {
      setError('Failed to fetch training data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTraining = async (e) => {
    e.preventDefault();
    try {
      await trainingAPI.createTrainingSession(newTraining);
      setIsDialogOpen(false);
      setNewTraining({
        training_id: '',
        training_type: '',
        given_date: '',
        end_date: '',
        given_by_name:'',
        given_location: '',
      });
      fetchData();
    } catch (error) {
      setError('Failed to create training session');
      console.error('Error creating training:', error);
    }
  };

  const handleRequestPayment=async(id)=>{
    try{
      await paymentAPI.requestPayment(id);
      
    }catch (error){
      setError('YOU HAVE ALREADY REQUESTED.! CHECK YOUR PAYMENTS!');
      console.error("Error:",error);
    }

  };
  const handleApproveApplication = async (id) => {
    try {
      await trainingAPI.approveApplication(id);
      fetchData();
    } catch (error) {
      setError('Failed to approve application');
      console.error('Error approving application:', error);
    }
  };

  const handleRejectApplication = async (id) => {
    try {
      await trainingAPI.rejectApplication(id);
      fetchData();
    } catch (error) {
      setError('Failed to reject application');
      console.error('Error rejecting application:', error);
    }
  };
  const handleApply = async (trn) => {
    try {
      await trainingAPI.applyApplication(trn);
      fetchData();
    } catch (error) {
      setError('you have already applied for this training');
      console.error('Error apply application:', error);
    }
  };
  const handleComplete= async(id)=>{
    try {
      await trainingAPI.completeApplication(id);
      fetchData();
      
    }catch(error){
      setError("something wants wrong application completion");
      console.error('Error while marking As Complete a tr_appn');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredSessions = useMemo(() => {
    let filtered=trainingSessions;
    if(searchTerm){
      filtered=filtered.filter(session =>
      (session.training_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.training_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.given_by_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.given_location.toLowerCase().includes(searchTerm.toLowerCase()))
    // (filterType === 'all' || session.training_type_id.toString() === filterType)
);
    }
  if (filterType !== 'all') {
      filtered = filtered.filter(session => session.training_type_name === statusFilter);
    }
    return filtered; 
  }, 
  [trainingSessions, searchTerm, filterType]);

  const filteredApplications = useMemo(() => {
    let filtered=applications;
    if(searchTerm){
      filtered=filtered.filter(application =>
    (application.training_details.training_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.training_details.training_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.trainer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.training_details.given_location.toLowerCase().includes(searchTerm.toLowerCase())||
    application.status.toLowerCase().includes(searchTerm.toLowerCase()))
    // (filterType === 'all' || session.training_type_id.toString() === filterType)
);
    }
  if (filterType !== 'all') {
      filtered = filtered.filter(application => 
        application.training_details.training_type_name === statusFilter);
    }
    return filtered; 
  }, 
  [applications, searchTerm, filterType]);

  // Pagination logic of trainingSessions
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSessions = filteredSessions.slice(startIndex, endIndex);
  
    // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    }, 
    [searchTerm, filterType]
  );

  // Pagination logic of trainingSessions
  const totalPagesapplication = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndexapplication = (currentPage - 1) * itemsPerPage;
  const endIndexapplication = startIndexapplication + itemsPerPage;
  const currentApplication = filteredApplications.slice(startIndexapplication, endIndexapplication);
  
    // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    }, 
    [searchTerm, filterType]
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-blue-500">Training</h1>
          {/* <p className="text-gray-600">Manage training sessions, applications,</p> */}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search trainings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
         
          {( user?.role === 'staff' || user?.role === 'admin' ||user.role==='rworker') && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Training Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Training Session</DialogTitle>
                  <DialogDescription>
                    Add a new training session to the system
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTraining} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="training_id">Training ID</Label>
                    <Input
                      id="training_id"
                      value={newTraining.training_id}
                      onChange={(e) => setNewTraining({...newTraining, training_id: e.target.value})}
                      placeholder="e.g., ETW-2025-0101(YYYY-MMDDs)"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="training_type">Training Type</Label>
                    <Select 
                      value={newTraining.training_type} 
                      onValueChange={(value) => setNewTraining({...newTraining, training_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select training type" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainingTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.training_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="given_date">Start Date</Label>
                      <Input
                        id="given_date"
                        type="date"
                        value={newTraining.given_date}
                        onChange={(e) => setNewTraining({...newTraining, given_date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={newTraining.end_date}
                        onChange={(e) => setNewTraining({...newTraining, end_date: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="given_location">Location</Label>
                    <Input
                      id="given_location"
                      value={newTraining.given_location}
                      onChange={(e) => setNewTraining({...newTraining, given_location: e.target.value})}
                      placeholder="Training location"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Training</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          
          <TabsTrigger value="sessions" className="text-blue-500" >Sessions</TabsTrigger>
          <TabsTrigger value="applications" className="text-blue-500">Applications</TabsTrigger>
          
          {/* <TabsTrigger value="certificates">Certificates</TabsTrigger> */}
        </TabsList>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                <GraduationCap className="h-5 w-5" />
                Training Sessions
              </CardTitle>
              <CardDescription>
                Manage training sessions and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-blue-500">Training ID</TableHead>
                    <TableHead className="text-blue-500">Type</TableHead>
                    <TableHead className="text-blue-500">Launched By</TableHead>
                    <TableHead className="text-blue-500">Start Date</TableHead>
                    <TableHead className="text-blue-500">End Date</TableHead>
                    <TableHead className="text-blue-500">Location</TableHead>
                    {(user.role==='trainer')&&
                     <TableHead className="text-green-500">Action</TableHead>}
                     
                
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.training_id}</TableCell>
                      <TableCell>{session.training_type_name}</TableCell>
                      <TableCell>{session.given_by_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.given_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.end_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {session.given_location}
                        </div>
                      </TableCell>

                      <TableCell>
                        {(user?.role==='trainer')&&
                        (<div className="flex space-x-2 text-green-800">
                            <Button
                              size="sm"
                              className="text-green-800 bg-blue-200 border-blue-500"
                              variant="outline"
                              onClick={() => handleApply(session.id)}
                              disabled={(new Date(session.given_date)<= new Date())}
                              
                              
                            >
                              <CheckCircle className=" h-4 w-4 mr-1 " />
                              Apply
                            </Button>
                          </div>
                        
                        )}
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
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Training Applications
              </CardTitle>
              <CardDescription>
                Review and manage training applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-blue-500">Training</TableHead>
                    <TableHead className="text-blue-500">Trainer</TableHead>
                    <TableHead className="text-blue-500">Applied Date</TableHead>
                    <TableHead className="text-blue-500">Status</TableHead>
                    {(user.role==='staff'|| user.role==='admin')&&
                    <TableHead className="text-blue-500">Actions</TableHead>}
                    {(user.role==='trainer')&&
                    <TableHead className="text-green-500">Payment</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentApplication.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        {application.training_details?.training_id} 
                      </TableCell>
                      <TableCell>{application.trainer_name}</TableCell>
                      <TableCell>
                        {new Date(application.applied_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                        </Badge>
                      </TableCell>
                      {(user.role==='staff'|| user.role==='admin')&&
                      <TableCell>
                        {application.status === 'pending' && ( 
                        user?.role === 'staff' || user?.role === 'admin') && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className='border-green-500 text-green-500'
                              variant="outline"
                              onClick={() => handleApproveApplication(application.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              color="border-red-500"
                              variant="outline"
                              className="border-red-500 text-red-500"
                              
                              onClick={() => handleRejectApplication(application.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )||
                        (application.status==='approved')&&
                        (<div className="flex space-x-2 text-green-800">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-500 text-green-500"
                              onClick={() => handleComplete(application.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                            </div>)}
                      </TableCell>}

                      {/* Requesting column cell */}
                      {(user.role==='trainer')&& (application.status==='complete')&&
                      <TableCell>
                        <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500 text-green-500"
                              
                              onClick={() => handleRequestPayment(application.id)}
                              disabled ={isDisabled}
                  
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Request
  
                            </Button>
                    
                          </div>
                      </TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPagesapplication > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPagesapplication}
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
                      {Array.from({ length: totalPagesapplication }, (_, i) => i + 1).map((page) => (
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
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default TrainingManagement;


