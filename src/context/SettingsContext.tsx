

'use client';

import type { AppSettings, OrganizationInfo, ModuleSettings, MenuCategory, MenuItem, Order, Table, Customer, Voucher, Collection, CustomerGroup, PosSettings, ServiceIssue, ServiceType, ServiceItem, ServiceItemCategory, ServiceJob, ServiceJobSettings, ProductCategory, Product, InventoryItem, Challan, ChallanItem, ChallanSettings, Brand, Model, Supplier, InventoryProduct, Floor, Reservation, ExpenseCategory, SupplierBill, SupplierPayment, Attribute, AttributeValue, Theme, Designation, Employee, RawMaterial, BillItem, AccountType, AccountGroup, AccountSubGroup, AccountHead, AccountSubHead, LedgerAccount, AccountingSettings, AccountingVoucher, VoucherType, FixedAsset, AssetLocation, AssetCategory, Samity, MicrofinanceSettings, Division, District, Upozilla, Union, Village, WorkingArea, LoanProduct, Branch, SavingsProductType, SavingsProduct, FdrPayoutRule, MemberMandatoryFields, SavingsAccount } from '@/types';
import React, { from } from 'react';
import { v4 as uuidv4 } from 'uuid';

const defaultSettings: AppSettings = {
  organization: {
    name: 'My Restaurant',
    address: '123 Main Street, Anytown',
    mobile: '555-123-4567',
    email: 'contact@myrestaurant.com',
    logo: '',
    contactPerson: 'John Doe',
    receiptFooter: 'Thank you for your visit! Please come again.',
  },
  theme: 'slate',
  modules: {
    pos: true,
    customerManagement: true,
    customerLedger: true,
    salesReport: true,
    dueReport: true,
    pendingBillReport: true,
    dueSell: true,
    serviceJob: false,
    challanAndBilling: true,
    productManagement: true,
    inventory: true,
    tableManagement: true,
    costManagement: true,
    accounting: true,
    hrManagement: true,
    userAccessControl: true,
    microfinance: true,
    fixedAssetManagement: true,
    addressManagement: true,
  },
  posSettings: {
    advancedItemOptions: true,
    showItemsByCategory: true,
    showPrintWithKitchenButton: true,
    maxDiscountPercentage: 0,
    maxDiscountAmount: 0,
    enableOrderTypes: true,
    allowQuantityEdit: true,
    allowPriceEdit: true,
  },
  serviceJobSettings: {
    termsAndConditions: '1. A copy of this job card must be presented at the time of device collection.\n2. The company is not responsible for any data loss during service. Customers are advised to back up all personal data.\n3. Warranty is void if the device shows signs of physical damage, liquid damage, or unauthorized tampering after service.\n4. Estimated delivery time is subject to the availability of parts. Any delays will be communicated.\n5. Devices not collected within 30 days of the completion notification may be disposed of to recover costs.'
  },
  challanSettings: {
    printWithOfficeCopy: true,
    printOfficeCopyWithPrice: true,
  },
  accountingSettings: {
    fiscalYear: '2024-2025',
    fiscalYearStartDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Default to Jan 1st of current year
    openingDate: new Date().toISOString().split('T')[0],
    cashLedgerIds: [],
    bankLedgerIds: [],
    voucherApprovalLevels: {
      preparedBy: undefined,
      reviewedBy: undefined,
      approvedBy: undefined,
    }
  },
  microfinanceSettings: {
    samityTerm: 'Samity',
    memberMandatoryFields: {
        dob: false,
        fatherName: false,
        motherName: false,
        spouseName: false,
        nidOrBirthCert: false,
        presentAddress: false,
        permanentAddress: false,
    }
  },
  branches: [
    { id: 'default-ho', name: 'Head Office', code: 'HO', startDate: new Date().toISOString().split('T')[0] },
  ],
  floors: [],
  tables: [],
  reservations: [],
  menuCategories: [],
  menuItems: [],
  orders: [],
  customers: [],
  customerGroups: [],
  samities: [],
  loanProducts: [],
  savingsProductTypes: [
    { id: 'regular-savings', name: 'Regular Savings', code: 'RS' },
    { id: 'dps', name: 'DPS', code: 'DPS' },
    { id: 'ots', name: 'OTS', code: 'OTS' },
    { id: 'fdr', name: 'FDR', code: 'FDR' },
  ],
  savingsProducts: [],
  savingsAccounts: [],
  vouchers: [],
  collections: [],
  serviceIssues: [],
  serviceTypes: [],
  serviceItemCategories: [],
  serviceItems: [],
  serviceJobs: [],
  // Simple Product management for challan
  productCategories: [],
  products: [],
  inventoryItems: [],
  challans: [],
  // Full Inventory Management
  invProductCategories: [],
  invProducts: [],
  invBrands: [],
  invModels: [],
  attributes: [],
  attributeValues: [],
  // Cost Management
  suppliers: [],
  expenseCategories: [],
  rawMaterials: [],
  supplierBills: [],
  supplierPayments: [],
  // HR Management
  designations: [],
  employees: [],
  // Fixed Asset Management
  fixedAssets: [],
  assetLocations: [],
  assetCategories: [],
  // Address Management
  divisions: [],
  districts: [],
  upozillas: [],
  unions: [],
  villages: [],
  workingAreas: [],
  // Accounting
  accountTypes: [],
  accountGroups: [],
  accountSubGroups: [],
  accountHeads: [],
  accountSubHeads: [],
  ledgerAccounts: [],
  accountingVouchers: [],
  lastOrderNumberForDate: {
    date: '',
    serial: 0,
  },
  lastServiceJobNumberForDate: {
      date: '',
      serial: 0,
  },
  lastChallanNumberForDate: {
      date: '',
      serial: 0,
  },
  lastVoucherNumbers: {},
  lastSamitySerials: {},
  lastMemberSerials: {},
  lastSavingsAccountSerials: {},
};

type ChallanItemBlueprint = { 
  productId: string;
  name: string; 
  serialNumber: string; 
  price: number; 
};

