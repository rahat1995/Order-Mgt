



export type Theme = 'slate' | 'stone';

export interface Floor {
  id: string;
  name: string;
}

export interface Table {
  id: string;
  name: string;
  floorId: string;
  shape: 'rectangle' | 'round';
  x: number; // grid position
  y: number; // grid position
  itemType: 'table' | 'landmark';
  icon?: 'Landmark' | 'Utensils' | 'Square';
}

export interface Reservation {
    id: string;
    tableId: string;
    customerId: string;
    dateTime: string; // ISO string
    partySize: number;
}

export interface OrganizationInfo {
  name: string;
  address: string;
  mobile: string;
  email: string;
  logo: string;
  contactPerson: string;
  receiptFooter?: string;
}

export interface ModuleSettings {
  pos: boolean;
  dueSell: boolean;
  serviceJob: boolean;
  dueReport: boolean;
  challanAndBilling: boolean;
  inventory: boolean;
  tableManagement: boolean;
  costManagement: boolean;
  accounting: boolean;
  hrManagement: boolean;
  userAccessControl: boolean;
  salesReport: boolean;
  customerManagement: boolean;
  customerLedger: boolean;
  productManagement: boolean;
  pendingBillReport: boolean;
}

export interface PosSettings {
  advancedItemOptions: boolean;
  showItemsByCategory: boolean;
  showPrintWithKitchenButton: boolean;
  maxDiscountPercentage: number;
  maxDiscountAmount: number;
  enableOrderTypes: boolean;
  allowQuantityEdit: boolean;
  allowPriceEdit: boolean;
}

export interface ServiceJobSettings {
  termsAndConditions: string;
}

export interface ChallanSettings {
    printWithOfficeCopy: boolean;
    printOfficeCopyWithPrice: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  code?: string;
  parentId?: string;
}

export interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemAddOn {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name:string;
  description: string;
  price: number; // Base Price
  categoryId: string;
  image: string;
  variants: MenuItemVariant[];
  addOns: MenuItemAddOn[];
}

export interface OrderItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  variant?: MenuItemVariant;
  addons?: MenuItemAddOn[];
  subtotal: number;
  serialNumber?: string;
}

export interface CustomerGroup {
  id: string;
  name: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  center?: string;
  groupId?: string;
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
  discountValidity?: string; // ISO Date string
}

export interface Voucher {
  id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  isActive: boolean;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  startDate?: string; // ISO Date string
  endDate?: string; // ISO Date string
}

export interface Collection {
  id: string;
  customerId: string;
  amount: number;
  date: string; // ISO Date string
  notes?: string;
}

export interface Order {
    id:string;
    orderNumber: string;
    items: OrderItem[];
    customerId?: string;
    customerName: string;
    customerMobile?: string;
    status: 'pending' | 'completed' | 'cancelled';
    paymentStatus: 'pending' | 'paid';
    orderType: 'dine-in' | 'takeaway' | 'delivery';
    subtotal: number;
    voucherCode?: string;
    discountAmount: number;
    discountType?: 'loyal' | 'manual' | 'voucher';
    total: number;
    amountTendered?: number;
    changeDue?: number;
    createdAt: string;
    serviceJobId?: string;
    challanId?: string;
}

export interface ServiceIssue {
  id: string;
  name: string;
}

export interface ServiceType {
  id: string;
  name: string;
}

export interface ServiceItemCategory {
  id: string;
  name: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
}

export interface ServiceJobStatusHistory {
  status: ServiceJob['status'];
  timestamp: string; // ISO Date string
}

export interface ServiceJob {
  id: string;
  jobNumber: string;
  customerId: string;
  deviceName: string;
  deviceModel: string;
  issueTypeId: string;
  serviceTypeId: string;
  issueDetails: string;
  status: 'Received' | 'Diagnosing' | 'Waiting for Approval' | 'Repairing' | 'Parts Needed' | 'Testing' | 'Ready for Delivery' | 'Delivered' | 'Cancelled';
  createdAt: string;
  orderId?: string;
  statusHistory?: ServiceJobStatusHistory[];
}

export interface ProductCategory {
  id: string;
  name: string;
  code?: string;
  parentId?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
  price: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  serialNumber: string;
  status: 'in-stock' | 'allocated-to-challan' | 'sold';
  challanId?: string;
  orderId?: string;
}

export interface ChallanItem {
  inventoryItemId: string;
  productId: string;
  name: string;
  serialNumber: string;
  price: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  createdAt: string; // ISO Date
  items: ChallanItem[];
  status: 'pending' | 'partially-billed' | 'fully-billed' | 'cancelled';
  deliveryLocation: string;
}

export interface Brand {
    id: string;
    name: string;
}

