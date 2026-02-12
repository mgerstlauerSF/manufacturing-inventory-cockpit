-- ============================================================================
-- Manufacturing Inventory Cockpit - Synthetic Data Generator
-- ============================================================================
-- This script creates the database schema and populates it with realistic
-- synthetic data for the Manufacturing Inventory Cockpit demo.
-- 
-- Prerequisites: 
--   - ACCOUNTADMIN role or equivalent privileges
--   - A warehouse to execute the script
-- ============================================================================

-- Create database and schema
CREATE DATABASE IF NOT EXISTS MANUFACTURING_DEMO;
CREATE SCHEMA IF NOT EXISTS MANUFACTURING_DEMO.INVENTORY;

USE DATABASE MANUFACTURING_DEMO;
USE SCHEMA INVENTORY;

-- ============================================================================
-- 1. PLANTS TABLE - Manufacturing sites worldwide
-- ============================================================================
CREATE OR REPLACE TABLE PLANTS (
    PLANT_ID VARCHAR(10) PRIMARY KEY,
    PLANT_NAME VARCHAR(100),
    COUNTRY VARCHAR(50),
    REGION VARCHAR(30),
    LATITUDE FLOAT,
    LONGITUDE FLOAT,
    SPECIALIZATION VARCHAR(50),
    CAPACITY_UNITS INT,
    OPERATIONAL_STATUS VARCHAR(20)
);

INSERT INTO PLANTS VALUES
    ('PLT001', 'Berlin Manufacturing Hub', 'Germany', 'Europe', 52.5200, 13.4050, 'Final Assembly', 500, 'Active'),
    ('PLT002', 'Paris Components Center', 'France', 'Europe', 48.8566, 2.3522, 'Components', 350, 'Active'),
    ('PLT003', 'Milan Precision Works', 'Italy', 'Europe', 45.4642, 9.1900, 'Precision Parts', 280, 'Active'),
    ('PLT004', 'Madrid Assembly Plant', 'Spain', 'Europe', 40.4168, -3.7038, 'Sub-Assembly', 420, 'Active'),
    ('PLT005', 'Warsaw Electronics', 'Poland', 'Europe', 52.2297, 21.0122, 'Electronics', 300, 'Active'),
    ('PLT006', 'Vienna Systems', 'Austria', 'Europe', 48.2082, 16.3738, 'Control Systems', 200, 'Active'),
    ('PLT007', 'Prague Mechanics', 'Czech Republic', 'Europe', 50.0755, 14.4378, 'Mechanical Parts', 380, 'Active'),
    ('PLT008', 'Amsterdam Logistics Hub', 'Netherlands', 'Europe', 52.3676, 4.9041, 'Distribution', 150, 'Active'),
    ('PLT009', 'Brussels Integration', 'Belgium', 'Europe', 50.8503, 4.3517, 'System Integration', 250, 'Active'),
    ('PLT010', 'Stockholm Innovation', 'Sweden', 'Europe', 59.3293, 18.0686, 'R&D Production', 180, 'Active'),
    ('PLT011', 'Chicago Manufacturing', 'USA', 'Americas', 41.8781, -87.6298, 'Final Assembly', 600, 'Active'),
    ('PLT012', 'Detroit Components', 'USA', 'Americas', 42.3314, -83.0458, 'Heavy Components', 450, 'Active'),
    ('PLT013', 'Toronto Systems', 'Canada', 'Americas', 43.6532, -79.3832, 'Electronics', 320, 'Active'),
    ('PLT014', 'Mexico City Assembly', 'Mexico', 'Americas', 19.4326, -99.1332, 'Sub-Assembly', 400, 'Active'),
    ('PLT015', 'Sao Paulo Manufacturing', 'Brazil', 'Americas', -23.5505, -46.6333, 'Regional Assembly', 350, 'Active'),
    ('PLT016', 'Buenos Aires Parts', 'Argentina', 'Americas', -34.6037, -58.3816, 'Components', 200, 'Active'),
    ('PLT017', 'Santiago Distribution', 'Chile', 'Americas', -33.4489, -70.6693, 'Distribution', 150, 'Active'),
    ('PLT018', 'Shanghai Assembly', 'China', 'Asia-Pacific', 31.2304, 121.4737, 'Final Assembly', 800, 'Active'),
    ('PLT019', 'Shenzhen Electronics', 'China', 'Asia-Pacific', 22.5431, 114.0579, 'Electronics', 650, 'Active'),
    ('PLT020', 'Tokyo Precision', 'Japan', 'Asia-Pacific', 35.6762, 139.6503, 'Precision Parts', 400, 'Active'),
    ('PLT021', 'Seoul Technology', 'South Korea', 'Asia-Pacific', 37.5665, 126.9780, 'High-Tech Components', 380, 'Active'),
    ('PLT022', 'Singapore Hub', 'Singapore', 'Asia-Pacific', 1.3521, 103.8198, 'Regional Distribution', 300, 'Active'),
    ('PLT023', 'Mumbai Manufacturing', 'India', 'Asia-Pacific', 19.0760, 72.8777, 'Assembly', 500, 'Active'),
    ('PLT024', 'Bangkok Assembly', 'Thailand', 'Asia-Pacific', 13.7563, 100.5018, 'Sub-Assembly', 350, 'Active'),
    ('PLT025', 'Sydney Operations', 'Australia', 'Asia-Pacific', -33.8688, 151.2093, 'Regional Assembly', 250, 'Active'),
    ('PLT026', 'Dubai Logistics', 'UAE', 'MEA', 25.2048, 55.2708, 'Distribution Hub', 200, 'Active'),
    ('PLT027', 'Johannesburg Assembly', 'South Africa', 'MEA', -26.2041, 28.0473, 'Regional Assembly', 280, 'Active'),
    ('PLT028', 'Cairo Manufacturing', 'Egypt', 'MEA', 30.0444, 31.2357, 'Components', 220, 'Active'),
    ('PLT029', 'Casablanca Parts', 'Morocco', 'MEA', 33.5731, -7.5898, 'Sub-Assembly', 180, 'Active'),
    ('PLT030', 'Istanbul Integration', 'Turkey', 'MEA', 41.0082, 28.9784, 'System Integration', 320, 'Active');

