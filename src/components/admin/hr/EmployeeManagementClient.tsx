
'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Employee } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function EmployeeManagementClient() {
  const { settings, addEmployee, updateEmployee, deleteEmployee, isLoaded } = useSettings();
  const { employees, designations } = settings;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleOpenDialog = (employee: Employee | null) => {
    setEditingEmployee(employee);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingEmployee(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const employeeData: Omit<Employee, 'id'> = {
      name: formData.get('name') as string,
      mobile: formData.get('mobile') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      designationId: formData.get('designationId') as string,
      joiningDate: formData.get('joiningDate') as string,
      salary: parseFloat(formData.get('salary') as string),
    };

    if (!employeeData.name || !employeeData.mobile || !employeeData.designationId || !employeeData.joiningDate || isNaN(employeeData.salary)) {
        alert("Please fill all required fields.");
        return;
    }

    if (editingEmployee) {
      updateEmployee({ ...editingEmployee, ...employeeData });
    } else {
      addEmployee(employeeData);
    }
    handleCloseDialog();
  };

  if (!isLoaded) {
    return <div>Loading employees...</div>;
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog(null)} disabled={designations.length === 0}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Employee
        </Button>
      </div>
      {designations.length === 0 && <p className="text-sm text-destructive text-right mt-2">Please add a designation before adding an employee.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {employees.map(employee => (
          <Card key={employee.id}>
            <CardHeader>
              <CardTitle>{employee.name}</CardTitle>
              <CardDescription>{designations.find(d => d.id === employee.designationId)?.name || 'N/A'}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold">{employee.mobile}</p>
              <p className="text-sm text-muted-foreground">{employee.email}</p>
              <p className="text-sm text-muted-foreground">{employee.address}</p>
              <div className="mt-2 pt-2 border-t">
                  <p className="text-sm">Salary: ৳{employee.salary.toFixed(2)}</p>
                  <p className="text-sm">Joined: {new Date(employee.joiningDate).toLocaleDateString()}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(employee)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteEmployee(employee.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
        {employees.length === 0 && (
          <Card className="text-center py-12 col-span-full mt-4">
            <CardHeader>
              <CardTitle>No Employees Found</CardTitle>
              <CardDescription>Click "Add New Employee" to get started.</CardDescription>
            </CardHeader>
          </Card>
        )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" defaultValue={editingEmployee?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input id="mobile" name="mobile" defaultValue={editingEmployee?.mobile} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={editingEmployee?.email} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" defaultValue={editingEmployee?.address} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designationId">Designation</Label>
                  <Select name="designationId" defaultValue={editingEmployee?.designationId} required>
                    <SelectTrigger><SelectValue placeholder="Select a designation" /></SelectTrigger>
                    <SelectContent>
                        {designations.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="salary">Salary</Label>
                    <Input id="salary" name="salary" type="number" step="0.01" defaultValue={editingEmployee?.salary} required />
                </div>
                 <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="joiningDate">Joining Date</Label>
                    <Input id="joiningDate" name="joiningDate" type="date" defaultValue={editingEmployee?.joiningDate} required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingEmployee ? 'Save Changes' : 'Create Employee'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