export interface Model {
    id: string;
    name: string;
    brandId: string;
}

export interface Supplier {
    id: string;
    name: string;
    contactPerson?: string;
    mobile: string;
    email?: string;
    address?: string;
}

export interface ExpenseCategory {
    id: string;
    name: string;
}

export interface RawMaterial {
    id: string;
    name: string;
    unit: string; // e.g., Kg, Pcs, Litre
    categoryId?: string;
}

export interface BillItem {
    id: string;
    rawMaterialId: string;
    name: string;
    unit: string;
    quantity: number;
    cost: number;
}

export interface SupplierBill {
    id: string;
    supplierId: string;
    items: BillItem[];
    totalAmount: number;
    paidAmount: number;
    date: string; // ISO Date string
    billNumber?: string;
    notes?: string;
    paymentStatus: 'unpaid' | 'partially-paid' | 'paid';
}

export interface SupplierPayment {
    id: string;
    supplierId: string;
    amount: number;
    date: string; // ISO Date string
    notes?: string;
    billId?: string; // Can be linked to a specific bill
}

export interface Attribute {
    id: string;
    name: string;
}

export interface AttributeValue {
    id: string;
    attributeId: string;
    value: string;
}

// INVENTORY PRODUCT TYPES
export type ProductType = 'standard' | 'variant' | 'composite';

export interface InventoryProductVariant {
    id: string;
    name: string; // e.g., "Red - Large"
    sku: string; // Unique SKU for this variant
    barcode: string;
    price: number;
    stock: number;
}

export interface CompositeItem {
    productId: string; // The ID of an InventoryProduct
    variantId: string; // The ID of a variant within that product
    quantity: number;
}

export interface InventoryProduct {
    id: string;
    name: string;
    type: ProductType;
    categoryId: string;
    brandId?: string;
    modelId?: string;
    unit?: string; // e.g., Pcs, Kg
    variants: InventoryProductVariant[];
    compositeItems?: CompositeItem[];
}

// HR Management
export interface Designation {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  mobile: string;
  username: string;
  password: string;
  email?: string;
  address?: string;
  designationId: string;
  joiningDate: string; // ISO Date string
  salary: number;
}

// Accounting
export interface AccountGroup {
  id: string;
  name: string;
  parentId?: undefined; // Groups are top-level
}

export interface AccountSubGroup {
  id: string;
  name: string;
  groupId: string;
}

export interface AccountHead {
  id: string;
  name: string;
  subGroupId: string;
}

export interface AccountSubHead {
  id: string;
  name: string;
  headId: string;
}

export interface LedgerAccount {
  id: string;
  name: string;
  subHeadId: string;
  code?: string;
  openingBalance?: number;
}


export interface AppSettings {
  organization: OrganizationInfo;
  theme: Theme;
  modules: ModuleSettings;
  posSettings: PosSettings;
  serviceJobSettings: ServiceJobSettings;
  challanSettings: ChallanSettings;
  floors: Floor[];
  tables: Table[];
  reservations: Reservation[];
  menuCategories: MenuCategory[];
  menuItems: MenuItem[];
  orders: Order[];
  customers: Customer[];
  customerGroups: CustomerGroup[];
  vouchers: Voucher[];
  collections: Collection[];
  serviceIssues: ServiceIssue[];
  serviceTypes: ServiceType[];
  serviceItemCategories: ServiceItemCategory[];
  serviceItems: ServiceItem[];
  serviceJobs: ServiceJob[];
  // Simple Product management for challan
  productCategories: ProductCategory[];
  products: Product[];
  inventoryItems: InventoryItem[];
  challans: Challan[];
  // Full Inventory Management
  invProductCategories: ProductCategory[];
  invProducts: InventoryProduct[];
  invBrands: Brand[];
  invModels: Model[];
  attributes: Attribute[];
  attributeValues: AttributeValue[];
  // Cost Management
  suppliers: Supplier[];
  expenseCategories: ExpenseCategory[];
  rawMaterials: RawMaterial[];
  supplierBills: SupplierBill[];
  supplierPayments: SupplierPayment[];
  // HR Management
  designations: Designation[];
  employees: Employee[];
  // Accounting
  accountGroups: AccountGroup[];
  accountSubGroups: AccountSubGroup[];
  accountHeads: AccountHead[];
  accountSubHeads: AccountSubHead[];
  ledgerAccounts: LedgerAccount[];
  
  lastOrderNumberForDate: {
    date: string; // YYYY-MM-DD
    serial: number;
  };
  lastServiceJobNumberForDate: {
    date: string;
    serial: number;
  };
  lastChallanNumberForDate: {
      date: string;
      serial: number;
  }
}