-- ============================================================================
-- 2. BOM TABLE - Bill of Materials / Component Master
-- ============================================================================
CREATE OR REPLACE TABLE BOM (
    SKU_CODE VARCHAR(20) PRIMARY KEY,
    SKU_NAME VARCHAR(100),
    CATEGORY VARCHAR(50),
    VEHICLE_TYPE VARCHAR(50),
    CRITICALITY VARCHAR(20),
    UNIT_COST_EUR FLOAT,
    LEAD_TIME_DAYS INT,
    QUANTITY_PER_VEHICLE FLOAT,
    SUPPLIER_COUNT INT,
    WEIGHT_KG FLOAT
);

INSERT INTO BOM VALUES
    ('SKU-001', 'Traction Motor Assembly', 'Propulsion', 'High-Speed Train', 'Critical', 125000, 90, 4, 2, 850),
    ('SKU-002', 'Power Electronics Module', 'Electrical', 'High-Speed Train', 'Critical', 85000, 75, 2, 3, 320),
    ('SKU-003', 'Bogie Frame Complete', 'Running Gear', 'High-Speed Train', 'Critical', 180000, 120, 4, 1, 2500),
    ('SKU-004', 'Pantograph System', 'Electrical', 'High-Speed Train', 'Critical', 45000, 60, 2, 2, 180),
    ('SKU-005', 'ATP/ATC Control Unit', 'Signaling', 'All Types', 'Critical', 95000, 100, 1, 2, 45),
    ('SKU-006', 'HVAC System Complete', 'Comfort', 'Passenger Vehicles', 'High', 32000, 45, 1, 4, 250),
    ('SKU-007', 'Passenger Door Assembly', 'Body', 'Passenger Vehicles', 'High', 18000, 35, 8, 5, 120),
    ('SKU-008', 'Driver Cab Console', 'Interior', 'All Types', 'High', 55000, 50, 2, 3, 280),
    ('SKU-009', 'Wheel Set Machined', 'Running Gear', 'All Types', 'Critical', 28000, 40, 8, 4, 950),
    ('SKU-010', 'Brake Disc Assembly', 'Braking', 'All Types', 'Critical', 12000, 30, 16, 6, 85),
    ('SKU-011', 'Transformer Unit', 'Electrical', 'Electric Trains', 'Critical', 145000, 85, 1, 2, 4500),
    ('SKU-012', 'Battery Pack 750V', 'Energy Storage', 'Hybrid/Battery', 'Critical', 220000, 110, 2, 2, 1800),
    ('SKU-013', 'Coupling System', 'Mechanical', 'All Types', 'High', 35000, 55, 2, 3, 450),
    ('SKU-014', 'LED Lighting Module', 'Interior', 'Passenger Vehicles', 'Medium', 4500, 20, 24, 8, 15),
    ('SKU-015', 'Seat Assembly Premium', 'Interior', 'Passenger Vehicles', 'Medium', 2800, 25, 72, 6, 35),
    ('SKU-016', 'Window Glass Laminated', 'Body', 'Passenger Vehicles', 'Medium', 1200, 15, 32, 7, 25),
    ('SKU-017', 'Gangway Bellows', 'Body', 'Passenger Vehicles', 'High', 8500, 40, 4, 4, 95),
    ('SKU-018', 'Fire Suppression System', 'Safety', 'All Types', 'Critical', 15000, 35, 2, 5, 75),
    ('SKU-019', 'Communication Antenna', 'Electronics', 'All Types', 'High', 6500, 25, 4, 6, 12),
    ('SKU-020', 'Pneumatic Compressor', 'Pneumatic', 'All Types', 'High', 22000, 50, 2, 3, 185),
    ('SKU-021', 'Axle Bearing Assembly', 'Running Gear', 'All Types', 'Critical', 8500, 35, 16, 4, 28),
    ('SKU-022', 'Crash Energy Absorber', 'Safety', 'All Types', 'Critical', 45000, 65, 2, 2, 380),
    ('SKU-023', 'Onboard Computer', 'Electronics', 'All Types', 'Critical', 38000, 45, 2, 3, 18),
    ('SKU-024', 'Speedometer Sensor', 'Instrumentation', 'All Types', 'High', 2200, 20, 8, 7, 2),
    ('SKU-025', 'Emergency Brake Valve', 'Braking', 'All Types', 'Critical', 5500, 25, 4, 5, 12),
    ('SKU-026', 'Toilet Module Complete', 'Interior', 'Passenger Vehicles', 'Medium', 28000, 45, 2, 3, 320),
    ('SKU-027', 'Windshield Wiper System', 'Driver Cab', 'All Types', 'Medium', 3500, 20, 2, 6, 18),
    ('SKU-028', 'Horn Assembly', 'Safety', 'All Types', 'High', 1800, 15, 2, 8, 8),
    ('SKU-029', 'Destination Display', 'Electronics', 'Passenger Vehicles', 'Medium', 4200, 25, 4, 5, 12),
    ('SKU-030', 'Suspension Spring Set', 'Running Gear', 'All Types', 'High', 6800, 30, 8, 4, 65);

