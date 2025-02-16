import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.production');
dotenv.config({ path: envPath });

const productsData = {
  categories: [
    {
      name: 'Headphones',
      items: [
        {
          name: 'XX99 Mark II Headphones',
          description:
            'The new XX99 Mark II headphones is the pinnacle of pristine audio. It redefines your premium headphone experience by reproducing the balanced depth and precision of studio-quality sound.',
          price: 469.99,
          features: [
            'Featuring a genuine leather head strap and premium earcups, these headphones deliver superior comfort for those who like to enjoy endless listening. It includes intuitive controls designed for any situation. Whether you are taking a business call or just in your own personal space, the auto on/off and pause features ensure that you will never miss a beat.',
            'The advanced Active Noise Cancellation with built-in equalizer allow you to experience your audio world on your terms. It lets you enjoy your audio in peace, but quickly interact with your surroundings when you need to. Combined with Bluetooth 5.0 compliant connectivity and 17 hour battery life, the XX99 Mark II headphones gives you superior sound, cutting-edge technology, and a modern design aesthetic.',
          ],
          includes: [
            { quantity: 1, item: 'Headphone Unit' },
            { quantity: 2, item: 'Replacement Earcups' },
            { quantity: 1, item: 'User Manual' },
            { quantity: 1, item: '3.5mm 5mm Audio Cable' },
            { quantity: 1, item: 'Travel Bag' },
          ],
          isNew: true,
        },
        {
          name: 'XX99 Mark I Headphones',
          description:
            'As the gold standard for headphones, the classic XX99 Mark I offers detailed and accurate audio reproduction for audiophiles, mixing engineers, and music aficionados alike in studios and on the go.',
          price: 344.99,
          features: [
            'The XX99 Mark I headphones offer a comfortable fit with their padded headband and earcups. They provide excellent sound isolation and a balanced sound profile, making them ideal for both casual listening and professional use.',
            'With a durable build and a detachable cable, the XX99 Mark I headphones are designed to last. They come with a carrying case for easy transport and storage.',
          ],
          includes: [
            { quantity: 1, item: 'Headphone Unit' },
            { quantity: 1, item: 'Replacement Earcups' },
            { quantity: 1, item: 'User Manual' },
            { quantity: 1, item: '3.5mm Audio Cable' },
            { quantity: 1, item: 'Carrying Case' },
          ],
          isNew: false,
        },
        {
          name: 'XX59 Headphones',
          description:
            'Enjoy your audio almost anywhere and customize it to your specific tastes with the XX59 headphones. The stylish yet durable versatile wireless headset is a brilliant companion at home or on the move.',
          price: 599.99,
          features: [
            'The XX59 headphones offer a sleek design and a comfortable fit. They provide a balanced sound profile with deep bass and clear highs, making them suitable for a wide range of music genres.',
            'With a long battery life and Bluetooth connectivity, the XX59 headphones are perfect for on-the-go listening. They also come with a built-in microphone for hands-free calls.',
          ],
          includes: [
            { quantity: 1, item: 'Headphone Unit' },
            { quantity: 1, item: 'User Manual' },
            { quantity: 1, item: '3.5mm Audio Cable' },
            { quantity: 1, item: 'Charging Cable' },
          ],
          isNew: false,
        },
      ],
    },
    {
      name: 'Speakers',
      items: [
        {
          name: 'ZX9 Speaker',
          description:
            "Upgrade your sound system with the all new ZX9 active speaker. It's a bookshelf speaker system that offers truly wireless connectivity -- creating new possibilities for more pleasing and practical audio setups.",
          price: 1045,
          features: [
            'The ZX9 speaker offers a powerful sound experience with its high-fidelity drivers and advanced acoustic design. It supports wireless connectivity, allowing you to stream music from your devices with ease.',
            'With a sleek and modern design, the ZX9 speaker fits seamlessly into any home decor. It also includes a remote control for convenient operation.',
          ],
          includes: [
            { quantity: 2, item: 'Speaker Units' },
            { quantity: 1, item: 'Remote Control' },
            { quantity: 1, item: 'User Manual' },
            { quantity: 1, item: 'Power Cable' },
            { quantity: 2, item: 'Speaker Stands' },
          ],
          isNew: true,
        },
        {
          name: 'ZX7 Speaker',
          description:
            'Stream high quality sound wirelessly with minimal loss. The ZX7 bookshelf speaker uses high-end audiophile components that represents the top of the line powered speakers for home or studio use.',
          price: 1248,
          features: [
            'The ZX7 speaker delivers exceptional sound quality with its high-performance drivers and advanced crossover network. It supports both wired and wireless connections, giving you flexibility in your audio setup.',
            "With a classic design and premium build quality, the ZX7 speaker is a great addition to any audio enthusiast's collection. It also includes a remote control for easy operation.",
          ],
          includes: [
            { quantity: 2, item: 'Speaker Units' },
            { quantity: 1, item: 'Remote Control' },
            { quantity: 1, item: 'User Manual' },
            { quantity: 1, item: 'Power Cable' },
          ],
          isNew: false,
        },
      ],
    },
    {
      name: 'Earphones',
      items: [
        {
          name: 'YX1 Wireless Earphones',
          description:
            'Tailor your listening experience with bespoke dynamic drivers from the new YX1 Wireless Earphones. Enjoy incredible high-fidelity sound even in noisy environments with its active noise cancellation feature.',
          price: 499.99,
          features: [
            'The YX1 wireless earphones offer a comfortable and secure fit with their ergonomic design and multiple ear tip sizes. They provide high-fidelity sound with deep bass and clear highs, making them perfect for music lovers.',
            'With active noise cancellation and a long battery life, the YX1 earphones let you enjoy your music without distractions. They also come with a charging case for convenient on-the-go charging.',
          ],
          includes: [
            { quantity: 1, item: 'Earphone Unit' },
            { quantity: 3, item: 'Ear Tip Sizes' },
            { quantity: 1, item: 'User Manual' },
            { quantity: 1, item: 'Charging Case' },
            { quantity: 1, item: 'USB-C Charging Cable' },
          ],
          isNew: true,
        },
      ],
    },
  ],
};

