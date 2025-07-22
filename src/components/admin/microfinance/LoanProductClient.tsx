
'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, X } from 'lucide-react';
import type { LoanProduct, InterestCalculationMethod, RepaymentFrequency, Fee, RepaymentSchedule } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';


const allFrequencies: RepaymentFrequency[] = ['daily', 'weekly', 'monthly', 'quarterly', 'one-time'];

const FeeInput = ({ label, name, value, onValueChange, typeValue, onTypeChange }: { 
    label: string, 
    name: string, 
    value?: number, 
    onValueChange: (name: string, value: number) => void,
    typeValue?: 'fixed' | 'percentage',
    onTypeChange: (name: string, value: 'fixed' | 'percentage') => void
}) => (
    <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <div className="flex gap-2">
            <Input 
                id={name} 
                name={name} 
                type="number" 
                step="0.01" 
                value={value} 
                onChange={(e) => onValueChange(name, parseFloat(e.target.value) || 0)}
            />
            <Select 
                name={`${name}Type`} 
                value={typeValue || 'fixed'} 
                onValueChange={(v: 'fixed' | 'percentage') => onTypeChange(`${name}Type`, v)}
            >
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
                        value={schedule.gracePeriodDays} 
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
                                        value={schedule.interestRateIndex?.[inst] || ''}
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


const getEmptyLoanProduct = (): Omit<LoanProduct, 'id'> => ({
    name: '',
    shortName: '',
    code: '',
    minAmount: 0,
    maxAmount: 0,
    defaultAmount: 0,
    interestRate: 0,
    interestCalculationMethod: 'flat',
    insurance: { type: 'fixed', value: 0 },
    processingFee: { type: 'fixed', value: 0 },
    formFee: { type: 'fixed', value: 0 },
    applicationFee: { type: 'fixed', value: 0 },
    additionalFee: { type: 'fixed', value: 0 },
    otherFee: { type: 'fixed', value: 0 },
    cashCollateral: { type: 'fixed', value: 0, isChangeable: false },
    repaymentSchedules: {},
});

export function LoanProductClient() {
  const { settings, addLoanProduct, updateLoanProduct, deleteLoanProduct, isLoaded } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Omit<LoanProduct, 'id'>>(getEmptyLoanProduct());

  const handleOpenDialog = (product: LoanProduct | null) => {
    setEditingProduct(product);
    setStep(1);
    if (product) {
        setFormData({
            ...getEmptyLoanProduct(),
            ...product
        });
    } else {
        setFormData(getEmptyLoanProduct());
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingProduct(null);
    setDialogOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };
  
  const handleFeeValueChange = (name: string, value: number) => {
      setFormData(prev => ({...prev, [name]: {...(prev as any)[name], value}}));
  };
  const handleFeeTypeChange = (nameWith_Type: string, type: 'fixed' | 'percentage') => {
      const name = nameWith_Type.replace('Type', '');
      setFormData(prev => ({...prev, [name]: {...(prev as any)[name], type}}));
  };

  const handleToggleSchedule = (frequency: RepaymentFrequency, checked: boolean) => {
    setFormData(prev => {
        const newSchedules = { ...prev.repaymentSchedules };
        if (checked) {
            if (!newSchedules[frequency]) {
                newSchedules[frequency] = { frequency, installments: [], gracePeriodDays: 0, interestRateIndex: {} };
            }
        } else {
            delete newSchedules[frequency];
        }
        return { ...prev, repaymentSchedules: newSchedules };
    });
  };

  const handleInstallmentAdd = (frequency: RepaymentFrequency, value: number) => {
    setFormData(prev => {
        const schedule = prev.repaymentSchedules[frequency];
        if (schedule && !schedule.installments.includes(value)) {
            const newSchedules = { ...prev.repaymentSchedules, [frequency]: { ...schedule, installments: [...schedule.installments, value].sort((a,b) => a - b) } };
            return { ...prev, repaymentSchedules: newSchedules };
        }
        return prev;
    });
  };

  const handleInstallmentRemove = (frequency: RepaymentFrequency, value: number) => {
    setFormData(prev => {
        const schedule = prev.repaymentSchedules[frequency];
        if (schedule) {
            const newInterestIndex = {...schedule.interestRateIndex};
            delete newInterestIndex[value];
            const newSchedules = { ...prev.repaymentSchedules, [frequency]: { ...schedule, installments: schedule.installments.filter(i => i !== value), interestRateIndex: newInterestIndex }};
            return { ...prev, repaymentSchedules: newSchedules };
        }
        return prev;
    });
  };
  
  const handleGracePeriodChange = (frequency: RepaymentFrequency, value: number) => {
    setFormData(prev => {
        const schedule = prev.repaymentSchedules[frequency];
        if (schedule) {
            const newSchedules = { ...prev.repaymentSchedules, [frequency]: { ...schedule, gracePeriodDays: value } };
            return { ...prev, repaymentSchedules: newSchedules };
        }
        return prev;
    });
  };
  
  const handleInterestIndexChange = (frequency: RepaymentFrequency, installment: number, value: number) => {
    setFormData(prev => {
        const schedule = prev.repaymentSchedules[frequency];
        if (schedule) {
            const newInterestIndex = {...schedule.interestRateIndex};
            if (!isNaN(value)) {
                newInterestIndex[installment] = value;
            } else {
                delete newInterestIndex[installment];
            }
            const newSchedules = { ...prev.repaymentSchedules, [frequency]: { ...schedule, interestRateIndex: newInterestIndex } };
            return { ...prev, repaymentSchedules: newSchedules };
        }
        return prev;
      });
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || isNaN(formData.interestRate)) {
      alert("Please fill all required fields: Name, Code, and Interest Rate.");
      return;
    }

    if (editingProduct) {
      updateLoanProduct({ ...editingProduct, ...formData });
    } else {
      addLoanProduct(formData);
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
        <DialogContent className="sm:max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Loan Product' : 'Add New Loan Product'}</DialogTitle>
             <div className="flex items-center pt-2">
                {[1, 2, 3].map((s) => (
                    <React.Fragment key={s}>
                    <div className={cn("flex flex-col items-center", s <= step ? 'text-primary' : 'text-muted-foreground')}>
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2", s <= step ? 'border-primary bg-primary text-primary-foreground' : 'bg-muted')}>
                            {s}
                        </div>
                    </div>
                    {s < 3 && <div className={cn("flex-1 h-0.5", s < step ? 'bg-primary' : 'bg-border')} />}
                    </React.Fragment>
                ))}
            </div>
          </DialogHeader>
          <form id="loan-product-form" onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
                <div className="flex-grow overflow-y-auto pr-4 -mr-4 py-4">
                  {step === 1 && (
                      <div className="space-y-6">
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2"><Label htmlFor="name">Product Name</Label><Input id="name" name="name" value={formData.name} onChange={handleInputChange} required /></div>
                                <div className="space-y-2"><Label htmlFor="shortName">Short Name</Label><Input id="shortName" name="shortName" value={formData.shortName} onChange={handleInputChange} /></div>
                                <div className="space-y-2"><Label htmlFor="code">Code</Label><Input id="code" name="code" value={formData.code} onChange={handleInputChange} required /></div>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg">Loan Amount</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2"><Label htmlFor="minAmount">Min Amount</Label><Input id="minAmount" name="minAmount" type="number" value={formData.minAmount} onChange={handleInputChange}/></div>
                                <div className="space-y-2"><Label htmlFor="maxAmount">Max Amount</Label><Input id="maxAmount" name="maxAmount" type="number" value={formData.maxAmount} onChange={handleInputChange} /></div>
                                <div className="space-y-2"><Label htmlFor="defaultAmount">Default/Avg Amount</Label><Input id="defaultAmount" name="defaultAmount" type="number" value={formData.defaultAmount} onChange={handleInputChange} /></div>
                            </div>
                        </div>
                    </div>
                  )}

                  {step === 2 && (
                       <div className="space-y-6">
                            <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="font-semibold text-lg">Fees & Insurance</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FeeInput label="Insurance" name="insurance" value={formData.insurance.value} onValueChange={handleFeeValueChange} typeValue={formData.insurance.type} onTypeChange={handleFeeTypeChange} />
                                    <FeeInput label="Processing Fee" name="processingFee" value={formData.processingFee.value} onValueChange={handleFeeValueChange} typeValue={formData.processingFee.type} onTypeChange={handleFeeTypeChange} />
                                    <FeeInput label="Form Fee" name="formFee" value={formData.formFee.value} onValueChange={handleFeeValueChange} typeValue={formData.formFee.type} onTypeChange={handleFeeTypeChange} />
                                    <FeeInput label="Application Fee" name="applicationFee" value={formData.applicationFee.value} onValueChange={handleFeeValueChange} typeValue={formData.applicationFee.type} onTypeChange={handleFeeTypeChange} />
                                    <FeeInput label="Additional Fee" name="additionalFee" value={formData.additionalFee.value} onValueChange={handleFeeValueChange} typeValue={formData.additionalFee.type} onTypeChange={handleFeeTypeChange} />
                                    <FeeInput label="Other Fee" name="otherFee" value={formData.otherFee.value} onValueChange={handleFeeValueChange} typeValue={formData.otherFee.type} onTypeChange={handleFeeTypeChange} />
                                </div>
                            </div>
                            
                            <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="font-semibold text-lg">Cash Collateral</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <FeeInput label="Collateral Amount" name="cashCollateral" value={formData.cashCollateral.value} onValueChange={(name, value) => setFormData(p => ({...p, cashCollateral: {...p.cashCollateral, value}}))} typeValue={formData.cashCollateral.type} onTypeChange={(name, type) => setFormData(p => ({...p, cashCollateral: {...p.cashCollateral, type}}))} />
                                <div className="flex items-center space-x-2 pb-2">
                                    <Switch id="cashCollateralIsChangeable" name="cashCollateralIsChangeable" checked={formData.cashCollateral.isChangeable} onCheckedChange={(checked) => setFormData(p => ({...p, cashCollateral: {...p.cashCollateral, isChangeable: checked}}))} />
                                    <Label htmlFor="cashCollateralIsChangeable">Allow override at disbursement</Label>
                                </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="font-semibold text-lg">Interest</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label htmlFor="interestRate">Interest Rate (%)</Label><Input id="interestRate" name="interestRate" type="number" step="0.01" value={formData.interestRate} onChange={handleInputChange} required /></div>
                                    <div className="space-y-2">
                                        <Label htmlFor="interestCalculationMethod">Interest Calculation</Label>
                                        <Select name="interestCalculationMethod" value={formData.interestCalculationMethod} onValueChange={(v) => setFormData(p => ({...p, interestCalculationMethod: v as InterestCalculationMethod}))}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="flat">Flat</SelectItem>
                                                <SelectItem value="reducing-balance">Reducing Balance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                       </div>
                  )}

                  {step === 3 && (
                       <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Repayment Schedules</h3>
                        <div className="space-y-4">
                            {allFrequencies.map(freq => (
                                <div key={freq} className="p-3 border rounded-md">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor={`switch-${freq}`} className="capitalize font-medium">{freq}</Label>
                                        <Switch 
                                            id={`switch-${freq}`} 
                                            checked={!!formData.repaymentSchedules[freq]}
                                            onCheckedChange={(checked) => handleToggleSchedule(freq, checked)}
                                        />
                                    </div>
                                    {formData.repaymentSchedules[freq] && (
                                        <div className="mt-4">
                                            <RepaymentScheduleForm 
                                                schedule={formData.repaymentSchedules[freq]!}
                                                onInstallmentAdd={handleInstallmentAdd}
                                                onInstallmentRemove={handleInstallmentRemove}
                                                onGracePeriodChange={handleGracePeriodChange}
                                                onInterestIndexChange={handleInterestIndexChange}
                                                isFlatRate={formData.interestCalculationMethod === 'flat'}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                  )}

                </div>
          </form>
          <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              {step > 1 && <Button type="button" variant="secondary" onClick={() => setStep(s => s - 1)}>Back</Button>}
              {step < 3 && <Button type="button" onClick={() => setStep(s => s + 1)}>Next</Button>}
              {step === 3 && <Button type="submit" form="loan-product-form">{editingProduct ? 'Save Changes' : 'Create Product'}</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
