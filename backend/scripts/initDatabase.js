require('dotenv').config();
const { pool } = require('../config/database');

const initDatabase = async () => {
  try {
    console.log('🚀 Starting database initialization...\n');

    // Create users table
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(20),
        organization VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      );
    `);
    console.log('✅ Users table created\n');

    // Create tenants table
    console.log('Creating tenants table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        tenant_id VARCHAR(100) UNIQUE NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        room VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(255),
        rent_amount DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        move_in_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Tenants table created\n');

    // Create bills table
    console.log('Creating bills table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id SERIAL PRIMARY KEY,
        bill_id VARCHAR(100) UNIQUE NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        tenant_id VARCHAR(100),
        bill_number VARCHAR(100) NOT NULL,
        tenant_name VARCHAR(255) NOT NULL,
        room VARCHAR(100),
        rent_amount DECIMAL(10, 2) DEFAULT 0,
        electricity_amount DECIMAL(10, 2) DEFAULT 0,
        water_amount DECIMAL(10, 2) DEFAULT 0,
        maintenance_amount DECIMAL(10, 2) DEFAULT 0,
        other_charges DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        bill_month VARCHAR(20),
        due_date DATE,
        status VARCHAR(50) DEFAULT 'unpaid',
        payment_date DATE,
        payment_method VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE SET NULL
      );
    `);
    console.log('✅ Bills table created\n');

    // Create password_resets table
    console.log('Creating password_resets table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        reset_code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Password resets table created\n');

    // Create sessions table
    console.log('Creating sessions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(50),
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Sessions table created\n');

    // Create indexes for better performance
    console.log('Creating indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
      CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);
      CREATE INDEX IF NOT EXISTS idx_tenants_tenant_id ON tenants(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
      CREATE INDEX IF NOT EXISTS idx_bills_bill_id ON bills(bill_id);
      CREATE INDEX IF NOT EXISTS idx_bills_tenant_id ON bills(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
      CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    `);
    console.log('✅ Indexes created\n');

    // Create trigger to update updated_at timestamp
    console.log('Creating triggers...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
      CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_bills_updated_at ON bills;
      CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Triggers created\n');

    console.log('🎉 Database initialization completed successfully!\n');
    console.log('Database schema:');
    console.log('  - users (authentication and profiles)');
    console.log('  - tenants (tenant information)');
    console.log('  - bills (billing records)');
    console.log('  - password_resets (password reset codes)');
    console.log('  - sessions (user sessions)');
    console.log('\nYou can now start the server with: npm start');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
};

initDatabase();
