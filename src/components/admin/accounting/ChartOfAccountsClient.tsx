
'use client';

import React, { useState, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Upload, Download, AlertTriangle } from 'lucide-react';
import type { AccountGroup, AccountSubGroup, AccountHead, AccountSubHead, LedgerAccount } from '@/types';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';


type DialogState = {
  isOpen: boolean;
  type: 'Group' | 'Sub-Group' | 'Head' | 'Sub-Head' | 'Ledger' | null;
  editing: AccountGroup | AccountSubGroup | AccountHead | AccountSubHead | LedgerAccount | null;
  parent?: AccountGroup | AccountSubGroup | AccountHead | AccountSubHead;
};

const hierarchyOrder = ['Group', 'Sub-Group', 'Head', 'Sub-Head', 'Ledger'];

// A new recursive component to render the tree
const AccountTree = ({
  parentId,
  level = 0,
  onAdd,
  onEdit,
  onDelete
}: {
  parentId?: string;
  level?: number;
  onAdd: (type: DialogState['type'], parent: any) => void;
  onEdit: (item: any, type: DialogState['type']) => void;
  onDelete: (item: any, type: DialogState['type']) => void;
}) => {
  const { settings } = useSettings();
  const { accountGroups, accountSubGroups, accountHeads, accountSubHeads, ledgerAccounts } = settings;

  const items = useMemo(() => {
    switch (level) {
      case 0: return accountGroups.filter(g => !g.parentId);
      case 1: return accountSubGroups.filter(sg => sg.groupId === parentId);
      case 2: return accountHeads.filter(h => h.subGroupId === parentId);
      case 3: return accountSubHeads.filter(sh => sh.headId === parentId);
      case 4: return ledgerAccounts.filter(l => l.subHeadId === parentId);
      default: return [];
    }
  }, [level, parentId, accountGroups, accountSubGroups, accountHeads, accountSubHeads, ledgerAccounts]);

  const itemType = hierarchyOrder[level] as DialogState['type'];
  const childType = hierarchyOrder[level + 1] as DialogState['type'];

  if (!items.length && level > 0) return null;

  return (
    <div className="space-y-1" style={{ paddingLeft: `${level * 24}px` }}>
      {items.map((item: any) => (
        <React.Fragment key={item.id}>
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/80 group">
            <div className="text-sm">
              <p className="font-semibold">{item.name}</p>
              {itemType === 'Ledger' && (
                <p className="text-xs text-muted-foreground">
                  Code: {item.code || 'N/A'} | OB: ৳{item.openingBalance?.toFixed(2) || '0.00'}
                </p>
              )}
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              {childType && (
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAdd(childType, item)}>
                    <PlusCircle className="h-4 w-4 text-green-600" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item, itemType)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(item, itemType)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          <AccountTree
            parentId={item.id}
            level={level + 1}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </React.Fragment>
      ))}
    </div>
  );
};


