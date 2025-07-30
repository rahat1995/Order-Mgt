

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, View, Download, Upload, User, Home, Heart, Camera, Wallet, Check } from 'lucide-react';
import type { Customer, SavingsProduct, SavingsAccount, SavingsTransaction } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';


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

const MemberReview = ({ formData, samityTerm }: { formData: Partial<Customer>, samityTerm: string }) => {
    const { settings } = useSettings();
    const samity = settings.samities.find(s => s.id === formData.samityId);
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <img src={formData.photo || 'https://placehold.co/400x400.png'} alt="Member Photo" className="h-20 w-20 rounded-full object-cover" data-ai-hint="person" />
                    <div>
                        <CardTitle className="text-2xl">{formData.name}</CardTitle>
                        <CardDescription>Review all information before creating the member.</CardDescription>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <DetailItem label={samityTerm} value={samity?.name} />
                        <DetailItem label="Father's Name" value={formData.fatherName} />
                        <DetailItem label="Mother's Name" value={formData.motherName} />
                        <DetailItem label="Spouse's Name" value={formData.spouseName} />
                        <DetailItem label="Relation with Spouse" value={formData.spouseRelation} />
                        <DetailItem label="Date of Birth" value={formData.dob} />
                        <DetailItem label="Admission Date" value={formData.admissionDate} />
                        <DetailItem label="Mobile Number" value={formData.mobile} />
                        <DetailItem label="NID/Birth Cert." value={formData.nidOrBirthCert} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-lg">Address Information</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <DetailItem label="Present Address" value={formData.presentAddress} />
                        <DetailItem label="Permanent Address" value={formData.permanentAddress} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-lg">Nominee Information</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <DetailItem label="Nominee's Name" value={formData.nomineeName} />
                        <DetailItem label="Relation" value={formData.nomineeRelation} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Savings Account</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <DetailItem label="Recoverable Amount" value={`৳${formData.primarySavingsRecoverableAmount || 'N/A'}`} />
                        <DetailItem label="Initial Deposit" value={`৳${formData.initialDeposit || 0}`} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

const MemberProfileView = ({ customer }: { customer: Customer | null }) => {
    const { settings } = useSettings();
    const { samities, branches, microfinanceSettings, savingsAccounts, savingsProductTypes, savingsProducts, savingsTransactions } = settings;
    const { samityTerm } = microfinanceSettings;
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

    const samity = useMemo(() => customer ? samities.find(s => s.id === customer.samityId) : null, [customer, samities]);
    const branch = useMemo(() => samity ? branches.find(b => b.id === samity.branchId) : null, [samity, branches]);
    const memberAccounts = useMemo(() => customer ? savingsAccounts.filter(acc => acc.memberId === customer.id) : [], [customer, savingsAccounts]);

    const statement = React.useMemo(() => {
        if (!selectedAccountId || !customer) return [];
        
        const account = memberAccounts.find(acc => acc.id === selectedAccountId);
        if (!account) return [];
        
        const transactions = savingsTransactions
            .filter(tx => tx.savingsAccountId === selectedAccountId)
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
        let runningBalance = 0;
        return transactions.map(tx => {
            const isDebit = tx.type === 'withdrawal' || tx.type === 'adjustment-out';
            runningBalance += isDebit ? -tx.amount : tx.amount;
            return {
                ...tx,
                debit: isDebit ? tx.amount : 0,
                credit: !isDebit ? tx.amount : 0,
                balance: runningBalance,
            };
        });
    }, [selectedAccountId, customer, memberAccounts, savingsTransactions]);

    if (!customer) {
        return (
            <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Loading...</DialogTitle>
                </DialogHeader>
            </DialogContent>
        );
    }
    
    return (
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
                 <div className="flex items-start gap-6">
                    <img src={customer.photo || 'https://placehold.co/400x400.png'} alt={customer.name} className="h-28 w-28 rounded-lg object-cover border-2 border-primary" data-ai-hint="person" />
                    <div className="pt-2">
                        <DialogTitle className="text-3xl font-bold">{customer.name}</DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground">
                            Member Code: <span className="font-mono text-foreground">{customer.code || 'N/A'}</span>
                        </DialogDescription>
                        {samity && (
                             <p className="text-sm mt-1">{samityTerm}: <span className="font-semibold">{samity.name}</span></p>
                        )}
                         {branch && (
                             <p className="text-sm text-muted-foreground">{branch.name}</p>
                        )}
                    </div>
                </div>
            </DialogHeader>
            <Tabs defaultValue="personal" className="w-full mt-4 flex-grow flex flex-col overflow-hidden">
                <TabsList>
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="address">Address</TabsTrigger>
                    <TabsTrigger value="nominee">Nominee</TabsTrigger>
                    <TabsTrigger value="savings-accounts">Savings Accounts</TabsTrigger>
                </TabsList>
                <TabsContent value="personal" className="pt-4 flex-grow overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                        <DetailItem label="Mobile" value={customer?.mobile} />
                        <DetailItem label="Admission Date" value={customer?.admissionDate ? new Date(customer.admissionDate).toLocaleDateString() : ''} />
                        <DetailItem label="Date of Birth" value={customer?.dob ? new Date(customer.dob).toLocaleDateString() : ''} />
                        <DetailItem label="Father's Name" value={customer?.fatherName} />
                        <DetailItem label="Mother's Name" value={customer?.motherName} />
                        <DetailItem label="Spouse's Name" value={customer?.spouseName} />
                        <DetailItem label="Spouse Relation" value={customer?.spouseRelation} />
                        <DetailItem label="NID/Birth Cert" value={customer?.nidOrBirthCert} />
                    </div>
                </TabsContent>
                <TabsContent value="address" className="pt-4 flex-grow overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailItem label="Present Address" value={customer?.presentAddress} />
                        <DetailItem label="Permanent Address" value={customer?.permanentAddress} />
                    </div>
                </TabsContent>
                <TabsContent value="nominee" className="pt-4 flex-grow overflow-y-auto">
                     <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Nominee Name" value={customer?.nomineeName} />
                        <DetailItem label="Relation" value={customer?.nomineeRelation} />
                     </div>
                </TabsContent>
                 <TabsContent value="savings-accounts" className="pt-4 flex-grow overflow-y-auto">
                    <div className="space-y-4">
                        {memberAccounts.map(acc => {
                            const product = savingsProducts.find(p => p.id === acc.savingsProductId);
                            return (
                                <Card key={acc.id} className={`cursor-pointer hover:bg-muted/50 ${selectedAccountId === acc.id ? 'border-primary' : ''}`} onClick={() => setSelectedAccountId(acc.id === selectedAccountId ? null : acc.id)}>
                                    <CardHeader className="p-4 flex flex-row justify-between items-center">
                                        <div>
                                            <CardTitle className="text-lg">{product?.name || 'Unknown Product'}</CardTitle>
                                            <CardDescription>A/C: {acc.accountNumber}</CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold">৳{acc.balance.toFixed(2)}</p>
                                            <p className="text-xs text-muted-foreground">Current Balance</p>
                                        </div>
                                    </CardHeader>
                                </Card>
                            )
                        })}

                        {selectedAccountId && (
                            <div className="mt-4">
                                <h4 className="text-xl font-semibold mb-2">Transaction Statement</h4>
                                 <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Particulars</TableHead>
                                            <TableHead className="text-right">Debit</TableHead>
                                            <TableHead className="text-right">Credit</TableHead>
                                            <TableHead className="text-right">Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {statement.length > 0 ? (
                                            statement.map(tx => (
                                                <TableRow key={tx.id}>
                                                    <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                                                    <TableCell className="capitalize">{tx.notes || tx.type.replace('-', ' ')}</TableCell>
                                                    <TableCell className="text-right">{tx.debit > 0 ? `৳${tx.debit.toFixed(2)}` : '-'}</TableCell>
                                                    <TableCell className="text-right">{tx.credit > 0 ? `৳${tx.credit.toFixed(2)}` : '-'}</TableCell>
                                                    <TableCell className="text-right font-medium">৳{tx.balance.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow><TableCell colSpan={5} className="text-center h-24">No transactions for this account.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </DialogContent>
    )
}


const relationshipOptions = ["Husband", "Father", "Wife", "Son", "Sister", "Brother", "Uncle", "Grand Father"];

const steps = [
    { id: 1, name: 'Personal Info', icon: User },
    { id: 2, name: 'Address Info', icon: Home },
    { id: 3, name: 'Nominee Info', icon: Heart },
    { id: 4, name: 'Photo Uploads', icon: Camera },
    { id: 5, name: 'Savings Account', icon: Wallet },
    { id: 6, name: 'Review & Save', icon: Check },
];

export function MemberManagementClient() {
  const { settings, addCustomer, updateCustomer, deleteCustomer, isLoaded } = useSettings();
  const { customers, samities, branches, microfinanceSettings, workingAreas, savingsProducts, lastMemberSerials } = settings;
  const { samityTerm, memberMandatoryFields, primarySavingsProductId } = microfinanceSettings;
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  
  const [step, setStep] = useState(1);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [usePresentAsPermanent, setUsePresentAsPermanent] = useState(false);
  const [generatedMemberCode, setGeneratedMemberCode] = useState('');
  const [isMobileValid, setIsMobileValid] = useState(true);
  const [primarySavingsRecoverableAmount, setPrimarySavingsRecoverableAmount] = useState<number | string>('');
  const [initialDeposit, setInitialDeposit] = useState<number | string>('');


  const handleOpenDialog = (customer: Customer | null) => {
    setEditingCustomer(customer);
    setFormData(customer || { mobile: '+880'});
    setUsePresentAsPermanent(false);
    setStep(1);
    setGeneratedMemberCode(customer?.code || '');
    setIsMobileValid(true);
    setPrimarySavingsRecoverableAmount('');
    setInitialDeposit('');
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
  
  const handleSamityChange = (samityId: string) => {
    setFormData(p => ({...p, samityId}));
    if (editingCustomer) return; // Don't regenerate code for existing members

    const samity = samities.find(s => s.id === samityId);
    if(samity) {
        const branchCode = branches.find(b => b.id === samity.branchId)?.code || 'XX';
        const samityCodePart = samity.code.split('-').pop() || '0000';
        const lastSerial = lastMemberSerials?.[samityId] || 0;
        const newSerial = lastSerial + 1;
        setGeneratedMemberCode(`${branchCode}-${samityCodePart}-${String(newSerial).padStart(3, '0')}`);
        
        // Auto-fill address
        const workingArea = workingAreas.find(wa => wa.id === samity.workingAreaId);
        if (workingArea) {
            setFormData(prev => ({...prev, presentAddress: workingArea.name}));
        }
    } else {
        setGeneratedMemberCode('');
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData(p => ({...p, mobile: value}));
      setIsMobileValid(/^\+880\d{10}$/.test(value));
  }
  
   useEffect(() => {
    if (usePresentAsPermanent) {
      setFormData(prev => ({ ...prev, permanentAddress: prev.presentAddress }));
    }
  }, [usePresentAsPermanent, formData.presentAddress]);

   const primarySavingsProduct = savingsProducts.find(p => p.id === primarySavingsProductId);
   const regularSavingsTypeId = settings.savingsProductTypes.find(t => t.code === 'RS')?.id;
   
   useEffect(() => {
    if (step === 5 && primarySavingsProduct && primarySavingsProduct.savingsProductTypeId === regularSavingsTypeId) {
        setPrimarySavingsRecoverableAmount(primarySavingsProduct.rs_recoverableAmount || '');
    }
   }, [step, primarySavingsProduct, regularSavingsTypeId]);


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
    if (!isMobileValid) {
        alert("Mobile number must be 14 digits including the country code (e.g., +8801712345678).");
        return;
    }

    const customerData: Omit<Customer, 'id' | 'code'> & { code?: string, primarySavingsRecoverableAmount?: number, initialDeposit?: number } = {
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
        primarySavingsRecoverableAmount: typeof primarySavingsRecoverableAmount === 'string' ? parseFloat(primarySavingsRecoverableAmount) : primarySavingsRecoverableAmount,
        initialDeposit: typeof initialDeposit === 'string' ? parseFloat(initialDeposit) : initialDeposit,
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
                    <div className="flex flex-col items-center space-y-1 text-center cursor-pointer" onClick={() => setStep(s.id)}>
                        <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            step === s.id ? 'border-primary bg-primary text-primary-foreground' : step > s.id ? 'border-green-500 bg-green-500 text-white' : 'border-border bg-muted'
                        }`}
                        >
                        {step > s.id ? <Check className="h-5 w-5"/> : <s.icon className="h-4 w-4"/>}
                        </div>
                        <p className={`text-xs w-20 ${step >= s.id ? 'text-foreground' : 'text-muted-foreground'}`}>{s.name}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 ${step > s.id + 1 ? 'bg-primary' : 'bg-border'}`} />
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
                                <Select name="samityId" defaultValue={formData?.samityId} onValueChange={handleSamityChange} required>
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
                                <Input value={generatedMemberCode || "Auto-generated"} readOnly disabled/>
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
                                <Input id="dob" name="dob" type="text" placeholder="DD/MM/YYYY" defaultValue={formData?.dob} required={!!memberMandatoryFields?.dob} />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Admission Date" isRequired={true} />
                                <Input id="admissionDate" name="admissionDate" type="date" defaultValue={formData?.admissionDate || new Date().toISOString().split('T')[0]} required />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel label="Mobile Number" isRequired={true} />
                                <Input id="mobile" name="mobile" value={formData?.mobile || '+880'} onChange={handleMobileChange} required pattern="^\+880\d{10}$" title="Must be in format +8801... (14 digits total)" placeholder="+8801..."/>
                                {!isMobileValid && <p className="text-xs text-destructive">❌ Invalid format. Must be +880 followed by 10 digits.</p>}
                                {isMobileValid && formData.mobile && formData.mobile.length === 14 && <p className="text-xs text-green-600">✅ Valid</p>}
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
                            <div className="mt-4 text-green-700 space-y-4">
                                <div>
                                    <p>Upon saving, the following savings account will be automatically created for this member:</p>
                                    <p className="mt-2 text-lg font-semibold">{primarySavingsProduct.name}</p>
                                    <p className="text-sm">Type: {settings.savingsProductTypes.find(t => t.id === primarySavingsProduct.savingsProductTypeId)?.name}</p>
                                    <p className="text-sm">Interest Rate: {primarySavingsProduct.interestRate}%</p>
                                </div>
                                {primarySavingsProduct.savingsProductTypeId === regularSavingsTypeId && (
                                    <div className="space-y-2 max-w-sm mx-auto">
                                        <Label htmlFor="primarySavingsRecoverableAmount">Recoverable Amount (per deposit)</Label>
                                        <Input
                                            id="primarySavingsRecoverableAmount"
                                            name="primarySavingsRecoverableAmount"
                                            type="number"
                                            step="0.01"
                                            value={primarySavingsRecoverableAmount}
                                            onChange={(e) => setPrimarySavingsRecoverableAmount(e.target.value)}
                                            placeholder="Enter recoverable amount"
                                        />
                                    </div>
                                )}
                                <div className="space-y-2 max-w-sm mx-auto border-t pt-4">
                                    <Label htmlFor="initialDeposit">Opening Deposit Amount</Label>
                                    <Input
                                        id="initialDeposit"
                                        name="initialDeposit"
                                        type="number"
                                        step="0.01"
                                        value={initialDeposit}
                                        onChange={(e) => setInitialDeposit(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 text-orange-700">
                                <p className="font-semibold">No Primary Savings Product configured.</p>
                                <p>Please go to Microfin Config to set a primary product to enable automatic account creation.</p>
                            </div>
                        )}
                    </div>
                )}
                {step === 6 && (
                    <MemberReview formData={formData} samityTerm={samityTerm} />
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
        <MemberProfileView customer={viewingCustomer} />
      </Dialog>
    </>
  );
}
