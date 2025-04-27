/**
 * Database migration system for JamesCRM
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Migration model schema
const MigrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

// Create or get the Migration model
const Migration = mongoose.models.Migration || mongoose.model('Migration', MigrationSchema);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jamescrm', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Get all migration files
const getMigrationFiles = () => {
  const migrationsDir = path.join(__dirname, 'scripts');
  
  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  // Get all .js files in the migrations directory
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort(); // Sort to ensure migrations run in order
  
  return files.map(file => ({
    name: file,
    path: path.join(migrationsDir, file)
  }));
};

// Get applied migrations from database
const getAppliedMigrations = async () => {
  const migrations = await Migration.find().sort({ name: 1 });
  return migrations.map(migration => migration.name);
};

// Apply pending migrations
const applyMigrations = async () => {
  // Get all migration files
  const migrationFiles = getMigrationFiles();
  
  // Get applied migrations
  const appliedMigrations = await getAppliedMigrations();
  
  // Filter out already applied migrations
  const pendingMigrations = migrationFiles.filter(
    migration => !appliedMigrations.includes(migration.name)
  );
  
  if (pendingMigrations.length === 0) {
    console.log('No pending migrations to apply');
    return;
  }
  
  console.log(`Found ${pendingMigrations.length} pending migrations`);
  
  // Apply each pending migration
  for (const migration of pendingMigrations) {
    try {
      console.log(`Applying migration: ${migration.name}`);
      
      // Import and run the migration
      const migrationModule = require(migration.path);
      await migrationModule.up();
      
      // Record the migration as applied
      await Migration.create({ name: migration.name });
      
      console.log(`Migration applied: ${migration.name}`);
    } catch (error) {
      console.error(`Error applying migration ${migration.name}:`, error);
      process.exit(1);
    }
  }
  
  console.log('All migrations applied successfully');
};

// Create a new migration file
const createMigration = (name) => {
  if (!name) {
    console.error('Migration name is required');
    process.exit(1);
  }
  
  // Format the migration name
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const fileName = `${timestamp}_${name.toLowerCase().replace(/\s+/g, '_')}.js`;
  
  const migrationsDir = path.join(__dirname, 'scripts');
  
  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  const filePath = path.join(migrationsDir, fileName);
  
  // Create migration file template
  const template = `/**
 * Migration: ${name}
 * Created at: ${new Date().toISOString()}
 */
const mongoose = require('mongoose');

module.exports = {
  /**
   * Apply the migration
   */
  up: async () => {
    // Write your migration code here
    // Example:
    // const db = mongoose.connection;
    // await db.collection('users').updateMany({}, { $set: { newField: 'defaultValue' } });
  },

  /**
   * Revert the migration
   */
  down: async () => {
    // Write code to revert the migration here
    // Example:
    // const db = mongoose.connection;
    // await db.collection('users').updateMany({}, { $unset: { newField: '' } });
  }
};
`;

  fs.writeFileSync(filePath, template);
  console.log(`Migration created: ${fileName}`);
};

// Rollback the last applied migration
const rollbackMigration = async () => {
  // Get the last applied migration
  const lastMigration = await Migration.findOne().sort({ appliedAt: -1 });
  
  if (!lastMigration) {
    console.log('No migrations to rollback');
    return;
  }
  
  try {
    console.log(`Rolling back migration: ${lastMigration.name}`);
    
    // Import and run the down method
    const migrationPath = path.join(__dirname, 'scripts', lastMigration.name);
    const migrationModule = require(migrationPath);
    
    if (typeof migrationModule.down !== 'function') {
      throw new Error('Migration does not have a down method');
    }
    
    await migrationModule.down();
    
    // Remove the migration record
    await Migration.deleteOne({ _id: lastMigration._id });
    
    console.log(`Migration rolled back: ${lastMigration.name}`);
  } catch (error) {
    console.error(`Error rolling back migration ${lastMigration.name}:`, error);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      const migrationName = process.argv[3];
      createMigration(migrationName);
      break;
      
    case 'up':
      await applyMigrations();
      break;
      
    case 'down':
      await rollbackMigration();
      break;
      
    case 'status':
      const migrationFiles = getMigrationFiles();
      const appliedMigrations = await getAppliedMigrations();
      
      console.log('Migration Status:');
      migrationFiles.forEach(migration => {
        const status = appliedMigrations.includes(migration.name) ? 'Applied' : 'Pending';
        console.log(`${migration.name}: ${status}`);
      });
      break;
      
    default:
      console.log(`
Migration Commands:
  create [name]  Create a new migration
  up            Apply pending migrations
  down          Rollback the last migration
  status        Show migration status
      `);
  }
  
  // Close the database connection
  await mongoose.connection.close();
};

// Run the main function
main().catch(error => {
  console.error('Migration error:', error);
  process.exit(1);
});
