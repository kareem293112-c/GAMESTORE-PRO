import express from 'express';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'node:fs';
import helmet from 'helmet';
import cors from 'cors';

dotenv.config();

// مسار التشغيل الجذري الآمن المتوافق مع جميع البيئات وRender
const currentDir = process.cwd();

// تحميل إعدادات Firebase Admin بأمان
let firebaseConfig: any = {};
try {
  const configPath = path.join(currentDir, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } else {
    console.warn('Firebase config file not found. Using environment variables.');
    firebaseConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID
    };
  }
} catch (error) {
  console.error('Error loading firebase config:', error);
}

let adminApp: admin.app.App | undefined;
let db_admin: any;

function getDbAdmin() {
  if (db_admin) return db_admin;
  if (firebaseConfig.projectId) {
    try {
      if (admin.apps.length === 0) {
        adminApp = admin.initializeApp({
          projectId: firebaseConfig.projectId,
        });
      } else {
        adminApp = admin.apps[0] || undefined;
      }
      db_admin = firebaseConfig.firestoreDatabaseId 
        ? getFirestore(adminApp, firebaseConfig.firestoreDatabaseId)
        : getFirestore(adminApp);
      return db_admin;
    } catch (error) {
      console.error('Firebase Admin init error:', error);
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // 1. الإعدادات الأمنية الصارمة لحماية المتجر وبوابات الدفع
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "google.com", "https://*.firebaseapp.com"],
        "connect-src": ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com", "wss://*.firebaseio.com", "https://*.google-analytics.com"],
        "img-src": ["'self'", "data:", "https://*.googleusercontent.com", "githubusercontent.com", "https://github.com"],
        "frame-src": ["'self'", "https://*.firebaseapp.com"],
      },
    }
  }));

  // حظر وإخفاء هوية برمجية الخادم (إخفاء أثر الـ AI والـ Express)
  app.disable('x-powered-by');

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ==========================================
  // البرمجيات الوسيطة (Middlewares)
  // ==========================================

  // التحقق من توكن المستخدم (Authentication)
  const verifyToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // التحقق من صلاحيات الإدارة (Admin Roles)
  const verifyAdmin = async (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const userData = userDoc.data();
      const isSuperAdmin = userData?.isAdmin || req.user.email === 'karmo2931@gmail.com';
      
      if (isSuperAdmin || userData?.isProductManager || userData?.isOrderManager) {
        req.adminRole = {
          isAdmin: isSuperAdmin,
          isProductManager: isSuperAdmin || userData?.isProductManager,
          isOrderManager: isSuperAdmin || userData?.isOrderManager
        };
        next();
      } else {
        res.status(403).json({ error: 'Not authorized' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Auth check failed' });
    }
  };

  // ==========================================
  // مسارات واجهة المستخدم (Customer APIs)
  // ==========================================

  // جلب المنتجات المتاحة
  app.get('/api/products', async (req, res) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Database context lost' });
    try {
      const snapshot = await db.collection('products').get();
      const products = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  // جلب طلبات المستخدم الحالي
  app.get('/api/me/orders', verifyToken, async (req: any, res: any) => {
    const db = getDbAdmin();
    try {
      const snapshot = await db.collection('orders')
        .where('userId', '==', req.user.uid)
        .get();
      const orders = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // فحص حالة شراء المنتج لمنح التقييم
  app.get('/api/me/purchases/:productId', verifyToken, async (req: any, res: any) => {
    const db = getDbAdmin();
    try {
      const snapshot = await db.collection('orders')
        .where('userId', '==', req.user.uid)
        .where('status', '==', 'completed')
        .get();
      const hasPurchased = snapshot.docs.some((doc: any) => 
        doc.data().items?.some((item: any) => item.id === req.params.productId)
      );
      res.json({ hasPurchased });
    } catch (error) {
      res.status(500).json({ error: 'Verification failed' });
    }
  });

  // إتمام عملية الشراء الآمنة (الخصم والمخزون في لحظة واحدة لمنع الاحتيال)
  app.post('/api/orders', verifyToken, async (req: any, res: any) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase offline' });

    try {
      const { items, total, customerEmail, customerName } = req.body;
      const userId = req.user.uid;
      const orderId = `ORD-${Date.now()}`;

      await db.runTransaction(async (transaction: any) => {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) throw new Error('User account not found');
        
        const balance = userDoc.data().balance || 0;
        if (balance < total) throw new Error('insufficient_balance');

        const productChecks = await Promise.all(items.map(async (item: any) => {
          const productRef = db.collection('products').doc(item.productId);
          const productDoc = await transaction.get(productRef);
          return { ref: productRef, doc: productDoc, item };
        }));

        for (const { doc, item } of productChecks) {
          if (!doc.exists) throw new Error('Product unlisted');
          if (doc.data().stock < item.quantity) throw new Error('out_of_stock');
        }

        // خصم الرصيد
        transaction.update(userRef, {
          balance: balance - total,
          updatedAt: FieldValue.serverTimestamp()
        });

        // تحديث المخزون
        for (const { ref, doc, item } of productChecks) {
          transaction.update(ref, { stock: doc.data().stock - item.quantity });
        }

        // إنشاء الفاتورة والطلب
        const orderRef = db.collection('orders').doc(orderId);
        transaction.set(orderRef, {
          userId, items, total,
          status: 'pending',
          paymentMethod: 'wallet',
          customerEmail, customerName,
          createdAt: FieldValue.serverTimestamp()
        });
      });

      res.status(201).json({ orderId });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // نظام شحن بطاقات الرصيد (أكواد الشحن والمحفظة)
  app.post('/api/wallet/redeem', verifyToken, async (req: any, res: any) => {
    const { code } = req.body;
    const db = getDbAdmin();
    try {
      await db.runTransaction(async (transaction: any) => {
        const codeRef = db.collection('recharge_codes').doc(code);
        const codeDoc = await transaction.get(codeRef);

        if (!codeDoc.exists || codeDoc.data().isUsed) {
          throw new Error('invalid_or_used_code');
        }

        const amount = codeDoc.data().amount;
        const userRef = db.collection('users').doc(req.user.uid);
        const userDoc = await transaction.get(userRef);

        const currentBalance = userDoc.data()?.balance || 0;
        transaction.update(userRef, { balance: currentBalance + amount });
        transaction.update(codeRef, { isUsed: true, redeemedBy: req.user.uid, redeemedAt: FieldValue.serverTimestamp() });
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ==========================================
  // مسارات لوحة التحكم الإدارية (Admin APIs)
  // ==========================================

  // إضافة منتج جديد (صلاحية مدير المنتجات أو المسؤول)
  app.post('/api/admin/products', verifyToken, verifyAdmin, async (req: any, res: any) => {
    if (!req.adminRole.isProductManager) return res.status(403).json({ error: 'Access denied' });
    const db = getDbAdmin();
    try {
      const newProduct = req.body;
      const ref = await db.collection('products').add({ ...newProduct, createdAt: FieldValue.serverTimestamp() });
      res.status(201).json({ id: ref.id });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  // تحديث حالة الطلب وتسليم البطاقات الرقمية
  app.put('/api/admin/orders/:orderId', verifyToken, verifyAdmin, async (req: any, res: any) => {
    if (!req.adminRole.isOrderManager) return res.status(403).json({ error: 'Access denied' });
    const { status, keys } = req.body;
    const db = getDbAdmin();
    try {
      const orderRef = db.collection('orders').doc(req.params.orderId);
      await orderRef.update({ status, keys, updatedAt: FieldValue.serverTimestamp() });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update order' });
    }
  });

  // نظام استرجاع الأموال للمحفظة عند إلغاء الطلب
  app.post('/api/admin/orders/:orderId/refund', verifyToken, verifyAdmin, async (req: any, res: any) => {
    if (!req.adminRole.isAdmin) return res.status(403).json({ error: 'Superadmin only' });
    const db = getDbAdmin();
    try {
      await db.runTransaction(async (transaction: any) => {
        const orderRef = db.collection('orders').doc(req.params.orderId);
        const orderDoc = await transaction.get(orderRef);
        if (orderDoc.data().status === 'refunded') throw new Error('Already refunded');

        const userRef = db.collection('users').doc(orderDoc.data().userId);
        const userDoc = await transaction.get(userRef);

        transaction.update(userRef, { balance: (userDoc.data().balance || 0) + orderDoc.data().total });
        transaction.update(orderRef, { status: 'refunded' });
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ==========================================
  // النظام الديناميكي لتوجيه وقراءة ملفات الـ HTML والـ Static Assets
  // ==========================================
  let distPath = path.join(currentDir, 'dist');

  if (!fs.existsSync(path.join(distPath, 'index.html'))) {
    if (fs.existsSync(path.join(currentDir, 'src', 'dist'))) {
      distPath = path.join(currentDir, 'src', 'dist');
    } else if (fs.existsSync(path.join(currentDir, 'dist', 'dist'))) {
      distPath = path.join(currentDir, 'dist', 'dist');
    }
  }

  console.log(`[Vite Host] Static mapping active at: ${distPath}`);
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Index header asset compilation mismatch. Please clear cache and re-build.');
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server environment secure. Broadcasting on port: ${PORT}`);
  });
}

startServer();
