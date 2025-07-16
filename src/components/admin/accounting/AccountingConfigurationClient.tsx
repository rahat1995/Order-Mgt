
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

export function AccountingConfigurationClient() {
  const { settings, setAccountingSettings, updateAllLedgerOpeningBalances, isLoaded } = useSettings();
  
  const [accountingConfig, setAccountingConfig] = useState<AccountingSettings>(settings.accountingSettings);
  
  // openingBalances will store a tuple [debit, credit] for each ledgerId
  const [openingBalances, setOpeningBalances] = useState<Record<string, [number, number]>>({});

  useEffect(() => {
    if (isLoaded) {
      setAccountingConfig(settings.accountingSettings);
      const initialBalances = settings.ledgerAccounts.reduce((acc, ledger) => {
        const balance = ledger.openingBalance || 0;
        const accountType = settings.accountTypes.find(at => at.id === ledger.accountTypeId);
        const isDebit = accountType?.code === 'ASSET' || accountType?.code === 'EXPENSE';
        acc[ledger.id] = isDebit ? [balance, 0] : [0, balance];
        return acc;
      }, {} as Record<string, [number, number]>);
      setOpeningBalances(initialBalances);
    }
  }, [isLoaded, settings.accountingSettings, settings.ledgerAccounts, settings.accountTypes]);

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setAccountingConfig(prev => ({ ...prev, [id]: value }));
  };

  const handleBalanceChange = (ledgerId: string, type: 'debit' | 'credit', value: string) => {
    const newBalance = parseFloat(value) || 0;
    setOpeningBalances(prev => ({
      ...prev,
      [ledgerId]: type === 'debit' ? [newBalance, 0] : [0, newBalance],
    }));
  };

  const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
    let debit = 0;
    let credit = 0;
    
    Object.values(openingBalances).forEach(([d, c]) => {
      debit += d;
      credit += c;
    });

    return {
      totalDebit: debit,
      totalCredit: credit,
      isBalanced: Math.abs(debit - credit) < 0.01,
    };
  }, [openingBalances]);

  const handleSave = () => {
    if (!isBalanced) {
      alert('Cannot save. Debit and Credit totals must be equal.');
      return;
    }
    setAccountingSettings(accountingConfig);
    
    const finalBalances = Object.entries(openingBalances).reduce((acc, [ledgerId, [debit, credit]]) => {
        const accountType = settings.accountTypes.find(at => at.id === settings.ledgerAccounts.find(l => l.id === ledgerId)?.accountTypeId);
        const isDebitType = accountType?.code === 'ASSET' || accountType?.code === 'EXPENSE';
        // Debit types have positive balance, Credit types have negative balance in some systems, but here we just store the magnitude.
        // The sign is implicit in the account type.
        acc[ledgerId] = isDebitType ? debit : credit;
        return acc;
    }, {} as Record<string, number>);

    updateAllLedgerOpeningBalances(finalBalances);
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
          <CardTitle>Opening Balance Entry (Trial Balance)</CardTitle>
          <CardDescription>Enter the opening balance for all your ledger accounts. Debits and Credits must match to save.</CardDescription>
        </CardHeader>
        <CardContent>
           {settings.ledgerAccounts.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-2/5">Account</TableHead>
                            <TableHead>Account Type</TableHead>
                            <TableHead className="w-[150px] text-right">Debit</TableHead>
                            <TableHead className="w-[150px] text-right">Credit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {settings.ledgerAccounts.map(ledger => {
                           const [debit, credit] = openingBalances[ledger.id] || [0, 0];
                           const accountType = settings.accountTypes.find(at => at.id === ledger.accountTypeId);
                           return (
                             <TableRow key={ledger.id}>
                                <TableCell>
                                    <p className="font-medium">{ledger.name}</p>
                                    <p className="text-xs text-muted-foreground">{ledger.code}</p>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs font-semibold text-muted-foreground">{accountType?.name || 'N/A'}</span>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={debit || ''}
                                        onChange={(e) => handleBalanceChange(ledger.id, 'debit', e.target.value)}
                                        className="h-8 text-right"
                                        placeholder="0.00"
                                    />
                                </TableCell>
                                 <TableCell>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={credit || ''}
                                        onChange={(e) => handleBalanceChange(ledger.id, 'credit', e.target.value)}
                                        className="h-8 text-right"
                                        placeholder="0.00"
                                    />
                                </TableCell>
                            </TableRow>
                           );
                        })}
                    </TableBody>
                </Table>
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
