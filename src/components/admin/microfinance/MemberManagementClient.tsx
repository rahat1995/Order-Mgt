

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, View, Download, Upload } from 'lucide-react';
import type { Customer, MemberMandatoryFields, SavingsProduct } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';


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

const DetailItem = ({ label, value }: { label: string, value?: string | number | null }) => (
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{value || 'N/A'}</p>
    </div>
);


const relationshipOptions = ["Husband", "Father", "Wife", "Son", "Sister", "Brother", "Uncle", "Grand Father"];

const steps = [
    { id: 1, name: 'Personal Info' },
    { id: 2, name: 'Address Info' },
    { id: 3, name: 'Nominee Info' },
    { id: 4, name: 'Photo Uploads' },
    { id: 5, name: 'Savings Account' },
];

export function MemberManagementClient() {
  const { settings, addCustomer, updateCustomer, deleteCustomer, isLoaded } = useSettings();
  const { customers, samities, branches, microfinanceSettings, workingAreas, savingsProducts } = settings;
  const { samityTerm, memberMandatoryFields, primarySavingsProductId } = microfinanceSettings;
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  
  const [step, setStep] = useState(1);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [usePresentAsPermanent, setUsePresentAsPermanent] = useState(false);


  const handleOpenDialog = (customer: Customer | null) => {
    setEditingCustomer(customer);
    setFormData(customer || {});
    setUsePresentAsPermanent(false);
    setStep(1);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingCustomer(null);
    setFormData({});
    setDialogOpen(false);
  };
  
  const captureFormData = () => {
     if (formRef.current) {
      const currentFormData = new FormData(formRef.current);
      const data: any = {};
      currentFormData.forEach((value, key) => {
        data[key] = value;
      });
       setFormData(prev => ({...prev, ...data}));
    }
  };

  const handleNextStep = () => {
    captureFormData();
    setStep(prev => Math.min(prev + 1, steps.length));
  };

  const handleBackStep = () => {
    captureFormData();
    setStep(prev => Math.max(prev - 1, 1));
  }
  
  useEffect(() => {
    if (formData.samityId) {
        const samity = samities.find(s => s.id === formData.samityId);
        if (samity) {
            const workingArea = workingAreas.find(wa => wa.id === samity.workingAreaId);
            if (workingArea) {
                setFormData(prev => ({...prev, presentAddress: workingArea.name}));
            }
        }
    }
  }, [formData.samityId, samities, workingAreas]);
  
   useEffect(() => {
    if (usePresentAsPermanent) {
      setFormData(prev => ({ ...prev, permanentAddress: prev.presentAddress }));
    }
  }, [usePresentAsPermanent, formData.presentAddress]);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const finalFormData = new FormData(e.currentTarget);
    const combinedData = {...formData};
    finalFormData.forEach((value, key) => {
        (combinedData as any)[key] = value;
    });

    const samityId = combinedData.samityId;
    const branchId = samities.find(s => s.id === samityId)?.branchId;
    
    const mobile = combinedData.mobile as string;
    if (mobile && !/^\+880\d{10}$/.test(mobile)) {
        alert("Mobile number must be 14 digits including the country code (e.g., +8801712345678).");
        return;
    }

    const customerData: Omit<Customer, 'id' | 'code'> & { code?: string } = {
        name: combinedData.name as string,
        mobile: mobile,
        email: combinedData.email as string,
        center: combinedData.center as string,
        samityId: samityId === 'none' ? undefined : samityId,
        dob: combinedData.dob as string,
        admissionDate: combinedData.admissionDate as string,
        fatherName: combinedData.fatherName as string,
        spouseName: combinedData.spouseName as string,
        spouseRelation: combinedData.spouseRelation as string,
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

  const handleDownloadFormat = () => {
    const headers = ["samityCode", "name", "mobile", "admissionDate", "fatherName", "motherName", "spouseName", "spouseRelation", "dob", "nidOrBirthCert", "presentAddress", "permanentAddress", "nomineeName", "nomineeRelation", "email"];
    const exampleData = [
      { 
        samityCode: "HO-0001",
        name: "Jane Doe",
        mobile: "+8801700000000",
        admissionDate: "2024-01-15",
        fatherName: "John Doe Sr.",
        motherName: "Mary Doe",
        spouseName: "John Doe Jr.",
        spouseRelation: "Husband",
        dob: "1990-05-20",
        nidOrBirthCert: "1234567890123",
        presentAddress: "123 Main St, Anytown",
        permanentAddress: "123 Main St, Anytown",
        nomineeName: "John Doe Jr.",
        nomineeRelation: "Husband",
        email: "jane.doe@example.com"
      },
    ];
    const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "member_import_format.xlsx");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        let itemsAdded = 0;
        let errors: string[] = [];

        json.forEach((row, index) => {
            const { samityCode, name, mobile, admissionDate, fatherName, motherName, spouseName, spouseRelation, dob, nidOrBirthCert, presentAddress, permanentAddress, nomineeName, nomineeRelation, email } = row;
            
            if (!samityCode || !name || !mobile) {
                errors.push(`Row ${index + 2}: Missing required fields (samityCode, name, mobile).`);
                return;
            }

            const samity = samities.find(s => s.code === samityCode);
            if (!samity) {
                errors.push(`Row ${index + 2}: Samity with code "${samityCode}" not found.`);
                return;
            }

            addCustomer({
                name,
                mobile: String(mobile),
                admissionDate: admissionDate ? new Date(admissionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                samityId: samity.id,
                fatherName,
                motherName,
                spouseName,
                spouseRelation,
                dob: dob ? new Date(dob).toISOString().split('T')[0] : undefined,
                nidOrBirthCert: nidOrBirthCert ? String(nidOrBirthCert) : undefined,
                presentAddress,
                permanentAddress,
                nomineeName,
                nomineeRelation,
                email,
            });
            itemsAdded++;
        });

        alert(`${itemsAdded} new members added successfully.${errors.length > 0 ? `\n\nErrors:\n${errors.join('\n')}` : ''}`);

      } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to process the uploaded file. Please ensure it is a valid Excel file.");
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  if (!isLoaded) {
    return <div>Loading members...</div>;
  }
  
  const primarySavingsProduct = savingsProducts.find(p => p.id === primarySavingsProductId);

  return (
    <>
      <Card>
          <CardHeader>
             <div className="flex justify-between items-center">
                <CardTitle>Member List</CardTitle>
                <div className="flex items-center gap-2">
                    <Button onClick={handleDownloadFormat} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Download Format
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <Label className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" /> Upload Members
                            <Input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
                        </Label>
                    </Button>
                    <Button onClick={() => handleOpenDialog(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Member
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent>
              <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Member Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>{samityTerm}</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.length > 0 ? customers.map(customer => {
                        const samity = samities.find(s => s.id === customer.samityId);
                        const branch = samity ? branches.find(b => b.id === samity.branchId) : null;
                        return (
                            <TableRow key={customer.id}>
                                <TableCell className="font-mono">{customer.code || 'N/A'}</TableCell>
                                <TableCell className="font-medium">{customer.name}</TableCell>
                                <TableCell>{branch?.name || 'N/A'}</TableCell>
                                <TableCell>{samity?.name || 'N/A'}</TableCell>
                                <TableCell>{customer.mobile}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingCustomer(customer)}><View className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(customer)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteCustomer(customer.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    }) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">No members found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
              </Table>
          </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Edit Member' : 'Add New Member'}</DialogTitle>
          </DialogHeader>
          <form ref={formRef} onSubmit={handleSubmit} className="flex-grow overflow-hidden flex flex-col">
            <div className="flex-shrink-0">
                <nav className="flex items-center justify-center space-x-2">
                {steps.map((s, index) => (
                    <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center space-y-1 text-center">
                        <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            step === s.id ? 'border-primary bg-primary text-primary-foreground' : step > s.id ? 'border-green-500 bg-green-500 text-white' : 'border-border bg-muted'
                        }`}
                        >
                        {step > s.id ? '✔' : s.id}
                        </div>
                        <p className={`text-xs w-20 ${step >= s.id ? 'text-foreground' : 'text-muted-foreground'}`}>{s.name}</p>
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
                                <Select name="samityId" defaultValue={formData?.samityId} onValueChange={(v) => setFormData(p => ({...p, samityId: v}))} required>
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
                                <Label>Relation with Spouse</Label>
                                 <Select name="spouseRelation" defaultValue={formData.spouseRelation}>
                                    <SelectTrigger><SelectValue placeholder="Select relation..."/></SelectTrigger>
                                    <SelectContent>
                                        {relationshipOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
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
                                <Input id="mobile" name="mobile" defaultValue={formData?.mobile || '+880'} onChange={e => setFormData(p => ({...p, mobile: e.target.value}))} required pattern="^\+880\d{10}$" title="Must be in format +8801... (14 digits total)" placeholder="+8801..."/>
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
                            <Textarea id="presentAddress" name="presentAddress" value={formData?.presentAddress || ''} onChange={(e) => setFormData(p=>({...p, presentAddress: e.target.value}))} required={!!memberMandatoryFields?.presentAddress} />
                        </div>
                        <div className="space-y-2">
                            <RequiredLabel label="Permanent Address" isRequired={!!memberMandatoryFields?.permanentAddress} />
                             <div className="flex items-center space-x-2 pb-2">
                                <Checkbox id="sameAsPresent" checked={usePresentAsPermanent} onCheckedChange={(checked) => setUsePresentAsPermanent(Boolean(checked))} />
                                <Label htmlFor="sameAsPresent" className="font-normal">Same as Present Address</Label>
                            </div>
                            <Textarea id="permanentAddress" name="permanentAddress" value={formData?.permanentAddress || ''} onChange={(e) => setFormData(p=>({...p, permanentAddress: e.target.value}))} required={!!memberMandatoryFields?.permanentAddress}/>
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
                             <Select name="nomineeRelation" defaultValue={formData.nomineeRelation}>
                                <SelectTrigger><SelectValue placeholder="Select relation..."/></SelectTrigger>
                                <SelectContent>
                                    {relationshipOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
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
                {step === 5 && (
                    <div className="text-center p-8 border rounded-lg bg-green-50 border-green-200">
                        <h3 className="text-xl font-bold text-green-800">Primary Savings Account</h3>
                        {primarySavingsProduct ? (
                            <div className="mt-4 text-green-700">
                                <p>Upon saving, the following savings account will be automatically created for this member:</p>
                                <p className="mt-2 text-lg font-semibold">{primarySavingsProduct.name}</p>
                                <p className="text-sm">Type: {settings.savingsProductTypes.find(t => t.id === primarySavingsProduct.savingsProductTypeId)?.name}</p>
                                <p className="text-sm">Interest Rate: {primarySavingsProduct.interestRate}%</p>
                            </div>
                        ) : (
                            <div className="mt-4 text-orange-700">
                                <p className="font-semibold">No Primary Savings Product configured.</p>
                                <p>Please go to Microfin Config to set a primary product to enable automatic account creation.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                {step > 1 && <Button type="button" variant="secondary" onClick={handleBackStep}>Back</Button>}
                {step < steps.length && <Button type="button" onClick={handleNextStep}>Next</Button>}
                {step === steps.length && <Button type="submit">{editingCustomer ? 'Save Changes' : 'Create Member'}</Button>}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!viewingCustomer} onOpenChange={() => setViewingCustomer(null)}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{viewingCustomer?.name}</DialogTitle>
                <DialogDescription>Member Code: {viewingCustomer?.code || 'N/A'}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 py-4 max-h-[60vh] overflow-y-auto">
                <DetailItem label="Mobile" value={viewingCustomer?.mobile} />
                <DetailItem label="Admission Date" value={viewingCustomer?.admissionDate ? new Date(viewingCustomer.admissionDate).toLocaleDateString() : ''} />
                <DetailItem label="Date of Birth" value={viewingCustomer?.dob ? new Date(viewingCustomer.dob).toLocaleDateString() : ''} />
                <DetailItem label="Father's Name" value={viewingCustomer?.fatherName} />
                <DetailItem label="Mother's Name" value={viewingCustomer?.motherName} />
                <DetailItem label="Spouse's Name" value={viewingCustomer?.spouseName} />
                <DetailItem label="Spouse Relation" value={viewingCustomer?.spouseRelation} />
                <DetailItem label="NID/Birth Cert" value={viewingCustomer?.nidOrBirthCert} />
                <div className="col-span-full">
                    <DetailItem label="Present Address" value={viewingCustomer?.presentAddress} />
                </div>
                 <div className="col-span-full">
                    <DetailItem label="Permanent Address" value={viewingCustomer?.permanentAddress} />
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
