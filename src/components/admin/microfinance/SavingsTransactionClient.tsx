
'use client';

import React, { useState, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownToDot, ArrowUpFromDot, Landmark, ChevronsUpDown, Check } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { SavingsAccount, Customer } from '@/types';


const AccountSelector = ({
    value,
    onValueChange,
}: {
    value: string;
    onValueChange: (accountId: string) => void;
}) => {
    const { settings } = useSettings();
    const { savingsAccounts, customers, savingsProducts } = settings;
    const [open, setOpen] = useState(false);

    const accountOptions = useMemo(() => {
        return savingsAccounts.map(account => {
            const member = customers.find(c => c.id === account.memberId);
            const product = savingsProducts.find(p => p.id === account.savingsProductId);
            return {
                ...account,
                memberName: member?.name || 'Unknown Member',
                memberCode: member?.code || 'N/A',
                productName: product?.name || 'Unknown Product',
                searchValue: `${member?.name} ${member?.code} ${account.accountNumber} ${product?.name}`.toLowerCase(),
            };
        });
    }, [savingsAccounts, customers, savingsProducts]);
    
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
                    <CommandInput placeholder="Search by name, code, account no..." />
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
                                        <p className="text-xs text-muted-foreground">{account.accountNumber}</p>
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
    const { savingsAccounts } = settings;
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    const selectedAccount = useMemo(() => savingsAccounts.find(acc => acc.id === selectedAccountId), [selectedAccountId, savingsAccounts]);

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
            notes,
        });

        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} of ৳${numAmount.toFixed(2)} successful!`);
        setSelectedAccountId('');
        setAmount('');
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
                        <AccountSelector value={selectedAccountId} onValueChange={setSelectedAccountId} />
                    </div>
                    {selectedAccount && (
                        <div className="p-2 bg-muted text-muted-foreground rounded-md text-sm">
                            Current Balance: <span className="font-bold text-foreground">৳{selectedAccount.balance.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input id="amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required disabled={!selectedAccountId} />
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Input id="notes" value={notes} onChange={e => setNotes(e.target.value)} disabled={!selectedAccountId} />
                         </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={!selectedAccountId}>Submit {type === 'deposit' ? 'Deposit' : 'Withdrawal'}</Button>
                </CardFooter>
            </form>
        </Card>
    );
};

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
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="deposit">
          <ArrowDownToDot className="mr-2 h-4 w-4" /> Deposit
        </TabsTrigger>
        <TabsTrigger value="withdrawal">
            <ArrowUpFromDot className="mr-2 h-4 w-4" /> Withdrawal
        </TabsTrigger>
        <TabsTrigger value="interest-payment">
            <Landmark className="mr-2 h-4 w-4" /> Interest Payment
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
    </Tabs>
  );
}
