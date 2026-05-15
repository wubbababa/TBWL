import { 
  Home, 
  Settings, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  DollarSign, 
  Archive, 
  Layers, 
  Wallet, 
  LogOut,
  MapPin,
  ClipboardList,
  CreditCard,
  FileText,
  UserPlus,
  type LucideIcon
} from 'lucide-react';

type SubmenuItem = {
  label: string;
  path: string;
};

export type MenuItem = {
  icon: LucideIcon;
  label: string;
  path: string;
  active?: boolean;
  hasSubmenu?: boolean;
  submenu?: SubmenuItem[];
  isOpen?: boolean;
};

export const MENU_ITEMS: MenuItem[] = [
  { icon: Home, label: '首页', path: '/home', active: true },
  { icon: Settings, label: '系统管理', path: '/system', hasSubmenu: true,
    submenu: [
      { label: '账号管理', path: '/system/users' },
    ]
  },
  { icon: Package, label: '未关联包裹', path: '/unassociated' },
  { icon: ShoppingCart, label: '订单管理', path: '/orders' },
  { icon: AlertTriangle, label: '异常包裹', path: '/abnormal' },
  { icon: DollarSign, label: '订单利润', path: '/profit' },
  { 
    icon: Archive, 
    label: '库存管理', 
    path: '/inventory', 
    hasSubmenu: true,
    submenu: [
      { label: '库存商品', path: '/inventory/products' },
      { label: '申请入库', path: '/inventory/apply' },
      { label: '库存调用记录', path: '/inventory/records' },
      { label: '商品库', path: '/inventory/database' },
    ]
  },
  { 
    icon: MapPin, 
    label: '台湾仓储', 
    path: '/taiwan', 
    hasSubmenu: true,
    submenu: [
      { label: '台湾库存商品', path: '/taiwan/products' },
      { label: '台湾申请入库', path: '/taiwan/apply' },
      { label: '台湾库存调用记录', path: '/taiwan/records' },
      { label: '台湾商品库', path: '/taiwan/database' },
    ]
  },
  { 
    icon: Layers, 
    label: '其他管理', 
    path: '/other', 
    hasSubmenu: true,
    submenu: [
      { label: '退件包裹', path: '/other/returns' },
      { label: '退件登记', path: '/other/return-register' },
      { label: '包裹认领', path: '/other/parcel-claim' },
      { label: '索赔登记', path: '/other/claims' },
    ]
  },
  { 
    icon: Wallet, 
    label: '资金管理', 
    path: '/funds', 
    hasSubmenu: true,
    submenu: [
      { label: '消费明细', path: '/funds/expense' },
      { label: '物流明细', path: '/funds/shipping' },
      { label: '账户充值', path: '/funds/recharge' },
      { label: '扫码登记', path: '/funds/scan-register' },
    ]
  },
  { icon: LogOut, label: '安全退出', path: '/logout' },
];
