
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
import { Textarea } from '@/components/ui/textarea';

const PhotoUploadField = ({ label, name, defaultValue, hint }: { label: string, name: string, defaultValue?: string, hint: string }) => (
    <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <Input id={name} name={name} placeholder="https://placehold.co/400x400.png" defaultValue={defaultValue} />
        <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
);

const RequiredLabel = ({ label, isRequired }: { label: string; isRequired: boolean }) => (
    <Label htmlFor={(label || '').toLowerCase().replace(/ /g, '-')}>
        {label} {isRequired && <span className="text-destructive">*</span>}
    </Label>
);

const steps = [
    { id: 1, name: 'Personal Info' },
    { id: 2, name: 'Address Info' },
    { id: 3, name: 'Nominee Info' },
    { id: 4, name: 'Photo Uploads' },
];

export function MemberManagementClient() {
  const { settings, addCustomer, updateCustomer, deleteCustomer, isLoaded } = useSettings();
  const { samityTerm, samities, branches, microfinanceSettings } = settings;
  const { memberMandatoryFields } = microfinanceSettings;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [step, setStep] = useState(1);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({});


  const handleOpenDialog = (customer: Customer | null) => {
    setEditingCustomer(customer);
    setFormData(customer || {});
    setStep(1);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingCustomer(null);
    setFormData({});
    setDialogOpen(false);
  };

  const handleNextStep = () => {
    if (formRef.current) {
      const currentFormData = new FormData(formRef.current);
      currentFormData.forEach((value, key) => {
        setFormData(prev => ({...prev, [key]: value}));
      });
    }
    setStep(prev => Math.min(prev + 1, steps.length));
  };

  const handleBackStep = () => {
     if (formRef.current) {
      const currentFormData = new FormData(formRef.current);
      currentFormData.forEach((value, key) => {
        setFormData(prev => ({...prev, [key]: value}));
      });
    }
    setStep(prev => Math.max(prev - 1, 1));
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const finalFormData = new FormData(e.currentTarget);
    const combinedData = {...formData};
    finalFormData.forEach((value, key) => {
        (combinedData as any)[key] = value;
    });

    const samityId = combinedData.samityId;
    const branchId = samities.find(s => s.id === samityId)?.branchId;

    const customerData: Omit<Customer, 'id' | 'code'> & { code?: string } = {
        name: combinedData.name as string,
        mobile: combinedData.mobile as string,
        email: combinedData.email as string,
        center: combinedData.center as string,
        samityId: samityId === 'none' ? undefined : samityId,
        dob: combinedData.dob as string,
        admissionDate: combinedData.admissionDate as string,
        fatherName: combinedData.fatherName as string,
        spouseName: combinedData.spouseName as string,
        motherName: combinedData.motherName as string,
        presentAddress: combinedData.presentAddress as string,
        permanentAddress: combinedData.permanentAddress as string,
        nidOrBirthCert: combinedData.nidOrBirthCert as string,
        nomineeName: combinedData.nomineeName as string,
        nomineeRelation: combinedData.nomineeRelation as string,
        photo: combinedData.photo as string,
        nidPhoto: combinedData.nidPhoto as string,
        guarantorPhoto: combinedData.guarantorPhoto as string,
        guarantorNidPhoto: combinedData.guarantorNidPhoto as string,
    };
    
    if (branchId) {
        (customerData as any).branchId = branchId;
    }

    if (!customerData.name || !customerData.mobile) return;
    if (!customerData.samityId) {
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
    return <div>Loading members...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mt-6">
        <h2 className="text-2xl font-bold">Member List</h2>
        <Button onClick={() => handleOpenDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Member
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
                      {customer.code ? `Code: ${customer.code} | ` : ''} 
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
              <CardTitle>No Members Found</CardTitle>
              <CardDescription>Click "Add New Member" to get started.</CardDescription>
            </CardHeader>
          </Card>
        )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Edit Member/Customer' : 'Add New Member/Customer'}</DialogTitle>
          </DialogHeader>
          <form ref={formRef} onSubmit={handleSubmit} className="flex-grow overflow-hidden flex flex-col">
            <div className="flex-shrink-0">
                <nav className="flex items-center justify-center space-x-4">
                {steps.map((s, index) => (
                    <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center space-y-1">
                        <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            step === s.id ? 'border-primary bg-primary text-primary-foreground' : step > s.id ? 'border-green-500 bg-green-500 text-white' : 'border-border bg-muted'
                        }`}
                        >
                        {step > s.id ? '✔' : s.id}
                        </div>
                        <p className={`text-xs ${step >= s.id ? 'text-foreground' : 'text-muted-foreground'}`}>{s.name}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 ${step > s.id ? 'bg-primary' : 'bg-border'}`} />
                    )}
                    </React.Fragment>
                ))}
                </nav>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-4 -mr-4 py-4 mt-4">
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <RequiredLabel label={samityTerm} isRequired={true} />
                                <Select name="samityId" defaultValue={formData?.samityId} required>
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
                                <Input id="name" name="name" defaultValue={formData?.name} required />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Father's Name" isRequired={!!memberMandatoryFields?.fatherName} />
                                <Input id="fatherName" name="fatherName" defaultValue={formData?.fatherName} required={!!memberMandatoryFields?.fatherName} />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Mother's Name" isRequired={!!memberMandatoryFields?.motherName} />
                                <Input id="motherName" name="motherName" defaultValue={formData?.motherName} required={!!memberMandatoryFields?.motherName} />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Spouse's Name" isRequired={!!memberMandatoryFields?.spouseName} />
                                <Input id="spouseName" name="spouseName" defaultValue={formData?.spouseName} required={!!memberMandatoryFields?.spouseName} />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Date of Birth" isRequired={!!memberMandatoryFields?.dob} />
                                <Input id="dob" name="dob" type="date" defaultValue={formData?.dob} required={!!memberMandatoryFields?.dob} />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Admission Date" isRequired={true} />
                                <Input id="admissionDate" name="admissionDate" type="date" defaultValue={formData?.admissionDate || new Date().toISOString().split('T')[0]} required />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Mobile Number" isRequired={true} />
                                <Input id="mobile" name="mobile" defaultValue={formData?.mobile} required />
                            </div>
                             <div className="space-y-2">
                                <RequiredLabel label="NID / Birth Certificate No." isRequired={!!memberMandatoryFields?.nidOrBirthCert} />
                                <Input id="nidOrBirthCert" name="nidOrBirthCert" defaultValue={formData?.nidOrBirthCert} required={!!memberMandatoryFields?.nidOrBirthCert} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Email (Optional)</Label>
                                <Input id="email" name="email" type="email" defaultValue={formData?.email} />
                            </div>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <RequiredLabel label="Present Address" isRequired={!!memberMandatoryFields?.presentAddress} />
                            <Textarea id="presentAddress" name="presentAddress" defaultValue={formData?.presentAddress} required={!!memberMandatoryFields?.presentAddress} />
                        </div>
                        <div className="space-y-2">
                            <RequiredLabel label="Permanent Address" isRequired={!!memberMandatoryFields?.permanentAddress} />
                            <Textarea id="permanentAddress" name="permanentAddress" defaultValue={formData?.permanentAddress} required={!!memberMandatoryFields?.permanentAddress}/>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nomineeName">Nominee's Name</Label>
                            <Input id="nomineeName" name="nomineeName" defaultValue={formData?.nomineeName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nomineeRelation">Relation with Nominee</Label>
                            <Input id="nomineeRelation" name="nomineeRelation" defaultValue={formData?.nomineeRelation} />
                        </div>
                    </div>
                )}
                {step === 4 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PhotoUploadField label="Member's Photo" name="photo" defaultValue={formData?.photo} hint="URL for the member's photograph." />
                        <PhotoUploadField label="NID Photo" name="nidPhoto" defaultValue={formData?.nidPhoto} hint="URL for the member's National ID card." />
                        <PhotoUploadField label="Guarantor's Photo" name="guarantorPhoto" defaultValue={formData?.guarantorPhoto} hint="URL for the guarantor's photograph." />
                        <PhotoUploadField label="Guarantor's NID Photo" name="guarantorNidPhoto" defaultValue={formData?.guarantorNidPhoto} hint="URL for the guarantor's NID card." />
                    </div>
                )}
            </div>
            <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                {step > 1 && <Button type="button" variant="secondary" onClick={handleBackStep}>Back</Button>}
                {step < steps.length && <Button type="button" onClick={handleNextStep}>Next</Button>}
                {step === steps.length && <Button type="submit">{editingCustomer ? 'Save Changes' : 'Create Customer'}</Button>}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
