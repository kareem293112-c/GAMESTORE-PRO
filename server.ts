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

// الحل الآمن والنهائي لتعريف المسار الحالي في جميع بيئات Node.js وسيرفرات الـ Build
const currentDir = process.cwd();

// Load Firebase Config
let firebaseConfig: any = {};
try {
  // استخدام المسار الجذري الفعلي للمشروع لتجنب الـ undefined نهائياً
  const configPath = path.join(currentDir, 'firebase-applet-config.json');
    
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } else {
    console.warn('Firebase config file not found. Using environment variables if available.');
    firebaseConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID
    };
  }
} catch (error) {
  console.error('Error loading firebase config:', error);
}

// Initialize Firebase Admin lazily
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
  const PORT = 3000;

  // 1. Security Headers (Helmet + Manual)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "https://apis.google.com", "https://*.firebaseapp.com"],
        "connect-src": ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com", "wss://*.firebaseio.com", "https://*.google-analytics.com"],
        "img-src": ["'self'", "data:", "https://*.googleusercontent.com", "https://raw.githubusercontent.com", "https://github.com"],
        "frame-src": ["'self'", "https://*.firebaseapp.com"],
      },
    }
  }));

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    // Security by obscurity
    res.removeHeader('X-Powered-By');
    next();
  });

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Middleware to verify Firebase Auth token
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
      console.error('Error verifying token:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Check if user is an admin
  const verifyAdmin = async (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const userData = userDoc.data();
      if (userData?.isAdmin || userData?.isProductManager || userData?.isOrderManager) {
        next();
      } else {
        res.status(403).json({ error: 'Not authorized' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Auth check failed' });
    }
  };

  // API Products Endpoints (Backend Proxy)
  app.get('/api/me/orders', verifyToken, async (req: any, res: any) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const snapshot = await db.collection('orders')
        .where('userId', '==', req.user.uid)
        .orderBy('createdAt', 'desc')
        .get();
      const orders = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch your orders' });
    }
  });

  app.get('/api/me/purchases/:productId', verifyToken, async (req: any, res: any) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const snapshot = await db.collection('orders')
        .where('userId', '==', req.user.uid)
        .where('status', '==', 'completed')
        .get();
      
      const hasPurchased = snapshot.docs.some((doc: any) => {
        const orderData = doc.data();
        return orderData.items?.some((item: any) => item.id === req.params.productId);
      });

      res.json({ hasPurchased });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check purchase status' });
    }
  });

  app.post('/api/orders', verifyToken, async (req: any, res: any) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const { items, total, customerEmail, customerName } = req.body;
      const userId = req.user.uid;
      const orderId = `ORD-${Date.now()}`;

      await db.runTransaction(async (transaction: any) => {
        // 1. Check user balance
        const userRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) throw new Error('User not found');
        
        const userData = userDoc.data();
        const balance = userData.balance || 0;
        if (balance < total) throw new Error('insufficient_balance');

        // 2. Check stock
        const productChecks = await Promise.all(items.map(async (item: any) => {
          const productRef = db.collection('products').doc(item.productId);
          const productDoc = await transaction.get(productRef);
          return { ref: productRef, doc: productDoc, item };
        }));

        for (const { doc, item } of productChecks) {
          if (!doc.exists) throw new Error(`Product ${item.name} not found`);
          const productData = doc.data();
          if (productData.stock < item.quantity) {
            throw new Error(`insufficient_stock_${item.name}`);
          }
        }

        // 3. Perform updates
        transaction.update(userRef, {
          balance: balance - total,
          updatedAt: FieldValue.serverTimestamp()
        });

        for (const { ref, doc, item } of productChecks) {
          transaction.update(ref, {
            stock: doc.data().stock - item.quantity
          });
        }

        // 4. Create order
        const orderRef = db.collection('orders').doc(orderId);
        transaction.set(orderRef, {
          userId,
          items,
          total,
          status: 'pending',
          paymentMethod: 'wallet',
          customerEmail,
          customerName,
          createdAt: FieldValue.serverTimestamp()
        });
      });

      res.status(201).json({ orderId });
    } catch (error: any) {
      console.error('Checkout error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/products', async (req, res) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const snapshot = await db.collection('products').get();
      const products = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const doc = await db.collection('products').doc(req.params.id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  app.get('/api/products/:id/reviews', async (req, res) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const snapshot = await db.collection('reviews')
        .where('productId', '==', req.params.id)
        .orderBy('createdAt', 'desc')
        .get();
      const reviews = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  app.post('/api/products/:id/reviews', verifyToken, async (req: any, res: any) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const { userName, rating, comment } = req.body;
      const review = {
        productId: req.params.id,
        userId: req.user.uid,
        userName,
        rating: Number(rating),
        comment,
        createdAt: FieldValue.serverTimestamp(),
      };
      const docRef = await db.collection('reviews').add(review);
      res.status(201).json({ id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit review' });
    }
  });

  app.post('/api/products', verifyToken, verifyAdmin, async (req, res) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const product = req.body;
      const docRef = await db.collection('products').add({
        ...product,
        createdAt: FieldValue.serverTimestamp(),
      });
      res.status(201).json({ id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  app.put('/api/products/:id', verifyToken, verifyAdmin, async (req, res) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      await db.collection('products').doc(req.params.id).update({
        ...req.body,
        updatedAt: FieldValue.serverTimestamp(),
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  app.delete('/api/products/:id', verifyToken, verifyAdmin, async (req, res) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      await db.collection('products').doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // API Orders Endpoints
  app.post('/api/orders/:id/refund', verifyToken, verifyAdmin, async (req: any, res: any) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const orderId = req.params.id;
      const { amount, userId } = req.body;

      if (!amount || amount <= 0 || !userId) {
        return res.status(400).json({ error: 'Invalid refund data' });
      }

      await db.runTransaction(async (transaction: any) => {
        const orderRef = db.collection('orders').doc(orderId);
        const userRef = db.collection('users').doc(userId);

        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists) throw new Error('Order not found');
        
        const orderData = orderDoc.data();
        if (orderData.status === 'cancelled') {
           throw new Error('Order already cancelled');
        }

        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) throw new Error('User not found');

        const currentBalance = userDoc.data().balance || 0;

        transaction.update(userRef, {
          balance: currentBalance + amount,
          updatedAt: FieldValue.serverTimestamp()
        });

        transaction.update(orderRef, {
          status: 'cancelled',
          updatedAt: FieldValue.serverTimestamp()
        });
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Refund error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/orders', verifyToken, verifyAdmin, async (req, res) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
      const orders = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.put('/api/orders/:id', verifyToken, verifyAdmin, async (req, res) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      await db.collection('orders').doc(req.params.id).update({
        ...req.body,
        updatedAt: FieldValue.serverTimestamp(),
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update order' });
    }
  });

  // API Users Endpoints
  app.post('/api/me/profile', verifyToken, async (req: any, res: any) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const { displayName } = req.body;
      const userRef = db.collection('users').doc(req.user.uid);
      const doc = await userRef.get();

      if (!doc.exists) {
        // Critical: Role assignment must be server-side
        const role = req.user.email === 'karmo2931@gmail.com' ? 'admin' : 'customer';
        const newProfile = {
          email: req.user.email,
          displayName: displayName || req.user.email.split('@')[0],
          role: role,
          balance: 0,
          createdAt: FieldValue.serverTimestamp(),
        };
        await userRef.set(newProfile);
        res.status(201).json(newProfile);
      } else {
        res.json(doc.data());
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to create/fetch profile' });
    }
  });

  app.get('/api/users', verifyToken, verifyAdmin, async (req, res) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const snapshot = await db.collection('users').get();
      const users = snapshot.docs.map((doc: any) => ({ uid: doc.id, ...doc.data() }));
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.put('/api/users/:id/balance', verifyToken, verifyAdmin, async (req, res) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const { balance } = req.body;
      await db.collection('users').doc(req.params.id).update({
        balance: Number(balance),
        updatedAt: FieldValue.serverTimestamp(),
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update balance' });
    }
  });

  app.delete('/api/orders/:id', verifyToken, verifyAdmin, async (req, res) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      await db.collection('orders').doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete order' });
    }
  });

  // API Reviews Endpoints
  app.get('/api/reviews', async (req, res) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      const snapshot = await db.collection('reviews').get();
      const reviews = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  app.delete('/api/reviews/:id', verifyToken, verifyAdmin, async (req, res) => {
    const db = getDbAdmin();
    if (!db) return res.status(500).json({ error: 'Firebase not configured' });

    try {
      await db.collection('reviews').doc(req.params.id).delete();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete review' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', fullstack: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting in development mode...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Starting in production mode...');
    const distPath = path.resolve(__dirname, 'dist');
    
    console.log(`Serving static files from: ${distPath}`);
    
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send('index.html not found in dist folder');
        }
      });
    } else {
      console.error('Dist folder missing at:', distPath);
      app.get('*', (req, res) => {
        res.status(500).send('dist folder not found. Please run build first.');
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