-- ============================================================================
-- 3. PRODUCTION_PLAN TABLE - Monthly production schedule
-- ============================================================================
CREATE OR REPLACE TABLE PRODUCTION_PLAN (
    PLAN_ID VARCHAR(20) PRIMARY KEY,
    PLANT_ID VARCHAR(10),
    VEHICLE_TYPE VARCHAR(50),
    PLANNED_MONTH DATE,
    PLANNED_VEHICLES INT,
    ACTUAL_VEHICLES INT,
    STATUS VARCHAR(20)
);

-- Generate production plan for 2025-2026
INSERT INTO PRODUCTION_PLAN
SELECT 
    'PP-' || ROW_NUMBER() OVER (ORDER BY p.PLANT_ID, m.month_date) AS PLAN_ID,
    p.PLANT_ID,
    CASE MOD(ROW_NUMBER() OVER (ORDER BY p.PLANT_ID), 4)
        WHEN 0 THEN 'High-Speed Train'
        WHEN 1 THEN 'Metro/Subway'
        WHEN 2 THEN 'Regional Train'
        ELSE 'Light Rail'
    END AS VEHICLE_TYPE,
    m.month_date AS PLANNED_MONTH,
    CASE 
        WHEN p.REGION = 'Europe' THEN UNIFORM(15, 35, RANDOM())
        WHEN p.REGION = 'Asia-Pacific' THEN UNIFORM(20, 50, RANDOM())
        WHEN p.REGION = 'Americas' THEN UNIFORM(12, 30, RANDOM())
        ELSE UNIFORM(8, 20, RANDOM())
    END AS PLANNED_VEHICLES,
    NULL AS ACTUAL_VEHICLES,
    'Planned' AS STATUS
FROM PLANTS p
CROSS JOIN (
    SELECT DATEADD(MONTH, SEQ4(), '2025-01-01')::DATE AS month_date
    FROM TABLE(GENERATOR(ROWCOUNT => 24))
) m
WHERE p.SPECIALIZATION IN ('Final Assembly', 'Regional Assembly', 'Assembly');

-- ============================================================================
-- 4. INVENTORY TABLE - Current inventory positions
-- ============================================================================
CREATE OR REPLACE TABLE INVENTORY (
    INVENTORY_ID VARCHAR(20) PRIMARY KEY,
    PLANT_ID VARCHAR(10),
    SKU_CODE VARCHAR(20),
    CURRENT_STOCK INT,
    REORDER_POINT INT,
    MAX_STOCK INT,
    INVENTORY_VALUE_EUR FLOAT,
    LAST_MOVEMENT_DATE DATE,
    STORAGE_LOCATION VARCHAR(50)
);

