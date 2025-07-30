
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownToDot, ArrowUpFromDot, Landmark, ChevronsUpDown, Check, Ban, Shuffle } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { SavingsAccount, Customer } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';


const AccountSelector = ({
    value,
    onValueChange,
    filter,
    label = "Member Savings Account",
}: {
    value: string;
    onValueChange: (accountId: string) => void;
    filter?: (account: SavingsAccount) => boolean;
    label?: string;
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
        <div className="space-y-2">
            <Label>{label}</Label>
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
        </div>
    );
};


const SavingsForm = ({ type }: { type: 'deposit' | 'withdrawal' }) => {
    const { settings, addSavingsTransaction } = useSettings();
    const router = useRouter();
    const { savingsAccounts, savingsTransactions } = settings;
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [amount, setAmount] = useState('');
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const { selectedAccount, cumulativeDeposit, cumulativeWithdrawal } = useMemo(() => {
        const account = savingsAccounts.find(acc => acc.id === selectedAccountId);
        if (!account) return { selectedAccount: null, cumulativeDeposit: 0, cumulativeWithdrawal: 0 };
        
        let totalDeposit = account.openingDeposit || 0;
        let totalWithdrawal = 0;
        
        savingsTransactions.forEach(tx => {
            if (tx.savingsAccountId === selectedAccountId) {
                if (tx.type === 'deposit' || tx.type === 'interest' || tx.type === 'adjustment-in') {
                    totalDeposit += tx.amount;
                } else if (tx.type === 'withdrawal' || tx.type === 'adjustment-out') {
                    totalWithdrawal += tx.amount;
                }
            }
        });
        
        return { selectedAccount: account, cumulativeDeposit: totalDeposit, cumulativeWithdrawal: totalWithdrawal };
    }, [selectedAccountId, savingsAccounts, savingsTransactions]);

    const handleFormReset = () => {
        setSelectedAccountId('');
        setAmount('');
        setTransactionDate(new Date().toISOString().split('T')[0]);
        setNotes('');
    }

    const handleSubmit = (redirect: boolean) => {
        const numAmount = parseFloat(amount);
        if (!selectedAccountId || isNaN(numAmount) || numAmount <= 0) {
            alert('Please select an account and enter a valid amount.');
            return false;
        }

        if (type === 'withdrawal' && selectedAccount && numAmount > selectedAccount.balance) {
            alert(`Withdrawal amount cannot exceed the current balance of ৳${(selectedAccount.balance || 0).toFixed(2)}.`);
            return false;
        }

        addSavingsTransaction({
            savingsAccountId: selectedAccountId,
            type,
            amount: numAmount,
            date: transactionDate,
            notes,
        });

        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} of ৳${numAmount.toFixed(2)} successful!`);
        
        if (redirect) {
            router.push('/admin/modules/microfinance/savings-accounts');
        } else {
            handleFormReset();
        }
        return true;
    };
    
    const onFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(true);
    }
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedAccountId, amount, transactionDate, notes]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Record Savings {type === 'deposit' ? 'Deposit' : 'Withdrawal'}</CardTitle>
                <CardDescription>Select a member's savings account to {type} funds.</CardDescription>
            </CardHeader>
            <form onSubmit={onFormSubmit}>
                <CardContent className="space-y-4">
                    <AccountSelector 
                        value={selectedAccountId} 
                        onValueChange={setSelectedAccountId} 
                        filter={(account) => account.status !== 'closed'}
                    />
                    {selectedAccount && (
                        <div className="p-3 border rounded-lg bg-muted/50 space-y-2 text-sm">
                            <div className="flex justify-between font-bold text-base">
                                <span>Current Balance:</span>
                                <span>৳{(selectedAccount.balance || 0).toFixed(2)}</span>
                            </div>
                             <div className="border-t pt-2 space-y-1 text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Total Deposits:</span>
                                    <span className="text-green-600 font-medium">৳{(cumulativeDeposit || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total Withdrawals:</span>
                                    <span className="text-red-600 font-medium">৳{(cumulativeWithdrawal || 0).toFixed(2)}</span>
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
                <CardFooter className="gap-2">
                    <Button type="submit" disabled={!selectedAccountId}>Submit &amp; View Accounts (Ctrl+Enter)</Button>
                    <Button type="button" variant="secondary" onClick={() => handleSubmit(false)} disabled={!selectedAccountId}>Submit &amp; Add Another</Button>
                </CardFooter>
            </form>
        </Card>
    );
};

const SavingsClosingForm = () => {
    const { settings, closeSavingsAccount } = useSettings();
    const router = useRouter();
    const { savingsAccounts } = settings;
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    
    const selectedAccount = useMemo(() => {
        return savingsAccounts.find(acc => acc.id === selectedAccountId);
    }, [selectedAccountId, savingsAccounts]);

    const handleClose = (redirect: boolean) => {
        if (!selectedAccountId) {
            alert('Please select an account to close.');
            return;
        }
        if (confirm(`Are you sure you want to close this account? The remaining balance of ৳${(selectedAccount?.balance || 0).toFixed(2)} will be withdrawn.`)) {
            closeSavingsAccount(selectedAccountId, closingDate, notes);
            alert('Account closed successfully.');
            if(redirect) {
                router.push('/admin/modules/microfinance/savings-accounts');
            } else {
                setSelectedAccountId('');
                setNotes('');
            }
        }
    }
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleClose(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedAccountId, closingDate, notes]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Close Savings Account</CardTitle>
                <CardDescription>Close a member's savings account and withdraw the final balance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <AccountSelector 
                    value={selectedAccountId} 
                    onValueChange={setSelectedAccountId} 
                    filter={(account) => account.status !== 'closed'}
                    label="Member Savings Account to Close"
                />
                {selectedAccount && (
                    <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-200 space-y-2 text-sm">
                        <div className="flex justify-between font-bold text-base text-yellow-800">
                            <span>Final Balance to Withdraw:</span>
                            <span>৳{(selectedAccount.balance || 0).toFixed(2)}</span>
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
            <CardFooter className="gap-2">
                <Button variant="destructive" onClick={() => handleClose(true)} disabled={!selectedAccountId}>Close &amp; View Accounts (Ctrl+Enter)</Button>
                <Button variant="destructive" onClick={() => handleClose(false)} disabled={!selectedAccountId}>Close &amp; Add Another</Button>
            </CardFooter>
        </Card>
    )
}

const SavingsAdjustmentForm = () => {
    const { settings, addSavingsAdjustment } = useSettings();
    const router = useRouter();
    const { customers, savingsAccounts, savingsProductTypes } = settings;
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [fromAccountId, setFromAccountId] = useState('');
    const [toAccountId, setToAccountId] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [adjustmentDate, setAdjustmentDate] = useState(new Date().toISOString().split('T')[0]);

    const rsTypeId = savingsProductTypes.find(t => t.code === 'RS')?.id;
    const dpsTypeId = savingsProductTypes.find(t => t.code === 'DPS')?.id;

    const { fromAccounts, toAccounts, fromAccountBalance } = useMemo(() => {
        if (!selectedCustomerId) return { fromAccounts: [], toAccounts: [], fromAccountBalance: 0 };
        const memberAccounts = savingsAccounts.filter(acc => acc.memberId === selectedCustomerId && acc.status === 'active');
        
        const f = memberAccounts.filter(acc => acc.savingsProductId && settings.savingsProducts.find(p => p.id === acc.savingsProductId)?.savingsProductTypeId === rsTypeId);
        const t = memberAccounts.filter(acc => {
            const product = settings.savingsProducts.find(p => p.id === acc.savingsProductId);
            return product && (product.savingsProductTypeId === rsTypeId || product.savingsProductTypeId === dpsTypeId);
        }).filter(acc => acc.id !== fromAccountId);

        const balance = fromAccountId ? memberAccounts.find(acc => acc.id === fromAccountId)?.balance || 0 : 0;
        
        return { fromAccounts: f, toAccounts: t, fromAccountBalance: balance };
    }, [selectedCustomerId, fromAccountId, savingsAccounts, settings.savingsProducts, rsTypeId, dpsTypeId]);

    const handleSubmit = (redirect: boolean) => {
        const numAmount = parseFloat(amount);
        if (!fromAccountId || !toAccountId || isNaN(numAmount) || numAmount <= 0) {
            alert('Please select valid accounts and enter a transfer amount.');
            return;
        }
        if (numAmount > fromAccountBalance) {
            alert(`Transfer amount cannot exceed the source account balance of ৳${fromAccountBalance.toFixed(2)}.`);
            return;
        }

        addSavingsAdjustment({ fromAccountId, toAccountId, amount: numAmount, date: adjustmentDate, notes });
        alert('Adjustment successful!');
        if(redirect) {
             router.push('/admin/modules/microfinance/savings-accounts');
        } else {
            setFromAccountId('');
            setToAccountId('');
            setAmount('');
            setNotes('');
        }
    };
    
     useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [fromAccountId, toAccountId, amount, adjustmentDate, notes]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Savings Adjustment</CardTitle>
                <CardDescription>Transfer balance between two savings accounts of the same member.</CardDescription>
            </CardHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(true); }}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select Member</Label>
                        <Select onValueChange={v => {setSelectedCustomerId(v); setFromAccountId(''); setToAccountId('');}}>
                            <SelectTrigger><SelectValue placeholder="Select a member..." /></SelectTrigger>
                            <SelectContent>
                                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedCustomerId && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Transfer From (Source)</Label>
                                    <Select value={fromAccountId} onValueChange={setFromAccountId}>
                                        <SelectTrigger><SelectValue placeholder="Select source account" /></SelectTrigger>
                                        <SelectContent>
                                            {fromAccounts.map(acc => {
                                                const product = settings.savingsProducts.find(p => p.id === acc.savingsProductId);
                                                return <SelectItem key={acc.id} value={acc.id}>{product?.name} (Bal: ৳{acc.balance.toFixed(2)})</SelectItem>
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Transfer To (Destination)</Label>
                                    <Select value={toAccountId} onValueChange={setToAccountId}>
                                        <SelectTrigger><SelectValue placeholder="Select destination account" /></SelectTrigger>
                                        <SelectContent>
                                            {toAccounts.map(acc => {
                                                const product = settings.savingsProducts.find(p => p.id === acc.savingsProductId);
                                                return <SelectItem key={acc.id} value={acc.id}>{product?.name}</SelectItem>
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input id="amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required disabled={!fromAccountId} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="adjustmentDate">Adjustment Date</Label>
                                    <Input id="adjustmentDate" type="date" value={adjustmentDate} onChange={e => setAdjustmentDate(e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="adj_notes">Notes (Optional)</Label>
                                <Input id="adj_notes" value={notes} onChange={e => setNotes(e.target.value)} />
                            </div>
                        </>
                    )}
                </CardContent>
                <CardFooter className="gap-2">
                    <Button type="submit" disabled={!fromAccountId || !toAccountId}>Confirm &amp; View Accounts (Ctrl+Enter)</Button>
                    <Button type="button" variant="secondary" onClick={() => handleSubmit(false)} disabled={!fromAccountId || !toAccountId}>Confirm &amp; Add Another</Button>
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
  const [activeTab, setActiveTab] = useState('deposit');
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!e.altKey) return;

        const key = parseInt(e.key, 10);
        if (key >= 1 && key <= 5) {
            e.preventDefault();
            const tabs = ['deposit', 'withdrawal', 'adjustment', 'interest-payment', 'closing'];
            setActiveTab(tabs[key - 1]);
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="deposit">
          <ArrowDownToDot className="mr-2 h-4 w-4" /> Deposit (Alt+1)
        </TabsTrigger>
        <TabsTrigger value="withdrawal">
            <ArrowUpFromDot className="mr-2 h-4 w-4" /> Withdrawal (Alt+2)
        </TabsTrigger>
        <TabsTrigger value="adjustment">
            <Shuffle className="mr-2 h-4 w-4" /> Adjustment (Alt+3)
        </TabsTrigger>
        <TabsTrigger value="interest-payment">
            <Landmark className="mr-2 h-4 w-4" /> Interest (Alt+4)
        </TabsTrigger>
        <TabsTrigger value="closing">
            <Ban className="mr-2 h-4 w-4" /> Closing (Alt+5)
        </TabsTrigger>
      </TabsList>
      <TabsContent value="deposit" className="mt-4">
        <SavingsForm type="deposit" />
      </TabsContent>
      <TabsContent value="withdrawal" className="mt-4">
        <SavingsForm type="withdrawal" />
      </TabsContent>
       <TabsContent value="adjustment" className="mt-4">
        <SavingsAdjustmentForm />
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
