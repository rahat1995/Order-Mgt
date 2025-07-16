
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { LedgerAccount, AccountingSettings } from '@/types';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const LedgerEntryGroup = ({ title, accounts, balances, onBalanceChange, type }: { title: string, accounts: LedgerAccount[], balances: Record<string, number>, onBalanceChange: (id: string, value: string) => void, type: 'debit' | 'credit' }) => {
  if (accounts.length === 0) return null;
  return (
    <div>
        <h3 className="text-lg font-semibold mb-2 p-2 border-b-2">{title}</h3>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="w-[150px] text-right">{type === 'debit' ? 'Debit' : 'Credit'}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {accounts.map(ledger => (
                     <TableRow key={ledger.id}>
                        <TableCell>
                            <p className="font-medium">{ledger.name}</p>
                            <p className="text-xs text-muted-foreground">{ledger.code}</p>
                        </TableCell>
                        <TableCell>
                            <Input
                                type="number"
                                step="0.01"
                                value={balances[ledger.id] || ''}
                                onChange={(e) => onBalanceChange(ledger.id, e.target.value)}
                                className="h-8 text-right"
                                placeholder="0.00"
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );
}


export function AccountingConfigurationClient() {
  const { settings, setAccountingSettings, updateAllLedgerOpeningBalances, isLoaded } = useSettings();
  
  const [accountingConfig, setAccountingConfig] = useState<AccountingSettings>(settings.accountingSettings);
  const [openingBalances, setOpeningBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isLoaded) {
      setAccountingConfig(settings.accountingSettings);
      const initialBalances = settings.ledgerAccounts.reduce((acc, ledger) => {
        acc[ledger.id] = ledger.openingBalance || 0;
        return acc;
      }, {} as Record<string, number>);
      setOpeningBalances(initialBalances);
    }
  }, [isLoaded, settings.accountingSettings, settings.ledgerAccounts]);

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setAccountingConfig(prev => ({ ...prev, [id]: value }));
  };

  const handleBalanceChange = (ledgerId: string, value: string) => {
    const newBalance = parseFloat(value) || 0;
    setOpeningBalances(prev => ({ ...prev, [ledgerId]: newBalance }));
  };

  const { totalDebit, totalCredit, isBalanced, groupedAccounts } = useMemo(() => {
    let debit = 0;
    let credit = 0;
    
    const groups: { [key: string]: LedgerAccount[] } = {
        assets: [],
        liabilities: [],
        income: [],
        expenses: [],
        other: [],
    };

    settings.ledgerAccounts.forEach(ledger => {
      const balance = openingBalances[ledger.id] || 0;
      const accountType = settings.accountTypes.find(at => at.id === ledger.accountTypeId);
      if (accountType?.code === 'ASSET') {
        debit += balance;
        groups.assets.push(ledger);
      } else if (accountType?.code === 'EXPENSE') {
        debit += balance;
        groups.expenses.push(ledger);
      } else if (accountType?.code === 'LIABILITY') {
        credit += balance;
        groups.liabilities.push(ledger);
      } else if (accountType?.code === 'INCOME') {
        credit += balance;
        groups.income.push(ledger);
      } else {
        groups.other.push(ledger); // Should not happen with proper setup
      }
    });
    return {
      totalDebit: debit,
      totalCredit: credit,
      isBalanced: Math.abs(debit - credit) < 0.01,
      groupedAccounts: groups,
    };
  }, [openingBalances, settings.ledgerAccounts, settings.accountTypes]);

  const handleSave = () => {
    if (!isBalanced) {
      alert('Cannot save. Debit and Credit totals must be equal.');
      return;
    }
    setAccountingSettings(accountingConfig);
    updateAllLedgerOpeningBalances(openingBalances);
    alert('Accounting settings and opening balances saved successfully!');
  };

  if (!isLoaded) {
    return <div>Loading configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fiscal Year & Opening Date</CardTitle>
          <CardDescription>Define your company's financial year and transaction start date.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fiscalYear">Fiscal Year Label</Label>
            <Input id="fiscalYear" value={accountingConfig.fiscalYear} onChange={handleConfigChange} placeholder="e.g., 2024-2025"/>
             <p className="text-xs text-muted-foreground">A label for your reference.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fiscalYearStartDate">Fiscal Year Start Date</Label>
            <Input id="fiscalYearStartDate" type="date" value={accountingConfig.fiscalYearStartDate} onChange={handleConfigChange}/>
             <p className="text-xs text-muted-foreground">The official start of your financial year.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="openingDate">Voucher Opening Date</Label>
            <Input id="openingDate" type="date" value={accountingConfig.openingDate} onChange={handleConfigChange}/>
             <p className="text-xs text-muted-foreground">The date from which transactions can be recorded.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Opening Balance Entry</CardTitle>
          <CardDescription>Enter the opening balance for all your ledger accounts. Debits and Credits must match to save.</CardDescription>
        </CardHeader>
        <CardContent>
           {settings.ledgerAccounts.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Debit Side */}
                    <div className="space-y-6">
                        <LedgerEntryGroup title="Assets" accounts={groupedAccounts.assets} balances={openingBalances} onBalanceChange={handleBalanceChange} type="debit" />
                        <LedgerEntryGroup title="Expenses" accounts={groupedAccounts.expenses} balances={openingBalances} onBalanceChange={handleBalanceChange} type="debit" />
                    </div>
                     {/* Credit Side */}
                    <div className="space-y-6">
                         <LedgerEntryGroup title="Liabilities" accounts={groupedAccounts.liabilities} balances={openingBalances} onBalanceChange={handleBalanceChange} type="credit" />
                         <LedgerEntryGroup title="Income" accounts={groupedAccounts.income} balances={openingBalances} onBalanceChange={handleBalanceChange} type="credit" />
                    </div>
                </div>
           ) : (
                <div className="text-center py-12 border rounded-lg">
                    <h3 className="text-lg font-semibold">No Ledger Accounts Found</h3>
                    <p className="text-muted-foreground mt-2">Please create accounts in the "Chart of Accounts" section first.</p>
                </div>
           )}
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
            <div className="w-full md:w-2/3 grid grid-cols-2 gap-4 text-center font-bold p-4 border rounded-lg">
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
            <Button onClick={handleSave} disabled={!isBalanced}>Save All Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

