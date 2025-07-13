
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { Customer, ServiceJob } from '@/types';
import { JobCard } from './print/JobCard';
import { Plus } from 'lucide-react';

export function CreateServiceJobClient() {
  const { settings, addServiceJob, addCustomer, isLoaded } = useSettings();
  const { customers, serviceIssues, serviceTypes, organization } = settings;
  const router = useRouter();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [jobToPrint, setJobToPrint] = useState<ServiceJob | null>(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const prevCustomerCountRef = useRef(customers.length);
  const formRef = useRef<HTMLFormElement>(null);
  const jobCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      setSelectedCustomer(customer || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [selectedCustomerId, customers]);
  
  useEffect(() => {
    if (customers.length > prevCustomerCountRef.current) {
        const newCustomer = customers[customers.length - 1];
        if (newCustomer) {
            setSelectedCustomerId(newCustomer.id);
        }
    }
    prevCustomerCountRef.current = customers.length;
  }, [customers]);
  
  useEffect(() => {
    if (jobToPrint && jobCardRef.current) {
      const timer = setTimeout(() => {
        printInNewWindow(jobCardRef, `Job Card - ${jobToPrint.jobNumber}`);
        setJobToPrint(null);
        router.push('/admin/modules/serviceJob/all');
      }, 200); // Increased delay
      return () => clearTimeout(timer);
    }
  }, [jobToPrint, router]);


  const printInNewWindow = (contentRef: React.RefObject<HTMLDivElement>, title: string) => {
    if (!contentRef.current) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        alert('Could not open print window. Please disable your popup blocker.');
        return;
    }
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(el => el.outerHTML).join('\n');
    printWindow.document.write(`<html><head><title>${title}</title>${styleTags}</head><body><div class="p-4">${contentRef.current.innerHTML}</div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const handleSaveJob = async (): Promise<ServiceJob | null> => {
    if (!formRef.current?.checkValidity()) {
        formRef.current?.reportValidity();
        return null;
    }
    
    const formData = new FormData(formRef.current);
    
    const jobData: Omit<ServiceJob, 'id' | 'jobNumber'> = {
      customerId: selectedCustomerId,
      deviceName: formData.get('deviceName') as string,
      deviceModel: formData.get('deviceModel') as string,
      issueTypeId: formData.get('issueTypeId') as string,
      serviceTypeId: formData.get('serviceTypeId') as string,
      issueDetails: formData.get('issueDetails') as string,
      status: 'Received',
      createdAt: new Date().toISOString(),
    };

    if (!jobData.customerId || !jobData.deviceName || !jobData.issueTypeId || !jobData.serviceTypeId) {
        alert("Please fill out all required fields: Customer, Device Name, Issue Type, and Service Type.");
        return null;
    }

    const newJob = addServiceJob(jobData);
    alert(`Service job #${newJob.jobNumber} created successfully!`);
    return newJob;
  };

  const handleSaveAndPrint = async () => {
      const newJob = await handleSaveJob();
      if (newJob) {
        setJobToPrint(newJob);
      }
  };

  const handleSaveAndBill = async () => {
      const newJob = await handleSaveJob();
      if (newJob) {
          router.push(`/admin/modules/serviceJob/billing?jobId=${newJob.id}`);
      }
  };
  
  const handleSaveAndNew = async () => {
    const newJob = await handleSaveJob();
    if(newJob) {
        formRef.current?.reset();
        setSelectedCustomerId('');
        setJobToPrint(null);
    }
  }

  const handleAddCustomerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerData: Omit<Customer, 'id'> = {
      name: formData.get('name') as string,
      mobile: formData.get('mobile') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
    };
    if (!customerData.name || !customerData.mobile) return;
    
    addCustomer(customerData);
    setCustomerDialogOpen(false);
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="hidden">
        {jobToPrint && selectedCustomer && (
          <div ref={jobCardRef}>
            <JobCard 
                job={jobToPrint} 
                customer={selectedCustomer} 
                organization={organization} 
                issueType={serviceIssues.find(i => i.id === jobToPrint.issueTypeId)}
                serviceType={serviceTypes.find(st => st.id === jobToPrint.serviceTypeId)}
            />
          </div>
        )}
      </div>
      <form ref={formRef}>
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card>
              <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                   <div className="grid gap-2">
                      <Label htmlFor="customerId">Select Customer</Label>
                       <div className="flex items-center gap-2">
                        <Select name="customerId" onValueChange={setSelectedCustomerId} value={selectedCustomerId} required>
                            <SelectTrigger><SelectValue placeholder="Search or select a customer..." /></SelectTrigger>
                            <SelectContent>
                                {customers.map(customer => (
                                    <SelectItem key={customer.id} value={customer.id}>{customer.name} - {customer.mobile}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="icon" onClick={() => setCustomerDialogOpen(true)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                       </div>
                   </div>
                   {selectedCustomer && (
                       <div className="p-4 border rounded-md bg-muted/50 text-sm space-y-1">
                           <p><strong>Name:</strong> {selectedCustomer.name}</p>
                           <p><strong>Mobile:</strong> {selectedCustomer.mobile}</p>
                           <p><strong>Address:</strong> {selectedCustomer.address || 'N/A'}</p>
                       </div>
                   )}
              </CardContent>
            </Card>
            
            <Card>
               <CardHeader>
                  <CardTitle className="text-lg">Device & Issue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                          <Label htmlFor="deviceName">Device Name (e.g., iPhone 13)</Label>
                          <Input id="deviceName" name="deviceName" required />
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="deviceModel">Device Model (e.g., A2633)</Label>
                          <Input id="deviceModel" name="deviceModel" />
                      </div>
                  </div>
                   <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                          <Label htmlFor="issueTypeId">Issue Type</Label>
                          <Select name="issueTypeId" required>
                              <SelectTrigger><SelectValue placeholder="Select issue type" /></SelectTrigger>
                              <SelectContent>
                                  {serviceIssues.map(issue => (
                                      <SelectItem key={issue.id} value={issue.id}>{issue.name}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="serviceTypeId">Service Type</Label>
                          <Select name="serviceTypeId" required>
                              <SelectTrigger><SelectValue placeholder="Select service type" /></SelectTrigger>
                              <SelectContent>
                                  {serviceTypes.map(type => (
                                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="issueDetails">Detailed Problem Description</Label>
                      <Textarea id="issueDetails" name="issueDetails" rows={4} />
                  </div>
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleSaveAndNew}>Save & Create New</Button>
            <Button type="button" variant="outline" onClick={handleSaveAndPrint}>Save & Print Job Card</Button>
            <Button type="button" onClick={handleSaveAndBill}>Save & Go to Bill</Button>
          </CardFooter>
        </Card>
      </form>
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>Enter the details for the new customer.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCustomerSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input id="mobile" name="mobile" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Input id="address" name="address" />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCustomerDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Create Customer</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
