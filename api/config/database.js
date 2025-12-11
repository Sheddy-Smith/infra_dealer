import sqlite3 from 'sqlite3';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../data/infradealer.db');

// Ensure data directory exists
const dataDir = join(__dirname, '../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Connect to database
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Create tables if they don't exist
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE NOT NULL,
        name TEXT,
        email TEXT,
        role TEXT DEFAULT 'buyer',
        city TEXT,
        state TEXT,
        company_name TEXT,
        kyc_status TEXT DEFAULT 'not_submitted',
        badge TEXT,
        trust_score INTEGER DEFAULT 100,
        rating REAL DEFAULT 0,
        total_sales INTEGER DEFAULT 0,
        kyc_verified_at DATETIME,
        kyc_expiry_date DATETIME,
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // OTPs table
    db.run(`
      CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        phone TEXT NOT NULL,
        otp TEXT NOT NULL,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Token wallets
    db.run(`
      CREATE TABLE IF NOT EXISTS token_wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        balance INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Token transactions
    db.run(`
      CREATE TABLE IF NOT EXISTS token_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        change INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        type TEXT NOT NULL,
        ref TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        tokens INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        currency TEXT DEFAULT 'INR',
        status TEXT DEFAULT 'created',
        receipt TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Listings table
    db.run(`
      CREATE TABLE IF NOT EXISTS listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        make_model TEXT,
        year INTEGER,
        km INTEGER,
        price INTEGER NOT NULL,
        description TEXT,
        city TEXT NOT NULL,
        area TEXT,
        seller_contact TEXT,
        images TEXT, -- JSON array of image paths
        status TEXT DEFAULT 'pending',
        featured BOOLEAN DEFAULT 0,
        views INTEGER DEFAULT 0,
        expiry_date DATETIME,
        quality_score INTEGER DEFAULT 50,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users (id)
      )
    `);

    // Unlocks table
    db.run(`
      CREATE TABLE IF NOT EXISTS unlocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        listing_id INTEGER NOT NULL,
        tokens_used INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (listing_id) REFERENCES listings (id)
      )
    `);

    // Broker info table
    db.run(`
      CREATE TABLE IF NOT EXISTS broker_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        experience_years TEXT,
        vehicles_handled TEXT,
        working_cities TEXT,
        specialization TEXT,
        account_number TEXT,
        ifsc_code TEXT,
        bank_name TEXT,
        account_holder_name TEXT,
        upi_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Broker assignments table
    db.run(`
      CREATE TABLE IF NOT EXISTS broker_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id INTEGER NOT NULL,
        seller_id INTEGER NOT NULL,
        broker_id INTEGER NOT NULL,
        status TEXT DEFAULT 'assigned',
        commission_rate REAL DEFAULT 2.5,
        final_sale_amount INTEGER,
        deal_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (listing_id) REFERENCES listings (id),
        FOREIGN KEY (seller_id) REFERENCES users (id),
        FOREIGN KEY (broker_id) REFERENCES users (id)
      )
    `);

    // Broker commissions table
    db.run(`
      CREATE TABLE IF NOT EXISTS broker_commissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL,
        broker_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        paid_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES broker_assignments (id),
        FOREIGN KEY (broker_id) REFERENCES users (id)
      )
    `);

    // Broker reviews table
    db.run(`
      CREATE TABLE IF NOT EXISTS broker_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        broker_id INTEGER NOT NULL,
        reviewer_id INTEGER NOT NULL,
        assignment_id INTEGER,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (broker_id) REFERENCES users (id),
        FOREIGN KEY (reviewer_id) REFERENCES users (id),
        FOREIGN KEY (assignment_id) REFERENCES broker_assignments (id)
      )
    `);

    // Listing audit log table
    db.run(`
      CREATE TABLE IF NOT EXISTS listing_audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (listing_id) REFERENCES listings (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Notifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link TEXT,
        read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Badge criteria tracking
    db.run(`
      CREATE TABLE IF NOT EXISTS badge_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        badge_type TEXT NOT NULL,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Trust incidents table
    db.run(`
      CREATE TABLE IF NOT EXISTS trust_incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        incident_type TEXT NOT NULL,
        description TEXT,
        severity TEXT,
        score_impact INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        reviewed_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create demo user if not exists
    db.get("SELECT id FROM users WHERE phone = '912345678901'", (err, row) => {
      if (!row) {
        db.run(
          "INSERT INTO users (phone, name, role) VALUES (?, ?, ?)",
          ['912345678901', 'Demo User', 'buyer'],
          function(err) {
            if (!err) {
              // Create wallet for demo user
              db.run(
                "INSERT INTO token_wallets (user_id, balance) VALUES (?, ?)",
                [this.lastID, 5]
              );
              console.log('Demo user created with 5 tokens');
            }
          }
        );
      }
    });

    // Create demo listings
    db.get("SELECT id FROM listings LIMIT 1", (err, row) => {
      if (!row) {
        const demoListings = [
          {
            seller_id: 1,
            title: 'JCB 3DX Super',
            category: 'JCB',
            make_model: 'JCB 3DX Super',
            year: 2019,
            km: 2500,
            price: 1850000,
            description: 'Well maintained JCB 3DX Super with all documents. Excellent condition.',
            city: 'Mumbai',
            area: 'Andheri',
            seller_contact: '+919876543210',
            images: JSON.stringify(['jcb1.jpg', 'jcb2.jpg']),
            status: 'approved'
          },
          {
            seller_id: 1,
            title: 'Tata Prima 2528.K',
            category: 'Trucks',
            make_model: 'Tata Prima 2528.K',
            year: 2020,
            km: 120000,
            price: 2800000,
            description: 'Tata Prima 2528.K tipper in excellent condition with insurance.',
            city: 'Delhi',
            area: 'Nehru Place',
            seller_contact: '+919876543211',
            images: JSON.stringify(['truck1.jpg', 'truck2.jpg']),
            status: 'approved'
          },
          {
            seller_id: 1,
            title: 'Ashok Leyland 2820',
            category: 'Trucks',
            make_model: 'Ashok Leyland 2820',
            year: 2018,
            km: 150000,
            price: 2200000,
            description: 'Ashok Leyland 2820 trolley in good condition with all papers.',
            city: 'Bangalore',
            area: 'Whitefield',
            seller_contact: '+919876543212',
            images: JSON.stringify(['truck3.jpg', 'truck4.jpg']),
            status: 'approved'
          },
          {
            seller_id: 1,
            title: 'BharatBenz 2823C',
            category: 'Trucks',
            make_model: 'BharatBenz 2823C',
            year: 2021,
            km: 80000,
            price: 3200000,
            description: 'BharatBenz 2823C tipper with AC and excellent mileage.',
            city: 'Hyderabad',
            area: 'Madhapur',
            seller_contact: '+919876543213',
            images: JSON.stringify(['truck5.jpg', 'truck6.jpg']),
            status: 'approved'
          },
          {
            seller_id: 1,
            title: 'Caterpillar 320D2',
            category: 'Excavator',
            make_model: 'Caterpillar 320D2',
            year: 2019,
            km: 3500,
            price: 4500000,
            description: 'Caterpillar 320D2 excavator in excellent working condition.',
            city: 'Pune',
            area: 'Koregaon Park',
            seller_contact: '+919876543214',
            images: JSON.stringify(['excavator1.jpg', 'excavator2.jpg']),
            status: 'approved'
          }
        ];

        demoListings.forEach(listing => {
          db.run(`
            INSERT INTO listings (
              seller_id, title, category, make_model, year, km, 
              price, description, city, area, seller_contact, images, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            listing.seller_id, listing.title, listing.category, listing.make_model,
            listing.year, listing.km, listing.price, listing.description,
            listing.city, listing.area, listing.seller_contact, listing.images, listing.status
          ]);
        });
        console.log('Demo listings created');
      }
    });

    console.log('Database tables initialized');
  });
}

// Close database connection on process exit
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    process.exit(0);
  });
});
