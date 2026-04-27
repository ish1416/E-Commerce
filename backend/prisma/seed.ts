import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Map DB category name → public image folder
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'Electronics':     'electronics',
  'Clothing':        'clothing',
  'Home & Kitchen':  'home-kitchen',
  'Sports':          'sports',
  'Beauty':          'beauty',
  'Books':           'hobby',
  'Toys':            'baby',
  'Automotive':      'grocery',
  'Footwear':        'clothing',
  'Accessories':     'clothing',
};

const PUBLIC_DIR = path.join(__dirname, '../../frontend/public/products');

// Build image index per folder
const imageIndex: Record<string, string[]> = {};
function getImagesForFolder(folder: string): string[] {
  if (!imageIndex[folder]) {
    const dir = path.join(PUBLIC_DIR, folder);
    if (fs.existsSync(dir)) {
      imageIndex[folder] = fs.readdirSync(dir)
        .filter((f) => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'))
        .map((f) => `/products/${folder}/${f}`);
    } else {
      imageIndex[folder] = [];
    }
  }
  return imageIndex[folder];
}

function pickImages(categoryName: string, count = 2): string[] {
  const folder = CATEGORY_IMAGE_MAP[categoryName] || 'grocery';
  const imgs = getImagesForFolder(folder);
  if (imgs.length === 0) return [];
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(imgs[Math.floor(Math.random() * imgs.length)]);
  }
  return result;
}

const CATEGORIES = [
  { name: 'Electronics',    slug: 'electronics' },
  { name: 'Clothing',       slug: 'clothing' },
  { name: 'Home & Kitchen', slug: 'home-kitchen' },
  { name: 'Sports',         slug: 'sports' },
  { name: 'Books',          slug: 'books' },
  { name: 'Beauty',         slug: 'beauty' },
  { name: 'Toys',           slug: 'toys' },
  { name: 'Automotive',     slug: 'automotive' },
  { name: 'Footwear',       slug: 'footwear' },
  { name: 'Accessories',    slug: 'accessories' },
];

const PRODUCT_TEMPLATES: Record<string, string[]> = {
  Electronics:      ['Wireless Headphones', 'Mechanical Keyboard', 'USB-C Hub', '4K Monitor', 'Webcam HD', 'Smart Speaker', 'Portable SSD', 'Gaming Mouse', 'LED Desk Lamp', 'Noise Cancelling Earbuds', 'Bluetooth Speaker', 'Laptop Stand', 'Phone Charger', 'Smart Watch', 'Tablet Stand'],
  Clothing:         ['Slim Fit Jeans', 'Cotton T-Shirt', 'Hoodie', 'Formal Shirt', 'Jogger Pants', 'Denim Jacket', 'Polo Shirt', 'Cargo Shorts', 'Linen Trousers', 'Bomber Jacket', 'Turtleneck Sweater', 'Chino Pants', 'Graphic Tee', 'Windbreaker', 'Fleece Pullover'],
  'Home & Kitchen': ['Pour Over Coffee Set', 'Cast Iron Pan', 'Bamboo Cutting Board', 'Knife Set', 'Air Fryer', 'Blender', 'Toaster Oven', 'Ceramic Mug Set', 'Spice Rack', 'Dish Rack', 'Salad Bowl', 'French Press', 'Instant Pot', 'Baking Sheet', 'Silicone Spatula'],
  Sports:           ['Yoga Mat', 'Resistance Bands', 'Dumbbell Set', 'Jump Rope', 'Foam Roller', 'Water Bottle', 'Running Belt', 'Gym Gloves', 'Pull Up Bar', 'Kettlebell', 'Cycling Helmet', 'Tennis Racket', 'Basketball', 'Swim Goggles', 'Hiking Backpack'],
  Books:            ['Clean Code', 'The Pragmatic Programmer', 'Atomic Habits', 'Deep Work', 'Zero to One', 'The Lean Startup', 'Designing Data-Intensive Apps', 'The Psychology of Money', 'Sapiens', 'Thinking Fast and Slow', 'The Alchemist', 'Rich Dad Poor Dad', 'Ikigai', 'The 4-Hour Work Week', 'Start With Why'],
  Beauty:           ['Vitamin C Serum', 'Moisturiser SPF 50', 'Retinol Cream', 'Face Wash', 'Lip Balm Set', 'Eye Cream', 'Sunscreen Stick', 'Toner', 'Sheet Mask Pack', 'Micellar Water', 'BB Cream', 'Mascara', 'Foundation', 'Blush Palette', 'Highlighter'],
  Toys:             ['LEGO City Set', 'Remote Control Car', 'Puzzle 1000pc', 'Board Game', 'Action Figure', 'Stuffed Animal', 'Building Blocks', 'Card Game', 'Magnetic Tiles', 'Science Kit', 'Art Set', 'Dollhouse', 'Toy Train Set', 'Foam Dart Gun', 'Slime Kit'],
  Automotive:       ['Car Phone Mount', 'Dash Cam', 'Seat Covers', 'Car Vacuum', 'Jump Starter', 'Tire Inflator', 'Car Organiser', 'Steering Wheel Cover', 'Car Air Freshener', 'OBD2 Scanner', 'Windshield Sunshade', 'Car Wax Kit', 'Floor Mats', 'Backup Camera', 'LED Interior Lights'],
  Footwear:         ['Running Shoes', 'Leather Sneakers', 'Chelsea Boots', 'Slip-On Loafers', 'Hiking Boots', 'Canvas Shoes', 'Sandals', 'Oxford Shoes', 'Ankle Boots', 'Sport Sandals', 'Moccasins', 'Platform Sneakers', 'Derby Shoes', 'Flip Flops', 'Boat Shoes'],
  Accessories:      ['Leather Wallet', 'Sunglasses', 'Canvas Tote Bag', 'Leather Belt', 'Silk Scarf', 'Baseball Cap', 'Beanie Hat', 'Backpack', 'Crossbody Bag', 'Watch Strap', 'Keychain', 'Umbrella', 'Passport Holder', 'Card Holder', 'Laptop Bag'],
};

