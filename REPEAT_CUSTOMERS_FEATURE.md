# Repeat Customer Detection via CSV Upload - Feature Documentation

## 🎯 Overview

This feature enables administrators to upload order CSV files and automatically detect, analyze, and manage repeat customers. The system groups orders by phone number to identify customer purchase patterns and segment them into new vs. repeat customers.

## 📋 Feature Components

### 1. **Backend Components**

#### Database Schema (Prisma)
- **CSVUpload**: Tracks all CSV uploads with metadata
  - `id`: Unique upload identifier
  - `fileName`: Name of uploaded file
  - `fileSize`: Size of uploaded file
  - `totalRows`: Number of rows processed
  - `status`: PROCESSING, SUCCESS, or FAILED
  - `uploadedAt`: Upload timestamp
  - `processedAt`: When processing completed

- **CustomerAnalysis**: Stores aggregated customer data
  - `uploadId`: Reference to upload
  - `customerPhone`: Unique customer identifier (normalized)
  - `totalOrders`: Count of orders for this customer
  - `customerType`: "New" or "Repeat"
  - `productsBought`: JSON array of product names
  - `orderIds`: JSON array of order IDs
  - `firstOrderDate`: Date of first order
  - `lastOrderDate`: Date of latest order
  - `totalSpent`: Total revenue from customer

- **CSVOrderRecord**: Raw order records from CSV
  - Stores individual order data for detailed views
  - Maintains historical record of CSV data

#### Backend Service: `/backend/src/services/customer-analysis.js`

**Key Functions:**

```javascript
// CSV Parsing & Validation
parseCSV(csvContent)
- Validates required columns
- Handles quoted fields with commas
- Returns array of validated records

// Data Processing
groupOrdersByCustomer(csvRecords)
- Groups records by normalized phone number
- Calculates customer metrics
- Determines customer type (New vs Repeat)
- Returns customer summary objects

// Database Operations
processCSVUpload(csvContent, uploadId, shopId, compareWithPrevious)
- Main entry point for CSV processing
- Handles errors gracefully
- Updates upload status

// Query & Analysis
getCustomerAnalysis(uploadId, filters)
- Retrieves customers with filtering
- Supports sorting by: total_orders, total_spent, last_order_date
- Handles search by phone and product

getCustomerDetail(uploadId, customerPhone)
- Returns full customer profile
- Includes complete order history
- Lists all products purchased

getUploadStats(uploadId)
- Calculates overview metrics
- New customers count
- Repeat customers count
- Total orders and revenue
```

#### API Routes: `/backend/src/routes/api.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/customers/upload-csv` | Upload and process CSV file |
| GET | `/api/customers/upload-status/:uploadId` | Check upload processing status |
| GET | `/api/customers/uploads` | List all historical uploads |
| GET | `/api/customers/stats/:uploadId` | Get overview statistics |
| GET | `/api/customers/analysis/:uploadId` | Get customer list with filters |
| GET | `/api/customers/detail/:uploadId/:customerPhone` | Get single customer details |
| GET | `/api/customers/export/:uploadId` | Export customer data (CSV/JSON) |

---

### 2. **Frontend Components**

#### Page: `/src/pages/RepeatCustomers.js`

**Sections:**

**A. Upload History Table**
- Lists all previous CSV uploads
- Shows: File name, status, row count, upload date
- Quick action buttons to view upload details

**B. Upload Modal**
- Required CSV column validation
- Two input methods:
  - Paste CSV content directly
  - Upload CSV file
- Option to compare with previous uploads
- Guides user on required format

**C. Overview Statistics (KPI Cards)**
- Total Customers
- New Customers
- Repeat Customers
- Total Orders
- Total Revenue

**D. Customer List Table**
| Column | Description |
|--------|-------------|
| Phone | Customer phone number (normalized) |
| Type | Badge: "New" or "Repeat" |
| Orders | Total order count |
| Products | Preview of purchased products |
| Total Spent | Revenue from customer |
| First Order | Date of first purchase |
| Last Order | Date of latest purchase |
| Actions | "Details" button |

**E. Filter & Search Interface**
- Filter by customer type (New/Repeat)
- Search by phone number
- Search by product name
- Sort options:
  - Total Orders (default)
  - Total Spent
  - Last Order Date

**F. Customer Detail Modal**
- Phone number and customer type
- Summary metrics
- List of all products purchased (badges)
- Full order history table:
  - Order ID
  - Product name
  - Order date
  - Order amount

**G. Export Feature**
- Export options:
  - All customers
  - Repeat customers only
- Format options:
  - CSV (for Excel/Sheets)
  - JSON (for programmatic use)

---

## 📊 CSV Format Specification

### Required Columns (Must exist in uploaded file)
```
order_id, customer_phone, product_name, order_date, order_amount
```

### Example CSV
```csv
order_id,customer_phone,product_name,order_date,order_amount
ORD101,9999999999,iPhone IMEI Check,2025-01-10,50.00
ORD102,8888888888,Blacklist Status Check,2025-01-12,40.00
ORD103,9999999999,Warranty Check,2025-01-15,65.00
ORD104,9999999999,iPhone IMEI Check,2025-03-02,52.00
```

### Validation Rules
- Phone numbers: Normalized (digits only)
- Dates: Any valid ISO 8601 format
- Amounts: Decimal numbers
- Extra columns: Silently ignored
- Missing required columns: Upload rejected with error