async function populateDatabase(): Promise<void> {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: 'storefront',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Cleaning existing data...');
    await client.query(`
      TRUNCATE TABLE order_products CASCADE;
      TRUNCATE TABLE orders CASCADE;
      TRUNCATE TABLE product_accessories CASCADE;
      TRUNCATE TABLE products CASCADE;
      TRUNCATE TABLE users CASCADE;
    `);

    // Insert users
    console.log('Inserting users...');
    const usersResult = await client.query(`
      INSERT INTO users (first_name, last_name, email, password_digest) VALUES
      (
        'John',
        'Doe',
        'john.doe@example.com',
        '$2b$10$xPPQQUB4gRTJK9BLON5e7.f6jpZBu0WJQAqJ0VLrDsQHnHrB8KDtC'
      ),
      (
        'Jane',
        'Smith',
        'jane.smith@example.com',
        '$2b$10$xPPQQUB4gRTJK9BLON5e7.1234567890abcdefghijklmnopqrstuv'
      )
      RETURNING id, email;
    `);

    const users = usersResult.rows;
    const userMap = new Map(users.map((user) => [user.email, user.id]));

    // Insert products and their accessories
    console.log('Inserting products and accessories...');
    const productIdMap = new Map<string, number>();

    for (const category of productsData.categories) {
      for (const product of category.items) {
        // Insert product
        const productResult = await client.query(
          `
          INSERT INTO products (
            product_name,
            price,
            category,
            product_desc,
            features,
            is_new
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `,
          [
            product.name,
            product.price,
            category.name.toLowerCase(),
            product.description,
            product.features,
            product.isNew,
          ]
        );

        const productId = productResult.rows[0].id;
        productIdMap.set(product.name, productId);

        // Insert accessories
        for (const accessory of product.includes) {
          await client.query(
            `
            INSERT INTO product_accessories (
              product_id,
              item_name,
              quantity
            ) VALUES ($1, $2, $3)
          `,
            [productId, accessory.item, accessory.quantity]
          );
        }
      }
    }

    // Create sample orders
    console.log('Creating sample orders...');

    // Create an active order for John Doe
    const johnDoeId = userMap.get('john.doe@example.com');
    const johnOrderResult = await client.query(
      `
      INSERT INTO orders (user_id, status)
      VALUES ($1, 'active')
      RETURNING id
      `,
      [johnDoeId]
    );

    // Add XX99 Mark II to John's order
    const xx99Mark2Id = productIdMap.get('XX99 Mark II Headphones');
    await client.query(
      `
      INSERT INTO order_products (order_id, product_id, quantity)
      VALUES ($1, $2, 2)
      `,
      [johnOrderResult.rows[0].id, xx99Mark2Id]
    );

    // Create a completed order for Jane Smith
    const janeSmithId = userMap.get('jane.smith@example.com');
    const janeOrderResult = await client.query(
      `
      INSERT INTO orders (user_id, status)
      VALUES ($1, 'complete')
      RETURNING id
      `,
      [janeSmithId]
    );

    // Add ZX9 Speaker and YX1 Wireless Earphones to Jane's order
    const zx9Id = productIdMap.get('ZX9 Speaker');
    const yx1Id = productIdMap.get('YX1 Wireless Earphones');

    await client.query(
      `
      INSERT INTO order_products (order_id, product_id, quantity)
      VALUES 
        ($1, $2, 1),
        ($1, $3, 1)
      `,
      [janeOrderResult.rows[0].id, zx9Id, yx1Id]
    );

    await client.query('COMMIT');
    console.log('Database populated successfully!');

    // Verify data
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) FROM users'),
      client.query('SELECT COUNT(*) FROM products'),
      client.query('SELECT COUNT(*) FROM product_accessories'),
      client.query('SELECT COUNT(*) FROM orders'),
      client.query('SELECT COUNT(*) FROM order_products'),
    ]);

    console.log('\nData verification:');
    console.log('Users:', counts[0].rows[0].count);
    console.log('Products:', counts[1].rows[0].count);
    console.log('Accessories:', counts[2].rows[0].count);
    console.log('Orders:', counts[3].rows[0].count);
    console.log('Order Products:', counts[4].rows[0].count);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error populating database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

console.log('Starting database population...');
populateDatabase().catch(console.error);
