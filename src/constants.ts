import { Product } from './types';

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'حساب ستيم: Elden Ring + DLC',
    description: 'حساب ستيم جاهز يحتوي على لعبة Elden Ring مع الإضافة الأخيرة Shadow of the Erdtree. كامل الضمان.',
    price: 150,
    discount: 10,
    stock: 25,
    category: 'حسابات ستيم',
    platform: 'PC - Steam',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
    rating: 4.9,
    featured: true,
    releaseDate: '2024-06-21',
    developer: 'FromSoftware',
    languages: ['العربية', 'English', 'French'],
    requirements: {
      os: 'Windows 10/11',
      processor: 'Intel Core i5-8400',
      memory: '12 GB RAM',
      graphics: 'NVIDIA GTX 1060 6GB',
      storage: '60 GB'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'كود ستيم: FC 25 Global Key',
    description: 'كود تفعيل لعبة FC 25 النسخة العالمية. تسليم فوري بعد الدفع مباشرة.',
    price: 240,
    discount: 25,
    stock: 5,
    category: 'أكواد ستيم',
    platform: 'Steam',
    imageUrl: 'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?q=80&w=1974&auto=format&fit=crop',
    rating: 4.5,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'بطاقة شدات ببجي 1800 UC',
    description: 'شحن شدات ببجي العالمية فوري. احصل على شداتك فور الدفع وابدأ بشراء الرويال باس.',
    price: 360,
    discount: 0,
    stock: 100,
    category: 'قسم الهدايا',
    platform: 'Global',
    imageUrl: 'https://images.unsplash.com/photo-1592155931584-901ac15763e3?q=80&w=2075&auto=format&fit=crop',
    rating: 4.8,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'حساب عشوائي: Epic Games (+50 Games)',
    description: 'حساب ايبك قيمز يحتوي على مجموعة عشوائية من الألعاب القوية. ضمان فوري ضد السحب.',
    price: 95,
    discount: 5,
    stock: 200,
    category: 'حسابات مشكلة',
    platform: 'Epic Games',
    imageUrl: 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?q=80&w=1964&auto=format&fit=crop',
    rating: 4.7,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'حساب ستيم: Cyberpunk 2077 + Phantom Liberty',
    description: 'استكشف نايت سيتي مع النسخة الكاملة التي تضم الإضافة الأسطورية Phantom Liberty. تجربة لعب لا مثيل لها.',
    price: 180,
    discount: 15,
    stock: 12,
    category: 'حسابات ستيم',
    platform: 'PC - Steam',
    imageUrl: 'https://images.unsplash.com/photo-1605898960710-9195cf29699b?q=80&w=2000&auto=format&fit=crop',
    rating: 4.9,
    featured: true,
    createdAt: new Date().toISOString()
  }
];
