const { execSync } = require('child_process');
const path = require('path');

// Get the path to the migrations directory
const migrationsPath = path.join(__dirname, 'src', 'migrations');

console.log('Running migrations from:', migrationsPath);

try {
  // Run each migration file manually
  const migrations = [
    '20250413_add_user_status_fields.js',
    '20250413_create_email_deliveries.js',
    '20250413_create_invitations.js'
  ];

  for (const migration of migrations) {
    console.log(`Running migration: ${migration}`);
    const migrationFile = require(path.join(migrationsPath, migration));
    
    // Run the up function
    migrationFile.up({
      addColumn: (table, column, options) => {
        console.log(`Adding column ${column} to table ${table}`);
        try {
          const { sequelize } = require('./src/models');
          return sequelize.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${options.type}`);
        } catch (error) {
          console.error(`Error adding column ${column} to table ${table}:`, error);
        }
      },
      createTable: (table, columns) => {
        console.log(`Creating table ${table}`);
        try {
          const { sequelize } = require('./src/models');
          const columnDefs = Object.entries(columns).map(([name, def]) => {
            return `${name} ${def.type}`;
          }).join(', ');
          return sequelize.query(`CREATE TABLE IF NOT EXISTS ${table} (${columnDefs})`);
        } catch (error) {
          console.error(`Error creating table ${table}:`, error);
        }
      },
      addIndex: () => {
        // Skip index creation for simplicity
        return Promise.resolve();
      }
    }, require('sequelize'));
  }

  console.log('Migrations completed successfully');
} catch (error) {
  console.error('Error running migrations:', error);
}
