-- JamesCRM Database Schema

-- Create Users Table
CREATE TABLE IF NOT EXISTS "Users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  "role" VARCHAR(50) NOT NULL DEFAULT 'user',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Companies Table
CREATE TABLE IF NOT EXISTS "Companies" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "industry" VARCHAR(255),
  "website" VARCHAR(255),
  "phone" VARCHAR(50),
  "address" TEXT,
  "city" VARCHAR(100),
  "state" VARCHAR(100),
  "postalCode" VARCHAR(20),
  "country" VARCHAR(100),
  "notes" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Contacts Table
CREATE TABLE IF NOT EXISTS "Contacts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "phone" VARCHAR(50),
  "jobTitle" VARCHAR(255),
  "notes" TEXT,
  "CompanyId" UUID REFERENCES "Companies"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Deals Table
CREATE TABLE IF NOT EXISTS "Deals" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "amount" DECIMAL(10, 2),
  "stage" VARCHAR(50) NOT NULL DEFAULT 'lead',
  "closeDate" TIMESTAMP WITH TIME ZONE,
  "probability" INTEGER,
  "notes" TEXT,
  "CompanyId" UUID REFERENCES "Companies"("id") ON DELETE SET NULL,
  "ContactId" UUID REFERENCES "Contacts"("id") ON DELETE SET NULL,
  "ownerId" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Notes Table
CREATE TABLE IF NOT EXISTS "Notes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "content" TEXT NOT NULL,
  "CompanyId" UUID REFERENCES "Companies"("id") ON DELETE CASCADE,
  "ContactId" UUID REFERENCES "Contacts"("id") ON DELETE CASCADE,
  "DealId" UUID REFERENCES "Deals"("id") ON DELETE CASCADE,
  "UserId" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Files Table
CREATE TABLE IF NOT EXISTS "Files" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "path" VARCHAR(255) NOT NULL,
  "mimeType" VARCHAR(100) NOT NULL,
  "size" INTEGER NOT NULL,
  "CompanyId" UUID REFERENCES "Companies"("id") ON DELETE CASCADE,
  "ContactId" UUID REFERENCES "Contacts"("id") ON DELETE CASCADE,
  "DealId" UUID REFERENCES "Deals"("id") ON DELETE CASCADE,
  "UserId" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Activities Table
CREATE TABLE IF NOT EXISTS "Activities" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" VARCHAR(50) NOT NULL,
  "subject" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "dueDate" TIMESTAMP WITH TIME ZONE,
  "completed" BOOLEAN NOT NULL DEFAULT FALSE,
  "CompanyId" UUID REFERENCES "Companies"("id") ON DELETE CASCADE,
  "ContactId" UUID REFERENCES "Contacts"("id") ON DELETE CASCADE,
  "DealId" UUID REFERENCES "Deals"("id") ON DELETE CASCADE,
  "UserId" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS "idx_contacts_company" ON "Contacts"("CompanyId");
CREATE INDEX IF NOT EXISTS "idx_deals_company" ON "Deals"("CompanyId");
CREATE INDEX IF NOT EXISTS "idx_deals_contact" ON "Deals"("ContactId");
CREATE INDEX IF NOT EXISTS "idx_deals_owner" ON "Deals"("ownerId");
CREATE INDEX IF NOT EXISTS "idx_notes_company" ON "Notes"("CompanyId");
CREATE INDEX IF NOT EXISTS "idx_notes_contact" ON "Notes"("ContactId");
CREATE INDEX IF NOT EXISTS "idx_notes_deal" ON "Notes"("DealId");
CREATE INDEX IF NOT EXISTS "idx_files_company" ON "Files"("CompanyId");
CREATE INDEX IF NOT EXISTS "idx_files_contact" ON "Files"("ContactId");
CREATE INDEX IF NOT EXISTS "idx_files_deal" ON "Files"("DealId");
CREATE INDEX IF NOT EXISTS "idx_activities_company" ON "Activities"("CompanyId");
CREATE INDEX IF NOT EXISTS "idx_activities_contact" ON "Activities"("ContactId");
CREATE INDEX IF NOT EXISTS "idx_activities_deal" ON "Activities"("DealId");
