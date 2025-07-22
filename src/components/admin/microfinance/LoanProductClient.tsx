

'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, X } from 'lucide-react';
import type { LoanProduct, InterestCalculationMethod, RepaymentFrequency, Fee, RepaymentSchedule } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const allFrequencies: RepaymentFrequency[] = ['daily', 'weekly', 'monthly', 'quarterly', 'one-time'];

const FeeInput = ({ label, name, defaultValue, defaultType }: { label: string, name: string, defaultValue?: number, defaultType?: 'fixed' | 'percentage' }) => (
    <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <div className="flex gap-2">
            <Input id={name} name={name} type="number" step="0.01" defaultValue={defaultValue} />
            <Select name={`${name}Type`} defaultValue={defaultType || 'fixed'}>
                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="percentage">%</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
);

const RepaymentScheduleForm = ({ 
    schedule, 
    onInstallmentAdd, 
    onInstallmentRemove, 
    onGracePeriodChange,
    onInterestIndexChange,
    isFlatRate
}: { 
    schedule: RepaymentSchedule, 
    onInstallmentAdd: (freq: RepaymentFrequency, value: number) => void,
    onInstallmentRemove: (freq: RepaymentFrequency, value: number) => void,
    onGracePeriodChange: (freq: RepaymentFrequency, value: number) => void,
    onInterestIndexChange: (freq: RepaymentFrequency, installment: number, value: number) => void,
    isFlatRate: boolean;
}) => {
    const [installmentInput, setInstallmentInput] = useState('');
    
    const handleAdd = () => {
        const num = parseInt(installmentInput, 10);
        if (!isNaN(num) && num > 0) {
            onInstallmentAdd(schedule.frequency, num);
            setInstallmentInput('');
        }
    }
    
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Installment Options</Label>
                    <div className="flex gap-2">
                        <Input 
                            type="number" 
                            placeholder="e.g., 46" 
                            value={installmentInput}
                            onChange={(e) => setInstallmentInput(e.target.value)}
                        />
                        <Button type="button" onClick={handleAdd}>Add</Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${schedule.frequency}GracePeriod`}>Grace Period (Days)</Label>
                    <Input 
                        id={`${schedule.frequency}GracePeriod`}
                        name={`${schedule.frequency}GracePeriod`}
                        type="number" 
                        defaultValue={schedule.gracePeriodDays} 
                        onChange={(e) => onGracePeriodChange(schedule.frequency, parseInt(e.target.value, 10) || 0)}
                    />
                </div>
            </div>
             <div className="flex flex-wrap gap-2">
                {schedule.installments.map(inst => (
                     <div key={inst} className="flex-1 min-w-[200px]">
                        <Card className="p-2">
                             <div className="flex justify-between items-center">
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    {inst} Installments
                                </Badge>
                                 <button type="button" onClick={() => onInstallmentRemove(schedule.frequency, inst)}>
                                    <X className="h-3 w-3 text-muted-foreground" />
                                </button>
                             </div>
                            {isFlatRate && (
                                <div className="mt-2 space-y-1">
                                    <Label className="text-xs">Interest Rate Index</Label>
                                    <Input 
                                        type="number" 
                                        step="0.01" 
                                        className="h-8"
                                        defaultValue={schedule.interestRateIndex?.[inst]}
                                        onChange={(e) => onInterestIndexChange(schedule.frequency, inst, parseFloat(e.target.value))}
                                    />
                                </div>
                            )}
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};


export function LoanProductClient() {
  const { settings, addLoanProduct, updateLoanProduct, deleteLoanProduct, isLoaded } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);

  const [repaymentSchedules, setRepaymentSchedules] = useState<Partial<Record<RepaymentFrequency, RepaymentSchedule>>>({});
  const [interestCalcMethod, setInterestCalcMethod] = useState<InterestCalculationMethod>('flat');

  const handleOpenDialog = (product: LoanProduct | null) => {
    setEditingProduct(product);
    if (product) {
      setRepaymentSchedules(product.repaymentSchedules || {});
      setInterestCalcMethod(product.interestCalculationMethod || 'flat');
    } else {
      setRepaymentSchedules({});
      setInterestCalcMethod('flat');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingProduct(null);
    setDialogOpen(false);
  };
  
  const handleToggleSchedule = (frequency: RepaymentFrequency, checked: boolean) => {
      setRepaymentSchedules(prev => {
          const newSchedules = { ...prev };
          if (checked) {
              if (!newSchedules[frequency]) {
                  newSchedules[frequency] = { frequency, installments: [], gracePeriodDays: 0, interestRateIndex: {} };
              }
          } else {
              delete newSchedules[frequency];
          }
          return newSchedules;
      });
  };

  const handleInstallmentAdd = (frequency: RepaymentFrequency, value: number) => {
      setRepaymentSchedules(prev => {
          const schedule = prev[frequency];
          if (schedule && !schedule.installments.includes(value)) {
              return {
                  ...prev,
                  [frequency]: { ...schedule, installments: [...schedule.installments, value].sort((a,b) => a - b) }
              };
          }
          return prev;
      });
  };

  const handleInstallmentRemove = (frequency: RepaymentFrequency, value: number) => {
      setRepaymentSchedules(prev => {
          const schedule = prev[frequency];
          if (schedule) {
              const newInterestIndex = {...schedule.interestRateIndex};
              delete newInterestIndex[value];

              return {
                  ...prev,
                  [frequency]: { ...schedule, installments: schedule.installments.filter(i => i !== value), interestRateIndex: newInterestIndex }
              };
          }
          return prev;
      });
  };
  
  const handleGracePeriodChange = (frequency: RepaymentFrequency, value: number) => {
      setRepaymentSchedules(prev => {
          const schedule = prev[frequency];
          if (schedule) {
              return { ...prev, [frequency]: { ...schedule, gracePeriodDays: value } };
          }
          return prev;
      });
  };
  
  const handleInterestIndexChange = (frequency: RepaymentFrequency, installment: number, value: number) => {
      setRepaymentSchedules(prev => {
        const schedule = prev[frequency];
        if (schedule) {
            const newInterestIndex = {...schedule.interestRateIndex};
            if (!isNaN(value)) {
                newInterestIndex[installment] = value;
            } else {
                delete newInterestIndex[installment];
            }
            return {
                ...prev,
                [frequency]: { ...schedule, interestRateIndex: newInterestIndex }
            };
        }
        return prev;
      });
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const getFee = (name: string): Fee => ({
        type: formData.get(`${name}Type`) as 'fixed' | 'percentage',
        value: parseFloat(formData.get(name) as string) || 0,
    });
    
    const productData: Omit<LoanProduct, 'id'> = {
      name: formData.get('name') as string,
      shortName: formData.get('shortName') as string,
      code: formData.get('code') as string,
      minAmount: parseFloat(formData.get('minAmount') as string) || 0,
      maxAmount: parseFloat(formData.get('maxAmount') as string) || 0,
      defaultAmount: parseFloat(formData.get('defaultAmount') as string) || 0,
      interestRate: parseFloat(formData.get('interestRate') as string),
      interestCalculationMethod: formData.get('interestCalculationMethod') as InterestCalculationMethod,
      insurance: getFee('insurance'),
      processingFee: getFee('processingFee'),
      formFee: getFee('formFee'),
      applicationFee: getFee('applicationFee'),
      additionalFee: getFee('additionalFee'),
      otherFee: getFee('otherFee'),
      cashCollateral: {
        type: formData.get('cashCollateralType') as 'fixed' | 'percentage',
        value: parseFloat(formData.get('cashCollateral') as string) || 0,
        isChangeable: (formData.get('cashCollateralIsChangeable') as string) === 'on',
      },
      repaymentSchedules: repaymentSchedules,
    };
    
    if (!productData.name || !productData.code || isNaN(productData.interestRate)) {
      alert("Please fill all required fields: Name, Code, and Interest Rate.");
      return;
    }

    if (editingProduct) {
      updateLoanProduct({ ...editingProduct, ...productData });
    } else {
      addLoanProduct(productData);
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading loan products...</div>;
  }
  
  const getSchedulesSummary = (schedules: Partial<Record<RepaymentFrequency, RepaymentSchedule>>): string => {
      return Object.values(schedules)
        .map(s => `${s.frequency} (${s.installments.join('/')})`)
        .join(', ');
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog(null)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Loan Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {settings.loanProducts.length > 0 ? settings.loanProducts.map(product => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.shortName} ({product.code})</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold">Interest: {product.interestRate}% ({product.interestCalculationMethod})</p>
              <p className="text-sm text-muted-foreground">Repayments: {getSchedulesSummary(product.repaymentSchedules)}</p>
              <p className="text-sm text-muted-foreground">Amount: ৳{product.minAmount} - ৳{product.maxAmount}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(product)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteLoanProduct(product.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardFooter>
          </Card>
        )) : (
            <Card className="col-span-full text-center py-12">
                <CardHeader>
                    <CardTitle>No Loan Products Found</CardTitle>
                    <CardDescription>Click "Add New Loan Product" to get started.</CardDescription>
                </CardHeader>
            </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Loan Product' : 'Add New Loan Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex-grow overflow-hidden flex flex-col">
            <ScrollArea className="flex-grow pr-6 -mr-6">
              <div className="space-y-6">
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label htmlFor="name">Product Name</Label><Input id="name" name="name" defaultValue={editingProduct?.name} required /></div>
                        <div className="space-y-2"><Label htmlFor="shortName">Short Name</Label><Input id="shortName" name="shortName" defaultValue={editingProduct?.shortName} /></div>
                        <div className="space-y-2"><Label htmlFor="code">Code</Label><Input id="code" name="code" defaultValue={editingProduct?.code} required /></div>
                    </div>
                </div>

                 <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Loan Amount</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label htmlFor="minAmount">Min Amount</Label><Input id="minAmount" name="minAmount" type="number" defaultValue={editingProduct?.minAmount || 0} /></div>
                        <div className="space-y-2"><Label htmlFor="maxAmount">Max Amount</Label><Input id="maxAmount" name="maxAmount" type="number" defaultValue={editingProduct?.maxAmount || 0} /></div>
                        <div className="space-y-2"><Label htmlFor="defaultAmount">Default/Avg Amount</Label><Input id="defaultAmount" name="defaultAmount" type="number" defaultValue={editingProduct?.defaultAmount || 0} /></div>
                    </div>
                </div>

                 <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Fees & Insurance</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         <FeeInput label="Insurance" name="insurance" defaultValue={editingProduct?.insurance.value} defaultType={editingProduct?.insurance.type} />
                         <FeeInput label="Processing Fee" name="processingFee" defaultValue={editingProduct?.processingFee.value} defaultType={editingProduct?.processingFee.type} />
                         <FeeInput label="Form Fee" name="formFee" defaultValue={editingProduct?.formFee.value} defaultType={editingProduct?.formFee.type} />
                         <FeeInput label="Application Fee" name="applicationFee" defaultValue={editingProduct?.applicationFee.value} defaultType={editingProduct?.applicationFee.type} />
                         <FeeInput label="Additional Fee" name="additionalFee" defaultValue={editingProduct?.additionalFee.value} defaultType={editingProduct?.additionalFee.type} />
                         <FeeInput label="Other Fee" name="otherFee" defaultValue={editingProduct?.otherFee.value} defaultType={editingProduct?.otherFee.type} />
                     </div>
                </div>
                
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Cash Collateral</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                      <FeeInput label="Collateral Amount" name="cashCollateral" defaultValue={editingProduct?.cashCollateral.value} defaultType={editingProduct?.cashCollateral.type} />
                       <div className="flex items-center space-x-2 pb-2">
                        <Switch id="cashCollateralIsChangeable" name="cashCollateralIsChangeable" defaultChecked={editingProduct?.cashCollateral.isChangeable} />
                        <Label htmlFor="cashCollateralIsChangeable">Allow override at disbursement</Label>
                      </div>
                    </div>
                </div>

                 <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Interest</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="interestRate">Interest Rate (%)</Label><Input id="interestRate" name="interestRate" type="number" step="0.01" defaultValue={editingProduct?.interestRate} required /></div>
                        <div className="space-y-2">
                            <Label htmlFor="interestCalculationMethod">Interest Calculation</Label>
                            <Select name="interestCalculationMethod" value={interestCalcMethod} onValueChange={(v) => setInterestCalcMethod(v as InterestCalculationMethod)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="flat">Flat</SelectItem>
                                    <SelectItem value="reducing-balance">Reducing Balance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                 <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Repayment Schedules</h3>
                     <div className="space-y-4">
                        {allFrequencies.map(freq => (
                            <div key={freq} className="p-3 border rounded-md">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor={`switch-${freq}`} className="capitalize font-medium">{freq}</Label>
                                    <Switch 
                                        id={`switch-${freq}`} 
                                        checked={!!repaymentSchedules[freq]}
                                        onCheckedChange={(checked) => handleToggleSchedule(freq, checked)}
                                    />
                                </div>
                                {repaymentSchedules[freq] && (
                                    <div className="mt-4">
                                        <RepaymentScheduleForm 
                                            schedule={repaymentSchedules[freq]!}
                                            onInstallmentAdd={handleInstallmentAdd}
                                            onInstallmentRemove={handleInstallmentRemove}
                                            onGracePeriodChange={handleGracePeriodChange}
                                            onInterestIndexChange={handleInterestIndexChange}
                                            isFlatRate={interestCalcMethod === 'flat'}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4 pt-4 border-t flex-shrink-0">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingProduct ? 'Save Changes' : 'Create Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