interface SettingsContextType {
  settings: AppSettings;
  isLoaded: boolean;
  setOrganizationInfo: (info: OrganizationInfo) => void;
  setModuleSettings: (settings: ModuleSettings) => void;
  setTheme: (theme: Theme) => void;
  setPosSettings: (settings: PosSettings) => void;
  setServiceJobSettings: (settings: ServiceJobSettings) => void;
  setChallanSettings: (settings: ChallanSettings) => void;
  setAccountingSettings: (settings: AccountingSettings) => void;
  setMicrofinanceSettings: (settings: MicrofinanceSettings) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  updateBranch: (branch: Branch) => void;
  deleteBranch: (branchId: string) => void;
  // Table Management
  addFloor: (floor: Omit<Floor, 'id'>) => Floor;
  updateFloor: (floor: Floor) => void;
  deleteFloor: (floorId: string) => void;
  addTable: (table: Omit<Table, 'id' | 'x' | 'y'>) => Table;
  updateTable: (table: Table) => void;
  deleteTable: (tableId: string) => void;
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  deleteReservation: (reservationId: string) => void;
  // Menu
  addMenuCategory: (category: Omit<MenuCategory, 'id'>) => void;
  updateMenuCategory: (category: MenuCategory) => void;
  deleteMenuCategory: (categoryId: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
  // Order
  addOrder: (order: Omit<Order, 'id' | 'orderNumber'>, billedInventoryItemIds?: string[]) => Order;
  updateOrder: (order: Order) => void;
  deleteOrder: (orderId: string) => void;
  // Customer
  addCustomer: (customer: Omit<Customer, 'id'> & { primarySavingsRecoverableAmount?: number }) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  // Customer Group
  addCustomerGroup: (group: Omit<CustomerGroup, 'id'>) => void;
  updateCustomerGroup: (group: CustomerGroup) => void;
  deleteCustomerGroup: (groupId: string) => void;
  // Microfinance
  addSamity: (samity: Omit<Samity, 'id' | 'code'>) => void;
  updateSamity: (samity: Samity) => void;
  deleteSamity: (samityId: string) => void;
  addLoanProduct: (product: Omit<LoanProduct, 'id'>) => void;
  updateLoanProduct: (product: LoanProduct) => void;
  deleteLoanProduct: (productId: string) => void;
  addSavingsProduct: (product: Omit<SavingsProduct, 'id'>) => void;
  updateSavingsProduct: (product: SavingsProduct) => void;
  deleteSavingsProduct: (productId: string) => void;
  addSavingsAccount: (account: Omit<SavingsAccount, 'id' | 'accountNumber' | 'openingDate' | 'balance' | 'status'>) => void;
  // Voucher
  addVoucher: (voucher: Omit<Voucher, 'id'>) => void;
  updateVoucher: (voucher: Voucher) => void;
  deleteVoucher: (voucherId: string) => void;
  // Collection
  addCollection: (collectionData: { customerId: string, amount: number, notes?: string }) => void;
  // Service Job
  addServiceJob: (job: Omit<ServiceJob, 'id' | 'jobNumber'>) => ServiceJob;
  updateServiceJob: (job: ServiceJob) => void;
  addServiceIssue: (issue: Omit<ServiceIssue, 'id'>) => void;
  updateServiceIssue: (issue: ServiceIssue) => void;
  deleteServiceIssue: (issueId: string) => void;
  addServiceType: (type: Omit<ServiceType, 'id'>) => void;
  updateServiceType: (type: ServiceType) => void;
  deleteServiceType: (typeId: string) => void;
  addServiceItemCategory: (category: Omit<ServiceItemCategory, 'id'>) => void;
  updateServiceItemCategory: (category: ServiceItemCategory) => void;
  deleteServiceItemCategory: (categoryId: string) => void;
  addServiceItem: (item: Omit<ServiceItem, 'id'>) => void;
  updateServiceItem: (item: ServiceItem) => void;
  deleteServiceItem: (itemId: string) => void;
  // Simple Product (for Challan)
  addProductCategory: (category: Omit<ProductCategory, 'id'>) => void;
  updateProductCategory: (category: ProductCategory) => void;
  deleteProductCategory: (categoryId: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  // Challan
  addChallan: (challanData: Omit<Challan, 'id' | 'challanNumber' | 'status' | 'items'> & { items: ChallanItemBlueprint[] }) => Challan;
  // Inventory Management
  addInvProductCategory: (category: Omit<ProductCategory, 'id' | 'code'> & { id?: string, name: string, parentId?: string, code?: string }) => void;
  updateInvProductCategory: (category: ProductCategory) => void;
  deleteInvProductCategory: (categoryId: string) => void;
  addBrand: (brand: Omit<Brand, 'id'> & { id?: string }) => void;
  updateBrand: (brand: Brand) => void;
  deleteBrand: (brandId: string) => void;
  addModel: (model: Omit<Model, 'id'> & { id?: string }) => void;
  updateModel: (model: Model) => void;
  deleteModel: (modelId: string) => void;
  addInvProduct: (product: Omit<InventoryProduct, 'id'>) => void;
  updateInvProduct: (product: InventoryProduct) => void;
  deleteInvProduct: (productId: string) => void;
  addAttribute: (attribute: Omit<Attribute, 'id'>) => void;
  updateAttribute: (attribute: Attribute) => void;
  deleteAttribute: (attributeId: string) => void;
  addAttributeValue: (value: Omit<AttributeValue, 'id'>) => void;
  updateAttributeValue: (value: AttributeValue) => void;
  deleteAttributeValue: (valueId: string) => void;
  // Supplier
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Customer;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (supplierId: string) => void;
  // Cost Management
  addExpenseCategory: (category: Omit<ExpenseCategory, 'id'>) => void;
  updateExpenseCategory: (category: ExpenseCategory) => void;
  deleteExpenseCategory: (categoryId: string) => void;
  addRawMaterial: (material: Omit<RawMaterial, 'id'>) => void;
  updateRawMaterial: (material: RawMaterial) => void;
  deleteRawMaterial: (materialId: string) => void;
  addSupplierBill: (bill: Omit<SupplierBill, 'id' | 'paymentStatus'>) => void;
  addSupplierPayment: (payment: Omit<SupplierPayment, 'id'>) => void;
  addBulkSupplierPayments: (payments: { supplierId: string, amount: number }[]) => void;
  // HR Management
  addDesignation: (designation: Omit<Designation, 'id'>) => void;
  updateDesignation: (designation: Designation) => void;
  deleteDesignation: (designationId: string) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (employeeId: string) => void;
  // Fixed Asset Management
  addFixedAsset: (asset: Omit<FixedAsset, 'id'>) => FixedAsset;
  addAssetLocation: (location: Omit<AssetLocation, 'id'>) => AssetLocation;
  updateAssetLocation: (location: AssetLocation) => void;
  deleteAssetLocation: (locationId: string) => void;
  addAssetCategory: (category: Omit<AssetCategory, 'id'>) => void;
  updateAssetCategory: (category: AssetCategory) => void;
  deleteAssetCategory: (categoryId: string) => void;
  // Address Management
  addAddressData: (entityType: 'Division' | 'District' | 'Upozilla' | 'Union' | 'Village' | 'WorkingArea', data: any) => void;
  updateAddressData: (entityType: 'Division' | 'District' | 'Upozilla' | 'Union' | 'Village' | 'WorkingArea', data: any) => void;
  deleteAddressData: (entityType: 'Division' | 'District' | 'Upozilla' | 'Union' | 'Village' | 'WorkingArea', id: string) => void;
  // Accounting
  addAccountingVoucher: (voucher: Omit<AccountingVoucher, 'id' | 'voucherNumber'>) => AccountingVoucher;
  deleteAccountingVoucher: (voucherId: string) => void;
  addAccountType: (type: Omit<AccountType, 'id'>) => AccountType;
  updateAccountType: (type: AccountType) => void;
  deleteAccountType: (typeId: string) => void;
  addAccountGroup: (group: Omit<AccountGroup, 'id'>) => AccountGroup;
  updateAccountGroup: (group: AccountGroup) => void;
  deleteAccountGroup: (groupId: string) => void;
  addAccountSubGroup: (subGroup: Omit<AccountSubGroup, 'id'>) => AccountSubGroup;
  updateAccountSubGroup: (subGroup: AccountSubGroup) => void;
  deleteAccountSubGroup: (subGroupId: string) => void;
  addAccountHead: (head: Omit<AccountHead, 'id'>) => AccountHead;
  updateAccountHead: (head: AccountHead) => void;
  deleteAccountHead: (headId: string) => void;
  addAccountSubHead: (subHead: Omit<AccountSubHead, 'id'>) => AccountSubHead;
  updateAccountSubHead: (subHead: AccountSubHead) => void;
  deleteAccountSubHead: (subHeadId: string) => void;
  addLedgerAccount: (account: Omit<LedgerAccount, 'id'>) => LedgerAccount;
  updateLedgerAccount: (account: LedgerAccount) => void;
  deleteLedgerAccount: (accountId: string) => void;
  clearChartOfAccounts: () => void;
  updateAllLedgerOpeningBalances: (balances: Record<string, number>) => void;
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

const PRIMARY_KEY = 'appSettings';
const BACKUP_KEY = 'appSettings_backup';

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettingsState] = React.useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load settings from localStorage on initial render
  React.useEffect(() => {
    let storedSettings: AppSettings | null = null;
    try {
      const primaryData = localStorage.getItem(PRIMARY_KEY);
      if (primaryData) {
        storedSettings = JSON.parse(primaryData);
      } else {
        const backupData = localStorage.getItem(BACKUP_KEY);
        if (backupData) {
          console.warn("Primary settings not found, restoring from backup.");
          storedSettings = JSON.parse(backupData);
          localStorage.setItem(PRIMARY_KEY, backupData); // Restore primary from backup
        }
      }
    } catch (error) {
      console.error("Failed to parse primary settings, attempting to use backup.", error);
      try {
        const backupData = localStorage.getItem(BACKUP_KEY);
        if (backupData) {
          storedSettings = JSON.parse(backupData);
          localStorage.setItem(PRIMARY_KEY, backupData); // Restore primary from backup
        }
      } catch (backupError) {
        console.error("Failed to parse backup settings as well. Using default settings.", backupError);
      }
    }

    if (storedSettings) {
      const mergedSettings: AppSettings = {
        ...defaultSettings,
        ...storedSettings,
        organization: { ...defaultSettings.organization, ...storedSettings.organization },
        theme: storedSettings.theme || defaultSettings.theme,
        modules: { ...defaultSettings.modules, ...storedSettings.modules },
        posSettings: { ...defaultSettings.posSettings, ...storedSettings.posSettings },
        serviceJobSettings: { ...defaultSettings.serviceJobSettings, ...storedSettings.serviceJobSettings },
        challanSettings: { ...defaultSettings.challanSettings, ...storedSettings.challanSettings },
        accountingSettings: { 
            ...defaultSettings.accountingSettings, 
            ...storedSettings.accountingSettings,
            voucherApprovalLevels: {
              ...defaultSettings.accountingSettings.voucherApprovalLevels,
              ...storedSettings.accountingSettings?.voucherApprovalLevels,
            }
        },
        microfinanceSettings: { 
            ...defaultSettings.microfinanceSettings, 
            ...storedSettings.microfinanceSettings,
            memberMandatoryFields: {
                ...defaultSettings.microfinanceSettings.memberMandatoryFields,
                ...storedSettings.microfinanceSettings?.memberMandatoryFields,
            },
        },
        branches: storedSettings.branches || defaultSettings.branches,
        floors: storedSettings.floors || defaultSettings.floors,
        tables: storedSettings.tables || defaultSettings.tables,
        reservations: storedSettings.reservations || defaultSettings.reservations,
        menuCategories: storedSettings.menuCategories || defaultSettings.menuCategories,
        menuItems: (storedSettings.menuItems || []).map((item: any) => ({ ...item, variants: item.variants || [], addOns: item.addOns || [] })),
        orders: storedSettings.orders || defaultSettings.orders,
        customers: storedSettings.customers || defaultSettings.customers,
        customerGroups: storedSettings.customerGroups || defaultSettings.customerGroups,
        samities: storedSettings.samities || defaultSettings.samities,
        loanProducts: storedSettings.loanProducts || defaultSettings.loanProducts,
        savingsProductTypes: storedSettings.savingsProductTypes?.length ? storedSettings.savingsProductTypes : defaultSettings.savingsProductTypes,
        savingsProducts: storedSettings.savingsProducts || defaultSettings.savingsProducts,
        savingsAccounts: storedSettings.savingsAccounts || defaultSettings.savingsAccounts,
        vouchers: storedSettings.vouchers || defaultSettings.vouchers,
        collections: storedSettings.collections || defaultSettings.collections,
        serviceIssues: storedSettings.serviceIssues || defaultSettings.serviceIssues,
        serviceTypes: storedSettings.serviceTypes || defaultSettings.serviceTypes,
        serviceItemCategories: storedSettings.serviceItemCategories || defaultSettings.serviceItemCategories,
        serviceItems: storedSettings.serviceItems || defaultSettings.serviceItems,
        serviceJobs: storedSettings.serviceJobs || defaultSettings.serviceJobs,
        productCategories: storedSettings.productCategories || defaultSettings.productCategories,
        products: storedSettings.products || defaultSettings.products,
        inventoryItems: storedSettings.inventoryItems || defaultSettings.inventoryItems,
        challans: storedSettings.challans || defaultSettings.challans,
        invProductCategories: storedSettings.invProductCategories || defaultSettings.invProductCategories,
        invProducts: (storedSettings.invProducts || []).map((p: InventoryProduct) => ({ ...p, compositeItems: p.compositeItems || [] })),
        invBrands: storedSettings.invBrands || defaultSettings.invBrands,
        invModels: storedSettings.invModels || defaultSettings.invModels,
        attributes: storedSettings.attributes || defaultSettings.attributes,
        attributeValues: storedSettings.attributeValues || defaultSettings.attributeValues,
        suppliers: storedSettings.suppliers || defaultSettings.suppliers,
        expenseCategories: storedSettings.expenseCategories || defaultSettings.expenseCategories,
        rawMaterials: storedSettings.rawMaterials || defaultSettings.rawMaterials,
        supplierBills: storedSettings.supplierBills || defaultSettings.supplierBills,
        supplierPayments: storedSettings.supplierPayments || defaultSettings.supplierPayments,
        designations: storedSettings.designations || defaultSettings.designations,
        employees: storedSettings.employees || defaultSettings.employees,
        fixedAssets: storedSettings.fixedAssets || defaultSettings.fixedAssets,
        assetLocations: storedSettings.assetLocations || defaultSettings.assetLocations,
        assetCategories: storedSettings.assetCategories || defaultSettings.assetCategories,
        divisions: storedSettings.divisions || defaultSettings.divisions,
        districts: storedSettings.districts || defaultSettings.districts,
        upozillas: storedSettings.upozillas || defaultSettings.upozillas,
        unions: storedSettings.unions || defaultSettings.unions,
        villages: storedSettings.villages || defaultSettings.villages,
        workingAreas: storedSettings.workingAreas || defaultSettings.workingAreas,
        accountTypes: storedSettings.accountTypes || defaultSettings.accountTypes,
        accountGroups: storedSettings.accountGroups || defaultSettings.accountGroups,
        accountSubGroups: storedSettings.accountSubGroups || defaultSettings.accountSubGroups,
        accountHeads: storedSettings.accountHeads || defaultSettings.accountHeads,
        accountSubHeads: storedSettings.accountSubHeads || defaultSettings.accountSubHeads,
        ledgerAccounts: storedSettings.ledgerAccounts || defaultSettings.ledgerAccounts,
        accountingVouchers: storedSettings.accountingVouchers || defaultSettings.accountingVouchers,
        lastOrderNumberForDate: storedSettings.lastOrderNumberForDate || defaultSettings.lastOrderNumberForDate,
        lastServiceJobNumberForDate: storedSettings.lastServiceJobNumberForDate || defaultSettings.lastServiceJobNumberForDate,
        lastChallanNumberForDate: storedSettings.lastChallanNumberForDate || defaultSettings.lastChallanNumberForDate,
        lastVoucherNumbers: storedSettings.lastVoucherNumbers || defaultSettings.lastVoucherNumbers,
        lastSamitySerials: storedSettings.lastSamitySerials || defaultSettings.lastSamitySerials,
        lastMemberSerials: storedSettings.lastMemberSerials || defaultSettings.lastMemberSerials,
        lastSavingsAccountSerials: storedSettings.lastSavingsAccountSerials || defaultSettings.lastSavingsAccountSerials,
      };
      setSettingsState(mergedSettings);
    } else {
      setSettingsState(defaultSettings);
    }
    setIsLoaded(true);
  }, []);

  const setSettings = React.useCallback((updater: React.SetStateAction<AppSettings>) => {
    setSettingsState(prevSettings => {
      const newSettings = typeof updater === 'function' ? updater(prevSettings) : updater;
      
      try {
        const settingsString = JSON.stringify(newSettings);
        // First, write to backup. If this fails, we don't touch the primary.
        localStorage.setItem(BACKUP_KEY, settingsString);
        // If backup is successful, write to primary.
        localStorage.setItem(PRIMARY_KEY, settingsString);
      } catch (error) {
        console.error("Failed to save settings to localStorage", error);
        // Optionally, show a user-facing error message here
      }
      
      return newSettings;
    });
  }, []);

  const setOrganizationInfo = (info: OrganizationInfo) => setSettings(prev => ({ ...prev, organization: info }));
  const setModuleSettings = (moduleInfo: ModuleSettings) => setSettings(prev => ({ ...prev, modules: moduleInfo }));
  const setTheme = (theme: Theme) => setSettings(prev => ({ ...prev, theme }));
  const setPosSettings = (posSettings: PosSettings) => setSettings(prev => ({ ...prev, posSettings }));
  const setServiceJobSettings = (serviceJobSettings: ServiceJobSettings) => setSettings(prev => ({ ...prev, serviceJobSettings }));
  const setChallanSettings = (challanSettings: ChallanSettings) => setSettings(prev => ({ ...prev, challanSettings }));
  const setAccountingSettings = (accountingSettings: AccountingSettings) => setSettings(prev => ({...prev, accountingSettings}));
  const setMicrofinanceSettings = (microfinanceSettings: MicrofinanceSettings) => setSettings(prev => ({...prev, microfinanceSettings}));

  const addBranch = (branch: Omit<Branch, 'id'>) => setSettings(prev => ({ ...prev, branches: [...prev.branches, { ...branch, id: uuidv4() }] }));
  const updateBranch = (updatedBranch: Branch) => setSettings(prev => ({ ...prev, branches: prev.branches.map(b => b.id === updatedBranch.id ? updatedBranch : b) }));
  const deleteBranch = (branchId: string) => {
    if (branchId === 'default-ho') {
      alert("Cannot delete the default Head Office.");
      return;
    }
    if (settings.employees.some(e => e.branchId === branchId)) {
        alert("Cannot delete branch with assigned employees. Please reassign them first.");
        return;
    }
    if (confirm('Are you sure you want to delete this branch?')) {
      setSettings(prev => ({ ...prev, branches: prev.branches.filter(b => b.id !== branchId) }));
    }
  };
  
  // Table Management
  const addFloor = (floor: Omit<Floor, 'id'>): Floor => {
    const newFloor = { ...floor, id: uuidv4() };
    setSettings(prev => ({ ...prev, floors: [...prev.floors, newFloor] }));
    return newFloor;
  };
  const updateFloor = (updatedFloor: Floor) => setSettings(prev => ({ ...prev, floors: prev.floors.map(f => f.id === updatedFloor.id ? updatedFloor : f) }));
  const deleteFloor = (floorId: string) => {
    if (confirm('Are you sure you want to delete this floor? All its tables and layout configurations will also be removed.')) {
      setSettings(prev => ({ ...prev, floors: prev.floors.filter(f => f.id !== floorId), tables: prev.tables.filter(t => t.floorId !== floorId) }));
    }
  };
  const addTable = (table: Omit<Table, 'id' | 'x' | 'y'>): Table => {
    const newTable = { ...table, id: uuidv4(), x: -1, y: -1 };
    setSettings(prev => ({ ...prev, tables: [...prev.tables, newTable] }));
    return newTable;
  };
  const updateTable = (updatedTable: Table) => setSettings(prev => ({ ...prev, tables: prev.tables.map(t => t.id === updatedTable.id ? updatedTable : t) }));
  const deleteTable = (tableId: string) => {
    setSettings(prev => ({ ...prev, tables: prev.tables.filter(t => t.id !== tableId), reservations: prev.reservations.filter(r => r.tableId !== tableId) }));
  };
  const addReservation = (reservation: Omit<Reservation, 'id'>) => setSettings(prev => ({ ...prev, reservations: [...prev.reservations, { ...reservation, id: uuidv4() }] }));
  const deleteReservation = (reservationId: string) => {
    if (confirm('Are you sure?')) {
      setSettings(prev => ({ ...prev, reservations: prev.reservations.filter(r => r.id !== reservationId) }));
    }
  };
  
  // Menu Category Management
  const addMenuCategory = (category: Omit<MenuCategory, 'id'>) => setSettings(prev => ({ ...prev, menuCategories: [...prev.menuCategories, { ...category, id: uuidv4() }] }));
  const updateMenuCategory = (updatedCategory: MenuCategory) => setSettings(prev => ({ ...prev, menuCategories: prev.menuCategories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat) }));
  const deleteMenuCategory = (categoryId: string) => {
    if (settings.menuCategories.some(cat => cat.parentId === categoryId)) {
      alert('Cannot delete category with sub-categories.');
      return;
    }
    if (confirm('Are you sure? This will delete the category and all its items.')) {
      setSettings(prev => ({ ...prev, menuCategories: prev.menuCategories.filter(cat => cat.id !== categoryId), menuItems: prev.menuItems.filter(item => item.categoryId !== categoryId) }));
    }
  };