---

## 🔄 Data Processing Flow

```
1. User Upload CSV
   ↓
2. Backend validates structure
   ↓
3. Create CSVUpload record (status: PROCESSING)
   ↓
4. Parse CSV and validate data
   ↓
5. Group records by customer_phone
   ↓
6. Calculate customer metrics
   ↓
7. Store in CustomerAnalysis table
   ↓
8. Store raw records in CSVOrderRecord
   ↓
9. Update CSVUpload status: SUCCESS/FAILED
   ↓
10. Frontend fetches results
    ↓
11. Display overview cards and customer table
```

---

## 🎨 UI Features

### Customer Type Badges
- **New**: Green badge (order_count = 1)
- **Repeat**: Orange/Warning badge (order_count > 1)

### Interactive Elements
- Click "View Details" to see full customer profile
- Click "Export" to download customer data
- Use filters to refine customer list
- Real-time search by phone or product

### Status Indicators
- Upload status: PROCESSING, SUCCESS, FAILED
- Error messages displayed clearly
- Upload progress tracking

---

## 💾 Key Data Structures

### Customer Summary Object (returned by API)
```javascript
{
  id: 123,
  uploadId: 1,
  customerPhone: "9999999999",
  totalOrders: 3,
  customerType: "Repeat",
  productsBought: "[\"iPhone IMEI Check\", \"Warranty Check\"]",  // JSON string
  orderIds: "[\"ORD101\", \"ORD103\", \"ORD104\"]",              // JSON string
  firstOrderDate: "2025-01-10T00:00:00Z",
  lastOrderDate: "2025-03-02T00:00:00Z",
  totalSpent: 207.00,
  createdAt: "2025-01-03T12:34:56Z"
}
```

### Overview Stats Object
```javascript
{
  totalCustomers: 150,
  newCustomers: 100,
  repeatCustomers: 50,
  totalOrders: 250,
  totalRevenue: 12500.00
}
```

---

## 🔐 Error Handling

### CSV Validation Errors
- Missing required columns
- Invalid date formats
- Non-numeric amounts
- Missing phone numbers
- Malformed CSV structure

**User Feedback**: Clear error messages with line numbers when possible

### Database Errors
- Duplicate entries handled gracefully
- Failed uploads logged with error message
- Upload status marked as FAILED
- User can retry or contact support

---

## 🚀 Usage Guide for Admins

### Step 1: Navigate to Feature
1. Click "Repeat Customers" in left sidebar
2. View previous uploads in history table

### Step 2: Upload CSV
1. Click "Upload Orders CSV" button
2. Either:
   - Paste CSV content directly, OR
   - Select CSV file from computer
3. (Optional) Enable "Compare with previous uploads" to merge data
4. Click "Upload & Process"

### Step 3: View Results
1. System displays overview cards:
   - Total/New/Repeat customer counts
   - Total orders and revenue
2. Browse customer list with all details
3. Use filters/search to find specific customers

### Step 4: Explore Customer Details
1. Click "Details" button on any customer row
2. View:
   - All products they've purchased
   - Complete order history
   - Purchase dates and amounts

### Step 5: Export Data
1. Click "Export" button
2. Select:
   - Customer type (All or Repeat only)
   - Format (CSV or JSON)
3. Download automatically

---

## 🔧 Technical Considerations

### Performance
- Efficient phone number normalization (remove non-digits)
- Database indexes on `uploadId` and `customerPhone`
- Async CSV processing to prevent blocking
- In-memory grouping for fast analysis

### Normalization
- Phone numbers: Remove all non-digit characters
- Dates: Convert to standard ISO 8601 format
- Currency: Parse as Decimal for accuracy

### Scalability
- Handles large CSVs (tested with 10,000+ rows)
- Batch database inserts for efficiency
- Indexed queries for fast retrieval

---

## 📝 Database Migrations

Run migrations to create new tables:
```bash
# From backend directory
npm run db:push
```

This creates:
- `CSVUpload` table
- `CustomerAnalysis` table
- `CSVOrderRecord` table
- Required indexes

---

## ✅ Feature Checklist

- [x] CSV upload with validation
- [x] Customer phone-based grouping
- [x] New vs Repeat customer detection
- [x] Overview statistics dashboard
- [x] Customer list with filtering
- [x] Search by phone and product
- [x] Sort by various metrics
- [x] Customer detail view with order history
- [x] Export to CSV and JSON
- [x] Upload history tracking
- [x] Error handling and reporting
- [x] Frontend-backend integration
- [x] Responsive UI design

---

## 🐛 Known Limitations

1. **Phone Number Format**: Only digits are compared. International formats must be pre-normalized.
2. **Date Format**: Expects ISO 8601 or common date formats. Some edge cases may fail.
3. **CSV Size**: Very large CSVs (>1GB) may be slow. Recommend splitting into chunks.
4. **Concurrent Uploads**: Single upload at a time. Queue added uploads sequentially.

---

## 🔮 Future Enhancements

- [ ] Batch CSV upload processing
- [ ] Scheduled automatic imports from external sources
- [ ] Customer lifetime value (LTV) calculation
- [ ] Cohort analysis (when did customers first buy?)
- [ ] Repeat rate trends (visualization)
- [ ] Integration with email marketing platforms
- [ ] SMS campaign directly to repeat customers
- [ ] Machine learning for churn prediction
- [ ] Customer segmentation by product preferences
