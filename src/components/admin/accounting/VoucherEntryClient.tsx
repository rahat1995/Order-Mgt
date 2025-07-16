
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown, XCircle, PlusCircle, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import type { VoucherType, VoucherTransaction, LedgerAccount } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

type TransactionRow = Omit<VoucherTransaction, 'isDebit' | 'amount'> & {
    debit: number;
    credit: number;
};

export function VoucherEntryClient() {
    const { settings, addAccountingVoucher, isLoaded } = useSettings();
    const { ledgerAccounts, accountingSettings } = settings;

    const [voucherType, setVoucherType] = useState<VoucherType>('Payment');
    const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
    const [narration, setNarration] = useState('');
    const [transactions, setTransactions] = useState<TransactionRow[]>([]);

    useEffect(() => {
        resetForm();
    }, [voucherType]);

    const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
        const debit = transactions.reduce((acc, tx) => acc + tx.debit, 0);
        const credit = transactions.reduce((acc, tx) => acc + tx.credit, 0);
        return { totalDebit: debit, totalCredit: credit, isBalanced: debit > 0 && Math.abs(debit - credit) < 0.01 };
    }, [transactions]);
    
    const availableLedgers = useMemo(() => {
        const cashAndBankIds = [...(accountingSettings.cashLedgerIds || []), ...(accountingSettings.bankLedgerIds || [])];
        if (voucherType === 'Journal') {
            return ledgerAccounts.filter(l => !cashAndBankIds.includes(l.id));
        }
        if (voucherType === 'Contra') {
            return ledgerAccounts.filter(l => cashAndBankIds.includes(l.id));
        }
        return ledgerAccounts;
    }, [voucherType, ledgerAccounts, accountingSettings]);


    const resetForm = () => {
        setVoucherDate(new Date().toISOString().split('T')[0]);
        setNarration('');
        setTransactions([]);
    };

    const addRow = () => {
        setTransactions([...transactions, { id: uuidv4(), ledgerId: '', debit: 0, credit: 0, narration: '' }]);
    };

    const handleTransactionChange = (id: string, field: keyof TransactionRow, value: any) => {
        setTransactions(prev => prev.map(tx => {
            if (tx.id === id) {
                const newTx = { ...tx, [field]: value };
                if (field === 'debit' && value > 0) newTx.credit = 0;
                if (field === 'credit' && value > 0) newTx.debit = 0;
                return newTx;
            }
            return tx;
        }));
    };

    const removeRow = (id: string) => {
        setTransactions(prev => prev.filter(tx => tx.id !== id));
    };

    const handleSubmit = () => {
        if (!isBalanced) {
            alert("Debit and Credit totals must be equal and greater than zero.");
            return;
        }
        if (transactions.some(tx => !tx.ledgerId)) {
            alert("Please select a ledger for all transaction rows.");
            return;
        }

        const finalTransactions: VoucherTransaction[] = transactions.map(tx => ({
            id: tx.id,
            ledgerId: tx.ledgerId,
            isDebit: tx.debit > 0,
            amount: tx.debit > 0 ? tx.debit : tx.credit,
            narration: tx.narration
        }));

        addAccountingVoucher({
            type: voucherType,
            date: voucherDate,
            narration: narration,
            transactions: finalTransactions
        });

        alert(`${voucherType} voucher saved successfully!`);
        resetForm();
    };

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create New Voucher</CardTitle>
                <CardDescription>Record a financial transaction. Ensure debits and credits are balanced before saving.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="voucherType">Voucher Type</Label>
                        <Select name="voucherType" value={voucherType} onValueChange={(v) => setVoucherType(v as VoucherType)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Payment">Payment</SelectItem>
                                <SelectItem value="Receipt">Receipt</SelectItem>
                                <SelectItem value="Contra">Contra</SelectItem>
                                <SelectItem value="Journal">Journal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="voucherDate">Date</Label>
                        <Input id="voucherDate" type="date" value={voucherDate} onChange={e => setVoucherDate(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="narration">Overall Narration (Optional)</Label>
                    <Textarea id="narration" value={narration} onChange={e => setNarration(e.target.value)} placeholder={`Being ${voucherType.toLowerCase()} for...`}/>
                </div>

                <div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-2/5">Ledger Account</TableHead>
                                <TableHead>Narration</TableHead>
                                <TableHead className="w-[120px] text-right">Debit</TableHead>
                                <TableHead className="w-[120px] text-right">Credit</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map(tx => (
                                <TransactionRowComponent
                                    key={tx.id}
                                    transaction={tx}
                                    ledgers={availableLedgers}
                                    onChange={handleTransactionChange}
                                    onRemove={removeRow}
                                />
                            ))}
                        </TableBody>
                    </Table>
                    <Button onClick={addRow} variant="outline" size="sm" className="mt-2">
                        <PlusCircle className="mr-2 h-4 w-4"/> Add Row
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-end gap-4">
                <div className="w-full md:w-2/3 grid grid-cols-2 gap-4 text-center font-bold p-4 border rounded-lg bg-muted/50">
                    <div>
                        <p className="text-lg text-muted-foreground">Total Debits</p>
                        <p className="text-2xl">৳{totalDebit.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-lg text-muted-foreground">Total Credits</p>
                        <p className="text-2xl">৳{totalCredit.toFixed(2)}</p>
                    </div>
                </div>
                <div className={cn(
                    "w-full flex items-center justify-center gap-2 p-3 rounded-lg text-base font-semibold",
                    isBalanced ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                )}>
                    {isBalanced ? <CheckCircle2 className="h-5 w-5"/> : <AlertCircle className="h-5 w-5"/>}
                    {isBalanced ? "Totals are balanced." : "Debit and Credit totals do not match."}
                </div>
                <Button onClick={handleSubmit} disabled={!isBalanced}>Save Voucher</Button>
            </CardFooter>
        </Card>
    );
}

const TransactionRowComponent = ({ transaction, ledgers, onChange, onRemove }: {
    transaction: TransactionRow;
    ledgers: LedgerAccount[];
    onChange: (id: string, field: keyof TransactionRow, value: any) => void;
    onRemove: (id: string) => void;
}) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    
    return (
        <TableRow>
            <TableCell>
                 <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                            {transaction.ledgerId ? ledgers.find(l => l.id === transaction.ledgerId)?.name : "Select ledger..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Search ledgers..." />
                            <CommandList>
                                <CommandEmpty>No ledger found.</CommandEmpty>
                                <CommandGroup>
                                    {ledgers.map((ledger) => (
                                        <CommandItem
                                            key={ledger.id}
                                            value={ledger.name}
                                            onSelect={() => {
                                                onChange(transaction.id, 'ledgerId', ledger.id);
                                                setPopoverOpen(false);
                                            }}
                                        >
                                            <Check className={cn("mr-2 h-4 w-4", transaction.ledgerId === ledger.id ? "opacity-100" : "opacity-0")}/>
                                            {ledger.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </TableCell>
            <TableCell>
                <Input
                    placeholder="Line narration..."
                    value={transaction.narration}
                    onChange={e => onChange(transaction.id, 'narration', e.target.value)}
                    className="h-9"
                />
            </TableCell>
            <TableCell>
                 <Input
                    type="number"
                    step="0.01"
                    value={transaction.debit || ''}
                    onChange={e => onChange(transaction.id, 'debit', parseFloat(e.target.value) || 0)}
                    className="h-9 text-right"
                    placeholder="0.00"
                />
            </TableCell>
            <TableCell>
                 <Input
                    type="number"
                    step="0.01"
                    value={transaction.credit || ''}
                    onChange={e => onChange(transaction.id, 'credit', parseFloat(e.target.value) || 0)}
                    className="h-9 text-right"
                    placeholder="0.00"
                />
            </TableCell>
            <TableCell>
                <Button variant="ghost" size="icon" onClick={() => onRemove(transaction.id)} className="h-8 w-8">
                    <XCircle className="h-4 w-4 text-destructive"/>
                </Button>
            </TableCell>
        </TableRow>
    );
};
