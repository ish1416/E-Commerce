import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Electronics',     slug: 'electronics' },
  { name: 'Clothing',        slug: 'clothing' },
  { name: 'Home & Kitchen',  slug: 'home-kitchen' },
  { name: 'Sports',          slug: 'sports' },
  { name: 'Books',           slug: 'books' },
  { name: 'Beauty',          slug: 'beauty' },
  { name: 'Toys',            slug: 'toys' },
  { name: 'Automotive',      slug: 'automotive' },
  { name: 'Footwear',        slug: 'footwear' },
  { name: 'Accessories',     slug: 'accessories' },
];

const PRODUCT_TEMPLATES: Record<string, string[]> = {
  Electronics:    ['Wireless Headphones', 'Mechanical Keyboard', 'USB-C Hub', '4K Monitor', 'Webcam HD', 'Smart Speaker', 'Portable SSD', 'Gaming Mouse', 'LED Desk Lamp', 'Noise Cancelling Earbuds', 'Bluetooth Speaker', 'Laptop Stand', 'Phone Charger', 'Smart Watch', 'Tablet Stand'],
  Clothing:       ['Slim Fit Jeans', 'Cotton T-Shirt', 'Hoodie', 'Formal Shirt', 'Jogger Pants', 'Denim Jacket', 'Polo Shirt', 'Cargo Shorts', 'Linen Trousers', 'Bomber Jacket', 'Turtleneck Sweater', 'Chino Pants', 'Graphic Tee', 'Windbreaker', 'Fleece Pullover'],
  'Home & Kitchen':['Pour Over Coffee Set', 'Cast Iron Pan', 'Bamboo Cutting Board', 'Knife Set', 'Air Fryer', 'Blender', 'Toaster Oven', 'Ceramic Mug Set', 'Spice Rack', 'Dish Rack', 'Salad Bowl', 'French Press', 'Instant Pot', 'Baking Sheet', 'Silicone Spatula'],
  Sports:         ['Yoga Mat', 'Resistance Bands', 'Dumbbell Set', 'Jump Rope', 'Foam Roller', 'Water Bottle', 'Running Belt', 'Gym Gloves', 'Pull Up Bar', 'Kettlebell', 'Cycling Helmet', 'Tennis Racket', 'Basketball', 'Swim Goggles', 'Hiking Backpack'],
  Books:          ['Clean Code', 'The Pragmatic Programmer', 'Atomic Habits', 'Deep Work', 'Zero to One', 'The Lean Startup', 'Designing Data-Intensive Apps', 'The Psychology of Money', 'Sapiens', 'Thinking Fast and Slow', 'The Alchemist', 'Rich Dad Poor Dad', 'Ikigai', 'The 4-Hour Work Week', 'Start With Why'],
  Beauty:         ['Vitamin C Serum', 'Moisturiser SPF 50', 'Retinol Cream', 'Face Wash', 'Lip Balm Set', 'Eye Cream', 'Sunscreen Stick', 'Toner', 'Sheet Mask Pack', 'Micellar Water', 'BB Cream', 'Mascara', 'Foundation', 'Blush Palette', 'Highlighter'],
  Toys:           ['LEGO City Set', 'Remote Control Car', 'Puzzle 1000pc', 'Board Game', 'Action Figure', 'Stuffed Animal', 'Building Blocks', 'Card Game', 'Magnetic Tiles', 'Science Kit', 'Art Set', 'Dollhouse', 'Toy Train Set', 'Foam Dart Gun', 'Slime Kit'],
  Automotive:     ['Car Phone Mount', 'Dash Cam', 'Seat Covers', 'Car Vacuum', 'Jump Starter', 'Tire Inflator', 'Car Organiser', 'Steering Wheel Cover', 'Car Air Freshener', 'OBD2 Scanner', 'Windshield Sunshade', 'Car Wax Kit', 'Floor Mats', 'Backup Camera', 'LED Interior Lights'],
  Footwear:       ['Running Shoes', 'Leather Sneakers', 'Chelsea Boots', 'Slip-On Loafers', 'Hiking Boots', 'Canvas Shoes', 'Sandals', 'Oxford Shoes', 'Ankle Boots', 'Sport Sandals', 'Moccasins', 'Platform Sneakers', 'Derby Shoes', 'Flip Flops', 'Boat Shoes'],
  Accessories:    ['Leather Wallet', 'Sunglasses', 'Canvas Tote Bag', 'Leather Belt', 'Silk Scarf', 'Baseball Cap', 'Beanie Hat', 'Backpack', 'Crossbody Bag', 'Watch Strap', 'Keychain', 'Umbrella', 'Passport Holder', 'Card Holder', 'Laptop Bag'],
};

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
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

  // Create categories
  const categories = await Promise.all(
    CATEGORIES.map((c) => prisma.category.create({ data: c }))
  );
  console.log(`✓ Created ${categories.length} categories`);

  // Create admin + seller users
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: { email: 'admin@shopsmart.dev', name: 'Admin User', passwordHash, role: 'ADMIN' },
  });

  const sellers = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `seller${i + 1}@shopsmart.dev`,
          name: faker.person.fullName(),
          passwordHash,
          role: 'SELLER',
        },
      })
    )
  );
  console.log(`✓ Created admin + ${sellers.length} sellers`);

  // Create stores (one per seller)
  const stores = await Promise.all(
    sellers.map((seller, i) => {
      const storeName = faker.company.name();
      return prisma.store.create({
        data: {
          name: storeName,
          slug: `store-${i + 1}-${faker.string.alphanumeric(4).toLowerCase()}`,
          description: faker.company.catchPhrase(),
          ownerId: seller.id,
        },
      });
    })
  );
  console.log(`✓ Created ${stores.length} stores`);

  // Create 1000 products spread across categories and stores
  const products = [];
  let productCount = 0;

  for (const category of categories) {
    const templates = PRODUCT_TEMPLATES[category.name] || [];
    const productsPerCategory = Math.ceil(1000 / CATEGORIES.length);

    for (let i = 0; i < productsPerCategory; i++) {
      const baseName = templates[i % templates.length];
      const variant = i >= templates.length ? ` ${faker.commerce.productAdjective()}` : '';
      const store = stores[Math.floor(Math.random() * stores.length)];

      products.push({
        name: `${baseName}${variant}`,
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 5, max: 999, dec: 2 })),
        stock: faker.number.int({ min: 0, max: 500 }),
        images: JSON.stringify([
          `https://picsum.photos/seed/${faker.string.alphanumeric(8)}/400/400`,
          `https://picsum.photos/seed/${faker.string.alphanumeric(8)}/400/400`,
        ]),
        categoryId: category.id,
        storeId: store.id,
      });
      productCount++;
    }
  }

  // Batch insert products in chunks of 100
  const chunkSize = 100;
  const createdProducts = [];
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    const created = await Promise.all(chunk.map((p) => prisma.product.create({ data: p })));
    createdProducts.push(...created);
    process.stdout.write(`\r  Creating products... ${Math.min(i + chunkSize, products.length)}/${products.length}`);
  }
  console.log(`\n✓ Created ${createdProducts.length} products`);

  // Create 50 shopper users
  const shoppers = await Promise.all(
    Array.from({ length: 50 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `user${i + 1}@shopsmart.dev`,
          name: faker.person.fullName(),
          passwordHash,
          role: 'SHOPPER',
        },
      })
    )
  );
  console.log(`✓ Created ${shoppers.length} shoppers`);

  // Create orders for shoppers
  let orderCount = 0;
  for (const shopper of shoppers) {
    const numOrders = faker.number.int({ min: 1, max: 8 });
    for (let o = 0; o < numOrders; o++) {
      const numItems = faker.number.int({ min: 1, max: 5 });
      const orderProducts = faker.helpers.arrayElements(createdProducts, numItems);
      const total = orderProducts.reduce((s, p) => s + Number(p.price), 0);
      const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

      await prisma.order.create({
        data: {
          userId: shopper.id,
          status: faker.helpers.arrayElement(statuses) as never,
          total,
          shippingAddress: JSON.stringify({
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zip: faker.location.zipCode(),
            country: 'India',
          }),
          items: {
            create: orderProducts.map((p) => ({
              productId: p.id,
              quantity: faker.number.int({ min: 1, max: 3 }),
              price: p.price,
            })),
          },
        },
      });
      orderCount++;
    }
  }
  console.log(`✓ Created ~${orderCount} orders`);

  // Create reviews
  let reviewCount = 0;
  for (const shopper of shoppers.slice(0, 20)) {
    const reviewProducts = faker.helpers.arrayElements(createdProducts, 10);
    for (const product of reviewProducts) {
      try {
        await prisma.review.create({
          data: {
            userId: shopper.id,
            productId: product.id,
            rating: faker.number.int({ min: 1, max: 5 }),
            comment: faker.lorem.sentence(),
          },
        });
        reviewCount++;
      } catch {
        // skip duplicate
      }
    }
  }
  console.log(`✓ Created ${reviewCount} reviews`);

  // Create a demo user easy to log in with
  await prisma.user.create({
    data: {
      email: 'demo@shopsmart.dev',
      name: 'Demo User',
      passwordHash: await bcrypt.hash('demo1234', 10),
      role: 'SHOPPER',
    },
  });

  console.log('\n✅ Seed complete!');
  console.log('   Demo login → demo@shopsmart.dev / demo1234');
  console.log('   Admin login → admin@shopsmart.dev / password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
