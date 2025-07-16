
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

  const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
    let debit = 0;
    let credit = 0;
    settings.ledgerAccounts.forEach(ledger => {
      const balance = openingBalances[ledger.id] || 0;
      const accountType = settings.accountTypes.find(at => at.id === ledger.accountTypeId);
      if (accountType?.code === 'ASSET' || accountType?.code === 'EXPENSE') {
        debit += balance;
      } else if (accountType?.code === 'LIABILITY' || accountType?.code === 'INCOME') {
        credit += balance;
      }
    });
    return {
      totalDebit: debit,
      totalCredit: credit,
      isBalanced: Math.abs(debit - credit) < 0.01,
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
            <Label htmlFor="fiscalYear">Fiscal Year</Label>
            <Input id="fiscalYear" value={accountingConfig.fiscalYear} onChange={handleConfigChange} placeholder="e.g., 2024-2025"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fiscalYearStartDate">Fiscal Year Start Date</Label>
            <Input id="fiscalYearStartDate" type="date" value={accountingConfig.fiscalYearStartDate} onChange={handleConfigChange}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="openingDate">Voucher Opening Date</Label>
            <Input id="openingDate" type="date" value={accountingConfig.openingDate} onChange={handleConfigChange}/>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Opening Balance Entry</CardTitle>
          <CardDescription>Enter the opening balance for all your ledger accounts. Debits and Credits must match.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Ledger Account</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead className="w-[200px] text-right">Opening Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.ledgerAccounts.length > 0 ? (
                    settings.ledgerAccounts.map(ledger => (
                      <TableRow key={ledger.id}>
                        <TableCell className="font-medium">{ledger.name}</TableCell>
                        <TableCell>{settings.accountTypes.find(at => at.id === ledger.accountTypeId)?.name || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            value={openingBalances[ledger.id] || ''}
                            onChange={(e) => handleBalanceChange(ledger.id, e.target.value)}
                            className="h-8 text-right"
                            placeholder="0.00"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">No ledger accounts found. Please create them first in the Chart of Accounts.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col items-end gap-4">
            <div className="w-full md:w-1/3 grid grid-cols-2 gap-4 text-center font-bold p-4 border rounded-lg">
                <div>
                    <p className="text-sm text-muted-foreground">Total Debit</p>
                    <p className="text-lg">৳{totalDebit.toFixed(2)}</p>
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Total Credit</p>
                    <p className="text-lg">৳{totalCredit.toFixed(2)}</p>
                </div>
            </div>
            <div className={cn(
                "w-full flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-semibold",
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
