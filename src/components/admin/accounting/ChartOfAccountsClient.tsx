
'use client';

import React, { useState, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, ChevronRight } from 'lucide-react';
import type { AccountGroup, AccountHead, LedgerAccount } from '@/types';
import { cn } from '@/lib/utils';


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
