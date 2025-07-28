










export type Theme = 'slate' | 'stone';

export interface Branch {
  id: string;
  name: string;
  code: string;
  startDate: string; // ISO Date
}

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
  microfinance: boolean;
  fixedAssetManagement: boolean;
  addressManagement: boolean;
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

export interface AccountingSettings {
  fiscalYear: string;
  fiscalYearStartDate: string; // ISO date
  openingDate: string; // ISO date
  cashLedgerIds?: string[];
  bankLedgerIds?: string[];
  voucherApprovalLevels?: {
    preparedBy?: string; // Designation ID
    reviewedBy?: string; // Designation ID
    approvedBy?: string; // Designation ID
  }
}

export interface MemberMandatoryFields {
    dob?: boolean;
    fatherName?: boolean;
    motherName?: boolean;
    spouseName?: boolean;
    nidOrBirthCert?: boolean;
    presentAddress?: boolean;
    permanentAddress?: boolean;
}

export interface MicrofinanceSettings {
  samityTerm: 'Samity' | 'Group' | 'Center';
  primarySavingsProductId?: string;
  memberMandatoryFields?: MemberMandatoryFields;
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

export interface Samity {
  id: string;
  name: string;
  code: string;
  branchId: string;
  workingAreaId: string;
  fieldOfficerId: string; // Employee ID
  meetingDay: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  openingDate: string; // ISO Date string
  maxMembers: number;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string; // Legacy/general address
  center?: string;
  groupId?: string;
  // Microfinance specific fields
  code?: string; // Auto-generated member code
  samityId?: string; 
  dob?: string; // date of birth
  admissionDate?: string;
  fatherName?: string;
  spouseName?: string;
  spouseRelation?: string;
  motherName?: string;
  presentAddress?: string;
  permanentAddress?: string;
  nidOrBirthCert?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  photo?: string; // URL
  nidPhoto?: string; // URL
  guarantorPhoto?: string; // URL
  guarantorNidPhoto?: string; // URL
  // Discount fields
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
  branchId?: string;
  joiningDate: string; // ISO Date string
  salary: number;
}

// Accounting
export type VoucherType = 'Payment' | 'Receipt' | 'Contra' | 'Journal';

export interface VoucherTransaction {
    id: string;
    ledgerId: string;
    isDebit: boolean;
    amount: number;
    narration?: string;
}

export interface AccountingVoucher {
    id: string;
    voucherNumber: string;
    date: string; // ISO date string
    type: VoucherType;
    narration?: string;
    transactions: VoucherTransaction[];
}

export interface AccountType {
  id: string;
  name: string; // e.g., Asset, Liability, Income, Expense
  code: string; // e.g., AS, LB, IN, EX
}

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
  accountTypeId: string;
  code?: string;
  openingBalance?: number;
}

// Fixed Asset Management
export type DepreciationMethod = 'Straight-Line' | 'Reducing Balance';

export interface AssetCategory {
    id: string;
    name: string;
}

export interface AssetLocation {
    id: string;
    name: string;
}

export interface FixedAsset {
    id: string;
    name: string;
    purchaseDate: string; // ISO Date
    purchasePrice: number;
    depreciationMethod: DepreciationMethod;
    usefulLife: number; // in years
    salvageValue: number;
    locationId?: string;
    employeeId?: string;
}

// Address Management
export interface Division {
    id: string;
    name: string;
}
export interface District {
    id: string;
    name: string;
    parentId: string; // Division ID
}
export interface Upozilla {
    id: string;
    name: string;
    parentId: string; // District ID
}
export interface Union {
    id: string;
    name: string;
    parentId: string; // Upozilla ID
}
export interface Village {
    id: string;
    name: string;
    parentId: string; // Union ID
}
export interface WorkingArea {
    id: string;
    name: string;
    parentId: string; // Village ID
}

// Microfinance
export type FeeType = 'percentage' | 'fixed';
export type InterestCalculationMethod = 'flat' | 'reducing-balance';
export type RepaymentFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'one-time';

export interface Fee {
  type: FeeType;
  value: number;
}

export interface CashCollateral {
  type: FeeType;
  value: number;
  isChangeable: boolean;
}

export interface RepaymentSchedule {
  frequency: RepaymentFrequency;
  installments: number[]; // e.g., [110, 220, 330]
  gracePeriodDays: number;
  interestRateIndex?: { [installment: number]: number };
}

export interface LoanProduct {
    id: string;
    name: string;
    shortName: string;
    code: string;
    minAmount: number;
    maxAmount: number;
    defaultAmount: number;
    insurance: Fee;
    processingFee: Fee;
    formFee: Fee;
    applicationFee: Fee;
    additionalFee: Fee;
    otherFee: Fee;
    cashCollateral: CashCollateral;
    repaymentSchedules: Partial<Record<RepaymentFrequency, RepaymentSchedule>>;
    interestRate: number;
    interestCalculationMethod: InterestCalculationMethod;
}

