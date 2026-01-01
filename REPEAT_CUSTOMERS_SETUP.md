# Repeat Customer Detection - Setup & Implementation Guide

## ✅ What Was Implemented

### 1. **Database Schema Updates**
Files modified: `backend/prisma/schema.prisma`

Added three new models:
- **CSVUpload**: Tracks uploaded files and processing status
- **CustomerAnalysis**: Stores aggregated customer data
- **CSVOrderRecord**: Stores individual order records

### 2. **Backend Service**
New file: `backend/src/services/customer-analysis.js`

Functions implemented:
- CSV parsing and validation
- Phone number normalization
- Customer grouping logic
- Data analysis and filtering
- Export functionality

### 3. **API Routes**
File modified: `backend/src/routes/api.js`

New endpoints (7 total):
- POST `/api/customers/upload-csv` - Upload CSV
- GET `/api/customers/uploads` - List all uploads
- GET `/api/customers/stats/:uploadId` - Get overview stats
- GET `/api/customers/analysis/:uploadId` - Get customer list with filters
- GET `/api/customers/detail/:uploadId/:customerPhone` - Get customer details
- GET `/api/customers/export/:uploadId` - Export data
- GET `/api/customers/upload-status/:uploadId` - Check processing status

### 4. **Frontend Page**
New file: `src/pages/RepeatCustomers.js`

Features:
- CSV upload modal with file/paste options
- Upload history table
- Overview statistics cards
- Customer list with sorting and filtering
- Customer detail modal with order history
- Export functionality (CSV & JSON)
- Search by phone and product name

### 5. **Navigation Integration**
Files modified:
- `src/main.js` - Added route and import
- `src/components/Sidebar.js` - Added menu item

---

## 🚀 Installation & Setup

### Step 1: Run Database Migration
```bash
cd backend
npm run db:push
```

This creates the necessary tables in your database.

### Step 2: Test the Feature
1. Start your backend server (if not running)
2. Start your frontend dev server
3. Navigate to "Repeat Customers" from the sidebar

### Step 3: Upload Test CSV
Create a sample CSV file (`test-orders.csv`):
```csv
order_id,customer_phone,product_name,order_date,order_amount
ORD001,9999999999,iPhone IMEI Check,2025-01-10,50.00
ORD002,8888888888,Blacklist Check,2025-01-12,40.00
ORD003,9999999999,Warranty Check,2025-01-15,65.00
ORD004,9999999999,iPhone IMEI Check,2025-03-02,52.00
ORD005,7777777777,Blacklist Check,2025-03-05,40.00
ORD006,8888888888,Warranty Check,2025-03-10,65.00
```

Upload via the dashboard and verify:
- Total Customers: 3
- New Customers: 1 (7777777777)
- Repeat Customers: 2 (9999999999, 8888888888)
- Total Orders: 6

---

## 📋 CSV Upload Requirements

### Required Columns (Must be present)
```
order_id, customer_phone, product_name, order_date, order_amount
```

### Rules
✅ Column order doesn't matter
✅ Extra columns are ignored
✅ Phone numbers can have formatting (normalized to digits only)
✅ Dates in ISO 8601 or common formats
✅ Amounts must be numeric

❌ Missing required column = Upload rejected
❌ Invalid date format = Upload rejected
❌ Non-numeric amount = Upload rejected

---

## 🎯 Customer Type Rules

| Condition | Customer Type | Color |
|-----------|---------------|-------|
| Total Orders = 1 | New Customer | Green |
| Total Orders > 1 | Repeat Customer | Orange |

---

## 📊 Data You Get

After upload, for each customer you get:
- ✅ Phone number (normalized)
- ✅ Customer type (New/Repeat)
- ✅ Total order count
- ✅ All products purchased
- ✅ All order IDs
- ✅ First order date
- ✅ Last order date
- ✅ Total amount spent

---

## 🔧 API Endpoint Examples

