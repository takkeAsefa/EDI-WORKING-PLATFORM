import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { warrantyAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Shield, DollarSign, Calendar, AlertTriangle } from 'lucide-react';

const WarrantyManagement = () => {
  const { user } = useAuth();
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWarranty, setNewWarranty] = useState({
    allowed_for: '',
    amount: '',
    status: 'active'
  });

  useEffect(() => {
    fetchWarranties();
  }, []);

  const fetchWarranties = async () => {
    try {
      const response = await warrantyAPI.getWarranties();
      setWarranties(response.data || []);
    } catch (error) {
      console.error('Error fetching warranties:', error);
      setWarranties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarranty = async (e) => {
    e.preventDefault();
    try {
      await warrantyAPI.createWarranty(newWarranty);
      setIsDialogOpen(false);
      setNewWarranty({
        allowed_for: '',
        amount: '',
        status: 'active'
      });
      fetchWarranties();
    } catch (error) {
      console.error('Error creating warranty:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'claimed':
        return <Badge variant="secondary">Claimed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading warranties...</div>
        </div>
      </div>
    );
  }

  // Only admin can access this feature
  if (user?.role !== 'admin') {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              no list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Admin Access Required</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Please contact your administrator for access to warranty management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalWarrantyAmount = warranties.reduce((sum, warranty) => sum + parseFloat(warranty.amount || 0), 0);
  const activeWarranties = warranties.filter(w => w.status === 'active');
  const expiredWarranties = warranties.filter(w => w.status === 'expired');
  const claimedWarranties= warranties.filter(w=>w.status==='claimed')

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold"> Allowed Money </h1>
          <p className="text-muted-foreground">Allocated money for Startup/Innovator</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Warranty
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Warranty</DialogTitle>
              <DialogDescription>
                Allocated Money for Startup/Innovator.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateWarranty} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allowed_for">Allowed For</Label>
                <Input
                  id="allowed_for"
                  value={newWarranty.allowed_for}
                  onChange={(e) => setNewWarranty({...newWarranty, allowed_for: e.target.value})}
                  placeholder="Enter person/entity name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newWarranty.amount}
                  onChange={(e) => setNewWarranty({...newWarranty, amount: e.target.value})}
                  placeholder="Enter warranty amount"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={newWarranty.status}
                  onChange={(e) => setNewWarranty({...newWarranty, status: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  required
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="claimed">Claimed</option>
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Create Warranty</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB {totalWarrantyAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claimed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claimedWarranties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWarranties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredWarranties.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warranty Allocations</CardTitle>
          <CardDescription>
            A list of all warranty allocations in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {warranties.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No warranties</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating a new warranty allocation.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Allowed For</TableHead>
                  <TableHead>Amount</TableHead>
                  
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warranties.map((warranty) => (
                  <TableRow key={warranty.id}>
                    <TableCell className="font-medium">{warranty.allowed_for_name}</TableCell>
                    <TableCell>{parseFloat(warranty.amount || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      {warranty.created_date ? new Date(warranty.created_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{getStatusBadge(warranty.status)}</TableCell>
                    
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

export default WarrantyManagement;