-- Generate inventory records
INSERT INTO INVENTORY
SELECT 
    'INV-' || ROW_NUMBER() OVER (ORDER BY p.PLANT_ID, b.SKU_CODE) AS INVENTORY_ID,
    p.PLANT_ID,
    b.SKU_CODE,
    CASE 
        WHEN b.CRITICALITY = 'Critical' THEN UNIFORM(5, 25, RANDOM())
        WHEN b.CRITICALITY = 'High' THEN UNIFORM(10, 50, RANDOM())
        ELSE UNIFORM(20, 100, RANDOM())
    END AS CURRENT_STOCK,
    CASE 
        WHEN b.CRITICALITY = 'Critical' THEN UNIFORM(8, 15, RANDOM())
        WHEN b.CRITICALITY = 'High' THEN UNIFORM(15, 30, RANDOM())
        ELSE UNIFORM(25, 50, RANDOM())
    END AS REORDER_POINT,
    CASE 
        WHEN b.CRITICALITY = 'Critical' THEN UNIFORM(30, 50, RANDOM())
        WHEN b.CRITICALITY = 'High' THEN UNIFORM(60, 100, RANDOM())
        ELSE UNIFORM(100, 200, RANDOM())
    END AS MAX_STOCK,
    b.UNIT_COST_EUR * UNIFORM(5, 25, RANDOM()) AS INVENTORY_VALUE_EUR,
    DATEADD(DAY, -UNIFORM(1, 90, RANDOM()), CURRENT_DATE()) AS LAST_MOVEMENT_DATE,
    'WH-' || UNIFORM(1, 5, RANDOM()) || '-RACK-' || UNIFORM(1, 20, RANDOM()) AS STORAGE_LOCATION
FROM PLANTS p
CROSS JOIN BOM b
WHERE UNIFORM(0, 100, RANDOM()) > 30;

-- ============================================================================
-- 5. FINANCIALS TABLE - Financial aggregates per plant
-- ============================================================================
CREATE OR REPLACE TABLE FINANCIALS (
    FINANCIAL_ID VARCHAR(20) PRIMARY KEY,
    PLANT_ID VARCHAR(10),
    FISCAL_YEAR INT,
    FISCAL_MONTH INT,
    HARD_INVENTORY_VALUE_EUR FLOAT,
    SOFT_INVENTORY_VALUE_EUR FLOAT,
    CASH_TIED_EUR FLOAT,
    INVENTORY_TURNS FLOAT,
    CARRYING_COST_EUR FLOAT
);

INSERT INTO FINANCIALS
SELECT 
    'FIN-' || ROW_NUMBER() OVER (ORDER BY p.PLANT_ID, m.month_num) AS FINANCIAL_ID,
    p.PLANT_ID,
    2026 AS FISCAL_YEAR,
    m.month_num AS FISCAL_MONTH,
    CASE 
        WHEN p.REGION = 'Europe' THEN UNIFORM(50000000, 150000000, RANDOM())
        WHEN p.REGION = 'Asia-Pacific' THEN UNIFORM(80000000, 200000000, RANDOM())
        WHEN p.REGION = 'Americas' THEN UNIFORM(40000000, 120000000, RANDOM())
        ELSE UNIFORM(20000000, 60000000, RANDOM())
    END AS HARD_INVENTORY_VALUE_EUR,
    UNIFORM(5000000, 25000000, RANDOM()) AS SOFT_INVENTORY_VALUE_EUR,
    UNIFORM(30000000, 100000000, RANDOM()) AS CASH_TIED_EUR,
    UNIFORM(3.5, 8.5, RANDOM())::DECIMAL(4,2) AS INVENTORY_TURNS,
    UNIFORM(2000000, 15000000, RANDOM()) AS CARRYING_COST_EUR
FROM PLANTS p
CROSS JOIN (
    SELECT SEQ4() + 1 AS month_num
    FROM TABLE(GENERATOR(ROWCOUNT => 12))
) m;

-- ============================================================================
-- 6. PROVIDERS_3PL TABLE - Logistics service providers
-- ============================================================================
CREATE OR REPLACE TABLE PROVIDERS_3PL (
    PROVIDER_ID VARCHAR(10) PRIMARY KEY,
    PROVIDER_NAME VARCHAR(100),
    REGION VARCHAR(30),
    SERVICE_TYPE VARCHAR(50),
    CONTRACT_VALUE_EUR FLOAT,
    PERFORMANCE_SCORE FLOAT,
    PLANTS_SERVED INT,
    CONTRACT_EXPIRY DATE
);

