
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Order, Challan, Customer } from '@/types';
import { Download, Search, Printer, Pencil, Trash2, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { CustomerReceipt } from '@/components/admin/pos/print/CustomerReceipt';
import { BillPrint } from '@/components/admin/challan/print/BillPrint';
import { useRouter } from 'next/navigation';

const getISODateString = (date: Date) => {
    return date.toISOString().split('T')[0];
}

export function SalesReportClient() {
  const { settings, deleteOrder, isLoaded } = useSettings();
  const { orders, organization, challans, customers } = settings;
  const router = useRouter();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [billToPrint, setBillToPrint] = useState<{ order: Order; challan: Challan; customer: Customer } | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);
  const billPrintRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const printInNewWindow = (contentRef: React.RefObject<HTMLDivElement>, title: string) => {
    if (!contentRef.current) {
        console.error("Print content ref is not available.");
        return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        alert('Could not open print window. Please disable your popup blocker.');
        return;
    }

    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML)
        .join('\n');

    const contentHTML = contentRef.current.innerHTML;

    const html = `
        <html>
            <head>
                <title>${title}</title>
                ${styleTags}
            </head>
            <body>
                <div class="p-4">
                    ${contentHTML}
                </div>
            </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
    }, 500);
  };


  const handlePrintReport = () => {
    printInNewWindow(reportRef, "Sales Report");
  };

  useEffect(() => {
    if (orderToPrint && receiptRef.current) {
      const timer = setTimeout(() => {
        printInNewWindow(receiptRef, `Receipt #${orderToPrint.orderNumber}`);
        setOrderToPrint(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [orderToPrint]);
  
  useEffect(() => {
    if (billToPrint && billPrintRef.current) {
      const timer = setTimeout(() => {
        printInNewWindow(billPrintRef, `Bill - ${billToPrint.order.orderNumber}`);
        setBillToPrint(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [billToPrint]);

  const { filteredOrders, stats } = useMemo(() => {
    if (!isLoaded || !startDate || !endDate) {
      return { filteredOrders: [], stats: { totalSales: 0, totalOrders: 0, totalDiscount: 0 }};
    }
    
    let tempOrders = orders.filter(o => o.status !== 'cancelled');

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    tempOrders = tempOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
    });

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        tempOrders = tempOrders.filter(order => {
            const matchesOrderId = order.orderNumber.toLowerCase().includes(lowercasedQuery);
            const matchesCustomerMobile = order.customerMobile?.toLowerCase().includes(lowercasedQuery) || false;
            const matchesCustomerName = order.customerName?.toLowerCase().includes(lowercasedQuery) || false;
            const matchesItem = order.items.some(item => item.name.toLowerCase().includes(lowercasedQuery));
            return matchesOrderId || matchesCustomerMobile || matchesItem || matchesCustomerName;
        });
    }

    const calculatedStats = {
      totalSales: tempOrders.reduce((acc, order) => acc + order.total, 0),
      totalOrders: tempOrders.length,
      totalDiscount: tempOrders.reduce((acc, order) => acc + (order.discountAmount || 0), 0),
    };

    return { 
        filteredOrders: tempOrders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), 
        stats: calculatedStats 
    };
  }, [orders, startDate, endDate, searchQuery, isLoaded]);
  
  const setDateRange = (preset: 'today' | 'this_month' | 'last_month') => {
      const today = new Date();
      let start = new Date();
      let end = new Date();

      if (preset === 'today') {
        // already set by default
      } else if (preset === 'this_month') {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      } else if (preset === 'last_month') {
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
      }
      
      setStartDate(getISODateString(start));
      setEndDate(getISODateString(end));
  }
  
  const handleExport = () => {
    const dataToExport = filteredOrders.map(order => ({
        'Date': new Date(order.createdAt).toLocaleString(),
        'Order Number': order.orderNumber,
        'Customer Name': order.customerName,
        'Customer Mobile': order.customerMobile || 'N/A',
        'Total Quantity': order.items.reduce((acc, item) => acc + item.quantity, 0),
        'Discount': order.discountAmount.toFixed(2),
        'Total': order.total.toFixed(2),
        'Status': order.status,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    XLSX.writeFile(wb, `SalesReport_${startDate}_to_${endDate}.xlsx`);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
        deleteOrder(orderId);
    }
  }

  const handleEditOrder = (orderId: string) => {
    router.push(`/admin/modules/pos/orderEntry?orderId=${orderId}`);
  };

  const handlePrintBill = (order: Order) => {
    if (!order.challanId) return;
    const challan = challans.find(c => c.id === order.challanId);
    const customer = customers.find(c => c.id === order.customerId);

    if (challan && customer) {
        setBillToPrint({ order, challan, customer });
    } else {
        alert('Could not find required challan or customer information to print the bill.');
    }
  };


  if (!isLoaded) {
    return <div>Loading report...</div>;
  }
  
  return (
    <div className="space-y-6">
        <div className="hidden">
            {orderToPrint && organization && (
                <div ref={receiptRef}>
                    <CustomerReceipt order={orderToPrint} organization={organization} />
                </div>
            )}
             {billToPrint && organization && (
                <div ref={billPrintRef}>
                    <BillPrint 
                        order={billToPrint.order} 
                        challan={billToPrint.challan} 
                        customer={billToPrint.customer} 
                        organization={organization} 
                    />
                </div>
            )}
        </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filter Report</CardTitle>
           <div className="flex items-center gap-2">
            <Button onClick={handlePrintReport} variant="outline" size="sm" disabled={filteredOrders.length === 0}>
                <Printer className="mr-2 h-4 w-4" /> Print Report
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm" disabled={filteredOrders.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div className="flex items-end gap-2">
                    <Button variant="secondary" onClick={() => setDateRange('today')}>Today</Button>
                    <Button variant="secondary" onClick={() => setDateRange('this_month')}>This Month</Button>
                    <Button variant="secondary" onClick={() => setDateRange('last_month')}>Last Month</Button>
                </div>
            </div>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by Order ID, Customer Name/Mobile, or Item Name..."
                    className="w-full pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">৳{stats.totalSales.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">৳{stats.totalDiscount.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Details</CardTitle>
        </CardHeader>
        <CardContent ref={reportRef}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Discount</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right print:hidden">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredOrders.length > 0 ? filteredOrders.map(order => (
                        <TableRow key={order.id}>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{order.orderNumber}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.customerMobile || 'N/A'}</TableCell>
                            <TableCell className="text-center">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
                            <TableCell className="text-right">৳{order.discountAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">৳{order.total.toFixed(2)}</TableCell>
                            <TableCell className="text-right print:hidden">
                                <div className="flex justify-end gap-2">
                                    {order.challanId ? (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Print Bill" onClick={() => handlePrintBill(order)}>
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Print Receipt" onClick={() => setOrderToPrint(order)}>
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Order" onClick={() => handleEditOrder(order.id)}><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Delete Order" onClick={() => handleDeleteOrder(order.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center h-24">No sales found for the selected criteria. Please select a date range to begin.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
