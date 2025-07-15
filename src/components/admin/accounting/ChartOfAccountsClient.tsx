
'use client';

import React, { useState, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, ChevronRight, Upload, Download } from 'lucide-react';
import type { AccountGroup, AccountHead, LedgerAccount } from '@/types';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';


type DialogState = {
  isOpen: boolean;
  type: 'Group' | 'Head' | 'Ledger' | null;
  editing: AccountGroup | AccountHead | LedgerAccount | null;
  parent?: AccountGroup | AccountHead;
};

export function ChartOfAccountsClient() {
  const { settings, addAccountGroup, updateAccountGroup, deleteAccountGroup, addAccountHead, updateAccountHead, deleteAccountHead, addLedgerAccount, updateLedgerAccount, deleteLedgerAccount, isLoaded } = useSettings();
  const { accountGroups, accountHeads, ledgerAccounts } = settings;

  const [selectedGroup, setSelectedGroup] = useState<AccountGroup | null>(null);
  const [selectedHead, setSelectedHead] = useState<AccountHead | null>(null);

  const [dialogState, setDialogState] = useState<DialogState>({ isOpen: false, type: null, editing: null });

  const handleSelectGroup = (group: AccountGroup) => {
    setSelectedGroup(group);
    setSelectedHead(null);
  };

  const handleSelectHead = (head: AccountHead) => {
    setSelectedHead(head);
  };
  
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

    if (type === 'Group') {
        editing ? updateAccountGroup({ ...(editing as AccountGroup), name }) : addAccountGroup({ name });
    } else if (type === 'Head' && parent) {
        editing ? updateAccountHead({ ...(editing as AccountHead), name }) : addAccountHead({ name, groupId: parent.id });
    } else if (type === 'Ledger' && parent) {
        editing ? updateLedgerAccount({ ...(editing as LedgerAccount), name }) : addLedgerAccount({ name, headId: parent.id });
    }
    
    handleCloseDialog();
  };
  
  const handleDelete = (item: AccountGroup | AccountHead | LedgerAccount, type: 'Group' | 'Head' | 'Ledger') => {
    let childExists = false;
    if (type === 'Group') {
        childExists = accountHeads.some(h => h.groupId === item.id);
    } else if (type === 'Head') {
        childExists = ledgerAccounts.some(l => l.headId === item.id);
    }
    
    if (childExists) {
        alert(`Cannot delete "${item.name}" because it contains other items. Please delete its children first.`);
        return;
    }

    if (confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
        if (type === 'Group') {
            deleteAccountGroup(item.id);
            if (selectedGroup?.id === item.id) setSelectedGroup(null);
        } else if (type === 'Head') {
            deleteAccountHead(item.id);
            if (selectedHead?.id === item.id) setSelectedHead(null);
        } else if (type === 'Ledger') {
            deleteLedgerAccount(item.id);
        }
    }
  }

  const handleDownloadFormat = () => {
    const headers = ["groupName", "headName", "ledgerName"];
    const exampleData = [
      { groupName: "Assets", headName: "Current Assets", ledgerName: "Cash" },
      { groupName: "Assets", headName: "Current Assets", ledgerName: "Accounts Receivable" },
      { groupName: "Expenses", headName: "Operating Expenses", ledgerName: "Salaries Expense" },
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

        json.forEach((row, index) => {
          const { groupName, headName, ledgerName } = row;
          if (!groupName || !headName || !ledgerName) {
            errors.push(`Row ${index + 2}: Missing required fields (groupName, headName, ledgerName).`);
            return;
          }

          try {
            // Find or create group
            let group = settings.accountGroups.find(g => g.name.toLowerCase() === groupName.toString().toLowerCase());
            if (!group) {
              group = addAccountGroup({ name: groupName });
            }

            // Find or create head
            let head = settings.accountHeads.find(h => h.name.toLowerCase() === headName.toString().toLowerCase() && h.groupId === group!.id);
            if (!head) {
              head = addAccountHead({ name: headName, groupId: group!.id });
            }

            // Find or create ledger
            let ledger = settings.ledgerAccounts.find(l => l.name.toLowerCase() === ledgerName.toString().toLowerCase() && l.headId === head!.id);
            if (!ledger) {
              addLedgerAccount({ name: ledgerName, headId: head!.id });
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


  const renderColumn = (
    title: string,
    items: any[],
    selectedItem: any | null,
    onSelectItem: (item: any) => void,
    onAdd: () => void,
    onEdit: (item: any) => void,
    onDelete: (item: any) => void,
    showAddButton: boolean,
    type: 'Group' | 'Head' | 'Ledger'
  ) => (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {showAddButton && (
          <Button size="sm" variant="outline" onClick={onAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        {items.length > 0 ? (
          items.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={cn(
                "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted/80 group",
                selectedItem?.id === item.id && "bg-muted font-semibold"
              )}
            >
                <span>{item.name}</span>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onDelete(item); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    {type !== 'Ledger' && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-muted-foreground pt-8">
            {title === "Account Groups" ? "No groups yet." : `Select a ${title === 'Account Heads' ? 'group' : 'head'} to see its children.`}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (!isLoaded) {
    return <div>Loading chart of accounts...</div>;
  }

  const filteredHeads = selectedGroup ? accountHeads.filter(h => h.groupId === selectedGroup.id) : [];
  const filteredLedgers = selectedHead ? ledgerAccounts.filter(l => l.headId === selectedHead.id) : [];

  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={handleDownloadFormat} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Download Format
        </Button>
        <Button asChild variant="outline" size="sm">
            <Label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" /> Upload Accounts
                <Input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
            </Label>
        </Button>
      </div>

      <div className="flex gap-4 h-[calc(100vh-16rem)]">
        {renderColumn('Account Groups', accountGroups, selectedGroup, handleSelectGroup, 
            () => handleOpenDialog('Group', null), 
            (g) => handleOpenDialog('Group', g),
            (g) => handleDelete(g, 'Group'),
            true, 'Group')}
        {renderColumn('Account Heads', filteredHeads, selectedHead, handleSelectHead, 
            () => handleOpenDialog('Head', null, selectedGroup!), 
            (h) => handleOpenDialog('Head', h, selectedGroup!),
            (h) => handleDelete(h, 'Head'),
            !!selectedGroup, 'Head')}
        {renderColumn('Ledger Accounts', filteredLedgers, null, () => {}, 
            () => handleOpenDialog('Ledger', null, selectedHead!), 
            (l) => handleOpenDialog('Ledger', l, selectedHead!),
            (l) => handleDelete(l, 'Ledger'),
            !!selectedHead, 'Ledger')}
      </div>

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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{dialogState.editing ? 'Save Changes' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
