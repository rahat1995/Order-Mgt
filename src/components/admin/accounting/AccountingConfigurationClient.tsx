
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
import { AlertCircle, CheckCircle2, Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

function MultiSelectCombobox({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: { value: string; label: string }[];
  selected: string[];
  onSelect: (selected: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    const isSelected = selected.includes(value);
    if (isSelected) {
      onSelect(selected.filter((s) => s !== value));
    } else {
      onSelect([...selected, value]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {selected.length > 0
              ? selected.map(val => options.find(opt => opt.value === val)?.label).join(', ')
              : `Select ${title}...`}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={`Search ${title}...`} />
          <CommandList>
            <CommandEmpty>No {title} found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function AccountingConfigurationClient() {
  const { settings, setAccountingSettings, updateAllLedgerOpeningBalances, isLoaded } = useSettings();
  
  const [accountingConfig, setAccountingConfig] = useState<AccountingSettings>(settings.accountingSettings);
  
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

  const handleCashBankConfigChange = (field: 'cashLedgerIds' | 'bankLedgerIds', value: string[]) => {
    setAccountingConfig(prev => ({ ...prev, [field]: value }));
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
        acc[ledgerId] = isDebitType ? debit : credit;
        return acc;
    }, {} as Record<string, number>);

    updateAllLedgerOpeningBalances(finalBalances);
    alert('Accounting settings and opening balances saved successfully!');
  };

  const ledgerOptions = useMemo(() => 
    settings.ledgerAccounts.map(l => ({ value: l.id, label: l.name })),
    [settings.ledgerAccounts]
  );

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
          <CardTitle>Cash & Bank Account Configuration</CardTitle>
          <CardDescription>Designate which ledger accounts represent your cash and bank accounts. This is important for Contra Vouchers.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
              <Label>Cash Ledgers</Label>
              <MultiSelectCombobox 
                title="Cash Ledgers"
                options={ledgerOptions}
                selected={accountingConfig.cashLedgerIds || []}
                onSelect={(value) => handleCashBankConfigChange('cashLedgerIds', value)}
              />
          </div>
          <div className="space-y-2">
              <Label>Bank Ledgers</Label>
              <MultiSelectCombobox 
                title="Bank Ledgers"
                options={ledgerOptions}
                selected={accountingConfig.bankLedgerIds || []}
                onSelect={(value) => handleCashBankConfigChange('bankLedgerIds', value)}
              />
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
                <div className="border rounded-md overflow-hidden">
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
                                            className="h-8 text-right bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-ring"
                                            placeholder="0.00"
                                        />
                                    </TableCell>
                                     <TableCell>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={credit || ''}
                                            onChange={(e) => handleBalanceChange(ledger.id, 'credit', e.target.value)}
                                            className="h-8 text-right bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-ring"
                                            placeholder="0.00"
                                        />
                                    </TableCell>
                                </TableRow>
                               );
                            })}
                        </TableBody>
                    </Table>
                </div>
           ) : (
                <div className="text-center py-12 border rounded-lg">
                    <h3 className="text-lg font-semibold">No Ledger Accounts Found</h3>
                    <p className="text-muted-foreground mt-2">Please create accounts in the "Chart of Accounts" section first.</p>
                </div>
           )}
        </CardContent>
        {settings.ledgerAccounts.length > 0 && (
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
            </CardFooter>
        )}
      </Card>
       <div className="flex justify-end sticky bottom-6 right-6">
            <Button onClick={handleSave} disabled={!isBalanced && settings.ledgerAccounts.length > 0} size="lg">Save All Settings</Button>
        </div>
    </div>
  );
}