  // Menu Item Management
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => setSettings(prev => ({ ...prev, menuItems: [...prev.menuItems, { ...item, id: uuidv4() }] }));
  const updateMenuItem = (updatedItem: MenuItem) => setSettings(prev => ({ ...prev, menuItems: prev.menuItems.map(item => item.id === updatedItem.id ? updatedItem : item) }));
  const deleteMenuItem = (itemId: string) => {
    if (confirm('Are you sure?')) {
      setSettings(prev => ({ ...prev, menuItems: prev.menuItems.filter(item => item.id !== itemId) }));
    }
  };
  
  // Order Management
  const addOrder = (orderData: Omit<Order, 'id' | 'orderNumber'>, billedInventoryItemIds?: string[]): Order => {
    let newOrderWithIdAndToken: Order;
    
    setSettings(prev => {
        const today = new Date(), yyyy = today.getFullYear(), mm = String(today.getMonth() + 1).padStart(2, '0'), dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`, todayFormatted = `${dd}${mm}${yyyy}`;
        let newSerial = prev.lastOrderNumberForDate.date === todayStr ? prev.lastOrderNumberForDate.serial + 1 : 1;
        const newOrderNumber = `${todayFormatted}-${String(newSerial).padStart(4, '0')}`;
        const paymentStatus = (orderData.amountTendered || 0) >= orderData.total ? 'paid' : 'pending';
        newOrderWithIdAndToken = { ...orderData, id: uuidv4(), orderNumber: newOrderNumber, paymentStatus };
        
        let updatedInventoryItems = prev.inventoryItems;
        let updatedChallans = prev.challans;

        if (orderData.challanId && billedInventoryItemIds) {
            updatedInventoryItems = prev.inventoryItems.map(invItem => 
                billedInventoryItemIds.includes(invItem.id) ? { ...invItem, status: 'sold', orderId: newOrderWithIdAndToken.id } : invItem
            );
            
            const challanToUpdate = prev.challans.find(c => c.id === orderData.challanId);
            if (challanToUpdate) {
                const allChallanItemsBilled = challanToUpdate.items.every(ci => updatedInventoryItems.find(inv => inv.id === ci.inventoryItemId)?.status === 'sold');
                const newStatus = allChallanItemsBilled ? 'fully-billed' : 'partially-billed';
                updatedChallans = prev.challans.map(c => c.id === orderData.challanId ? { ...c, status: newStatus } : c);
            }
        }
    
        return {
            ...prev,
            orders: [...prev.orders, newOrderWithIdAndToken],
            inventoryItems: updatedInventoryItems,
            challans: updatedChallans,
            lastOrderNumberForDate: { date: todayStr, serial: newSerial },
        };
    });

    // @ts-ignore
    return newOrderWithIdAndToken;
  };

  const updateOrder = (updatedOrder: Order) => setSettings(prev => ({ ...prev, orders: prev.orders.map(o => o.id === updatedOrder.id ? updatedOrder : o) }));
  const deleteOrder = (orderId: string) => {
    if (confirm('Are you sure? This action cannot be undone.')) {
      setSettings(prev => ({ ...prev, orders: prev.orders.filter(o => o.id !== orderId) }));
    }
  };
  
  const addSavingsAccount = (account: Omit<SavingsAccount, 'id' | 'accountNumber' | 'openingDate' | 'balance' | 'status'>) => {
    setSettings(prev => {
        const product = prev.savingsProducts.find(p => p.id === account.savingsProductId);
        if (!product) return prev;

        const lastSerial = prev.lastSavingsAccountSerials?.[product.id] || 0;
        const newSerial = lastSerial + 1;
        
        const member = prev.customers.find(c => c.id === account.memberId);
        if (!member) return prev;

        const accountNumber = `${product.code}-${member.code}-${String(newSerial).padStart(4, '0')}`;
        
        const newAccount: SavingsAccount = {
            ...account,
            id: uuidv4(),
            accountNumber,
            openingDate: new Date().toISOString(),
            balance: 0,
            status: 'active'
        };

        return {
            ...prev,
            savingsAccounts: [...prev.savingsAccounts, newAccount],
            lastSavingsAccountSerials: {
                ...prev.lastSavingsAccountSerials,
                [product.id]: newSerial,
            },
        };
    });
  }

  // Customer Management
  const addCustomer = (customer: Omit<Customer, 'id'> & { primarySavingsRecoverableAmount?: number }): Customer => {
    let newCustomerWithCode: Customer;

    setSettings(prev => {
        let memberCode = '';
        const updatedSerials = { ...prev.lastMemberSerials };

        if (customer.samityId) {
            const samity = prev.samities.find(s => s.id === customer.samityId);
            if (samity) {
                const branchCode = prev.branches.find(b => b.id === samity.branchId)?.code || 'XX';
                const samityCodePart = samity.code.split('-').pop() || '0000';
                const lastSerial = prev.lastMemberSerials?.[customer.samityId] || 0;
                const newSerial = lastSerial + 1;
                memberCode = `${branchCode}-${samityCodePart}-${String(newSerial).padStart(3, '0')}`;
                updatedSerials[customer.samityId] = newSerial;
            }
        }

        const { primarySavingsRecoverableAmount, ...customerData } = customer;
        newCustomerWithCode = { ...customerData, id: uuidv4(), code: memberCode };
        
        // Auto-create primary savings account
        const primarySavingsProductId = prev.microfinanceSettings.primarySavingsProductId;
        let newSavingsAccounts = prev.savingsAccounts;
        let newLastSavingsAccountSerials = prev.lastSavingsAccountSerials;

        if (primarySavingsProductId) {
             const product = prev.savingsProducts.find(p => p.id === primarySavingsProductId);
             if (product) {
                const lastSerial = prev.lastSavingsAccountSerials?.[product.id] || 0;
                const newSerial = lastSerial + 1;
                const accountNumber = `${product.code}-${memberCode}-${String(newSerial).padStart(4, '0')}`;
                
                const newAccount: SavingsAccount = {
                    id: uuidv4(),
                    memberId: newCustomerWithCode.id,
                    savingsProductId: primarySavingsProductId,
                    accountNumber,
                    openingDate: new Date().toISOString(),
                    balance: 0,
                    status: 'active',
                    recoverableAmount: primarySavingsRecoverableAmount ?? product.rs_recoverableAmount,
                };
                newSavingsAccounts = [...prev.savingsAccounts, newAccount];
                newLastSavingsAccountSerials = {
                  ...prev.lastSavingsAccountSerials,
                  [product.id]: newSerial,
                }
             }
        }

        return { 
            ...prev, 
            customers: [...prev.customers, newCustomerWithCode],
            lastMemberSerials: updatedSerials,
            savingsAccounts: newSavingsAccounts,
            lastSavingsAccountSerials: newLastSavingsAccountSerials
        };
    });

    // @ts-ignore
    return newCustomerWithCode;
  };

  const updateCustomer = (updatedCustomer: Customer) => setSettings(prev => ({ ...prev, customers: prev.customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c) }));
  const deleteCustomer = (customerId: string) => {
    if (confirm('Are you sure?')) {
      setSettings(prev => ({ ...prev, customers: prev.customers.filter(c => c.id !== customerId) }));
    }
  };

  // Customer Group Management
  const addCustomerGroup = (group: Omit<CustomerGroup, 'id'>) => setSettings(prev => ({ ...prev, customerGroups: [...prev.customerGroups, { ...group, id: uuidv4() }] }));
  const updateCustomerGroup = (updatedGroup: CustomerGroup) => setSettings(prev => ({ ...prev, customerGroups: prev.customerGroups.map(g => g.id === updatedGroup.id ? updatedGroup : g) }));
  const deleteCustomerGroup = (groupId: string) => {
    if (confirm('Are you sure?')) {
      setSettings(prev => ({ ...prev, customerGroups: prev.customerGroups.filter(g => g.id !== groupId) }));
    }
  };

  // Voucher Management
  const addVoucher = (voucher: Omit<Voucher, 'id'>) => setSettings(prev => ({ ...prev, vouchers: [...prev.vouchers, { ...voucher, id: uuidv4() }] }));
  const updateVoucher = (updatedVoucher: Voucher) => setSettings(prev => ({ ...prev, vouchers: prev.vouchers.map(v => v.id === updatedVoucher.id ? updatedVoucher : v) }));
  const deleteVoucher = (voucherId: string) => {
    if (confirm('Are you sure?')) {
      setSettings(prev => ({ ...prev, vouchers: prev.vouchers.filter(v => v.id !== voucherId) }));
    }
  };

  // Collection Management
  const addCollection = (collectionData: { customerId: string, amount: number, notes?: string }) => {
    const newCollection: Collection = { ...collectionData, id: uuidv4(), date: new Date().toISOString() };
    setSettings(prev => {
        let updatedServiceJobs = [...prev.serviceJobs];

        const customerOrders = prev.orders.filter(o => o.customerId === collectionData.customerId);
        const customerCollections = prev.collections.filter(c => c.customerId === collectionData.customerId);
        const totalBilled = customerOrders.reduce((acc, order) => acc + order.total, 0);
        const totalPaidBefore = customerCollections.reduce((acc, c) => acc + c.amount, 0) + customerOrders.reduce((acc, order) => acc + (order.amountTendered || 0), 0);
        const newTotalPaid = totalPaidBefore + collectionData.amount;
        
        // If the new payment clears the balance, update service jobs.
        if (newTotalPaid >= totalBilled) {
            const jobsToUpdate = prev.serviceJobs.filter(sj => 
                sj.customerId === collectionData.customerId &&
                sj.status !== 'Delivered' &&
                sj.status !== 'Cancelled'
            );

            const jobIdsToUpdate = jobsToUpdate.map(j => j.id);

            updatedServiceJobs = prev.serviceJobs.map(sj => {
                if (jobIdsToUpdate.includes(sj.id)) {
                    const newHistoryEntry = { status: 'Delivered', timestamp: new Date().toISOString() };
                    const currentHistory = Array.isArray(sj.statusHistory) ? sj.statusHistory : [];
                    return { ...sj, status: 'Delivered', statusHistory: [...currentHistory, newHistoryEntry] };
                }
                return sj;
            });
        }
        
        return {
            ...prev,
            collections: [...prev.collections, newCollection],
            serviceJobs: updatedServiceJobs,
        };
    });
  };

  // Service Job Management
  const addServiceJob = (jobData: Omit<ServiceJob, 'id' | 'jobNumber'>): ServiceJob => {
    let newJobWithIdAndNumber: ServiceJob;
    setSettings(prev => {
        const today = new Date(), yyyy = today.getFullYear(), mm = String(today.getMonth() + 1).padStart(2, '0'), dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`, todayFormatted = `SJ-${dd}${mm}${yyyy}`;
        let newSerial = prev.lastServiceJobNumberForDate.date === todayStr ? prev.lastServiceJobNumberForDate.serial + 1 : 1;
        const newJobNumber = `${todayFormatted}-${String(newSerial).padStart(3, '0')}`;
        newJobWithIdAndNumber = { ...jobData, id: uuidv4(), jobNumber: newJobNumber, statusHistory: [{ status: jobData.status, timestamp: jobData.createdAt }] };
        return { ...prev, serviceJobs: [...prev.serviceJobs, newJobWithIdAndNumber], lastServiceJobNumberForDate: { date: todayStr, serial: newSerial } };
    });
    // @ts-ignore
    return newJobWithIdAndNumber;
  };
  const updateServiceJob = (updatedJob: ServiceJob) => {
    setSettings(prev => {
      const originalJob = prev.serviceJobs.find(job => job.id === updatedJob.id);
      if (originalJob && originalJob.status !== updatedJob.status) {
        const newHistoryEntry = { status: updatedJob.status, timestamp: new Date().toISOString() };
        const currentHistory = Array.isArray(originalJob.statusHistory) ? originalJob.statusHistory : [];
        updatedJob.statusHistory = [...currentHistory, newHistoryEntry];
      }
      return { ...prev, serviceJobs: prev.serviceJobs.map(job => job.id === updatedJob.id ? updatedJob : job) };
    });
  };

