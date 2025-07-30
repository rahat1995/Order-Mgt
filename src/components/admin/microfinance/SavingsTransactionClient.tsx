

'use client';

import React, { useState, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownToDot, ArrowUpFromDot, Landmark, ChevronsUpDown, Check, Ban } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { SavingsAccount, Customer } from '@/types';


const AccountSelector = ({
    value,
    onValueChange,
    filter,
}: {
    value: string;
    onValueChange: (accountId: string) => void;
    filter?: (account: SavingsAccount) => boolean;
}) => {
    const { settings } = useSettings();
    const { savingsAccounts, customers, savingsProducts } = settings;
    const [open, setOpen] = useState(false);

    const accountOptions = useMemo(() => {
        let accounts = savingsAccounts;
        if (filter) {
            accounts = accounts.filter(filter);
        }

        return accounts.map(account => {
            const member = customers.find(c => c.id === account.memberId);
            const product = savingsProducts.find(p => p.id === account.savingsProductId);
            return {
                ...account,
                memberName: member?.name || 'Unknown Member',
                memberCode: member?.code || 'N/A',
                memberMobile: member?.mobile || '',
                productName: product?.name || 'Unknown Product',
                searchValue: `${member?.name} ${member?.code} ${account.accountNumber} ${product?.name} ${member?.mobile}`.toLowerCase(),
            };
        });
    }, [savingsAccounts, customers, savingsProducts, filter]);
    
    const selectedAccountDisplay = useMemo(() => {
        if (!value) return "Select an account...";
        const account = accountOptions.find(acc => acc.id === value);
        if (!account) return "Select an account...";
        return `${account.memberName} (${account.productName}) - ${account.accountNumber}`;
    }, [value, accountOptions]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                    <span className="truncate">{selectedAccountDisplay}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search by name, code, mobile, account no..." />
                    <CommandList>
                        <CommandEmpty>No account found.</CommandEmpty>
                        <CommandGroup>
                            {accountOptions.map(account => (
                                <CommandItem
                                    key={account.id}
                                    value={account.searchValue}
                                    onSelect={() => {
                                        onValueChange(account.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", value === account.id ? "opacity-100" : "opacity-0")} />
                                    <div>
                                        <p>{account.memberName} ({account.productName})</p>
                                        <p className="text-xs text-muted-foreground">{account.memberMobile} | {account.accountNumber}</p>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};


const SavingsForm = ({ type }: { type: 'deposit' | 'withdrawal' }) => {
    const { settings, addSavingsTransaction } = useSettings();
    const { savingsAccounts, savingsTransactions } = settings;
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [amount, setAmount] = useState('');
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const { selectedAccount, cumulativeDeposit, cumulativeWithdrawal } = useMemo(() => {
        const account = savingsAccounts.find(acc => acc.id === selectedAccountId);
        if (!account) return { selectedAccount: null, cumulativeDeposit: 0, cumulativeWithdrawal: 0 };
        
        let totalDeposit = account.openingDeposit;
        let totalWithdrawal = 0;
        
        savingsTransactions.forEach(tx => {
            if (tx.savingsAccountId === selectedAccountId) {
                if (tx.type === 'deposit' || tx.type === 'interest') {
                    totalDeposit += tx.amount;
                } else {
                    totalWithdrawal += tx.amount;
                }
            }
        });
        
        return { selectedAccount: account, cumulativeDeposit: totalDeposit, cumulativeWithdrawal: totalWithdrawal };
    }, [selectedAccountId, savingsAccounts, savingsTransactions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (!selectedAccountId || isNaN(numAmount) || numAmount <= 0) {
            alert('Please select an account and enter a valid amount.');
            return;
        }

        if (type === 'withdrawal' && selectedAccount && numAmount > selectedAccount.balance) {
            alert(`Withdrawal amount cannot exceed the current balance of ৳${selectedAccount.balance.toFixed(2)}.`);
            return;
        }

        addSavingsTransaction({
            savingsAccountId: selectedAccountId,
            type,
            amount: numAmount,
            date: transactionDate,
            notes,
        });

        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} of ৳${numAmount.toFixed(2)} successful!`);
        setSelectedAccountId('');
        setAmount('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
        setNotes('');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Record Savings {type === 'deposit' ? 'Deposit' : 'Withdrawal'}</CardTitle>
                <CardDescription>Select a member's savings account to {type} funds.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Member Savings Account</Label>
                        <AccountSelector 
                            value={selectedAccountId} 
                            onValueChange={setSelectedAccountId} 
                            filter={(account) => account.status !== 'closed'}
                        />
                    </div>
                    {selectedAccount && (
                        <div className="p-3 border rounded-lg bg-muted/50 space-y-2 text-sm">
                            <div className="flex justify-between font-bold text-base">
                                <span>Current Balance:</span>
                                <span>৳{selectedAccount.balance.toFixed(2)}</span>
                            </div>
                             <div className="border-t pt-2 space-y-1 text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Total Deposits:</span>
                                    <span className="text-green-600 font-medium">৳{cumulativeDeposit.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total Withdrawals:</span>
                                    <span className="text-red-600 font-medium">৳{cumulativeWithdrawal.toFixed(2)}</span>
                                </div>
                             </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input id="amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required disabled={!selectedAccountId} />
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="transactionDate">Transaction Date</Label>
                            <Input id="transactionDate" type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} required disabled={!selectedAccountId} />
                         </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input id="notes" value={notes} onChange={e => setNotes(e.target.value)} disabled={!selectedAccountId} />
                     </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={!selectedAccountId}>Submit {type === 'deposit' ? 'Deposit' : 'Withdrawal'}</Button>
                </CardFooter>
            </form>
        </Card>
    );
};

const SavingsClosingForm = () => {
    const { settings, closeSavingsAccount } = useSettings();
    const { savingsAccounts } = settings;
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    
    const selectedAccount = useMemo(() => {
        return savingsAccounts.find(acc => acc.id === selectedAccountId);
    }, [selectedAccountId, savingsAccounts]);

    const handleClose = () => {
        if (!selectedAccountId) {
            alert('Please select an account to close.');
            return;
        }
        if (confirm(`Are you sure you want to close this account? The remaining balance of ৳${selectedAccount?.balance.toFixed(2)} will be withdrawn.`)) {
            closeSavingsAccount(selectedAccountId, closingDate, notes);
            alert('Account closed successfully.');
            setSelectedAccountId('');
            setNotes('');
        }
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Close Savings Account</CardTitle>
                <CardDescription>Close a member's savings account and withdraw the final balance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Member Savings Account to Close</Label>
                    <AccountSelector 
                        value={selectedAccountId} 
                        onValueChange={setSelectedAccountId} 
                        filter={(account) => account.status !== 'closed'}
                    />
                </div>
                {selectedAccount && (
                    <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-200 space-y-2 text-sm">
                        <div className="flex justify-between font-bold text-base text-yellow-800">
                            <span>Final Balance to Withdraw:</span>
                            <span>৳{selectedAccount.balance.toFixed(2)}</span>
                        </div>
                    </div>
                )}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="closingDate">Closing Date</Label>
                        <Input id="closingDate" type="date" value={closingDate} onChange={e => setClosingDate(e.target.value)} required disabled={!selectedAccountId} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="close_notes">Closing Notes (Optional)</Label>
                        <Input id="close_notes" value={notes} onChange={e => setNotes(e.target.value)} disabled={!selectedAccountId} placeholder="e.g., Member requested closure."/>
                    </div>
                 </div>
            </CardContent>
            <CardFooter>
                <Button variant="destructive" onClick={handleClose} disabled={!selectedAccountId}>Permanently Close Account</Button>
            </CardFooter>
        </Card>
    )
}

const SavingsInterestPaymentForm = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Process Interest Payment</CardTitle>
                <CardDescription>Pay out calculated interest to a member's account.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Interest payment form will be here.</p>
            </CardContent>
             <CardFooter>
                <Button>Pay Interest</Button>
            </CardFooter>
        </Card>
    );
}


export function SavingsTransactionClient() {
  return (
    <Tabs defaultValue="deposit" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="deposit">
          <ArrowDownToDot className="mr-2 h-4 w-4" /> Deposit
        </TabsTrigger>
        <TabsTrigger value="withdrawal">
            <ArrowUpFromDot className="mr-2 h-4 w-4" /> Withdrawal
        </TabsTrigger>
        <TabsTrigger value="interest-payment">
            <Landmark className="mr-2 h-4 w-4" /> Interest Payment
        </TabsTrigger>
        <TabsTrigger value="closing">
            <Ban className="mr-2 h-4 w-4" /> Account Closing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="deposit" className="mt-4">
        <SavingsForm type="deposit" />
      </TabsContent>
      <TabsContent value="withdrawal" className="mt-4">
        <SavingsForm type="withdrawal" />
      </TabsContent>
       <TabsContent value="interest-payment" className="mt-4">
        <SavingsInterestPaymentForm />
      </TabsContent>
       <TabsContent value="closing" className="mt-4">
        <SavingsClosingForm />
      </TabsContent>
    </Tabs>
  );
}
