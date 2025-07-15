
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, ChevronRight, Upload, Download, AlertTriangle } from 'lucide-react';
import type { AccountGroup, AccountSubGroup, AccountHead, AccountSubHead, LedgerAccount } from '@/types';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';


type DialogState = {
  isOpen: boolean;
  type: 'Group' | 'Sub-Group' | 'Head' | 'Sub-Head' | 'Ledger' | null;
  editing: AccountGroup | AccountSubGroup | AccountHead | AccountSubHead | LedgerAccount | null;
  parent?: AccountGroup | AccountSubGroup | AccountHead | AccountSubHead;
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

  const [selectedGroup, setSelectedGroup] = useState<AccountGroup | null>(null);
  const [selectedSubGroup, setSelectedSubGroup] = useState<AccountSubGroup | null>(null);
  const [selectedHead, setSelectedHead] = useState<AccountHead | null>(null);
  const [selectedSubHead, setSelectedSubHead] = useState<AccountSubHead | null>(null);

  const [dialogState, setDialogState] = useState<DialogState>({ isOpen: false, type: null, editing: null });
  const [clearConfirmationOpen, setClearConfirmationOpen] = useState(false);

  const filteredSubGroups = useMemo(() => selectedGroup ? accountSubGroups.filter(sg => sg.groupId === selectedGroup.id) : [], [selectedGroup, accountSubGroups]);
  const filteredHeads = useMemo(() => selectedSubGroup ? accountHeads.filter(h => h.subGroupId === selectedSubGroup.id) : [], [selectedSubGroup, accountHeads]);
  const filteredSubHeads = useMemo(() => selectedHead ? accountSubHeads.filter(sh => sh.headId === selectedHead.id) : [], [selectedHead, accountSubHeads]);
  const filteredLedgers = useMemo(() => selectedSubHead ? ledgerAccounts.filter(l => l.subHeadId === selectedSubHead.id) : [], [selectedSubHead, ledgerAccounts]);
  
  useEffect(() => {
    setSelectedSubGroup(null);
    setSelectedHead(null);
    setSelectedSubHead(null);
  }, [selectedGroup]);

  useEffect(() => {
    setSelectedHead(null);
    setSelectedSubHead(null);
  }, [selectedSubGroup]);

  useEffect(() => {
    setSelectedSubHead(null);
  }, [selectedHead]);

  const handleSelectGroup = (group: AccountGroup) => {
    setSelectedGroup(group);
  };

  const handleSelectSubGroup = (subGroup: AccountSubGroup) => {
    setSelectedSubGroup(subGroup);
  }

  const handleSelectHead = (head: AccountHead) => {
    setSelectedHead(head);
  };
  
  const handleSelectSubHead = (subHead: AccountSubHead) => {
    setSelectedSubHead(subHead);
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

    if (editing) { // Handle all updates
        if (type === 'Group') updateAccountGroup({ ...(editing as AccountGroup), name });
        else if (type === 'Sub-Group') updateAccountSubGroup({ ...(editing as AccountSubGroup), name });
        else if (type === 'Head') updateAccountHead({ ...(editing as AccountHead), name });
        else if (type === 'Sub-Head') updateAccountSubHead({ ...(editing as AccountSubHead), name });
        else if (type === 'Ledger') {
            const code = formData.get('code') as string;
            const openingBalance = parseFloat(formData.get('openingBalance') as string) || 0;
            updateLedgerAccount({ ...(editing as LedgerAccount), name, code, openingBalance });
        }
    } else { // Handle all creations
        if (type === 'Group') {
            const newGroup = addAccountGroup({ name });
            setSelectedGroup(newGroup);
        } else if (type === 'Sub-Group' && parent) {
            const newSubGroup = addAccountSubGroup({ name, groupId: parent.id });
            setSelectedSubGroup(newSubGroup);
        } else if (type === 'Head' && parent) {
            const newHead = addAccountHead({ name, subGroupId: parent.id });
            setSelectedHead(newHead);
        } else if (type === 'Sub-Head' && parent) {
            const newSubHead = addAccountSubHead({ name, headId: parent.id });
            setSelectedSubHead(newSubHead);
        } else if (type === 'Ledger' && parent) {
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
        if (type === 'Group') { deleteAccountGroup(item.id); if (selectedGroup?.id === item.id) setSelectedGroup(null); }
        else if (type === 'Sub-Group') { deleteAccountSubGroup(item.id); if (selectedSubGroup?.id === item.id) setSelectedSubGroup(null); }
        else if (type === 'Head') { deleteAccountHead(item.id); if (selectedHead?.id === item.id) setSelectedHead(null); }
        else if (type === 'Sub-Head') { deleteAccountSubHead(item.id); if (selectedSubHead?.id === item.id) setSelectedSubHead(null); }
        else if (type === 'Ledger') { deleteLedgerAccount(item.id); }
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

        json.forEach((row, index) => {
          const { groupName, subGroupName, headName, subHeadName, ledgerName, ledgerCode, openingBalance } = row;
          if (!groupName || !subGroupName || !headName || !subHeadName || !ledgerName) {
            errors.push(`Row ${index + 2}: Missing required fields. All name columns must be filled.`);
            return;
          }

          try {
            let group = settings.accountGroups.find(g => g.name.toLowerCase() === groupName.toString().toLowerCase());
            if (!group) group = addAccountGroup({ name: groupName });

            let subGroup = settings.accountSubGroups.find(sg => sg.name.toLowerCase() === subGroupName.toString().toLowerCase() && sg.groupId === group!.id);
            if (!subGroup) subGroup = addAccountSubGroup({ name: subGroupName, groupId: group!.id });
            
            let head = settings.accountHeads.find(h => h.name.toLowerCase() === headName.toString().toLowerCase() && h.subGroupId === subGroup!.id);
            if (!head) head = addAccountHead({ name: headName, subGroupId: subGroup!.id });

            let subHead = settings.accountSubHeads.find(sh => sh.name.toLowerCase() === subHeadName.toString().toLowerCase() && sh.headId === head!.id);
            if (!subHead) subHead = addAccountSubHead({ name: subHeadName, headId: head!.id });

            let ledger = settings.ledgerAccounts.find(l => l.name.toLowerCase() === ledgerName.toString().toLowerCase() && l.subHeadId === subHead!.id);
            if (!ledger) {
              addLedgerAccount({ name: ledgerName, code: ledgerCode || '', openingBalance: parseFloat(openingBalance) || 0, subHeadId: subHead!.id });
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

  const renderColumn = (
    title: string,
    items: any[],
    selectedItem: any | null,
    onSelectItem: (item: any) => void,
    onAdd: () => void,
    onEdit: (item: any) => void,
    onDelete: (item: any) => void,
    showAddButton: boolean,
    type: DialogState['type']
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
                {type === 'Ledger' ? (
                  <div className="text-sm">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Code: {item.code} | OB: ৳{item.openingBalance?.toFixed(2) || '0.00'}</p>
                  </div>
                ) : (
                  <span>{item.name}</span>
                )}
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
            {title === "Groups" ? "No groups yet." : `Select a parent to see its children.`}
          </p>
        )}
      </CardContent>
    </Card>
  );

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
        <Button onClick={() => setClearConfirmationOpen(true)} variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" /> Clear Chart of Accounts
        </Button>
      </div>

      <div className="flex gap-2 h-[calc(100vh-16rem)]">
        {renderColumn('Groups', accountGroups, selectedGroup, handleSelectGroup, 
            () => handleOpenDialog('Group', null), 
            (g) => handleOpenDialog('Group', g),
            (g) => handleDelete(g, 'Group'),
            true, 'Group')}
        {renderColumn('Sub-Groups', filteredSubGroups, selectedSubGroup, handleSelectSubGroup, 
            () => handleOpenDialog('Sub-Group', null, selectedGroup!), 
            (sg) => handleOpenDialog('Sub-Group', sg, selectedGroup!),
            (sg) => handleDelete(sg, 'Sub-Group'),
            !!selectedGroup, 'Sub-Group')}
        {renderColumn('Account Heads', filteredHeads, selectedHead, handleSelectHead, 
            () => handleOpenDialog('Head', null, selectedSubGroup!), 
            (h) => handleOpenDialog('Head', h, selectedSubGroup!),
            (h) => handleDelete(h, 'Head'),
            !!selectedSubGroup, 'Head')}
        {renderColumn('Sub-Heads', filteredSubHeads, selectedSubHead, handleSelectSubHead,
            () => handleOpenDialog('Sub-Head', null, selectedHead!),
            (sh) => handleOpenDialog('Sub-Head', sh, selectedHead!),
            (sh) => handleDelete(sh, 'Sub-Head'),
            !!selectedHead, 'Sub-Head')}
        {renderColumn('Ledger Accounts', filteredLedgers, null, () => {}, 
            () => handleOpenDialog('Ledger', null, selectedSubHead!), 
            (l) => handleOpenDialog('Ledger', l, selectedSubHead!),
            (l) => handleDelete(l, 'Ledger'),
            !!selectedSubHead, 'Ledger')}
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

