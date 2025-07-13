
'use client';

import React, { useEffect, useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ServiceJob, Customer, Order } from '@/types';
import { Package, FileText, List } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  
  return <Badge variant={'outline'} className={cn('font-semibold text-base px-4 py-2', colorClassMap[status])}>{status}</Badge>;
};


export default function JobStatusPage() {
    const { settings, isLoaded } = useSettings();
    const params = useParams();
    const { jobId } = params;

    const [job, setJob] = useState<ServiceJob | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (isLoaded && jobId) {
            const foundJob = settings.serviceJobs.find(j => j.id === jobId);
            if(foundJob) {
                setJob(foundJob);
                const foundCustomer = settings.customers.find(c => c.id === foundJob.customerId);
                setCustomer(foundCustomer || null);
                if (foundJob.orderId) {
                    const foundOrder = settings.orders.find(o => o.id === foundJob.orderId);
                    setOrder(foundOrder || null);
                }
            }
        }
    }, [isLoaded, jobId, settings.serviceJobs, settings.customers, settings.orders]);

    if (!isLoaded) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-muted/40">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!job) {
         return (
            <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Job Not Found</CardTitle>
                        <CardDescription>The service job ID is invalid or does not exist.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-4">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mb-4">
                            <Package className="h-6 w-6" />
                        </div>
                        <CardTitle>Service Status for Job #{job.jobNumber}</CardTitle>
                        <CardDescription>Thank you for your patience. Your device status is updated below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-center text-muted-foreground">Current Status:</h3>
                            <div className="flex justify-center">
                                <JobStatusBadge status={job.status} />
                            </div>
                        </div>
                        <div className="border-t pt-4 space-y-1 text-sm text-muted-foreground">
                            <p><strong>Customer:</strong> {customer?.name}</p>
                            <p><strong>Device:</strong> {job.deviceName} ({job.deviceModel})</p>
                            <p><strong>Reported Issue:</strong> {settings.serviceIssues.find(i => i.id === job.issueTypeId)?.name}</p>
                            <p><strong>Received On:</strong> {new Date(job.createdAt).toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>

                {order && (
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                             <FileText className="h-6 w-6 text-primary" />
                            <CardTitle>Billing Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Bill:</span>
                                <span className="font-semibold">৳{order.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount Paid:</span>
                                <span className="font-semibold">৳{(order.amountTendered || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base pt-2 border-t">
                                <span className="text-destructive">Amount Due:</span>
                                <span className="text-destructive">৳{(order.total - (order.amountTendered || 0)).toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {job.statusHistory && job.statusHistory.length > 0 && (
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <List className="h-6 w-6 text-primary" />
                            <CardTitle>Status History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                            {job.statusHistory.slice().reverse().map((historyItem, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={cn("h-4 w-4 rounded-full", index === 0 ? 'bg-primary' : 'bg-muted-foreground/50')}></div>
                                        {index < job.statusHistory!.length - 1 && <div className="w-px h-8 bg-muted-foreground/30"></div>}
                                    </div>
                                    <div>
                                        <p className={cn("font-semibold", index === 0 && 'text-primary')}>{historyItem.status}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(historyItem.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                 <div className="text-center text-xs text-muted-foreground/80 pt-4">
                    <p>Status is updated in real-time. Please contact us if you have any questions.</p>
                    <p className="font-semibold mt-2">{settings.organization.name}</p>
                </div>
            </div>
        </div>
    );
}
