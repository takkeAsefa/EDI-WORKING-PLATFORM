import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard, CheckCircle, Clock, XCircle, Calendar,Search, ChevronLeft,ChevronRight } from 'lucide-react';


const PaymentManagement = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, SetError]= useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    approved_by: '',
    requested_by: '',
    reason: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentAPI.getPayments();
      setPayments(response.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      await paymentAPI.createPayment(newPayment);
      setIsDialogOpen(false);
      setNewPayment({
        approved_by: '',
        requested_by: '',
        reason: '',
        status: 'pending'
      });
      fetchPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      await paymentAPI.approvePayment(paymentId);
      fetchPayments();
    } catch (error) {
      SetError("Error approving")
      console.error('Error approving payment:', error);
    }
  };

  const handleRejectPayment = async (paymentId) => {
    try {
      await paymentAPI.rejectPayment(paymentId);
      fetchPayments();
    } catch (error) {
      SetError("Error Rejecting the Request")
      console.error('Error rejecting payment:', error);
    }
  };
  // Filter and search logic
    const filteredPayments = useMemo(() => {
      let filtered = payments;
  
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(payment =>
          payment.requested_by_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.reason.toLowerCase().includes(searchTerm.toLowerCase())||
          payment.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
      }
  
      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(payment => payment.status === statusFilter);
      }
  
      return filtered;
    }, 
    [payments, searchTerm, statusFilter]);

    // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);
    
   useEffect(() => {
         setCurrentPage(1);
       }, [searchTerm, statusFilter]);
       
        const handlePageChange = (page) => {
       setCurrentPage(page);
     };
   
     const clearFilters = () => {
       setSearchTerm('');
       setFilterType('all');
       setCurrentPage(1);
     };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading payments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-blue-500">Payment</h1>
          {/* <p className="text-gray-600">Manage training sessions, applications,</p> */}
        </div>
         <div className="flex items-center space-x-2">
          <div className="relative ">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 " />
            <Input
              type="text"
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-right pl-16 border-blue-500"
            />
          </div>
          </div>
        
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-blue-500 font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-orange-500 font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter(p => p.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
    
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            
            <CardTitle className="text-sm text-green-500 font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter(p => p.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-red-500 font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter(p => p.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          
          <CardTitle className="text-blue-500">Payment Requested</CardTitle>
          <CardDescription>
            A list of all payment requests in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No payment requests</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by requesting the Service you faciltated/complete.
              </p>
            </div>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-blue-500">Requested By</TableHead>
                  <TableHead className="text-blue-500">Reason</TableHead>
                  <TableHead className="text-blue-500">Amount+tax(ETB)</TableHead>
                  <TableHead className="text-blue-500">Requested Date</TableHead>
                  <TableHead className="text-blue-500">Status</TableHead>
                  {(user.role!=='trainer')&&
                  <TableHead className="text-blue-500">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.requested_by_name}</TableCell>
                    <TableCell>{payment.reason}</TableCell>
                    
                    <TableCell>{payment.amount || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(payment.created_date).toLocaleDateString()}
                        </div>
                        </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.status === 'pending' && (user?.role === 'admin' || user?.role === 'staff') && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className='border-green-500 text-green-500'
                            onClick={() => handleApprovePayment(payment.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className='border-red-500 text-red-500'
                            onClick={() => handleRejectPayment(payment.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
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
          </>
          )}
        </CardContent>
        
      </Card>
    </div>
  );
};

export default PaymentManagement;