async function main() {
  console.log('🌱 Seeding database with real product images...');

  // Wipe all data
  await prisma.orderEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Cleared existing data');

  // Categories
  const categories = await Promise.all(
    CATEGORIES.map((c) => prisma.category.create({ data: c }))
  );
  console.log(`✓ Created ${categories.length} categories`);

  // Users
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: { email: 'admin@shopsmart.dev', name: 'Admin User', passwordHash, role: 'ADMIN' },
  });

  const sellers = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.user.create({
        data: { email: `seller${i + 1}@shopsmart.dev`, name: faker.person.fullName(), passwordHash, role: 'SELLER' },
      })
    )
  );

  // Stores
  const stores = await Promise.all(
    sellers.map((seller, i) =>
      prisma.store.create({
        data: {
          name: faker.company.name(),
          slug: `store-${i + 1}-${faker.string.alphanumeric(4).toLowerCase()}`,
          description: faker.company.catchPhrase(),
          ownerId: seller.id,
        },
      })
    )
  );
  console.log(`✓ Created ${sellers.length} sellers + ${stores.length} stores`);

  // Products — 100 per category = 1000 total, each with 2 real images
  const productData = [];
  for (const category of categories) {
    const templates = PRODUCT_TEMPLATES[category.name] || [];
    for (let i = 0; i < 100; i++) {
      const baseName = templates[i % templates.length];
      const variant = i >= templates.length ? ` ${faker.commerce.productAdjective()}` : '';
      const store = stores[Math.floor(Math.random() * stores.length)];
      const images = pickImages(category.name, 2);

      productData.push({
        name: `${baseName}${variant}`,
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 99, max: 49999, dec: 2 })),
        stock: faker.number.int({ min: 0, max: 500 }),
        images: JSON.stringify(images),
        categoryId: category.id,
        storeId: store.id,
      });
    }
  }

  // Insert in chunks of 100
  let created = 0;
  for (let i = 0; i < productData.length; i += 100) {
    await Promise.all(productData.slice(i, i + 100).map((p) => prisma.product.create({ data: p })));
    created += Math.min(100, productData.length - i);
    process.stdout.write(`\r  Products: ${created}/${productData.length}`);
  }
  console.log(`\n✓ Created ${created} products with real images`);

  // Shoppers
  const shoppers = await Promise.all(
    Array.from({ length: 50 }, (_, i) =>
      prisma.user.create({
        data: { email: `user${i + 1}@shopsmart.dev`, name: faker.person.fullName(), passwordHash, role: 'SHOPPER' },
      })
    )
  );

  // Demo user
  await prisma.user.create({
    data: { email: 'demo@shopsmart.dev', name: 'Demo User', passwordHash: await bcrypt.hash('demo1234', 10), role: 'SHOPPER' },
  });
  console.log(`✓ Created ${shoppers.length} shoppers + demo user`);

  // Orders
  const allProducts = await prisma.product.findMany({ select: { id: true, price: true } });
  let orderCount = 0;
  for (const shopper of shoppers) {
    const numOrders = faker.number.int({ min: 1, max: 8 });
    for (let o = 0; o < numOrders; o++) {
      const items = faker.helpers.arrayElements(allProducts, faker.number.int({ min: 1, max: 5 }));
      const total = items.reduce((s, p) => s + Number(p.price), 0);
      await prisma.order.create({
        data: {
          userId: shopper.id,
          status: faker.helpers.arrayElement(['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED']) as never,
          total,
          shippingAddress: JSON.stringify({ street: faker.location.streetAddress(), city: faker.location.city(), state: faker.location.state(), zip: faker.location.zipCode(), country: 'India' }),
          items: { create: items.map((p) => ({ productId: p.id, quantity: faker.number.int({ min: 1, max: 3 }), price: p.price })) },
        },
      });
      orderCount++;
    }
  }
  console.log(`✓ Created ~${orderCount} orders`);

  console.log('\n✅ Seed complete!');
  console.log('   Demo  → demo@shopsmart.dev  / demo1234');
  console.log('   Admin → admin@shopsmart.dev / password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
