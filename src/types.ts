export type Role = 'admin' | 'productManager' | 'orderManager' | 'customer';

export interface UserProfile {
  uid: string;
  email: string;
  role: Role;
  displayName?: string;
  balance: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  category: string;
  platform: string;
  imageUrl: string;
  rating: number;
  featured: boolean;
  releaseDate?: string;
  developer?: string;
  languages?: string[];
  requirements?: {
    os?: string;
    processor?: string;
    memory?: string;
    graphics?: string;
    storage?: string;
  };
  costPrice?: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled' | 'on_hold';
  paymentMethod: 'wallet';
  deliveryInfo?: string;
  keys?: string[];
  createdAt: any; // Firestore Timestamp
  customerEmail: string;
  customerName: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any; // Firestore Timestamp
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