### Upload CSV
```bash
curl -X POST http://localhost:3000/api/customers/upload-csv \
  -H "Content-Type: application/json" \
  -d '{
    "csvContent": "order_id,customer_phone,product_name,order_date,order_amount\nORD001,9999999999,Product A,2025-01-10,50.00",
    "compareWithPrevious": false
  }'
```

### Get Stats
```bash
curl http://localhost:3000/api/customers/stats/1
```

Response:
```json
{
  "totalCustomers": 3,
  "newCustomers": 1,
  "repeatCustomers": 2,
  "totalOrders": 6,
  "totalRevenue": 312.00
}
```

### Get Customer List
```bash
curl "http://localhost:3000/api/customers/analysis/1?customerType=Repeat&sortBy=total_spent&sortOrder=desc"
```

### Export Data
```bash
# Export as CSV
curl "http://localhost:3000/api/customers/export/1?format=csv&customersOnly=repeat" > customers.csv

# Export as JSON
curl "http://localhost:3000/api/customers/export/1?format=json" > customers.json
```

---

## 🎨 UI Walkthrough

### Main Page Features
1. **Header**: "Repeat Customer Detection" title + "Upload Orders CSV" button
2. **Upload History**: Table of all previous uploads
3. **Stats Section**: 5 KPI cards showing metrics
4. **Customer Table**: Full list with all data
5. **Filters & Search**: Refine results by type/phone/product
6. **Export Button**: Download data in CSV or JSON

### Customer Detail Modal
Click "Details" button on any customer to see:
- Customer type badge
- Metrics summary
- List of products purchased (as badges)
- Complete order history table

---

## 🐛 Troubleshooting

### CSV Upload Fails
**Check:**
1. All required columns present: `order_id, customer_phone, product_name, order_date, order_amount`
2. No empty rows in CSV
3. Dates are in valid format (ISO 8601: YYYY-MM-DD)
4. All amount fields are numeric

**Error Message Tips:**
- "Missing required CSV columns" → Check column headers
- "Invalid date format" → Use YYYY-MM-DD format
- "Invalid amount" → Ensure numeric values

### No Data Shows After Upload
1. Check upload status - should be "SUCCESS"
2. Verify CSV had data (check totalRows > 0)
3. Try refreshing the page
4. Check browser console for errors

### Phone Numbers Not Matching
- Ensure phone numbers are consistent (same format)
- System normalizes to digits only
- "+1-999-999-9999" and "9999999999" are treated as same customer

---

## 📈 Metrics Explained

| Metric | Definition |
|--------|-----------|
| **Total Customers** | Unique customer phone numbers in upload |
| **New Customers** | Customers with exactly 1 order |
| **Repeat Customers** | Customers with 2+ orders |
| **Total Orders** | Sum of all orders in CSV |
| **Total Revenue** | Sum of all order amounts |

---

## 🔐 Data Privacy Notes

- Phone numbers are normalized (non-digits removed)
- No PII beyond phone number is stored
- All data can be exported by admin
- Delete uploads to remove associated data

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `backend/prisma/schema.prisma` | Database models |
| `backend/src/services/customer-analysis.js` | Business logic |
| `backend/src/routes/api.js` | API endpoints |
| `src/pages/RepeatCustomers.js` | UI component |
| `src/main.js` | Routing setup |
| `src/components/Sidebar.js` | Navigation menu |

---

## ✨ Next Steps

1. ✅ Run database migration
2. ✅ Test with sample CSV
3. ✅ Upload real order data
4. ✅ Analyze repeat customers
5. ✅ Export data for campaigns
6. ✅ Segment by product preferences
7. ✅ Plan retention campaigns

---

## 💡 Use Cases

- **Identify VIP Customers**: Filter by repeat customers + high spend
- **Product Analysis**: See which products repeat customers buy
- **Campaign Targeting**: Export repeat customers for email campaigns
- **Churn Analysis**: Find customers not ordering recently
- **Growth Tracking**: Monitor new vs repeat ratio over time
- **Revenue Attribution**: Track which orders come from repeat customers

---

**For detailed feature documentation, see: `REPEAT_CUSTOMERS_FEATURE.md`**
