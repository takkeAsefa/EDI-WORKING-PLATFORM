import React, { useState, useEffect, useMemo} from 'react';
import { useAuth } from '../contexts/AuthContext';
import {certificateAPI} from '../lib/api';
import { userAPI } from '../lib/api';
import { trainingAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Award,Download, Calendar, Search, User , ChevronLeft, ChevronRight} from 'lucide-react';

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [certifiedPerson, setCertifiedPerson]=useState([]);
  const [trainingSession, setTrainingSession]= useState([]);
  const [downloadingCertificate, setDownloadingCertificate]=useState(null)

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterType, setFilterType] = useState('all');
  const [error, setError]=useState('')
  
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    certified: '',
    given_for: '',
    given_date: ''
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const [cerificateResponse, personResponse, trainingResponse] = await Promise.all([
              certificateAPI.getCertificates(),
              userAPI.getTrainees(),
              trainingAPI.getTrainingSessions(),
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
      setCertificates(extractData(cerificateResponse));
      setCertifiedPerson(extractData(personResponse));
      setTrainingSession(extractData(trainingResponse))
    }catch (error) {
      setError('Failed to fetch certificate');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateCertificate = async (e) => {
    e.preventDefault();
    try {
      await certificateAPI.createCertificate(newCertificate);
      setIsDialogOpen(false);
      setNewCertificate({
        certified: '',
        given_for: '',
        given_date: ''
      });
      fetchCertificates();
    } catch (error) {
      console.error('Error creating certificate:', error);
    }
  };

  const handleDownloadCertificate = async (certificate) => {
    try {
      setDownloadingCertificate(certificate);
      
      // Make API call to the Flask backend
      const response = await fetch(`${PDF_SERVICE_URL}/api/certificate/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificate: certificate
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const safeName = certificate.certified_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'certificate';
      link.download = `certificate_${safeName}_${certificate}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert(`Failed to download certificate: ${error.message}`);
    } finally {
      setDownloadingCertificate(null);
    }
  };

  const filteredCertificates = useMemo(() => {
      let filtered=certificates;
      if(searchTerm){
        filtered=filtered.filter(cert =>
        (cert.certified_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.training_details.training_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.training_details.training_id.toLowerCase().includes(searchTerm.toLowerCase()))
      // session.given_location.toLowerCase().includes(searchTerm.toLowerCase()))
      // (filterType === 'all' || session.training_type_id.toString() === filterType)
  );
      }
    if (filterType !== 'all') {
        filtered = filtered.filter(certificate => certificate.training_type_name === statusFilter);
      }
      return filtered; 
    }, 
    [certificates, searchTerm, filterType]);
  // Pagination logic
    const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCertificates = filteredCertificates.slice(startIndex, endIndex);
  
    // Reset to first page when filters change
    useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm, filterType]);

     const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setCurrentPage(1);
  };


  if (loading) {
    return (
      <div className="p-2">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading certificates...</div>
        </div>
      </div>
    );
  }

  // Filter certificates based on user role
  // const filteredCertificates = user.role==='unknown'
  //   ? certificates.filter(cert => cert.certified === user.username || cert.certified === user.email)
  //   : certificates;

  return (
    <div className="p-1 space-y-1">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-blue-500">Certificates</h1>
          <p className="text-muted-foreground">
            {user?.role === 'trainee' 
              ? 'View and download your training certificates'
              : 'Manage training certificates and awards'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
        <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          </div>
        
        
        {(user?.role === 'admin' || user?.role === 'staff') 
        && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Issue Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Issue New Certificate</DialogTitle>
                <DialogDescription>
                  Issue a new training certificate to a participant.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCertificate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="certified">Certified Person</Label>
                  {/* <Input
                    id="certified"
                    value={newCertificate.certified}
                    onChange={(e) => setNewCertificate({...newCertificate, certified: e.target.value})}
                    placeholder="Enter person's name or email"
                    required 

                  /> */}
                  <Select 
                      value={newCertificate.certified} 
                      onValueChange={(value) => setNewCertificate({...newCertificate, certified: value})}
                
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a trainee"/>
                      </SelectTrigger>
                      <SelectContent className="h-[200px]">
                        {certifiedPerson.map((person) => (
                          <SelectItem key={person.id} value={person.id.toString()}>
                            {person.first_name} {person.middle_name || "N/A"} {person.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                </div>
                <div className="space-y-2">
                  <Label htmlFor="given_for">Given For</Label>
                  <Select 
                      value={newCertificate.given_for} 
                      onValueChange={(value) => setNewCertificate({...newCertificate, given_for: value})}
                    >
                      <SelectTrigger >
                        <SelectValue placeholder="Select Training Session ID"/>
                      </SelectTrigger>
                      <SelectContent className="h-[200px]">
                        {trainingSession.map((session) => (
                          <SelectItem key={session.id} value={session.id.toString()}>
                            {session.training_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                </div>
                <div className="space-y-2">
                  <Label htmlFor="given_date">Issue Date</Label>
                  <Input
                    id="given_date"
                    type="date"
                    value={newCertificate.given_date}
                    onChange={(e) => setNewCertificate({...newCertificate, given_date: e.target.value})}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Issue Certificate</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user?.role === 'trainee' ? 'My Certificates' : 'Total Certificates'}
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCertificates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentCertificates.filter(cert => {
                const givenDate = new Date(cert.given_date);
                const now = new Date();
                return givenDate.getMonth() === now.getMonth() && 
                givenDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user?.role === 'trainee' ? 'Programs Completed' : 'Unique Recipients'}
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.role === 'trainee' 
                ? new Set(currentCertificates.map(c => c.given_for)).size
                : new Set(currentCertificates.map(c => c.certified)).size
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentCertificates.filter(cert => {
                const givenDate = new Date(cert.given_date);
                const now = new Date();
                return givenDate.getFullYear() === now.getFullYear();
              
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === 'trainee' ? 'My Certificates' : 'All Certificates'}
          </CardTitle>
          <CardDescription>
            {user?.role === 'trainee' 
              ? 'Your training certificates and achievements.'
              : 'A list of all issued certificates in the system.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* {filteredCertificates.length === 0 ? (
            <div className="text-center py-8">
              <Award className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">
                {user?.role === 'trainee' ? 'No certificates yet' : 'No certificates issued'}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {user?.role === 'trainee' 
                  ? 'Complete training programs to earn certificates.'
                  : 'Start by issuing your first certificate.'
                }
              </p>
            </div>
          ) : ( */}
            <Table>
              <TableHeader>
                <TableRow className="text-bold">
                  
                  <TableHead className="font-medium text-blue-500" >Certified Person</TableHead>
                  <TableHead className="font-medium text-blue-500">Training ID</TableHead>
                  <TableHead className="font-medium text-blue-500">Type</TableHead>
                  <TableHead className="font-medium text-blue-500">Issue Date</TableHead>
                
                  <TableHead className="font-medium text-blue-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCertificates.map((certificate) => (
                  <TableRow key={certificate.id}>
              
                      <TableCell className="font-medium">{certificate.certified_name}</TableCell>
                    <TableCell>{certificate.training_details?.training_id}</TableCell>
                    <TableCell>{certificate.training_details?.training_type_name}</TableCell>
                    <TableCell>{certificate.given_date}</TableCell>
                    {/* <TableCell>
                      <Badge variant="default">Issued</Badge>
                    </TableCell> */}
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadCertificate(certificate.id)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          {totalPages > 1 && 
          (
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
    </div>
  );
};

export default Certificates;

