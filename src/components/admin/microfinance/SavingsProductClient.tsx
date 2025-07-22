

'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, XCircle } from 'lucide-react';
import type { SavingsProduct, SavingsInterestFrequency, SavingsInterestCalculationMethod, DpsPaymentFrequency, OtsPayoutFrequency, OtsProvisionType, FdrPayoutRule, MaturityPayoutMethod } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { v4 as uuidv4 } from 'uuid';
import { Switch } from '@/components/ui/switch';

const interestFrequencies: SavingsInterestFrequency[] = ['daily', 'weekly', 'monthly', 'half-yearly', 'yearly'];
const dpsPaymentFrequencies: DpsPaymentFrequency[] = ['daily', 'weekly', 'monthly'];
const interestCalcMethods: SavingsInterestCalculationMethod[] = ['opening-closing-average', 'closing-balance'];
const otsPayoutFrequencies: OtsPayoutFrequency[] = ['monthly', 'quarterly', 'half-yearly', 'yearly'];
const otsProvisionTypes: OtsProvisionType[] = ['end_of_month', 'on_opening_anniversary'];
const maturityPayoutOptions: MaturityPayoutMethod[] = ['cash', 'transfer_to_savings'];


export function SavingsProductClient() {
  const { settings, addSavingsProduct, updateSavingsProduct, deleteSavingsProduct, isLoaded } = useSettings();
  const { savingsProducts, savingsProductTypes } = settings;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SavingsProduct | null>(null);

  // State for the form, including the selected type
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<string>('');
  
  // State for FDR rules
  const [fdrPayoutRules, setFdrPayoutRules] = useState<FdrPayoutRule[]>([]);
  const [newFdrRule, setNewFdrRule] = useState({ durationInYears: '', totalInterestRate: '' });

  const handleOpenDialog = (product: SavingsProduct | null) => {
    setEditingProduct(product);
    if (product) {
      setSelectedProductTypeId(product.savingsProductTypeId);
      setFdrPayoutRules(product.fdr_payoutRules || []);
    } else {
      setSelectedProductTypeId('');
      setFdrPayoutRules([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingProduct(null);
    setDialogOpen(false);
  };
  
  const handleAddFdrRule = () => {
      const duration = parseInt(newFdrRule.durationInYears, 10);
      const rate = parseFloat(newFdrRule.totalInterestRate);
      if (isNaN(duration) || isNaN(rate) || duration <= 0 || rate < 0) {
          alert('Please enter valid duration and interest rate.');
          return;
      }
      setFdrPayoutRules(prev => [...prev, { id: uuidv4(), durationInYears: duration, totalInterestRate: rate }]);
      setNewFdrRule({ durationInYears: '', totalInterestRate: '' });
  }

  const handleRemoveFdrRule = (id: string) => {
      setFdrPayoutRules(prev => prev.filter(rule => rule.id !== id));
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData: Omit<SavingsProduct, 'id'> = {
      name: formData.get('name') as string,
      shortName: formData.get('shortName') as string,
      code: formData.get('code') as string,
      savingsProductTypeId: formData.get('savingsProductTypeId') as string,
      interestRate: parseFloat(formData.get('interestRate') as string),
      lienAllowed: (formData.get('lienAllowed') as string) === 'on',
      collateralAllowed: (formData.get('collateralAllowed') as string) === 'on',
      
      // Regular Savings fields
      depositFrequency: formData.get('depositFrequency') as DpsPaymentFrequency,
      isProvisionApplicable: (formData.get('isProvisionApplicable') as string) === 'on',
      interestProvisionFrequency: formData.get('interestProvisionFrequency') as SavingsInterestFrequency,
      interestDisbursementFrequency: formData.get('interestDisbursementFrequency') as SavingsInterestFrequency,
      provisionGracePeriodDays: parseInt(formData.get('provisionGracePeriodDays') as string, 10) || 0,
      minBalance: parseFloat(formData.get('minBalance') as string),
      maxBalance: parseFloat(formData.get('maxBalance') as string),
      closingCharge: parseFloat(formData.get('closingCharge') as string),
      interestCalculationMethod: formData.get('interestCalculationMethod') as SavingsInterestCalculationMethod,
      canWithdrawInterest: (formData.get('canWithdrawInterest') as string) === 'on',
      isInterestEditableOnDisbursement: (formData.get('isInterestEditableOnDisbursement') as string) === 'on',

      // DPS fields
      dps_paymentFrequency: formData.get('dps_paymentFrequency') as DpsPaymentFrequency,
      dps_durationsInYears: (formData.get('dps_durationsInYears') as string)?.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)),
      dps_prematureWithdrawalInterestRate: parseFloat(formData.get('dps_prematureWithdrawalInterestRate') as string),
      dps_lateFeeType: formData.get('dps_lateFeeType') as 'extend_duration' | 'interest_penalty',
      dps_maturityPayout: formData.get('dps_maturityPayout') as MaturityPayoutMethod,
      // OTS fields
      ots_interestPayoutFrequency: formData.get('ots_interestPayoutFrequency') as OtsPayoutFrequency,
      ots_provisionType: formData.get('ots_provisionType') as OtsProvisionType,
      ots_interestCalculationMethod: 'daily_balance',
      ots_interestDisbursementMethod: formData.get('ots_interestDisbursementMethod') as MaturityPayoutMethod,
      // FDR fields
      fdr_payoutRules: fdrPayoutRules,
      fdr_maturityPayout: formData.get('fdr_maturityPayout') as MaturityPayoutMethod,
      fdr_prematureWithdrawalInterestRate: parseFloat(formData.get('fdr_prematureWithdrawalInterestRate') as string),
    };

    if (!productData.name || !productData.code || !productData.savingsProductTypeId || isNaN(productData.interestRate)) {
      alert("Please fill all required fields.");
      return;
    }

    if (editingProduct) {
      updateSavingsProduct({ ...editingProduct, ...productData });
    } else {
      addSavingsProduct(productData);
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading savings products...</div>;
  }
  
  const getTypeName = (typeId: string) => {
    return savingsProductTypes.find(t => t.id === typeId)?.name || 'N/A';
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog(null)} disabled={savingsProductTypes.length === 0}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Savings Product
        </Button>
      </div>
      {savingsProductTypes.length === 0 && (
          <p className="text-destructive text-sm text-right mt-2">Please define Savings Product Types first.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {savingsProducts.map(product => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{getTypeName(product.savingsProductTypeId)} ({product.code})</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{product.interestRate}% Interest Rate</p>
              {product.savingsProductTypeId === 'regular-savings' && (
                  <>
                    <p className="text-sm text-muted-foreground">Provision: {product.interestProvisionFrequency}</p>
                    <p className="text-sm text-muted-foreground">Disbursement: {product.interestDisbursementFrequency}</p>
                  </>
              )}
              {product.savingsProductTypeId === 'dps' && product.dps_durationsInYears && (
                  <p className="text-sm text-muted-foreground">Durations: {product.dps_durationsInYears.join(', ')} years</p>
              )}
              {product.savingsProductTypeId === 'ots' && (
                  <p className="text-sm text-muted-foreground">Payout: {product.ots_interestPayoutFrequency}</p>
              )}
               {product.savingsProductTypeId === 'fdr' && product.fdr_payoutRules && (
                  <p className="text-sm text-muted-foreground">Rules: {product.fdr_payoutRules.length} term(s)</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(product)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSavingsProduct(product.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       {savingsProducts.length === 0 && (
            <Card className="col-span-full text-center py-12 mt-4">
                <CardHeader>
                    <CardTitle>No Savings Products Found</CardTitle>
                    <CardDescription>Click "Add New Savings Product" to get started.</CardDescription>
                </CardHeader>
            </Card>
        )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Savings Product' : 'Add New Savings Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2">
            <div className="grid gap-6 py-4">
               <div className="space-y-2">
                <Label htmlFor="savingsProductTypeId">Savings Type</Label>
                <Select name="savingsProductTypeId" defaultValue={editingProduct?.savingsProductTypeId} onValueChange={setSelectedProductTypeId} required>
                  <SelectTrigger><SelectValue placeholder="Select a base type..."/></SelectTrigger>
                  <SelectContent>
                    {savingsProductTypes.map(type => <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

            {selectedProductTypeId && (
              <>
                <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-semibold text-md">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Product Name</Label>
                          <Input id="name" name="name" defaultValue={editingProduct?.name} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shortName">Short Name</Label>
                          <Input id="shortName" name="shortName" defaultValue={editingProduct?.shortName} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="code">Product Code</Label>
                          <Input id="code" name="code" defaultValue={editingProduct?.code} required />
                        </div>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="interestRate">Interest Rate (Annual %)</Label>
                      <Input id="interestRate" name="interestRate" type="number" step="0.01" defaultValue={editingProduct?.interestRate} required />
                    </div>
                </div>

                {selectedProductTypeId === 'regular-savings' && (
                  <div className="p-4 border rounded-md space-y-4 bg-muted/30">
                    <h4 className="font-semibold text-md">Regular Savings Settings</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="depositFrequency">Deposit Frequency</Label>
                            <Select name="depositFrequency" defaultValue={editingProduct?.depositFrequency || 'monthly'}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {dpsPaymentFrequencies.map(freq => <SelectItem key={freq} value={freq} className="capitalize">{freq}</SelectItem>)}
                            </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="interestCalculationMethod">Interest Calculation Method</Label>
                            <Select name="interestCalculationMethod" defaultValue={editingProduct?.interestCalculationMethod || 'closing-balance'} required>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                <SelectItem value="closing-balance">Month Closing Balance</SelectItem>
                                <SelectItem value="opening-closing-average">Month Opening-Closing Average</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="interestProvisionFrequency">Interest Provision Period</Label>
                            <Select name="interestProvisionFrequency" defaultValue={editingProduct?.interestProvisionFrequency || 'monthly'} required>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                {interestFrequencies.map(freq => <SelectItem key={freq} value={freq} className="capitalize">{freq}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="interestDisbursementFrequency">Interest Disbursement Period</Label>
                            <Select name="interestDisbursementFrequency" defaultValue={editingProduct?.interestDisbursementFrequency || 'monthly'} required>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                {interestFrequencies.map(freq => <SelectItem key={freq} value={freq} className="capitalize">{freq}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="provisionGracePeriodDays">Provision Grace Period (Days)</Label>
                            <Input id="provisionGracePeriodDays" name="provisionGracePeriodDays" type="number" defaultValue={editingProduct?.provisionGracePeriodDays || 0} />
                         </div>
                          <div className="space-y-2">
                            <Label htmlFor="closingCharge">Closing Charge</Label>
                            <Input id="closingCharge" name="closingCharge" type="number" step="0.01" defaultValue={editingProduct?.closingCharge || 0} />
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="minBalance">Minimum Balance</Label>
                            <Input id="minBalance" name="minBalance" type="number" step="0.01" defaultValue={editingProduct?.minBalance} />
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="maxBalance">Maximum Balance</Label>
                            <Input id="maxBalance" name="maxBalance" type="number" step="0.01" defaultValue={editingProduct?.maxBalance} />
                         </div>
                         <div className="flex items-center space-x-2 pt-2">
                            <Switch id="isProvisionApplicable" name="isProvisionApplicable" defaultChecked={editingProduct?.isProvisionApplicable} />
                            <Label htmlFor="isProvisionApplicable">Is Provision Applicable?</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Switch id="canWithdrawInterest" name="canWithdrawInterest" defaultChecked={editingProduct?.canWithdrawInterest} />
                            <Label htmlFor="canWithdrawInterest">Allow Interest Withdrawal?</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="isInterestEditableOnDisbursement" name="isInterestEditableOnDisbursement" defaultChecked={editingProduct?.isInterestEditableOnDisbursement} />
                            <Label htmlFor="isInterestEditableOnDisbursement">Interest Editable on Disbursement?</Label>
                        </div>
                     </div>
                  </div>
                )}
                
                {selectedProductTypeId === 'dps' && (
                  <div className="p-4 border rounded-md space-y-4 bg-muted/30">
                    <h4 className="font-semibold text-md">DPS Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dps_paymentFrequency">Payment Frequency</Label>
                        <Select name="dps_paymentFrequency" defaultValue={editingProduct?.dps_paymentFrequency || 'monthly'}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>
                            {dpsPaymentFrequencies.map(freq => <SelectItem key={freq} value={freq} className="capitalize">{freq}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="dps_durationsInYears">Scheme Durations (in years)</Label>
                        <Input id="dps_durationsInYears" name="dps_durationsInYears" placeholder="e.g., 1, 2, 3, 5" defaultValue={editingProduct?.dps_durationsInYears?.join(', ')} />
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="dps_prematureWithdrawalInterestRate">Premature Withdrawal Rate (%)</Label>
                        <Input id="dps_prematureWithdrawalInterestRate" name="dps_prematureWithdrawalInterestRate" type="number" step="0.01" defaultValue={editingProduct?.dps_prematureWithdrawalInterestRate} />
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="dps_lateFeeType">Late Fee Handling</Label>
                        <Select name="dps_lateFeeType" defaultValue={editingProduct?.dps_lateFeeType || 'extend_duration'}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="extend_duration">Extend Duration</SelectItem>
                            <SelectItem value="interest_penalty">Interest Penalty</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="dps_maturityPayout">Maturity Payout Method</Label>
                         <Select name="dps_maturityPayout" defaultValue={editingProduct?.dps_maturityPayout || 'cash'}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>
                            {maturityPayoutOptions.map(opt => <SelectItem key={opt} value={opt} className="capitalize">{opt.replace('_', ' ')}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {selectedProductTypeId === 'ots' && (
                  <div className="p-4 border rounded-md space-y-4 bg-muted/30">
                    <h4 className="font-semibold text-md">OTS Settings</h4>
                    <p className="text-sm text-muted-foreground">Interest for OTS is always calculated on a daily basis.</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ots_interestPayoutFrequency">Interest Payout Frequency</Label>
                            <Select name="ots_interestPayoutFrequency" defaultValue={editingProduct?.ots_interestPayoutFrequency || 'monthly'}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {otsPayoutFrequencies.map(freq => <SelectItem key={freq} value={freq} className="capitalize">{freq}</SelectItem>)}
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ots_provisionType">Interest Provision Type</Label>
                            <Select name="ots_provisionType" defaultValue={editingProduct?.ots_provisionType || 'end_of_month'}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="end_of_month">End of Month</SelectItem>
                                <SelectItem value="on_opening_anniversary">On Anniversary Date</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="ots_interestDisbursementMethod">Interest Disbursement Method</Label>
                            <Select name="ots_interestDisbursementMethod" defaultValue={editingProduct?.ots_interestDisbursementMethod || 'transfer_to_savings'}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {maturityPayoutOptions.map(opt => <SelectItem key={opt} value={opt} className="capitalize">{opt.replace('_', ' ')}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                     </div>
                  </div>
                )}
                
                {selectedProductTypeId === 'fdr' && (
                  <div className="p-4 border rounded-md space-y-4 bg-muted/30">
                    <h4 className="font-semibold text-md">FDR Settings</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label htmlFor="fdr_maturityPayout">Maturity Payout Method</Label>
                        <Select name="fdr_maturityPayout" defaultValue={editingProduct?.fdr_maturityPayout || 'transfer_to_savings'}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                            {maturityPayoutOptions.map(opt => <SelectItem key={opt} value={opt} className="capitalize">{opt.replace('_', ' ')}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fdr_prematureWithdrawalInterestRate">Premature Withdrawal Rate (%)</Label>
                            <Input id="fdr_prematureWithdrawalInterestRate" name="fdr_prematureWithdrawalInterestRate" type="number" step="0.01" defaultValue={editingProduct?.fdr_prematureWithdrawalInterestRate} />
                        </div>
                     </div>
                    <div className="space-y-2">
                      <Label>Payout Rules</Label>
                      <div className="space-y-2 border-t pt-2">
                        {fdrPayoutRules.map(rule => (
                          <div key={rule.id} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded-md">
                            <p className="flex-1">{rule.durationInYears} Years &rarr; {rule.totalInterestRate}% Interest</p>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveFdrRule(rule.id)}>
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 items-end pt-2">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Duration (Years)</Label>
                          <Input type="number" placeholder="e.g., 7" value={newFdrRule.durationInYears} onChange={e => setNewFdrRule({...newFdrRule, durationInYears: e.target.value})} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Total Interest Rate (%)</Label>
                          <Input type="number" placeholder="e.g., 100 for double" value={newFdrRule.totalInterestRate} onChange={e => setNewFdrRule({...newFdrRule, totalInterestRate: e.target.value})} />
                        </div>
                        <Button type="button" onClick={handleAddFdrRule}>Add Rule</Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-4 border rounded-md space-y-4 bg-muted/30">
                    <h4 className="font-semibold text-md">General Settings</h4>
                    <div className="flex items-center space-x-2">
                        <Switch id="lienAllowed" name="lienAllowed" defaultChecked={editingProduct?.lienAllowed} />
                        <Label htmlFor="lienAllowed">Allow account balance to be used as lien for loans</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="collateralAllowed" name="collateralAllowed" defaultChecked={editingProduct?.collateralAllowed} />
                        <Label htmlFor="collateralAllowed">Allow account balance to be used as cash collateral for loans</Label>
                    </div>
                </div>

              </>
            )}
            </div>

            <DialogFooter className="mt-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" disabled={!selectedProductTypeId}>{editingProduct ? 'Save Changes' : 'Create Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
