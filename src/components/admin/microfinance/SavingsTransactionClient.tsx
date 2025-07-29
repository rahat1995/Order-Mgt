
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownToDot, ArrowUpFromDot, Landmark } from 'lucide-react';


const SavingsDepositForm = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Record Savings Deposit</CardTitle>
                <CardDescription>Select a member's savings account to deposit funds.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Deposit form will be here.</p>
            </CardContent>
            <CardFooter>
                <Button>Submit Deposit</Button>
            </CardFooter>
        </Card>
    );
}

const SavingsWithdrawalForm = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Record Savings Withdrawal</CardTitle>
                <CardDescription>Select a member's savings account to withdraw funds.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Withdrawal form will be here.</p>
            </CardContent>
             <CardFooter>
                <Button>Submit Withdrawal</Button>
            </CardFooter>
        </Card>
    );
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
      <TabsContent value="deposit">
        <SavingsDepositForm />
      </TabsContent>
      <TabsContent value="withdrawal">
        <SavingsWithdrawalForm />
      </TabsContent>
       <TabsContent value="interest-payment">
        <SavingsInterestPaymentForm />
      </TabsContent>
    </Tabs>
  );
}
