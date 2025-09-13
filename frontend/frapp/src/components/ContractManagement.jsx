import React, { useState, useEffect, useMemo } from 'react';
import FileUpload from './FileUpload';
import { useAuth } from '../contexts/AuthContext';
import { contractAPI } from '../lib/api';
import { trainingAPI } from '../lib/api';
import DocumentViewer from './DocumentViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Calendar, DollarSign, Search, Filter, CheckCircle, XCircle, ChevronLeft, ChevronRight, Contact, Upload } from 'lucide-react';

const ContractManagement = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [trainingType, setTrainingType]=useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError]= useState('')
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docs, setDocs]=useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [newContract, setNewContract] = useState({
    for_training: '',
    // signed_by: '',
    contract_doc:null,
    completion: 'draft',
    end_date: '',
    // signed_date: ''
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const [contractResponse, types]= await Promise.all([
        contractAPI.getContracts(),
        trainingAPI.getTrainingTypes(),
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

      setContracts(extractData(contractResponse));
      setTrainingType(extractData(types));
      
    } catch (error) {
      setError('Failed to Fetch Contracts');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    try {
      await contractAPI.createContract(newContract);
      setIsDialogOpen(false);
      setNewContract({
        for_training: '',
        contract_doc:null,
        signed_by: '',
        completion: '',
        end_date: '',
        signed_date: ''
      });
      fetchContracts();
    } catch (error) {
      setError('error creating New Contract.')
      console.error('Error creating contract:', error);
    }
  };
  const handleComplete= async (id)=>{
    try{
      await contractAPI.completeContract(id);
      fetchContracts();    
    }
    catch (error){
      setError('not setted as complete');
      console.error("Error:", error)
    }
  };
const handleActivate= async(id)=>{
  try{
    await contractAPI.activateContract(id);
    fetchContracts();
  } catch (error){
    setError("the contract is not activated!")
    console.error("Error:", error)

  }
};
const handleTerminate= async(id)=>{
  try {
    await contractAPI.terminateContract(id);
    fetchContracts();
  }catch(error){
    setError('the contract is not Terminated');
    console.error('Error:', error)
  }
}
const handleFileUpload = (file, fileId) => {
    console.log('File uploaded:', file.name);
    // Add file to state
    setFiles(prev => [...prev, { id: fileId, name: file.name, size: file.size, type: file.type }]);
  };

  const handleFileRemove = (fileId) => {
    console.log('File removed:', fileId);
    // Remove file from state
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };
  const handleFileSelect = (fileInfo) => {
    // In a real app, you would create a File object or fetch the file
    // For this example, we'll create a mock file
    const mockFile = new File(['Sample content'], fileInfo.name, { type: fileInfo.type });
    setSelectedFile(mockFile);
  };
  
  // Filter and search logic
  const filteredContracts = useMemo(() => {
    let filtered = contracts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.training_details.training_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.signed_by_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.completion === statusFilter);
    }

    return filtered;
  }, [contracts, searchTerm, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContracts = filteredContracts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getStatusBadge = (completion) => {
    if (completion === 'completed') {
      return <Badge variant="default" className="bg-green-500">Completed</Badge>;
    } else if (completion === 'active') {
      return <Badge variant="secondary" className="bg-blue-500 ">Active</Badge>;

    } 
     else if (completion === 'terminated') {
      return <Badge variant="secondary" className="bg-red-500 ">Terminated</Badge>;
    } 
    else {
      return <Badge variant="outline" className="border-orange-500 text-orange-500">Draft</Badge>;
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading contracts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-blue-500">Contracts</h1>
          {/* <p className="text-muted-foreground">Manage training contracts and agreements</p> */}
        </div>
        {/* user?.role === 'admin' || user?.role === 'staff' || */}
        {( user?.role=='trainer') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Sign New Contract
              </Button>
            </DialogTrigger>
            <DialogContent className="h-120 overflow-y-auto border border-gray-300 rounded-lg p-4">
              <DialogHeader>
                <DialogTitle>Sign New Contract</DialogTitle>
                <DialogDescription>
                  Create a new training contract. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateContract} className="space-y-4 overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="for_training">Training Program</Label>
                  
                  <Select 
                    value={newContract.for_training} 
                    onValueChange={(value) => setNewContract({...newContract, for_training: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select training type" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainingType.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.training_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="completion">Status</Label>
                  <Select
                    value={newContract.completion}
                    onValueChange={(value) => setNewContract({...newContract, completion: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
               
                    </SelectContent>
                  </Select>
                </div>

                
                {/* <div className="space-y-2">
                  <Label htmlFor="contract_doc">Contract Document</Label>
                  <Input
                    id="contract_doc"
                    type="file"
                    onChange={(e) => setNewContract({...newContract, contract_doc: e.target.files[0]})}
                  />
                  </div> */}

                <div >
                  <Label htmlFor="contract_doc">New Contract Document and Business TIN </Label>
                
                    <FileUpload
                      onFileUpload={handleFileUpload}
                      onFileRemove={handleFileRemove}
                      uploadedFiles={files}
                      onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    setNewContract({
                                      ...newContract,
                                      contract_doc: e.target.files[0],
                                    });
                                  }
                                }}
                      
                    /> 
                    
                    
                    
                  {files.length > 0 && (
                    <div >
                      <h3 className="text-lg font-semibold mb-3 overflow-y-auto">Uploaded Files:</h3>
                      <ul >
                        
                      </ul>
                    </div>
                  )}
                </div>
  
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newContract.end_date}
                    onChange={(e) => setNewContract({...newContract, end_date: e.target.value})}
                    required
                  />
                </div>
                
                <DialogFooter>
                  <Button type="submit">Sign a new Contract</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>


      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by training program or trainer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {currentContracts.length} of {filteredContracts.length} contracts
            {filteredContracts.length !== contracts.length && ` (filtered from ${contracts.length} total)`}
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {currentContracts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">
                {filteredContracts.length === 0 && contracts.length > 0 
                  ? 'No contracts match your search criteria' 
                  : 'No contracts'}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredContracts.length === 0 && contracts.length > 0
                  ? 'Try adjusting your search terms or filters.'
                  : 'Get started by creating a new contract.'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader >
                  <TableRow >
                    <TableHead className="text-blue-500">Training Program</TableHead>
                    <TableHead className="text-blue-500">Trainer</TableHead>
                   <TableHead className="text-blue-500">Document</TableHead>
                    <TableHead className="text-blue-500">Signed Date</TableHead>
                    <TableHead className="text-blue-500">Expired Date</TableHead>
                     <TableHead className="text-blue-500">Status</TableHead>
                     {(user.role=='staff'|| user.role==='admin')&&
                     <TableHead className="text-blue-500">Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell >
                        {contract.training_details.training_type}
                      </TableCell>

                      <TableCell className="font-medium">{contract.signed_by_name}</TableCell>


                      <TableCell>
                        
                          <div className="border">
                            
                            <DocumentViewer 
                              file={selectedFile} 
                              onClose={() => setSelectedFile(null)}
                           
                            />
                            
                            
                          </div>
  
                      </TableCell>
                      <TableCell>{contract.signed_date}</TableCell>
                      <TableCell>{contract.end_date}</TableCell>
                       <TableCell>{getStatusBadge(contract.completion)}</TableCell>
                       <TableCell>
                        {(user?.role==='admin' || user.role=='staff')&&
                        (<div className="flex space-x-2 text-green-800">
                            <Button
                              size="sm"
                              color= "bg-blue-100 border-green-500"
                              className='border-green-500 text-blue-500'
                
                              variant="outline"
                              onClick={() => handleActivate(contract.id)}
                            >
                              <CheckCircle className=" h-4 w-4 mr-1 " />
                              Activate
                            </Button> 
                            <Button
                              size="sm"
                              color= "bg-blue-100"
                              className='border-green-500 text-green-500'
                
                              variant="outline"
                              onClick={() => handleComplete(contract.id)}
                            >
                              <CheckCircle className=" h-4 w-4 mr-1 " />
                              Complete
                            </Button> 
                          </div> 
                        
                        )}
                        {(user?.role==='admin' || user?.role==="staff")&&
                        (<div className="flex space-x-2 text-red-800">
                            <Button
                              size="sm"
                              className='border-red-500 text-red-500'
                              variant="outline"
                              onClick={() => handleTerminate(contract.id)}
                            >
                              <XCircle className=" h-4 w-4 mr-1 " />
                              Stop
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractManagement;
