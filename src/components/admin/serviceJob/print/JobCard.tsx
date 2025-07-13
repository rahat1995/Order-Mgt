
'use client';

import React, { useState, useEffect } from 'react';
import type { ServiceJob, Customer, OrganizationInfo, ServiceIssue, ServiceType } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import Barcode from 'react-barcode';
import QRCode from 'react-qr-code';
import { Package } from 'lucide-react';

interface JobCardProps {
  job: ServiceJob;
  customer: Customer;
  organization: OrganizationInfo;
  issueType?: ServiceIssue;
  serviceType?: ServiceType;
}

const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
};


export const JobCard = ({ job, customer, organization, issueType, serviceType }: JobCardProps) => {
    const { settings } = useSettings();
    const [qrUrl, setQrUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setQrUrl(`${window.location.origin}/status/${job.id}`);
        }
    }, [job.id]);

    const terms = settings.serviceJobSettings.termsAndConditions.split('\n');

    return (
        <div className="bg-white text-black font-sans w-[210mm] min-h-[297mm] mx-auto p-12 print:p-6 print:shadow-none print:m-0">
            {/* Header */}
            <header className="flex justify-between items-start pb-6 border-b-2 border-gray-800">
                <div className="flex items-center gap-4">
                    {organization.logo ? (
                        <img src={organization.logo} alt="Organization Logo" className="h-20 w-20 object-contain" data-ai-hint="company logo" />
                    ) : (
                        <div className="h-20 w-20 bg-gray-200 flex items-center justify-center rounded-md">
                            <Package className="h-10 w-10 text-gray-500" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
                        <p className="text-sm text-gray-600">{organization.address}</p>
                        <p className="text-sm text-gray-600">Tel: {organization.mobile} | Email: {organization.email}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-semibold uppercase text-gray-700">Service Job Card</h2>
                    <p className="text-md mt-2"><strong>Job No:</strong> {job.jobNumber}</p>
                    <p className="text-sm text-gray-600"><strong>Date:</strong> {formatDate(job.createdAt)}</p>
                </div>
            </header>

            {/* Body */}
            <main className="mt-8 grid grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    <div className="border border-gray-300 rounded-lg p-4">
                        <h3 className="text-lg font-semibold border-b pb-2 mb-3">Customer Information</h3>
                        <div className="text-sm space-y-1">
                            <p><strong>Name:</strong> {customer.name}</p>
                            <p><strong>Mobile:</strong> {customer.mobile}</p>
                            <p><strong>Address:</strong> {customer.address || 'N/A'}</p>
                            <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
                        </div>
                    </div>
                     <div className="border border-gray-300 rounded-lg p-4">
                        <h3 className="text-lg font-semibold border-b pb-2 mb-3">Device Information</h3>
                        <div className="text-sm space-y-1">
                            <p><strong>Device:</strong> {job.deviceName}</p>
                            <p><strong>Model:</strong> {job.deviceModel || 'N/A'}</p>
                            <p><strong>Service Type:</strong> {serviceType?.name || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6 text-center">
                     <div className="border border-gray-300 rounded-lg p-4">
                        <h3 className="text-lg font-semibold border-b pb-2 mb-3">Service Tracking</h3>
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="p-2 bg-white border rounded-md">
                                {qrUrl ? <QRCode value={qrUrl} size={128} /> : <div className="h-[128px] w-[128px] bg-gray-200 animate-pulse" />}
                            </div>
                            <p className="text-xs text-gray-600">Scan this QR code with your phone to track the real-time status of your service request.</p>
                        </div>
                    </div>
                    <div>
                         <Barcode value={job.jobNumber} height={60} width={2} fontSize={16} />
                    </div>
                </div>
            </main>
            
            {/* Issue Details Section */}
            <section className="mt-8 border border-gray-300 rounded-lg p-4">
                 <h3 className="text-lg font-semibold border-b pb-2 mb-3">Reported Issue ({issueType?.name || 'N/A'})</h3>
                 <p className="text-sm min-h-[60px]">{job.issueDetails || 'No specific details provided.'}</p>
            </section>
            
            {/* Terms & Conditions Section */}
            <section className="mt-8">
                <h3 className="text-md font-semibold mb-2">Terms & Conditions</h3>
                <div className="text-xs text-gray-600 space-y-1 border-t pt-2">
                    {terms.map((term, index) => (
                        <p key={index}>{term}</p>
                    ))}
                </div>
            </section>

            {/* Signature Section */}
            <footer className="mt-16 pt-8 grid grid-cols-2 gap-16 text-center">
                <div>
                    <div className="border-t-2 border-gray-400 border-dotted pt-2">
                        <p className="font-semibold">Customer Signature</p>
                    </div>
                </div>
                 <div>
                    <div className="border-t-2 border-gray-400 border-dotted pt-2">
                        <p className="font-semibold">Authorized Signature</p>
                    </div>
                </div>
            </footer>
             {organization.receiptFooter && <p className="text-center text-xs text-gray-500 mt-8">{organization.receiptFooter}</p>}
        </div>
    );
};
