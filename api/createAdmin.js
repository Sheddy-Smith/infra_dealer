import { db } from './config/database.js';

// Wait for database initialization
setTimeout(() => {
  createAdminUser();
}, 2000);

// Create admin user
const createAdminUser = () => {
  // First, check what columns exist
  db.all("PRAGMA table_info(users)", [], (err, columns) => {
    if (err) {
      console.error('Error checking table:', err.message);
      process.exit(1);
    }
    
    const columnNames = columns.map(col => col.name);
    console.log('Available columns:', columnNames.join(', '));
    
    // Build INSERT query based on available columns
    let insertColumns = ['phone', 'name', 'email', 'role'];
    let insertValues = ['9999999999', 'Admin', 'admin@infradealer.com', 'admin'];
    let placeholders = ['?', '?', '?', '?'];
    
    if (columnNames.includes('badge')) {
      insertColumns.push('badge');
      insertValues.push('admin');
      placeholders.push('?');
    }
    
    if (columnNames.includes('created_at')) {
      insertColumns.push('created_at');
      placeholders.push("datetime('now')");
    }
    
    const query = `INSERT OR REPLACE INTO users (${insertColumns.join(', ')}) 
                   VALUES (${placeholders.join(', ')})`;
    
    db.run(query, insertValues, function(err) {
      if (err) {
        console.error('❌ Error creating admin user:', err.message);
      } else {
        console.log('✅ Admin user created/updated successfully!');
        console.log('📱 Phone: 9999999999');
        console.log('👤 Role: admin');
        console.log('');
        console.log('⚠️  Note: Set password during first login via OTP');
      }
      db.close();
      process.exit(0);
    });
  });
};
