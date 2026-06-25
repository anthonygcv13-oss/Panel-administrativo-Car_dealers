const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Read the database URL from the backend's .env file
const envPath = 'c:/Users/Antoni/Git-proyectos/Car_dealership/.env';
const envContent = fs.readFileSync(envPath, 'utf8');

let connectionString = '';
const lines = envContent.split('\n');
for (const line of lines) {
  if (line.trim().startsWith('DATABASE_URL_NEON=')) {
    connectionString = line.split('DATABASE_URL_NEON=')[1].trim();
    // Remove comments or quotes if present
    connectionString = connectionString.split('#')[0].trim();
    if (connectionString.startsWith('"') || connectionString.startsWith("'")) {
      connectionString = connectionString.slice(1, -1);
    }
  }
}

if (!connectionString) {
  console.error('DATABASE_URL_NEON not found in .env file!');
  process.exit(1);
}

console.log('Connecting to Neon database...');
const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Query user accounts
    console.log('\n--- User Accounts ---');
    const [users] = await sequelize.query('SELECT id_user, first_name, last_name, email, status, id_role FROM user_account');
    console.log(`Found ${users.length} users:`);
    console.log(users);

    // Query vehicle sales
    console.log('\n--- Vehicle Sales ---');
    const [sales] = await sequelize.query('SELECT * FROM vehicle_sale');
    console.log(`Found ${sales.length} sales:`);
    console.log(sales);

    // Query vehicles
    console.log('\n--- Vehicles ---');
    const [vehicles] = await sequelize.query('SELECT id_vehicle, license_plate, year, purchase_price, sale_price, status FROM vehicle');
    console.log(`Found ${vehicles.length} vehicles:`);
    if (vehicles.length > 0) {
      console.log('First 5 vehicles:', vehicles.slice(0, 5));
    }

    // Query brands
    console.log('\n--- Brands ---');
    const [brands] = await sequelize.query('SELECT id_brand, name FROM brand');
    console.log(`Found ${brands.length} brands:`);
    console.log(brands);

    // Query quotes
    console.log('\n--- Quotes ---');
    const [quotes] = await sequelize.query('SELECT * FROM quote');
    console.log(`Found ${quotes.length} quotes:`);
    console.log(quotes);

    // Query installments
    console.log('\n--- Installments ---');
    const [installments] = await sequelize.query('SELECT * FROM installment');
    console.log(`Found ${installments.length} installments:`);
    console.log(installments);

  } catch (error) {
    console.error('Unable to connect or query database:', error);
  } finally {
    await sequelize.close();
  }
}

run();
