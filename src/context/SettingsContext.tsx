
'use client';

import type { AppSettings, OrganizationInfo, ModuleSettings, MenuCategory, MenuItem, Order, Table, Customer, Voucher, Collection, CustomerGroup, PosSettings, ServiceIssue, ServiceType, ServiceItem, ServiceItemCategory, ServiceJob, ServiceJobSettings, ProductCategory, Product, InventoryItem, Challan, ChallanItem, ChallanSettings, Brand, Model, Supplier, InventoryProduct, Floor, Reservation, ExpenseCategory, SupplierBill, SupplierPayment, Attribute, AttributeValue, Theme } from '@/types';
import React, from 'react';
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
    hrManagement: false,
    userAccessControl: true,
  },
  posSettings: {
    advancedItemOptions: true,
    showItemsByCategory: true,
    showPrintWithKitchenButton: true,
    maxDiscountAmount: 0,
    maxDiscountPercentage: 0,
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
  floors: [],
  tables: [],
  reservations: [],
  menuCategories: [],
  menuItems: [],
  orders: [],
  customers: [],
  customerGroups: [],
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
  suppliers: [],
  expenseCategories: [],
  supplierBills: [],
  supplierPayments: [],
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
  }
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
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  // Customer Group
  addCustomerGroup: (group: Omit<CustomerGroup, 'id'>) => void;
  updateCustomerGroup: (group: CustomerGroup) => void;
  deleteCustomerGroup: (groupId: string) => void;
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
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (supplierId: string) => void;
  // Cost Management
  addExpenseCategory: (category: Omit<ExpenseCategory, 'id'>) => void;
  updateExpenseCategory: (category: ExpenseCategory) => void;
  deleteExpenseCategory: (categoryId: string) => void;
  addSupplierBill: (bill: Omit<SupplierBill, 'id' | 'paymentStatus'>) => void;
  addSupplierPayment: (payment: Omit<SupplierPayment, 'id'>) => void;
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
      const mergedSettings = {
        ...defaultSettings,
        ...storedSettings,
        organization: { ...defaultSettings.organization, ...storedSettings.organization },
        theme: storedSettings.theme || defaultSettings.theme,
        modules: { ...defaultSettings.modules, ...storedSettings.modules },
        posSettings: { ...defaultSettings.posSettings, ...storedSettings.posSettings },
        serviceJobSettings: { ...defaultSettings.serviceJobSettings, ...storedSettings.serviceJobSettings },
        challanSettings: { ...defaultSettings.challanSettings, ...storedSettings.challanSettings },
        floors: storedSettings.floors || defaultSettings.floors,
        tables: storedSettings.tables || defaultSettings.tables,
        reservations: storedSettings.reservations || defaultSettings.reservations,
        menuCategories: storedSettings.menuCategories || defaultSettings.menuCategories,
        menuItems: (storedSettings.menuItems || []).map((item: any) => ({ ...item, variants: item.variants || [], addOns: item.addOns || [] })),
        orders: storedSettings.orders || defaultSettings.orders,
        customers: storedSettings.customers || defaultSettings.customers,
        customerGroups: storedSettings.customerGroups || defaultSettings.customerGroups,
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
        supplierBills: storedSettings.supplierBills || defaultSettings.supplierBills,
        supplierPayments: storedSettings.supplierPayments || defaultSettings.supplierPayments,
        lastOrderNumberForDate: storedSettings.lastOrderNumberForDate || defaultSettings.lastOrderNumberForDate,
        lastServiceJobNumberForDate: storedSettings.lastServiceJobNumberForDate || defaultSettings.lastServiceJobNumberForDate,
        lastChallanNumberForDate: storedSettings.lastChallanNumberForDate || defaultSettings.lastChallanNumberForDate,
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

  // Customer Management
  const addCustomer = (customer: Omit<Customer, 'id'>): Customer => {
    const newCustomer = { ...customer, id: uuidv4() };
    setSettings(prev => ({ ...prev, customers: [...prev.customers, newCustomer] }));
    return newCustomer;
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
    setSettings(prev => ({ ...prev, collections: [...prev.collections, newCollection] }));
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
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => setSettings(prev => ({ ...prev, suppliers: [...prev.suppliers, { ...supplier, id: uuidv4() }] }));
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
  const addSupplierBill = (bill: Omit<SupplierBill, 'id' | 'paymentStatus'>) => {
      const newBill = { ...bill, id: uuidv4(), paymentStatus: 'unpaid' as const };
      setSettings(prev => ({ ...prev, supplierBills: [...prev.supplierBills, newBill]}));
  };
  const addSupplierPayment = (payment: Omit<SupplierPayment, 'id'>) => {
      setSettings(prev => ({ ...prev, supplierPayments: [...prev.supplierPayments, {...payment, id: uuidv4()}] }));
      // Here you would add logic to update the paymentStatus of related bills
  };


  const contextValue = {
    settings, isLoaded, setOrganizationInfo, setModuleSettings, setTheme, setPosSettings, setServiceJobSettings, setChallanSettings, addFloor, updateFloor, deleteFloor, addTable, updateTable, deleteTable, addReservation, deleteReservation, addMenuCategory, updateMenuCategory, deleteMenuCategory, addMenuItem, updateMenuItem, deleteMenuItem, addOrder, updateOrder, deleteOrder, addCustomer, updateCustomer, deleteCustomer, addCustomerGroup, updateCustomerGroup, deleteCustomerGroup, addVoucher, updateVoucher, deleteVoucher, addCollection, addServiceJob, updateServiceJob, addServiceIssue, updateServiceIssue, deleteServiceIssue, addServiceType, updateServiceType, deleteServiceType, addServiceItemCategory, updateServiceItemCategory, deleteServiceItemCategory, addServiceItem, updateServiceItem, deleteServiceItem, addProductCategory, updateProductCategory, deleteProductCategory, addProduct, updateProduct, deleteProduct, addChallan,
    addInvProductCategory, updateInvProductCategory, deleteInvProductCategory, addBrand, updateBrand, deleteBrand, addModel, updateModel, deleteModel,
    addInvProduct, updateInvProduct, deleteInvProduct,
    addAttribute, updateAttribute, deleteAttribute,
    addAttributeValue, updateAttributeValue, deleteAttributeValue,
    addSupplier, updateSupplier, deleteSupplier,
    addExpenseCategory, updateExpenseCategory, deleteExpenseCategory, addSupplierBill, addSupplierPayment,
  };

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = React.useContext(SettingsContext);
  if (context === undefined) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
