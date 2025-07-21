



'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Customer } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePathname } from 'next/navigation';

export function CustomerManagementClient() {
  const { settings, addCustomer, updateCustomer, deleteCustomer, isLoaded } = useSettings();
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  const isMicrofinance = pathname.includes('/microfinance');

  const handleOpenDialog = (customer: Customer | null) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingCustomer(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const discountType = formData.get('discountType') as 'fixed' | 'percentage' | 'none';
    const discountValue = parseFloat(formData.get('discountValue') as string);
    const discountValidity = formData.get('discountValidity') as string;
    const groupId = formData.get('groupId') as string;
    const samityId = formData.get('samityId') as string;

    const customerData: Partial<Customer> & { name: string, mobile: string } = {
        name: formData.get('name') as string,
        mobile: formData.get('mobile') as string,
        email: formData.get('email') as string,
        address: formData.get('address') as string,
        center: formData.get('center') as string,
        groupId: groupId === 'none' ? undefined : groupId,
        samityId: samityId === 'none' ? undefined : samityId,
        discountValidity: discountValidity || undefined,
    };

    if (discountType !== 'none' && !isNaN(discountValue) && discountValue > 0) {
        customerData.discountType = discountType;
        customerData.discountValue = discountValue;
    } else {
        customerData.discountType = undefined;
        customerData.discountValue = undefined;
    }


    if (!customerData.name || !customerData.mobile) return;

    if (editingCustomer) {
      updateCustomer({ ...editingCustomer, ...customerData });
    } else {
      addCustomer(customerData as Omit<Customer, 'id'>);
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading customers...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mt-6">
        <h2 className="text-2xl font-bold">Customer List</h2>
        <Button onClick={() => handleOpenDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Customer
        </Button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {settings.customers.map(customer => (
          <Card key={customer.id}>
            <CardHeader>
              <CardTitle>{customer.name}</CardTitle>
              <CardDescription>{customer.mobile}</CardDescription>
            </CardHeader>
            <CardContent>
              {customer.center && <p className="text-sm font-semibold text-primary">{customer.center}</p>}
              <p className="text-sm text-muted-foreground">{customer.email}</p>
              <p className="text-sm text-muted-foreground">{customer.address}</p>
              {settings.customerGroups.find(g => g.id === customer.groupId) && (
                  <p className="text-sm text-muted-foreground">Group: {settings.customerGroups.find(g => g.id === customer.groupId)?.name}</p>
              )}
              {settings.samities.find(s => s.id === customer.samityId) && (
                  <p className="text-sm text-muted-foreground">Samity: {settings.samities.find(s => s.id === customer.samityId)?.name}</p>
              )}
              {customer.discountType && customer.discountValue && (
                <div className="mt-2 pt-2 border-t">
                    <p className="text-sm font-semibold text-green-600">Loyalty Discount: {customer.discountType === 'fixed' ? `৳${customer.discountValue}` : `${customer.discountValue}%`}</p>
                    {customer.discountValidity && <p className="text-xs text-muted-foreground">Valid until: {new Date(customer.discountValidity).toLocaleDateString()}</p>}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(customer)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteCustomer(customer.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
        {settings.customers.length === 0 && (
          <Card className="text-center py-12 col-span-full">
            <CardHeader>
              <CardTitle>No Customers Found</CardTitle>
              <CardDescription>Click "Add New Customer" to get started.</CardDescription>
            </CardHeader>
          </Card>
        )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
            <DialogDescription>
              {editingCustomer ? 'Update the customer\'s details.' : 'Enter the details for the new customer.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={editingCustomer?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input id="mobile" name="mobile" defaultValue={editingCustomer?.mobile} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="center">Center (Optional)</Label>
                  <Input id="center" name="center" defaultValue={editingCustomer?.center} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="groupId">Customer Group (Optional)</Label>
                    <Select name="groupId" defaultValue={editingCustomer?.groupId}>
                      <SelectTrigger><SelectValue placeholder="Select a group" /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {settings.customerGroups.map(group => (
                              <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                </div>
                 {isMicrofinance && (
                    <div className="space-y-2">
                        <Label htmlFor="samityId">Samity</Label>
                        <Select name="samityId" defaultValue={editingCustomer?.samityId}>
                        <SelectTrigger><SelectValue placeholder="Select a samity" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {settings.samities.map(samity => (
                                <SelectItem key={samity.id} value={samity.id}>{samity.name}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                 )}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input id="email" name="email" type="email" defaultValue={editingCustomer?.email} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Input id="address" name="address" defaultValue={editingCustomer?.address} />
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                  <Label className="text-base font-semibold">Loyalty Discount</Label>
                  <p className="text-sm text-muted-foreground mb-2">Set an automatic discount for this customer.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                          <Label htmlFor="discountType">Type</Label>
                          <Select name="discountType" defaultValue={editingCustomer?.discountType || 'none'}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="fixed">Fixed (৳)</SelectItem>
                                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div>
                          <Label htmlFor="discountValue">Value</Label>
                          <Input id="discountValue" name="discountValue" type="number" step="0.01" defaultValue={editingCustomer?.discountValue} />
                      </div>
                      <div>
                          <Label htmlFor="discountValidity">Validity Date</Label>
                          <Input id="discountValidity" name="discountValidity" type="date" defaultValue={editingCustomer?.discountValidity} />
                      </div>
                  </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingCustomer ? 'Save Changes' : 'Create Customer'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