export function ChartOfAccountsClient() {
  const { 
    settings, 
    addAccountGroup, updateAccountGroup, deleteAccountGroup,
    addAccountSubGroup, updateAccountSubGroup, deleteAccountSubGroup,
    addAccountHead, updateAccountHead, deleteAccountHead,
    addAccountSubHead, updateAccountSubHead, deleteAccountSubHead,
    addLedgerAccount, updateLedgerAccount, deleteLedgerAccount, 
    clearChartOfAccounts,
    isLoaded 
  } = useSettings();
  
  const { accountGroups, accountSubGroups, accountHeads, accountSubHeads, ledgerAccounts } = settings;
  const [dialogState, setDialogState] = useState<DialogState>({ isOpen: false, type: null, editing: null });
  const [clearConfirmationOpen, setClearConfirmationOpen] = useState(false);
  
  const handleOpenDialog = (type: DialogState['type'], editing: DialogState['editing'], parent?: DialogState['parent']) => {
    setDialogState({ isOpen: true, type, editing, parent });
  };
  
  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, type: null, editing: null });
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    if (!name) return;

    const { type, editing, parent } = dialogState;

    if (editing) {
        if (type === 'Group') updateAccountGroup({ ...(editing as AccountGroup), name });
        else if (type === 'Sub-Group') updateAccountSubGroup({ ...(editing as AccountSubGroup), name });
        else if (type === 'Head') updateAccountHead({ ...(editing as AccountHead), name });
        else if (type === 'Sub-Head') updateAccountSubHead({ ...(editing as AccountSubHead), name });
        else if (type === 'Ledger') {
            const code = formData.get('code') as string;
            const openingBalance = parseFloat(formData.get('openingBalance') as string) || 0;
            updateLedgerAccount({ ...(editing as LedgerAccount), name, code, openingBalance });
        }
    } else {
        if (type === 'Group') addAccountGroup({ name });
        else if (type === 'Sub-Group' && parent) addAccountSubGroup({ name, groupId: parent.id });
        else if (type === 'Head' && parent) addAccountHead({ name, subGroupId: parent.id });
        else if (type === 'Sub-Head' && parent) addAccountSubHead({ name, headId: parent.id });
        else if (type === 'Ledger' && parent) {
            const code = formData.get('code') as string;
            const openingBalance = parseFloat(formData.get('openingBalance') as string) || 0;
            addLedgerAccount({ name, code, openingBalance, subHeadId: parent.id });
        }
    }
    
    handleCloseDialog();
  };
  
  const handleDelete = (item: any, type: DialogState['type']) => {
    let childExists = false;
    if (type === 'Group') childExists = accountSubGroups.some(h => h.groupId === item.id);
    else if (type === 'Sub-Group') childExists = accountHeads.some(h => h.subGroupId === item.id);
    else if (type === 'Head') childExists = accountSubHeads.some(h => h.headId === item.id);
    else if (type === 'Sub-Head') childExists = ledgerAccounts.some(l => l.subHeadId === item.id);
    
    if (childExists) {
        alert(`Cannot delete "${item.name}" because it contains other items. Please delete its children first.`);
        return;
    }

    if (confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
        if (type === 'Group') deleteAccountGroup(item.id);
        else if (type === 'Sub-Group') deleteAccountSubGroup(item.id);
        else if (type === 'Head') deleteAccountHead(item.id);
        else if (type === 'Sub-Head') deleteAccountSubHead(item.id);
        else if (type === 'Ledger') deleteLedgerAccount(item.id);
    }
  }

  const handleDownloadFormat = () => {
    const headers = ["groupName", "subGroupName", "headName", "subHeadName", "ledgerName", "ledgerCode", "openingBalance"];
    const exampleData = [
      { groupName: "Assets", subGroupName: "Current Assets", headName: "Bank Accounts", subHeadName: "Checking Accounts", ledgerName: "Main Checking Account", ledgerCode: "10101", openingBalance: 50000.00 },
      { groupName: "Assets", subGroupName: "Current Assets", headName: "Bank Accounts", subHeadName: "Savings Accounts", ledgerName: "Business Savings", ledgerCode: "10102", openingBalance: 150000.00 },
      { groupName: "Expenses", subGroupName: "Operating Expenses", headName: "Salaries", subHeadName: "Management Salaries", ledgerName: "CEO Salary", ledgerCode: "50101", openingBalance: 0 },
    ];
    const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ChartOfAccounts");
    XLSX.writeFile(wb, "chart_of_accounts_format.xlsx");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        let itemsAdded = 0;
        const errors: string[] = [];
        
        let currentGroups = [...settings.accountGroups];
        let currentSubGroups = [...settings.accountSubGroups];
        let currentHeads = [...settings.accountHeads];
        let currentSubHeads = [...settings.accountSubHeads];
        let currentLedgers = [...settings.ledgerAccounts];

        json.forEach((row, index) => {
          const { groupName, subGroupName, headName, subHeadName, ledgerName, ledgerCode, openingBalance } = row;
          if (!groupName || !subGroupName || !headName || !subHeadName || !ledgerName) {
            errors.push(`Row ${index + 2}: Missing required fields. All name columns must be filled.`);
            return;
          }

          try {
            let group = currentGroups.find(g => g.name.toLowerCase() === groupName.toString().toLowerCase());
            if (!group) {
              group = addAccountGroup({ name: groupName });
              currentGroups.push(group);
            }

            let subGroup = currentSubGroups.find(sg => sg.name.toLowerCase() === subGroupName.toString().toLowerCase() && sg.groupId === group!.id);
            if (!subGroup) {
              subGroup = addAccountSubGroup({ name: subGroupName, groupId: group!.id });
              currentSubGroups.push(subGroup);
            }
            
            let head = currentHeads.find(h => h.name.toLowerCase() === headName.toString().toLowerCase() && h.subGroupId === subGroup!.id);
            if (!head) {
              head = addAccountHead({ name: headName, subGroupId: subGroup!.id });
              currentHeads.push(head);
            }

            let subHead = currentSubHeads.find(sh => sh.name.toLowerCase() === subHeadName.toString().toLowerCase() && sh.headId === head!.id);
            if (!subHead) {
              subHead = addAccountSubHead({ name: subHeadName, headId: head!.id });
              currentSubHeads.push(subHead);
            }

            let ledger = currentLedgers.find(l => l.name.toLowerCase() === ledgerName.toString().toLowerCase() && l.subHeadId === subHead!.id);
            if (!ledger) {
              const newLedger = addLedgerAccount({ name: ledgerName, code: ledgerCode || '', openingBalance: parseFloat(openingBalance) || 0, subHeadId: subHead!.id });
              currentLedgers.push(newLedger);
              itemsAdded++;
            }
          } catch (e: any) {
             errors.push(`Row ${index + 2}: Error processing - ${e.message}`);
          }
        });

        alert(`${itemsAdded} new ledger accounts added successfully.${errors.length > 0 ? `\n\nErrors:\n${errors.join('\n')}` : ''}`);

      } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to process the uploaded file. Please ensure it is a valid Excel file.");
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  const handleConfirmClear = () => {
      clearChartOfAccounts();
      setClearConfirmationOpen(false);
  }

  if (!isLoaded) {
    return <div>Loading chart of accounts...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-end gap-2">
            <Button onClick={handleDownloadFormat} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download Format
            </Button>
            <Button asChild variant="outline" size="sm">
                <Label className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" /> Upload Accounts
                    <Input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
                </Label>
            </Button>
            <Button onClick={() => setClearConfirmationOpen(true)} variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Clear Chart of Accounts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
           <div className="border rounded-lg p-4 min-h-[calc(100vh-20rem)]">
              <div className="flex items-center justify-between pb-2 border-b">
                 <h4 className="font-semibold">Chart of Accounts</h4>
                 <Button size="sm" variant="outline" onClick={() => handleOpenDialog('Group', null)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Group
                 </Button>
              </div>
              <div className="mt-4">
                <AccountTree
                  onAdd={handleOpenDialog}
                  onEdit={(item, type) => handleOpenDialog(type, item)}
                  onDelete={handleDelete}
                />
              </div>
           </div>
        </CardContent>
      </Card>

      <Dialog open={dialogState.isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
                {dialogState.editing ? `Edit ${dialogState.type}` : `Add New ${dialogState.type}`}
            </DialogTitle>
            {dialogState.parent && <DialogDescription>Adding under "{dialogState.parent.name}"</DialogDescription>}
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={(dialogState.editing as any)?.name} required />
              </div>
              {dialogState.type === 'Ledger' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="code">Ledger Code</Label>
                    <Input id="code" name="code" defaultValue={(dialogState.editing as LedgerAccount)?.code} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openingBalance">Opening Balance</Label>
                    <Input id="openingBalance" name="openingBalance" type="number" step="0.01" defaultValue={(dialogState.editing as LedgerAccount)?.openingBalance || 0} />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{dialogState.editing ? 'Save Changes' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={clearConfirmationOpen} onOpenChange={setClearConfirmationOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-destructive" /> Are you absolutely sure?</DialogTitle>
                <DialogDescription className="pt-2">
                    This action is irreversible. It will permanently delete your entire Chart of Accounts, including all groups, heads, and ledger accounts.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setClearConfirmationOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleConfirmClear}>Yes, Clear Everything</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