INSERT INTO PROVIDERS_3PL VALUES
    ('3PL001', 'EuroLogistics GmbH', 'Europe', 'Full Service', 45000000, 94.5, 12, '2027-06-30'),
    ('3PL002', 'TransEuropa SA', 'Europe', 'Transportation', 28000000, 91.2, 8, '2026-12-31'),
    ('3PL003', 'Nordic Freight AB', 'Europe', 'Specialized Cargo', 18000000, 96.8, 5, '2027-03-31'),
    ('3PL004', 'Continental Logistics', 'Americas', 'Full Service', 52000000, 89.3, 10, '2027-09-30'),
    ('3PL005', 'AmeriFreight Inc', 'Americas', 'Transportation', 32000000, 92.1, 7, '2026-11-30'),
    ('3PL006', 'Latino Express', 'Americas', 'Regional Delivery', 15000000, 87.5, 5, '2027-01-31'),
    ('3PL007', 'Asia Pacific Logistics', 'Asia-Pacific', 'Full Service', 68000000, 93.7, 14, '2027-08-31'),
    ('3PL008', 'Dragon Freight Ltd', 'Asia-Pacific', 'Sea Freight', 42000000, 90.8, 8, '2027-04-30'),
    ('3PL009', 'Pacific Express', 'Asia-Pacific', 'Air Freight', 25000000, 95.2, 6, '2026-10-31'),
    ('3PL010', 'MEA Global Transport', 'MEA', 'Full Service', 22000000, 88.9, 6, '2027-05-31'),
    ('3PL011', 'Desert Logistics', 'MEA', 'Regional Delivery', 12000000, 86.4, 4, '2026-09-30'),
    ('3PL012', 'African Rail Freight', 'MEA', 'Rail Transport', 8000000, 84.7, 3, '2027-02-28');

-- ============================================================================
-- 7. SAVED_SCENARIOS TABLE - User-saved simulation scenarios
-- ============================================================================
CREATE OR REPLACE TABLE SAVED_SCENARIOS (
    SCENARIO_ID VARCHAR(30) PRIMARY KEY,
    SCENARIO_NAME VARCHAR(100),
    CREATED_BY VARCHAR(50),
    CREATED_AT TIMESTAMP_NTZ,
    PRODUCTION_DELTA_PCT FLOAT,
    LEAD_TIME_VARIANCE_PCT FLOAT,
    SAFETY_STOCK_ADJ_PCT FLOAT,
    CASH_IMPACT_EUR FLOAT,
    NOTES TEXT
);

-- Insert sample scenarios
INSERT INTO SAVED_SCENARIOS VALUES
    ('SCN-20260115-001', 'Baseline 2026', 'System', '2026-01-15 09:00:00', 0, 0, 0, 0, 'Baseline scenario for 2026 planning'),
    ('SCN-20260115-002', 'Growth Scenario +20%', 'Director', '2026-01-15 14:30:00', 20, 10, 15, 45000000, 'Optimistic growth scenario with increased safety stock'),
    ('SCN-20260116-001', 'Supply Chain Disruption', 'Director', '2026-01-16 11:00:00', -10, 50, 30, 78000000, 'Scenario modeling potential supply chain disruptions');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify data counts
SELECT 'PLANTS' AS TABLE_NAME, COUNT(*) AS ROW_COUNT FROM PLANTS
UNION ALL SELECT 'BOM', COUNT(*) FROM BOM
UNION ALL SELECT 'PRODUCTION_PLAN', COUNT(*) FROM PRODUCTION_PLAN
UNION ALL SELECT 'INVENTORY', COUNT(*) FROM INVENTORY
UNION ALL SELECT 'FINANCIALS', COUNT(*) FROM FINANCIALS
UNION ALL SELECT 'PROVIDERS_3PL', COUNT(*) FROM PROVIDERS_3PL
UNION ALL SELECT 'SAVED_SCENARIOS', COUNT(*) FROM SAVED_SCENARIOS;

-- Sample data preview
SELECT * FROM PLANTS LIMIT 5;
SELECT * FROM BOM WHERE CRITICALITY = 'Critical' LIMIT 5;
SELECT * FROM INVENTORY LIMIT 5;

COMMENT ON DATABASE MANUFACTURING_DEMO IS 'Demo database for Manufacturing Inventory Cockpit - Synthetic data for demonstration purposes';
