
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, HandCoins, History } from 'lucide-react';

const ComingSoonCard = ({ title, description }: { title: string, description: string }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground p-8">This feature is under construction.</p>
        </CardContent>
    </Card>
);

export function InterestManagementClient() {
  return (
    <Tabs defaultValue="provision" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="provision">
          <Calculator className="mr-2 h-4 w-4" /> Interest Provision
        </TabsTrigger>
        <TabsTrigger value="disbursement">
            <HandCoins className="mr-2 h-4 w-4" /> Interest Disbursement
        </TabsTrigger>
        <TabsTrigger value="log">
            <History className="mr-2 h-4 w-4" /> Interest Log
        </TabsTrigger>
      </TabsList>
      <TabsContent value="provision" className="mt-4">
        <ComingSoonCard 
            title="Interest Provision"
            description="Calculate and provision interest for all applicable savings accounts based on their product rules."
        />
      </TabsContent>
      <TabsContent value="disbursement" className="mt-4">
        <ComingSoonCard 
            title="Interest Disbursement"
            description="Disburse previously provisioned interest to member savings accounts, making the funds available for withdrawal."
        />
      </TabsContent>
       <TabsContent value="log" className="mt-4">
        <ComingSoonCard 
            title="Interest Transaction Log"
            description="View a complete history of all interest provision and disbursement transactions."
        />
      </TabsContent>
    </Tabs>
  );
}