export interface SavingsProductType {
    id: string;
    name: string;
    code: string;
}

export type SavingsInterestFrequency = 'daily' | 'weekly' | 'monthly' | 'half-yearly' | 'yearly';
export type DpsPaymentFrequency = 'daily' | 'weekly' | 'monthly';
export type SavingsInterestCalculationMethod = 'opening-closing-average' | 'closing-balance';
export type OtsPayoutFrequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
export type OtsProvisionType = 'end_of_month' | 'on_opening_anniversary';
export type MaturityPayoutMethod = 'cash' | 'transfer_to_savings';

export interface FdrPayoutRule {
    id: string;
    durationInYears: number;
    totalInterestRate: number; // For the entire duration
}

export interface SavingsProduct {
    id: string;
    name: string;
    shortName: string;
    code: string;
    savingsProductTypeId: string;
    interestRate: number;
    
    // General Settings
    lienAllowed: boolean;
    collateralAllowed: boolean;
    
    // Regular Savings fields
    depositFrequency?: DpsPaymentFrequency;
    isProvisionApplicable?: boolean;
    interestProvisionFrequency?: SavingsInterestFrequency;
    interestDisbursementFrequency?: SavingsInterestFrequency;
    provisionGracePeriodDays?: number;
    minBalance?: number;
    maxBalance?: number;
    closingCharge?: number;
    interestCalculationMethod?: SavingsInterestCalculationMethod;
    canWithdrawInterest?: boolean;
    isInterestEditableOnDisbursement?: boolean;

    // DPS fields
    dps_paymentFrequency?: DpsPaymentFrequency;
    dps_durationsInYears?: number[];
    dps_isProvisionApplicable?: boolean;
    dps_provisionFrequency?: SavingsInterestFrequency;
    dps_prematureWithdrawalInterestRate?: number;
    dps_lateFeeType?: 'extend_duration' | 'interest_penalty';
    dps_isInterestEditableOnDisbursement?: boolean;
    dps_maturityPayout?: MaturityPayoutMethod;
    dps_closingCharge?: number;
    // OTS fields
    ots_interestPayoutFrequency?: OtsPayoutFrequency;
    ots_provisionType?: OtsProvisionType;
    ots_interestCalculationMethod?: 'daily_balance';
    ots_interestDisbursementMethod?: MaturityPayoutMethod;
    // FDR fields
    fdr_payoutRules?: FdrPayoutRule[];
    fdr_maturityPayout?: MaturityPayoutMethod;
    fdr_prematureWithdrawalInterestRate?: number;
}

export interface SavingsAccount {
    id: string;
    memberId: string;
    savingsProductId: string;
    accountNumber: string;
    openingDate: string; // ISO Date
    balance: number;
    status: 'active' | 'dormant' | 'closed';
}

export interface AppSettings {
  organization: OrganizationInfo;
  theme: Theme;
  modules: ModuleSettings;
  posSettings: PosSettings;
  serviceJobSettings: ServiceJobSettings;
  challanSettings: ChallanSettings;
  accountingSettings: AccountingSettings;
  microfinanceSettings: MicrofinanceSettings;
  branches: Branch[];
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
  samities: Samity[];
  loanProducts: LoanProduct[];
  savingsProductTypes: SavingsProductType[];
  savingsProducts: SavingsProduct[];
  savingsAccounts: SavingsAccount[];
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
  // Fixed Asset Management
  fixedAssets: FixedAsset[];
  assetLocations: AssetLocation[];
  assetCategories: AssetCategory[];
  // Address Management
  divisions: Division[];
  districts: District[];
  upozillas: Upozilla[];
  unions: Union[];
  villages: Village[];
  workingAreas: WorkingArea[];
  // Accounting
  accountTypes: AccountType[];
  accountGroups: AccountGroup[];
  accountSubGroups: AccountSubGroup[];
  accountHeads: AccountHead[];
  accountSubHeads: AccountSubHead[];
  ledgerAccounts: LedgerAccount[];
  accountingVouchers: AccountingVoucher[];
  
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
  };
  lastVoucherNumbers: {
      [key in VoucherType]?: {
          date: string; // YYYY-MM-DD
          serial: number;
      }
  };
  lastSamitySerials: {
    [branchId: string]: number;
  };
  lastMemberSerials: {
      [samityId: string]: number;
  };
  lastSavingsAccountSerials: {
      [productId: string]: number;
  };
}
