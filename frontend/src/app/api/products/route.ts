import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CATEGORY_MAP: Record<string, { folder: string; label: string; priceRange: [number, number] }> = {
  electronics:   { folder: 'electronics',  label: 'Electronics',    priceRange: [999,  49999] },
  clothing:      { folder: 'clothing',     label: 'Clothing',       priceRange: [299,  9999]  },
  'home-kitchen':{ folder: 'home-kitchen', label: 'Home & Kitchen', priceRange: [199,  14999] },
  sports:        { folder: 'sports',       label: 'Sports',         priceRange: [299,  19999] },
  beauty:        { folder: 'beauty',       label: 'Beauty',         priceRange: [99,   4999]  },
  grocery:       { folder: 'grocery',      label: 'Grocery',        priceRange: [49,   1999]  },
  baby:          { folder: 'baby',         label: 'Baby Products',  priceRange: [199,  7999]  },
  hobby:         { folder: 'hobby',        label: 'Hobby & Arts',   priceRange: [149,  9999]  },
  pets:          { folder: 'pets',         label: 'Pet Supplies',   priceRange: [99,   4999]  },
};

const PRODUCT_NAMES: Record<string, string[]> = {
  electronics:    ['Wireless Headphones','Mechanical Keyboard','USB-C Hub','4K Monitor','Smart Speaker','Portable SSD','Gaming Mouse','LED Desk Lamp','Noise Cancelling Earbuds','Bluetooth Speaker','Laptop Stand','Smart Watch','Webcam HD','Phone Charger','Tablet Stand','Gaming Headset','Wireless Charger','Mini Projector','Action Camera','Smart Bulb'],
  clothing:       ['Slim Fit Jeans','Cotton T-Shirt','Hoodie','Formal Shirt','Jogger Pants','Denim Jacket','Polo Shirt','Cargo Shorts','Linen Trousers','Bomber Jacket','Turtleneck Sweater','Chino Pants','Graphic Tee','Windbreaker','Fleece Pullover','Oversized Shirt','Track Pants','Blazer','Kurta','Sweatshirt'],
  'home-kitchen': ['Pour Over Coffee Set','Cast Iron Pan','Bamboo Cutting Board','Knife Set','Air Fryer','Blender','Toaster Oven','Ceramic Mug Set','Spice Rack','Dish Rack','French Press','Instant Pot','Baking Sheet','Silicone Spatula','Pressure Cooker','Non-Stick Pan','Electric Kettle','Rice Cooker','Chopper','Storage Containers'],
  sports:         ['Yoga Mat','Resistance Bands','Dumbbell Set','Jump Rope','Foam Roller','Water Bottle','Gym Gloves','Pull Up Bar','Kettlebell','Cycling Helmet','Tennis Racket','Basketball','Swim Goggles','Hiking Backpack','Running Shoes','Skipping Rope','Ab Roller','Push Up Bars','Ankle Weights','Sports Bag'],
  beauty:         ['Vitamin C Serum','Moisturiser SPF 50','Retinol Cream','Face Wash','Lip Balm Set','Eye Cream','Sunscreen Stick','Toner','Sheet Mask Pack','Micellar Water','BB Cream','Mascara','Foundation','Blush Palette','Highlighter','Face Scrub','Hair Serum','Nail Polish Set','Kajal','Compact Powder'],
  grocery:        ['Organic Honey','Green Tea','Almonds Pack','Olive Oil','Quinoa','Chia Seeds','Protein Bar','Oats','Brown Rice','Coconut Oil','Apple Cider Vinegar','Peanut Butter','Dark Chocolate','Granola','Dried Fruits Mix','Turmeric Powder','Black Pepper','Himalayan Salt','Flaxseeds','Multivitamin Gummies'],
  baby:           ['Baby Carrier','Diaper Bag','Baby Monitor','Feeding Bottle','Baby Blanket','Teether Set','Baby Shampoo','Stroller','Baby Wipes','Nursing Pillow','Baby Clothes Set','Rattle Toy','Baby Lotion','Crib Mobile','Baby Food Maker'],
  hobby:          ['Watercolour Set','Sketch Pad','Acrylic Paint Kit','Calligraphy Set','Origami Paper','Knitting Kit','Embroidery Hoop Set','Puzzle 1000pc','Board Game','Card Game','Lego Set','Model Kit','Scrapbook Kit','Crochet Kit','Diamond Painting'],
  pets:           ['Dog Collar','Cat Toy','Pet Bed','Dog Leash','Cat Scratcher','Pet Shampoo','Bird Cage','Fish Tank','Pet Carrier','Dog Treats','Cat Food Bowl','Pet Brush','Aquarium Filter','Dog Harness','Cat Litter'],
};

const STORES = ['TechZone India','FashionHub','KitchenKing','SportsPro','GlowUp Beauty','FreshMart','BabyBliss','ArtCraft Co','PetParadise','HomeEssentials'];

// Stable hash for deterministic values per image filename
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return Math.abs(h);
}

function buildProducts() {
  const publicDir = path.join(process.cwd(), 'public', 'products');
  const all: {
    id: string; name: string; price: number; rating: number;
    reviews: number; stock: number; image: string;
    category: string; categorySlug: string; store: string;
  }[] = [];

  for (const [slug, meta] of Object.entries(CATEGORY_MAP)) {
    const dir = path.join(publicDir, meta.folder);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.match(/\.(jpeg|jpg|png)$/i));
    const names = PRODUCT_NAMES[slug] || ['Product'];
    const [minP, maxP] = meta.priceRange;

    files.forEach((file) => {
      const h = hash(file);
      all.push({
        id:           `${slug}-${file}`,
        name:         names[h % names.length] + (h % 3 === 0 ? ` - ${['Pro','Plus','Lite','Max','Mini'][h % 5]}` : ''),
        price:        minP + (h % (maxP - minP)),
        rating:       Number((3.5 + (h % 15) / 10).toFixed(1)),
        reviews:      10 + (h % 990),
        stock:        h % 200,
        image:        `/products/${meta.folder}/${file}`,
        category:     meta.label,
        categorySlug: slug,
        store:        STORES[h % STORES.length],
      });
    });
  }

  return all;
}

// Cache in memory so we don't re-read disk on every request
let cache: ReturnType<typeof buildProducts> | null = null;

export async function GET(req: NextRequest) {
  if (!cache) cache = buildProducts();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const search   = (searchParams.get('search') || '').toLowerCase();
  const page     = parseInt(searchParams.get('page') || '0');
  const limit    = parseInt(searchParams.get('limit') || '20');

  let results = cache;
  if (category) results = results.filter((p) => p.categorySlug === category);
  if (search)   results = results.filter((p) => p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search));

  const total = results.length;
  const items = results.slice(page * limit, page * limit + limit);

  return NextResponse.json({ items, total, page, limit });
}