  // Service Component Management
  const addServiceIssue = (issue: Omit<ServiceIssue, 'id'>) => setSettings(prev => ({ ...prev, serviceIssues: [...prev.serviceIssues, { ...issue, id: uuidv4() }] }));
  const updateServiceIssue = (updatedIssue: ServiceIssue) => setSettings(prev => ({ ...prev, serviceIssues: prev.serviceIssues.map(i => i.id === updatedIssue.id ? updatedIssue : i) }));
  const deleteServiceIssue = (issueId: string) => {
    if (confirm('Are you sure?')) setSettings(prev => ({ ...prev, serviceIssues: prev.serviceIssues.filter(i => i.id !== issueId) }));
  };
  const addServiceType = (type: Omit<ServiceType, 'id'>) => setSettings(prev => ({ ...prev, serviceTypes: [...prev.serviceTypes, { ...type, id: uuidv4() }] }));
  const updateServiceType = (updatedType: ServiceType) => setSettings(prev => ({ ...prev, serviceTypes: prev.serviceTypes.map(t => t.id === updatedType.id ? updatedType : t) }));
  const deleteServiceType = (typeId: string) => {
    if (confirm('Are you sure?')) setSettings(prev => ({ ...prev, serviceTypes: prev.serviceTypes.filter(t => t.id !== typeId) }));
  };
  const addServiceItemCategory = (category: Omit<ServiceItemCategory, 'id'>) => setSettings(prev => ({ ...prev, serviceItemCategories: [...prev.serviceItemCategories, { ...category, id: uuidv4() }] }));
  const updateServiceItemCategory = (updatedCategory: ServiceItemCategory) => setSettings(prev => ({ ...prev, serviceItemCategories: prev.serviceItemCategories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat) }));
  const deleteServiceItemCategory = (categoryId: string) => {
    if (confirm('Are you sure? This also deletes items in it.')) setSettings(prev => ({ ...prev, serviceItemCategories: prev.serviceItemCategories.filter(cat => cat.id !== categoryId), serviceItems: prev.serviceItems.filter(item => item.categoryId !== categoryId) }));
  };
  const addServiceItem = (item: Omit<ServiceItem, 'id'>) => setSettings(prev => ({ ...prev, serviceItems: [...prev.serviceItems, { ...item, id: uuidv4() }] }));
  const updateServiceItem = (updatedItem: ServiceItem) => setSettings(prev => ({ ...prev, serviceItems: prev.serviceItems.map(item => item.id === updatedItem.id ? updatedItem : item) }));
  const deleteServiceItem = (itemId: string) => {
    if (confirm('Are you sure?')) setSettings(prev => ({ ...prev, serviceItems: prev.serviceItems.filter(item => item.id !== itemId) }));
  };

  // Simple Product (for Challan) Management
  const addProductCategory = (category: Omit<ProductCategory, 'id'>) => setSettings(prev => ({ ...prev, productCategories: [...prev.productCategories, { ...category, id: uuidv4() }] }));
  const updateProductCategory = (updatedCategory: ProductCategory) => setSettings(prev => ({ ...prev, productCategories: prev.productCategories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat) }));
  const deleteProductCategory = (categoryId: string) => {
    if (confirm('Are you sure? This will delete the category and all its products.')) {
      setSettings(prev => ({ ...prev, productCategories: prev.productCategories.filter(cat => cat.id !== categoryId), products: prev.products.filter(item => item.categoryId !== categoryId) }));
    }
  };
  const addProduct = (product: Omit<Product, 'id'>) => setSettings(prev => ({ ...prev, products: [...prev.products, { ...product, id: uuidv4() }] }));
  const updateProduct = (updatedProduct: Product) => setSettings(prev => ({ ...prev, products: prev.products.map(item => item.id === updatedProduct.id ? updatedProduct : item) }));
  const deleteProduct = (productId: string) => {
    if (confirm('Are you sure?')) {
      setSettings(prev => ({ ...prev, products: prev.products.filter(item => item.id !== productId) }));
    }
  };

  // Challan Management
  const addChallan = (challanData: Omit<Challan, 'id' | 'challanNumber' | 'status' | 'items'> & { items: ChallanItemBlueprint[] }): Challan => {
    let newChallanWithIdAndNumber: Challan;
    setSettings(prev => {
        const today = new Date(), yyyy = today.getFullYear(), mm = String(today.getMonth() + 1).padStart(2, '0'), dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`, todayFormatted = `CH-${dd}${mm}${yyyy}`;
        let newSerial = prev.lastChallanNumberForDate.date === todayStr ? prev.lastChallanNumberForDate.serial + 1 : 1;
        const newChallanNumber = `${todayFormatted}-${String(newSerial).padStart(3, '0')}`;
        
        const newInventoryItems: InventoryItem[] = [];
        const finalChallanItems: ChallanItem[] = [];

        for (const itemBlueprint of challanData.items) {
          const newInventoryItem: InventoryItem = {
            id: uuidv4(),
            productId: itemBlueprint.productId,
            serialNumber: itemBlueprint.serialNumber,
            status: 'allocated-to-challan',
          };
          newInventoryItems.push(newInventoryItem);

          finalChallanItems.push({
            inventoryItemId: newInventoryItem.id,
            productId: itemBlueprint.productId,
            name: itemBlueprint.name,
            serialNumber: itemBlueprint.serialNumber,
            price: itemBlueprint.price,
          });
        }
        
        newChallanWithIdAndNumber = { ...challanData, items: finalChallanItems, id: uuidv4(), challanNumber: newChallanNumber, status: 'pending' };
        
        newInventoryItems.forEach(item => item.challanId = newChallanWithIdAndNumber.id);
        
        return {
            ...prev,
            challans: [...prev.challans, newChallanWithIdAndNumber],
            inventoryItems: [...prev.inventoryItems, ...newInventoryItems],
            lastChallanNumberForDate: { date: todayStr, serial: newSerial },
        };
    });
    // @ts-ignore
    return newChallanWithIdAndNumber;
  };
  
  // Inventory Management
  const addInvProductCategory = (category: Omit<ProductCategory, 'id' | 'code'> & { id?: string, name: string, parentId?: string, code?:string }) => setSettings(prev => ({ ...prev, invProductCategories: [...prev.invProductCategories, { ...category, id: category.id || uuidv4() }] }));
  const updateInvProductCategory = (updatedCategory: ProductCategory) => setSettings(prev => ({ ...prev, invProductCategories: prev.invProductCategories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat) }));
  const deleteInvProductCategory = (categoryId: string) => {
    if (settings.invProductCategories.some(cat => cat.parentId === categoryId)) {
      alert('Cannot delete category with sub-categories.');
      return;
    }
    if (confirm('Are you sure? This may affect products in this category.')) {
      setSettings(prev => ({ ...prev, invProductCategories: prev.invProductCategories.filter(cat => cat.id !== categoryId) }));
    }
  };
  
  const addBrand = (brand: Omit<Brand, 'id'> & { id?: string }) => setSettings(prev => ({ ...prev, invBrands: [...prev.invBrands, { ...brand, id: brand.id || uuidv4() }] }));
  const updateBrand = (updatedBrand: Brand) => setSettings(prev => ({ ...prev, invBrands: prev.invBrands.map(b => b.id === updatedBrand.id ? updatedBrand : b) }));
  const deleteBrand = (brandId: string) => {
    if (confirm('Are you sure?')) setSettings(prev => ({ ...prev, invBrands: prev.invBrands.filter(b => b.id !== brandId) }));
  };

  const addModel = (model: Omit<Model, 'id'> & { id?: string }) => setSettings(prev => ({ ...prev, invModels: [...prev.invModels, { ...model, id: model.id || uuidv4() }] }));
  const updateModel = (updatedModel: Model) => setSettings(prev => ({ ...prev, invModels: prev.invModels.map(m => m.id === updatedModel.id ? updatedModel : m) }));
  const deleteModel = (modelId: string) => {
    if (confirm('Are you sure?')) setSettings(prev => ({ ...prev, invModels: prev.invModels.filter(m => m.id !== modelId) }));
  };

  const addInvProduct = (product: Omit<InventoryProduct, 'id'>) => {
    const productWithVariants = {
        ...product,
        variants: product.variants.map(v => ({
            ...v,
            barcode: v.barcode || v.sku || uuidv4().slice(0, 12),
        }))
    };
    const newProduct = { ...productWithVariants, id: uuidv4(), compositeItems: product.compositeItems || [] };
    setSettings(prev => ({ ...prev, invProducts: [...prev.invProducts, newProduct]}));
  };
  const updateInvProduct = (product: InventoryProduct) => {
    setSettings(prev => ({ ...prev, invProducts: prev.invProducts.map(p => p.id === product.id ? product : p)}));
  };
  const deleteInvProduct = (productId: string) => {
    if (confirm('Are you sure? This will delete the product and all its variants.')) {
      setSettings(prev => ({...prev, invProducts: prev.invProducts.filter(p => p.id !== productId)}));
    }
  };

  const addAttribute = (attribute: Omit<Attribute, 'id'>) => setSettings(prev => ({ ...prev, attributes: [...prev.attributes, { ...attribute, id: uuidv4() }] }));
  const updateAttribute = (updatedAttribute: Attribute) => setSettings(prev => ({ ...prev, attributes: prev.attributes.map(a => a.id === updatedAttribute.id ? updatedAttribute : a) }));
  const deleteAttribute = (attributeId: string) => {
      if (confirm('Are you sure? This will also delete all associated values.')) {
          setSettings(prev => ({ ...prev, attributes: prev.attributes.filter(a => a.id !== attributeId), attributeValues: prev.attributeValues.filter(v => v.attributeId !== attributeId) }));
      }
  };

  const addAttributeValue = (value: Omit<AttributeValue, 'id'>) => setSettings(prev => ({ ...prev, attributeValues: [...prev.attributeValues, { ...value, id: uuidv4() }] }));
  const updateAttributeValue = (updatedValue: AttributeValue) => setSettings(prev => ({ ...prev, attributeValues: prev.attributeValues.map(v => v.id === updatedValue.id ? updatedValue : v) }));
  const deleteAttributeValue = (valueId: string) => setSettings(prev => ({ ...prev, attributeValues: prev.attributeValues.filter(v => v.id !== valueId) }));

  // Supplier Management
  const addSupplier = (supplier: Omit<Supplier, 'id'>): Customer => {
      const newSupplier = { ...supplier, id: uuidv4() };
      setSettings(prev => ({ ...prev, suppliers: [...prev.suppliers, newSupplier] }));
      return newSupplier as any; // Cast for compatibility with shared function signature
  }
  const updateSupplier = (updatedSupplier: Supplier) => setSettings(prev => ({ ...prev, suppliers: prev.suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s)}));
  const deleteSupplier = (supplierId: string) => {
    if (confirm('Are you sure?')) {
      setSettings(prev => ({ ...prev, suppliers: prev.suppliers.filter(s => s.id !== supplierId) }));
    }
  };
  
  // Cost Management
  const addExpenseCategory = (category: Omit<ExpenseCategory, 'id'>) => setSettings(prev => ({ ...prev, expenseCategories: [...prev.expenseCategories, { ...category, id: uuidv4() }] }));
  const updateExpenseCategory = (updatedCategory: ExpenseCategory) => setSettings(prev => ({ ...prev, expenseCategories: prev.expenseCategories.map(c => c.id === updatedCategory.id ? updatedCategory : c)}));
  const deleteExpenseCategory = (categoryId: string) => {
    if (confirm('Are you sure?')) {
        setSettings(prev => ({...prev, expenseCategories: prev.expenseCategories.filter(c => c.id !== categoryId) }));
    }
  }
  const addRawMaterial = (material: Omit<RawMaterial, 'id'>) => setSettings(prev => ({ ...prev, rawMaterials: [...prev.rawMaterials, { ...material, id: uuidv4() }] }));
  const updateRawMaterial = (updatedMaterial: RawMaterial) => setSettings(prev => ({ ...prev, rawMaterials: prev.rawMaterials.map(m => m.id === updatedMaterial.id ? updatedMaterial : m)}));
  const deleteRawMaterial = (materialId: string) => {
    if (confirm('Are you sure?')) {
        setSettings(prev => ({...prev, rawMaterials: prev.rawMaterials.filter(m => m.id !== materialId) }));
    }
  }

  const addSupplierBill = (bill: Omit<SupplierBill, 'id' | 'paymentStatus'>) => {
      const paymentStatus = bill.paidAmount >= bill.totalAmount ? 'paid' : (bill.paidAmount > 0 ? 'partially-paid' : 'unpaid');
      const newBill = { ...bill, id: uuidv4(), paymentStatus: paymentStatus };
      setSettings(prev => ({ ...prev, supplierBills: [...prev.supplierBills, newBill]}));
  };

  const addSupplierPayment = (payment: Omit<SupplierPayment, 'id'>) => {
      setSettings(prev => {
        const newSettings = {...prev};
        newSettings.supplierPayments = [...newSettings.supplierPayments, {...payment, id: uuidv4()}];
        
        if (payment.billId) {
            newSettings.supplierBills = newSettings.supplierBills.map(bill => {
                if (bill.id === payment.billId) {
                    const newPaidAmount = (bill.paidAmount || 0) + payment.amount;
                    const newPaymentStatus = newPaidAmount >= bill.totalAmount ? 'paid' : (newPaidAmount > 0 ? 'partially-paid' : 'unpaid');
                    return { ...bill, paidAmount: newPaidAmount, paymentStatus: newPaymentStatus };
                }
                return bill;
            });
        }
        return newSettings;
      });
  };

  const addBulkSupplierPayments = (payments: { supplierId: string, amount: number }[]) => {
      setSettings(prev => {
        const newPayments: SupplierPayment[] = payments.map(p => ({
            id: uuidv4(),
            supplierId: p.supplierId,
            amount: p.amount,
            date: new Date().toISOString(),
            notes: 'Bulk payment from Excel upload.',
        }));
        return {
          ...prev,
          supplierPayments: [...prev.supplierPayments, ...newPayments],
        };
      });
  };
  
  // HR Management
  const addDesignation = (designation: Omit<Designation, 'id'>) => setSettings(prev => ({ ...prev, designations: [...prev.designations, { ...designation, id: uuidv4() }] }));
  const updateDesignation = (updatedDesignation: Designation) => setSettings(prev => ({ ...prev, designations: prev.designations.map(d => d.id === updatedDesignation.id ? updatedDesignation : d) }));
  const deleteDesignation = (designationId: string) => {
      if(confirm('Are you sure?')) {
          setSettings(prev => ({ ...prev, designations: prev.designations.filter(d => d.id !== designationId) }));
      }
  };
  const addEmployee = (employee: Omit<Employee, 'id'>) => setSettings(prev => ({ ...prev, employees: [...prev.employees, { ...employee, id: uuidv4() }] }));
  const updateEmployee = (updatedEmployee: Employee) => setSettings(prev => ({ ...prev, employees: prev.employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e)}));
  const deleteEmployee = (employeeId: string) => {
      if(confirm('Are you sure?')) {
          setSettings(prev => ({ ...prev, employees: prev.employees.filter(e => e.id !== employeeId) }));
      }
  };
  
  // Fixed Asset Management
  const addFixedAsset = (asset: Omit<FixedAsset, 'id'>): FixedAsset => {
      const newAsset = { ...asset, id: uuidv4() };
      setSettings(prev => ({ ...prev, fixedAssets: [...prev.fixedAssets, newAsset] }));
      return newAsset;
  }
  const addAssetLocation = (location: Omit<AssetLocation, 'id'>): AssetLocation => {
    const newLocation = { ...location, id: uuidv4() };
    setSettings(prev => ({ ...prev, assetLocations: [...prev.assetLocations, newLocation] }));
    return newLocation;
  };
  const updateAssetLocation = (updatedLocation: AssetLocation) => setSettings(prev => ({ ...prev, assetLocations: prev.assetLocations.map(l => l.id === updatedLocation.id ? updatedLocation : l)}));
  const deleteAssetLocation = (locationId: string) => {
    if (confirm('Are you sure?')) {
        setSettings(prev => ({...prev, assetLocations: prev.assetLocations.filter(l => l.id !== locationId) }));
    }
  }
  const addAssetCategory = (category: Omit<AssetCategory, 'id'>) => {
    const newCategory = { ...category, id: uuidv4() };
    setSettings(prev => ({ ...prev, assetCategories: [...prev.assetCategories, newCategory]}));
  }
  const updateAssetCategory = (updatedCategory: AssetCategory) => {
      setSettings(prev => ({ ...prev, assetCategories: prev.assetCategories.map(c => c.id === updatedCategory.id ? updatedCategory : c)}));
  }
  const deleteAssetCategory = (categoryId: string) => {
    if (confirm('Are you sure?')) {
        setSettings(prev => ({...prev, assetCategories: prev.assetCategories.filter(c => c.id !== categoryId) }));
    }
  }

  // Address Management
  const addAddressData = (entityType: 'Division' | 'District' | 'Upozilla' | 'Union' | 'Village' | 'WorkingArea', data: any) => {
    const keyMap = {
        'Division': 'divisions',
        'District': 'districts',
        'Upozilla': 'upozillas',
        'Union': 'unions',
        'Village': 'villages',
        'WorkingArea': 'workingAreas',
    };
    const arrayKey = keyMap[entityType];
    setSettings(prev => ({...prev, [arrayKey]: [...prev[arrayKey], data]}));
  }
  const updateAddressData = (entityType: 'Division' | 'District' | 'Upozilla' | 'Union' | 'Village' | 'WorkingArea', data: any) => {
    const keyMap = {
        'Division': 'divisions',
        'District': 'districts',
        'Upozilla': 'upozillas',
        'Union': 'unions',
        'Village': 'villages',
        'WorkingArea': 'workingAreas',
    };
    const arrayKey = keyMap[entityType];
    setSettings(prev => ({...prev, [arrayKey]: prev[arrayKey].map((item: any) => item.id === data.id ? data : item)}));
  }
  const deleteAddressData = (entityType: 'Division' | 'District' | 'Upozilla' | 'Union' | 'Village' | 'WorkingArea', id: string) => {
     if (confirm('Are you sure?')) {
        const keyMap = {
            'Division': 'divisions',
            'District': 'districts',
            'Upozilla': 'upozillas',
            'Union': 'unions',
            'Village': 'villages',
            'WorkingArea': 'workingAreas',
        };
        const arrayKey = keyMap[entityType];
        setSettings(prev => ({...prev, [arrayKey]: prev[arrayKey].filter((item: any) => item.id !== id)}));
     }
  }


  // Microfinance
  const addSamity = (samity: Omit<Samity, 'id' | 'code'>) => {
    setSettings(prev => {
        const branchCode = prev.branches.find(b => b.id === samity.branchId)?.code || 'XX';
        const lastSerial = prev.lastSamitySerials?.[samity.branchId] || 0;
        const newSerial = lastSerial + 1;
        const newCode = `${branchCode}-${String(newSerial).padStart(4, '0')}`;
        const newSamity = { ...samity, id: uuidv4(), code: newCode };

        return { 
          ...prev, 
          samities: [...prev.samities, newSamity],
          lastSamitySerials: {
            ...prev.lastSamitySerials,
            [samity.branchId]: newSerial,
          }
        };
    });
  };
  const updateSamity = (samity: Samity) => setSettings(prev => ({ ...prev, samities: prev.samities.map(s => s.id === samity.id ? samity : s)}));
  const deleteSamity = (samityId: string) => {
    if (confirm('Are you sure? Members in this Samity will no longer be grouped.')) {
        setSettings(prev => ({...prev, samities: prev.samities.filter(s => s.id !== samityId) }));
    }
  };
  const addLoanProduct = (product: Omit<LoanProduct, 'id'>) => setSettings(prev => ({ ...prev, loanProducts: [...prev.loanProducts, { ...product, id: uuidv4() }] }));
  const updateLoanProduct = (product: LoanProduct) => setSettings(prev => ({ ...prev, loanProducts: prev.loanProducts.map(p => p.id === product.id ? product : p)}));
  const deleteLoanProduct = (productId: string) => {
      if (confirm('Are you sure you want to delete this loan product?')) {
        setSettings(prev => ({ ...prev, loanProducts: prev.loanProducts.filter(p => p.id !== productId) }));
      }
  };
  const addSavingsProduct = (product: Omit<SavingsProduct, 'id'>) => setSettings(prev => ({...prev, savingsProducts: [...prev.savingsProducts, { ...product, id: uuidv4() }] }));
  const updateSavingsProduct = (product: SavingsProduct) => setSettings(prev => ({...prev, savingsProducts: prev.savingsProducts.map(p => p.id === product.id ? product : p)}));
  const deleteSavingsProduct = (productId: string) => {
      if (confirm('Are you sure you want to delete this savings product?')) {
        setSettings(prev => ({...prev, savingsProducts: prev.savingsProducts.filter(p => p.id !== productId)}));
      }
  };


  // Accounting
  const addAccountingVoucher = (voucher: Omit<AccountingVoucher, 'id' | 'voucherNumber'>): AccountingVoucher => {
      let newVoucher: AccountingVoucher;
      setSettings(prev => {
        const today = new Date(), yyyy = today.getFullYear(), mm = String(today.getMonth() + 1).padStart(2, '0'), dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        const prefixMap = { Payment: 'PV', Receipt: 'RV', Contra: 'CV', Journal: 'JV' };
        const prefix = prefixMap[voucher.type];

        const lastVoucherState = prev.lastVoucherNumbers[voucher.type] || { date: '', serial: 0 };
        const newSerial = lastVoucherState.date === todayStr ? lastVoucherState.serial + 1 : 1;
        const voucherNumber = `${prefix}-${dd}${mm}${yyyy.toString().slice(-2)}-${String(newSerial).padStart(4, '0')}`;
        
        newVoucher = { ...voucher, id: uuidv4(), voucherNumber };
        
        return {
          ...prev,
          accountingVouchers: [...prev.accountingVouchers, newVoucher],
          lastVoucherNumbers: {
            ...prev.lastVoucherNumbers,
            [voucher.type]: { date: todayStr, serial: newSerial },
          },
        };
      });
      // @ts-ignore
      return newVoucher;
  };

  const deleteAccountingVoucher = (voucherId: string) => {
      if (confirm('Are you sure you want to delete this voucher? This cannot be undone.')) {
        setSettings(prev => ({ ...prev, accountingVouchers: prev.accountingVouchers.filter(v => v.id !== voucherId)}));
      }
  }


  const addAccountType = (type: Omit<AccountType, 'id'>): AccountType => {
    const newType = { ...type, id: uuidv4() };
    setSettings(prev => ({...prev, accountTypes: [...prev.accountTypes, newType]}));
    return newType;
  }
  const updateAccountType = (type: AccountType) => setSettings(prev => ({...prev, accountTypes: prev.accountTypes.map(t => t.id === type.id ? type : t)}));
  const deleteAccountType = (typeId: string) => {
      if (confirm('Are you sure? This may affect existing ledger accounts.')) {
          setSettings(prev => ({...prev, accountTypes: prev.accountTypes.filter(t => t.id !== typeId)}));
      }
  }

  const addAccountGroup = (group: Omit<AccountGroup, 'id'>): AccountGroup => {
    const newGroup = { ...group, id: uuidv4() };
    setSettings(prev => ({...prev, accountGroups: [...prev.accountGroups, newGroup]}));
    return newGroup;
  };
  const updateAccountGroup = (group: AccountGroup) => setSettings(prev => ({...prev, accountGroups: prev.accountGroups.map(g => g.id === group.id ? group : g)}));
  const deleteAccountGroup = (groupId: string) => setSettings(prev => ({...prev, accountGroups: prev.accountGroups.filter(g => g.id !== groupId)}));
  
  const addAccountSubGroup = (subGroup: Omit<AccountSubGroup, 'id'>): AccountSubGroup => {
    const newSubGroup = { ...subGroup, id: uuidv4() };
    setSettings(prev => ({...prev, accountSubGroups: [...prev.accountSubGroups, newSubGroup]}));
    return newSubGroup;
  };
  const updateAccountSubGroup = (subGroup: AccountSubGroup) => setSettings(prev => ({...prev, accountSubGroups: prev.accountSubGroups.map(sg => sg.id === subGroup.id ? subGroup : sg)}));
  const deleteAccountSubGroup = (subGroupId: string) => setSettings(prev => ({...prev, accountSubGroups: prev.accountSubGroups.filter(sg => sg.id !== subGroupId)}));

  const addAccountHead = (head: Omit<AccountHead, 'id'>): AccountHead => {
    const newHead = { ...head, id: uuidv4() };
    setSettings(prev => ({...prev, accountHeads: [...prev.accountHeads, newHead]}));
    return newHead;
  };
  const updateAccountHead = (head: AccountHead) => setSettings(prev => ({...prev, accountHeads: prev.accountHeads.map(h => h.id === head.id ? head : h)}));
  const deleteAccountHead = (headId: string) => setSettings(prev => ({...prev, accountHeads: prev.accountHeads.filter(h => h.id !== headId)}));

  const addAccountSubHead = (subHead: Omit<AccountSubHead, 'id'>): AccountSubHead => {
    const newSubHead = { ...subHead, id: uuidv4() };
    setSettings(prev => ({...prev, accountSubHeads: [...prev.accountSubHeads, newSubHead]}));
    return newSubHead;
  };
  const updateAccountSubHead = (subHead: AccountSubHead) => setSettings(prev => ({...prev, accountSubHeads: prev.accountSubHeads.map(sh => sh.id === subHead.id ? subHead : sh)}));
  const deleteAccountSubHead = (subHeadId: string) => setSettings(prev => ({...prev, accountSubHeads: prev.accountSubHeads.filter(sh => sh.id !== subHeadId)}));

  const addLedgerAccount = (account: Omit<LedgerAccount, 'id'>): LedgerAccount => {
    const newAccount = { ...account, id: uuidv4() };
    setSettings(prev => ({...prev, ledgerAccounts: [...prev.ledgerAccounts, newAccount]}));
    return newAccount;
  };
  const updateLedgerAccount = (account: LedgerAccount) => setSettings(prev => ({...prev, ledgerAccounts: prev.ledgerAccounts.map(l => l.id === account.id ? account : l)}));
  const deleteLedgerAccount = (accountId: string) => setSettings(prev => ({...prev, ledgerAccounts: prev.ledgerAccounts.filter(l => l.id !== accountId)}));

  const clearChartOfAccounts = () => {
    setSettings(prev => ({
      ...prev,
      accountGroups: [],
      accountSubGroups: [],
      accountHeads: [],
      accountSubHeads: [],
      ledgerAccounts: [],
    }));
  };
  
  const updateAllLedgerOpeningBalances = (balances: Record<string, number>) => {
    setSettings(prev => ({
      ...prev,
      ledgerAccounts: prev.ledgerAccounts.map(ledger => ({
        ...ledger,
        openingBalance: balances[ledger.id] || 0,
      }))
    }));
  };


  const contextValue = {
    settings, isLoaded, setOrganizationInfo, setModuleSettings, setTheme, setPosSettings, setServiceJobSettings, setChallanSettings, setAccountingSettings, setMicrofinanceSettings, addBranch, updateBranch, deleteBranch, addFloor, updateFloor, deleteFloor, addTable, updateTable, deleteTable, addReservation, deleteReservation, addMenuCategory, updateMenuCategory, deleteMenuCategory, addMenuItem, updateMenuItem, deleteMenuItem, addOrder, updateOrder, deleteOrder, addCustomer, updateCustomer, deleteCustomer, addCustomerGroup, updateCustomerGroup, deleteCustomerGroup, addVoucher, updateVoucher, deleteVoucher, addCollection, addServiceJob, updateServiceJob, addServiceIssue, updateServiceIssue, deleteServiceIssue, addServiceType, updateServiceType, deleteServiceType, addServiceItemCategory, updateServiceItemCategory, deleteServiceItemCategory, addServiceItem, updateServiceItem, deleteServiceItem, addProductCategory, updateProductCategory, deleteProductCategory, addProduct, updateProduct, deleteProduct, addChallan,
    addInvProductCategory, updateInvProductCategory, deleteInvProductCategory, addBrand, updateBrand, deleteBrand, addModel, updateModel, deleteModel,
    addInvProduct, updateInvProduct, deleteInvProduct,
    addAttribute, updateAttribute, deleteAttribute,
    addAttributeValue, updateAttributeValue, deleteAttributeValue,
    addSupplier, updateSupplier, deleteSupplier,
    addExpenseCategory, updateExpenseCategory, deleteExpenseCategory, addRawMaterial, updateRawMaterial, deleteRawMaterial, addSupplierBill, addSupplierPayment, addBulkSupplierPayments,
    addDesignation, updateDesignation, deleteDesignation, addEmployee, updateEmployee, deleteEmployee,
    addFixedAsset, addAssetLocation, updateAssetLocation, deleteAssetLocation,
    addAssetCategory, updateAssetCategory, deleteAssetCategory,
    addAddressData, updateAddressData, deleteAddressData,
    addSamity, updateSamity, deleteSamity,
    addLoanProduct, updateLoanProduct, deleteLoanProduct,
    addSavingsProduct, updateSavingsProduct, deleteSavingsProduct,
    addSavingsAccount,
    addAccountingVoucher, deleteAccountingVoucher,
    addAccountType, updateAccountType, deleteAccountType,
    addAccountGroup, updateAccountGroup, deleteAccountGroup, addAccountSubGroup, updateAccountSubGroup, deleteAccountSubGroup, addAccountHead, updateAccountHead, deleteAccountHead, addAccountSubHead, updateAccountSubHead, deleteAccountSubHead, addLedgerAccount, updateLedgerAccount, deleteLedgerAccount,
    clearChartOfAccounts,
    updateAllLedgerOpeningBalances,
  };

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = React.useContext(SettingsContext);
  if (context === undefined) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
