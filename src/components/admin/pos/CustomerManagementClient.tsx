






'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Customer, MemberMandatoryFields } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePathname } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const PhotoUploadField = ({ label, name, defaultValue, hint }: { label: string, name: string, defaultValue?: string, hint: string }) => (
    <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <Input id={name} name={name} placeholder="https://placehold.co/400x400.png" defaultValue={defaultValue} />
        <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
);

const RequiredLabel = ({ label, isRequired }: { label: string; isRequired: boolean }) => (
    <Label htmlFor={label.toLowerCase().replace(/ /g, '-')}>
        {label} {isRequired && <span className="text-destructive">*</span>}
    </Label>
);


export function CustomerManagementClient() {
  const { settings, addCustomer, updateCustomer, deleteCustomer, isLoaded } = useSettings();
  const { samityTerm, samities, branches, microfinanceSettings } = settings;
  const { memberMandatoryFields } = microfinanceSettings;
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
    const samityId = formData.get('samityId') as string;
    const branchId = samities.find(s => s.id === samityId)?.branchId;


    const customerData: Omit<Customer, 'id' | 'code'> & { code?: string } = {
        name: formData.get('name') as string,
        mobile: formData.get('mobile') as string,
        email: formData.get('email') as string,
        center: formData.get('center') as string,
        samityId: samityId === 'none' ? undefined : samityId,
        dob: formData.get('dob') as string,
        admissionDate: formData.get('admissionDate') as string,
        fatherName: formData.get('fatherName') as string,
        spouseName: formData.get('spouseName') as string,
        motherName: formData.get('motherName') as string,
        presentAddress: formData.get('presentAddress') as string,
        permanentAddress: formData.get('permanentAddress') as string,
        nidOrBirthCert: formData.get('nidOrBirthCert') as string,
        nomineeName: formData.get('nomineeName') as string,
        nomineeRelation: formData.get('nomineeRelation') as string,
        photo: formData.get('photo') as string,
        nidPhoto: formData.get('nidPhoto') as string,
        guarantorPhoto: formData.get('guarantorPhoto') as string,
        guarantorNidPhoto: formData.get('guarantorNidPhoto') as string,
    };
    
    // Add branchId to the data if a samity is selected
    if (branchId) {
        (customerData as any).branchId = branchId;
    }


    if (!customerData.name || !customerData.mobile) return;
    if (isMicrofinance && !customerData.samityId) {
        alert(`Please select a ${samityTerm}.`);
        return;
    }


    if (editingCustomer) {
      updateCustomer({ ...editingCustomer, ...customerData, code: editingCustomer.code });
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
        {settings.customers.map(customer => {
            const samity = settings.samities.find(s => s.id === customer.samityId);
            const branch = samity ? settings.branches.find(b => b.id === samity.branchId) : null;
            return (
              <Card key={customer.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {customer.photo ? <img src={customer.photo} alt={customer.name} className="h-10 w-10 rounded-full object-cover" data-ai-hint="person" /> : null}
                    {customer.name}
                  </CardTitle>
                  <CardDescription>
                      {isMicrofinance && customer.code ? `Code: ${customer.code} | ` : ''} 
                      {customer.mobile}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {branch && <p className="text-sm font-semibold text-primary">{branch.name}</p>}
                  {samity && <p className="text-sm text-muted-foreground">{samityTerm}: {samity.name}</p>}
                  {customer.fatherName && <p className="text-sm text-muted-foreground">Father: {customer.fatherName}</p>}
                  {customer.presentAddress && <p className="text-sm text-muted-foreground">Address: {customer.presentAddress}</p>}
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
            )
        })}
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
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Edit Member/Customer' : 'Add New Member/Customer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex-grow overflow-hidden flex flex-col">
           <Tabs defaultValue="personal" className="flex-grow flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="address">Address</TabsTrigger>
                    <TabsTrigger value="nominee">Nominee</TabsTrigger>
                    <TabsTrigger value="photos">Photos</TabsTrigger>
                </TabsList>
                <div className="flex-grow overflow-y-auto pr-2">
                    <TabsContent value="personal" className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <RequiredLabel label={samityTerm} isRequired={isMicrofinance} />
                                <Select name="samityId" defaultValue={editingCustomer?.samityId} required={isMicrofinance}>
                                <SelectTrigger><SelectValue placeholder={`Select a ${samityTerm}`} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {settings.samities.map(samity => (
                                        <SelectItem key={samity.id} value={samity.id}>{samity.name}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Member Code</Label>
                                <Input value={editingCustomer?.code || "Auto-generated"} readOnly disabled/>
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Full Name" isRequired={true} />
                                <Input id="name" name="name" defaultValue={editingCustomer?.name} required />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Father's Name" isRequired={!!memberMandatoryFields?.fatherName} />
                                <Input id="fatherName" name="fatherName" defaultValue={editingCustomer?.fatherName} required={!!memberMandatoryFields?.fatherName} />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Mother's Name" isRequired={!!memberMandatoryFields?.motherName} />
                                <Input id="motherName" name="motherName" defaultValue={editingCustomer?.motherName} required={!!memberMandatoryFields?.motherName} />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Spouse's Name" isRequired={!!memberMandatoryFields?.spouseName} />
                                <Input id="spouseName" name="spouseName" defaultValue={editingCustomer?.spouseName} required={!!memberMandatoryFields?.spouseName} />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Date of Birth" isRequired={!!memberMandatoryFields?.dob} />
                                <Input id="dob" name="dob" type="date" defaultValue={editingCustomer?.dob} required={!!memberMandatoryFields?.dob} />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Admission Date" isRequired={true} />
                                <Input id="admissionDate" name="admissionDate" type="date" defaultValue={editingCustomer?.admissionDate || new Date().toISOString().split('T')[0]} required />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Mobile Number" isRequired={true} />
                                <Input id="mobile" name="mobile" defaultValue={editingCustomer?.mobile} required />
                            </div>
                             <div className="space-y-2">
                                <RequiredLabel label="NID / Birth Certificate No." isRequired={!!memberMandatoryFields?.nidOrBirthCert} />
                                <Input id="nidOrBirthCert" name="nidOrBirthCert" defaultValue={editingCustomer?.nidOrBirthCert} required={!!memberMandatoryFields?.nidOrBirthCert} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Email (Optional)</Label>
                                <Input id="email" name="email" type="email" defaultValue={editingCustomer?.email} />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="address" className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <RequiredLabel label="Present Address" isRequired={!!memberMandatoryFields?.presentAddress} />
                                <Textarea id="presentAddress" name="presentAddress" defaultValue={editingCustomer?.presentAddress} required={!!memberMandatoryFields?.presentAddress} />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Permanent Address" isRequired={!!memberMandatoryFields?.permanentAddress} />
                                <Textarea id="permanentAddress" name="permanentAddress" defaultValue={editingCustomer?.permanentAddress} required={!!memberMandatoryFields?.permanentAddress}/>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="nominee" className="pt-4 space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nomineeName">Nominee's Name</Label>
                                <Input id="nomineeName" name="nomineeName" defaultValue={editingCustomer?.nomineeName} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nomineeRelation">Relation with Nominee</Label>
                                <Input id="nomineeRelation" name="nomineeRelation" defaultValue={editingCustomer?.nomineeRelation} />
                            </div>
                         </div>
                    </TabsContent>
                    <TabsContent value="photos" className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <PhotoUploadField label="Member's Photo" name="photo" defaultValue={editingCustomer?.photo} hint="URL for the member's photograph." />
                           <PhotoUploadField label="NID Photo" name="nidPhoto" defaultValue={editingCustomer?.nidPhoto} hint="URL for the member's National ID card." />
                           <PhotoUploadField label="Guarantor's Photo" name="guarantorPhoto" defaultValue={editingCustomer?.guarantorPhoto} hint="URL for the guarantor's photograph." />
                           <PhotoUploadField label="Guarantor's NID Photo" name="guarantorNidPhoto" defaultValue={editingCustomer?.guarantorNidPhoto} hint="URL for the guarantor's NID card." />
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
            <DialogFooter className="mt-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingCustomer ? 'Save Changes' : 'Create Customer'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
