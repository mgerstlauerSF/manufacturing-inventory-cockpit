# Database Setup

This folder contains SQL scripts to set up the Snowflake database for the Manufacturing Inventory Cockpit.

## Prerequisites

- Snowflake account with ACCOUNTADMIN role or equivalent privileges
- A warehouse to execute the scripts

## Setup Instructions

1. Connect to your Snowflake account
2. Run `create_synthetic_data.sql` to create the database, schema, and tables with sample data

```sql
-- Run in Snowflake worksheet or via SnowSQL
USE ROLE ACCOUNTADMIN;
USE WAREHOUSE COMPUTE_WH;

-- Execute the script
!source create_synthetic_data.sql
```

## Database Schema

The script creates the following objects:

- **Database**: `MANUFACTURING_DEMO`
- **Schema**: `INVENTORY`

### Tables

| Table | Description |
|-------|-------------|
| `PLANTS` | Manufacturing sites worldwide (30 plants across 4 regions) |
| `BOM` | Bill of Materials - Component master data (30 SKUs) |
| `PRODUCTION_PLAN` | Monthly production schedule for 2025-2026 |
| `INVENTORY` | Current inventory positions per plant/SKU |
| `FINANCIALS` | Financial aggregates per plant per month |
| `PROVIDERS_3PL` | Logistics service providers (12 providers) |
| `SAVED_SCENARIOS` | User-saved simulation scenarios |

## Data Overview

- **Regions**: Europe, Americas, Asia-Pacific, MEA
- **Plants**: 30 manufacturing facilities
- **SKUs**: 30 components ranging from critical (Traction Motors) to medium priority (LED Lighting)
- **3PL Providers**: 12 logistics partners across all regions
