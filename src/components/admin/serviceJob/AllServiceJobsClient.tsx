
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ServiceJob, Customer, Order, ServiceIssue, ServiceType } from '@/types';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, FileText, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { JobCard } from './print/JobCard';
import { ServiceInvoice } from './print/ServiceInvoice';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const JobStatusBadge = ({ status }: { status: ServiceJob['status'] }) => {
  const colorClassMap: { [key in ServiceJob['status']]?: string } = {
    'Ready for Delivery': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    'Delivered': 'bg-blue-100 text-blue-800 border-blue-200',
    'Completed': 'bg-green-100 text-green-800 border-green-200',
    'Waiting for Approval': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Parts Needed': 'bg-orange-100 text-orange-800 border-orange-200',
    'Received': 'bg-gray-100 text-gray-800 border-gray-200',
    'Diagnosing': 'bg-purple-100 text-purple-800 border-purple-200',
    'Repairing': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Testing': 'bg-pink-100 text-pink-800 border-pink-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200',
  };
  
  return <Badge variant={'outline'} className={cn('font-semibold', colorClassMap[status])}>{status}</Badge>;
};

type PrintJobInfo = {
  job: ServiceJob;
  customer: Customer;
  order?: Order;
  issueType?: ServiceIssue;
  serviceType?: ServiceType;
  type: 'card' | 'invoice';
};

const statusOptions: ServiceJob['status'][] = [
    'Received',
    'Diagnosing',
    'Waiting for Approval',
    'Repairing',
    'Parts Needed',
    'Testing',
    'Ready for Delivery',
    'Delivered',
    'Cancelled'
];


export function AllServiceJobsClient() {
  const { settings, updateServiceJob, isLoaded } = useSettings();
  const { serviceJobs, customers, orders, serviceIssues, serviceTypes, organization } = settings;
  const router = useRouter();

  const [jobToPrint, setJobToPrint] = useState<PrintJobInfo | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const printInNewWindow = (contentRef: React.RefObject<HTMLDivElement>, title: string) => {
    if (!contentRef.current) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Could not open print window. Please disable your popup blocker.');
      return;
    }
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(el => el.outerHTML).join('\n');
    printWindow.document.write(`<html><head><title>${title}</title>${styleTags}</head><body><div class="p-4 print:p-0">${contentRef.current.innerHTML}</div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  useEffect(() => {
    if (jobToPrint && printRef.current) {
      const timer = setTimeout(() => {
        printInNewWindow(printRef, 'Service Document');
        setJobToPrint(null); // Reset after printing
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [jobToPrint]);

  const handleStatusChange = (jobId: string, newStatus: ServiceJob['status']) => {
    const jobToUpdate = settings.serviceJobs.find(j => j.id === jobId);
    if (jobToUpdate) {
      updateServiceJob({ ...jobToUpdate, status: newStatus });
    }
  };

  const handlePrint = (job: ServiceJob) => {
    const customer = customers.find(c => c.id === job.customerId);
    if (!customer) {
      alert("Customer not found!");
      return;
    }
    const issueType = serviceIssues.find(i => i.id === job.issueTypeId);
    const serviceType = serviceTypes.find(st => st.id === job.serviceTypeId);

    if (job.orderId) {
      const order = orders.find(o => o.id === job.orderId);
      if (order) {
        setJobToPrint({ job, customer, order, type: 'invoice', issueType, serviceType });
      } else {
        alert("Billed order not found!");
      }
    } else {
      setJobToPrint({ job, customer, issueType, serviceType, type: 'card' });
    }
  };

  if (!isLoaded) {
    return <div>Loading service jobs...</div>;
  }
  
  const sortedJobs = [...serviceJobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      <div className="hidden">
        <div ref={printRef}>
          {jobToPrint?.type === 'card' &&
            <JobCard 
              job={jobToPrint.job} 
              customer={jobToPrint.customer} 
              organization={organization}
              issueType={jobToPrint.issueType}
              serviceType={jobToPrint.serviceType}
            />
          }
          {jobToPrint?.type === 'invoice' && jobToPrint.order && jobToPrint.job &&
            <ServiceInvoice 
              job={jobToPrint.job}
              order={jobToPrint.order} 
              customer={jobToPrint.customer} 
              organization={organization} 
              issueType={jobToPrint.issueType}
              serviceType={jobToPrint.serviceType}
            />
          }
        </div>
      </div>

       <div className="flex justify-between items-center">
        <div>
          {/* This is intentionally left blank to align the button to the right */}
        </div>
        <Button onClick={() => router.push('/admin/modules/serviceJob/manage')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Job
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>All Service Jobs</CardTitle>
            <CardDescription>View and manage all created service jobs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job No.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedJobs.length > 0 ? (
                sortedJobs.map(job => {
                  const customer = customers.find(c => c.id === job.customerId);
                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.jobNumber}</TableCell>
                      <TableCell>{customer?.name || 'N/A'}</TableCell>
                      <TableCell>{job.deviceName}</TableCell>
                      <TableCell>
                          <Select value={job.status} onValueChange={(newStatus) => handleStatusChange(job.id, newStatus as ServiceJob['status'])}>
                            <SelectTrigger className="w-48 h-8">
                                <JobStatusBadge status={job.status} />
                            </SelectTrigger>
                             <SelectContent>
                                {statusOptions.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                      </TableCell>
                      <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handlePrint(job)}>
                            <Printer className="mr-2 h-4 w-4" /> Print
                          </Button>
                          {job.orderId ? (
                            <Button variant="secondary" size="sm" disabled>Billed</Button>
                          ) : (
                            <Button size="sm" onClick={() => router.push(`/admin/modules/serviceJob/billing?jobId=${job.id}`)}>
                              <FileText className="mr-2 h-4 w-4" /> Create Bill
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No Service Jobs Found. Click "Create New Job" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
