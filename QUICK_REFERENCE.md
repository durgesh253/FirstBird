# 📌 Repeat Customer Detection - Quick Reference Card

## 🎯 At a Glance

**What it does:** Uploads CSV files of orders and automatically identifies new vs repeat customers by phone number.

**Where it is:** `Repeat Customers` menu item (left sidebar, bottom section)

**Who uses it:** Admins analyzing customer behavior and purchase patterns

---

## ⚡ Quick Start (5 minutes)

1. Navigate to "Repeat Customers" in sidebar
2. Click "Upload Orders CSV"
3. Upload/paste CSV with these columns:
   ```
   order_id, customer_phone, product_name, order_date, order_amount
   ```
4. Click "Upload & Process"
5. View statistics and customer list

---

## 📋 CSV Format

### Required Columns
```
order_id           → Unique order identifier
customer_phone     → Phone number (any format, normalized to digits)
product_name       → Product or service name
order_date         → Date in ISO format (YYYY-MM-DD)
order_amount       → Numeric value of order
```

### Example
```csv
order_id,customer_phone,product_name,order_date,order_amount
ORD001,+1-999-999-9999,iPhone Check,2025-01-10,50.00
ORD002,9999999999,Warranty Check,2025-03-02,65.00
```

### Notes
- ✅ Extra columns are ignored
- ✅ Phone formats are normalized
- ✅ Dates can be in common formats
- ❌ Missing required column = Error

---

## 📊 What You'll Get

### Overview Cards (5 metrics)
- **Total Customers** → Unique phone numbers
- **New Customers** → Customers with 1 order
- **Repeat Customers** → Customers with 2+ orders
- **Total Orders** → Sum of all orders
- **Total Revenue** → Sum of all amounts

### Customer List (8 columns)
| Column | Shows |
|--------|-------|
| Phone | Customer number (normalized) |
| Type | New or Repeat (color badge) |
| Orders | Total order count |
| Products | Preview of bought items |
| Total Spent | Revenue per customer |
| First Order | Oldest order date |
| Last Order | Newest order date |
| Details | Link to full history |

### Customer Details (modal view)
- Phone and type badge
- All products purchased (as badges)
- Complete order history table
- Order ID, Product, Date, Amount

---

## 🔍 Finding Customers

### Filter by Type
```
Filter: All Customers / New Customers / Repeat Customers
```

### Search by Phone
```
Search: "999999" → finds customer with matching phone digits
```

### Search by Product
```
Search: "iPhone" → finds all customers who bought products with "iPhone"
```

### Sort Results
```
Sort by: Total Orders / Total Spent / Last Order Date
Order: Ascending or Descending
```

---

## 💾 Export Data

### Options
1. **What**: All Customers OR Repeat Customers Only
2. **Format**: CSV (Excel) OR JSON (for apps)

### Use Cases
- Export repeat customers for email campaign
- Analyze in Excel or Google Sheets
- Import into marketing tools
- Create VIP customer lists

---

## 🐛 Common Issues & Fixes

### "Missing required CSV columns"
**Fix:** Ensure CSV has exactly these column headers:
```
order_id,customer_phone,product_name,order_date,order_amount
```

### "Invalid date format"
**Fix:** Use `YYYY-MM-DD` format for dates:
```
✅ 2025-01-10
❌ 01/10/2025
❌ Jan 10, 2025
```

### "Invalid amount"
**Fix:** Use numeric values only:
```
✅ 50.00
❌ $50.00
❌ 50 USD
```

### No data appears after upload
**Steps:**
1. Check upload status is "SUCCESS"
2. Refresh page (F5)
3. Check CSV had data rows
4. Try smaller CSV first

---

## 💡 Smart Tips

### Finding Valuable Customers
```
Filter: Repeat Customers
Sort by: Total Spent (Descending)
Result: Your most profitable customers
```

### Analyzing Product Popularity
```
Search by: Product name
See how many customers bought it
Identify trending products
```

### New Customer Acquisition
```
Filter: New Customers
Sort by: Last Order Date (Descending)
Action: Send welcome/follow-up email
```

### At-Risk Customers
```
Sort by: Last Order Date (Ascending)
See: Repeat customers not ordering recently
Action: Send re-engagement campaign
```

---

## 🎨 Color Codes

### Customer Type Badges
- 🟢 **Green** = New Customer (1 order)
- 🟠 **Orange** = Repeat Customer (2+ orders)

### Upload Status
- ⏳ **Yellow/Warning** = PROCESSING
- ✅ **Green** = SUCCESS
- ❌ **Red** = FAILED

### Products & Tags
- 🔵 **Blue** = Product names/badges

---

## 📈 Data Insights

After uploading 100 orders:

```
📊 Analytics Example
├── Upload Status: SUCCESS
├── Total Rows: 100
│
├── OVERVIEW
├── Total Customers: 15
├── New Customers: 8 (53%)
├── Repeat Customers: 7 (47%)
├── Total Orders: 100
└── Total Revenue: $5,275

🏆 TOP INSIGHTS
├── Highest Spender: $625 (12 orders)
├── Most Common Product: iPhone IMEI Check (25 orders)
├── Latest Purchase: 2025-03-15
└── Repeat Rate: 47%
```

---

## 🔗 Related Features

- **Dashboard**: Overview of all metrics
- **Analytics**: Trend analysis over time
- **Campaigns**: Marketing campaign tracking
- **Coupons**: Coupon code tracking
- **Orders**: Full order management

---

## ❓ FAQs

**Q: How is customer identified?**
A: By phone number. Same phone = same customer.

**Q: Are names required?**
A: No. Only phone number matters.

**Q: Can I merge multiple CSVs?**
A: Yes. Each upload is separate, but you can compare history.

**Q: How many orders can I upload?**
A: Recommended: Up to 10,000 rows per file

**Q: What if I upload wrong data?**
A: Previous uploads are saved. Upload new data separately.

**Q: Can I edit customer data?**
A: No, data is read-only. Re-upload with corrected CSV.

**Q: Where is data stored?**
A: In your local database (SQLite). Fully under your control.

**Q: Can I delete uploads?**
A: Not in current UI, but can be done via database directly.

---

## 🚀 Common Workflows

### Workflow 1: Identify VIP Customers
1. Upload orders CSV
2. Filter: Repeat Customers
3. Sort by: Total Spent (Desc)
4. View top 10-20 customers
5. Export as CSV
6. Use for loyalty program

### Workflow 2: Product Performance
1. Upload orders CSV
2. Search by: Product name
3. View customer count
4. Identify bestsellers
5. Plan inventory accordingly

### Workflow 3: Customer Segmentation
1. Upload orders CSV
2. View all metrics
3. Filter by type and date
4. Export different segments
5. Create targeted campaigns

### Workflow 4: Campaign Analysis
1. Upload CSV from campaign
2. Review new customer count
3. Track repeat customers
4. Calculate ROI per product
5. Plan next campaign

---

## 📞 Technical Details

### Phone Normalization
```
Input: "+1-999-999-9999"
↓ Remove all non-digits
Output: "9999999999"
```

### Customer Type Logic
```
if (orders = 1) → "New Customer"
if (orders > 1) → "Repeat Customer"
```

### Revenue Calculation
```
Total Spent = Sum of all order_amount values
```

### Date Tracking
```
First Order = Earliest date in orders
Last Order = Most recent date in orders
```

---

## 🔐 Privacy & Security

- ✅ Phone numbers normalized (digits only)
- ✅ No customer names stored
- ✅ No email addresses stored
- ✅ All data in your database
- ✅ Not shared externally
- ✅ Can be deleted anytime

---

## 📚 Documentation Files

| File | What's in it |
|------|-------------|
| `REPEAT_CUSTOMERS_README.md` | Complete overview |
| `REPEAT_CUSTOMERS_SETUP.md` | Setup instructions |
| `REPEAT_CUSTOMERS_FEATURE.md` | Technical details |
| `IMPLEMENTATION_CHECKLIST.md` | What was built |
| `generate-demo-csv.js` | Sample data generator |

---

## ⚙️ Configuration

**Current Settings:**
- Compare with previous uploads: Optional toggle
- Phone normalization: Automatic (digits only)
- Customer type: Auto-detected (1 vs 2+ orders)
- Date format: ISO 8601 supported

**No configuration needed to start using!**

---

## 🎓 Training

### For Admins
**Time: 15 minutes**
1. Read this quick reference
2. Generate sample CSV: `node generate-demo-csv.js`
3. Upload and explore
4. Try different filters and exports

### For Developers
**Time: 45 minutes**
1. Review `REPEAT_CUSTOMERS_FEATURE.md`
2. Study `backend/src/services/customer-analysis.js`
3. Check `src/pages/RepeatCustomers.js`
4. Review API endpoints in `backend/src/routes/api.js`

---

## 📞 Getting Help

**Issue?** Check these in order:
1. Review "Common Issues & Fixes" above
2. See `REPEAT_CUSTOMERS_SETUP.md` - "Troubleshooting" section
3. Check error message in browser console (F12)
4. Review CSV format requirements

---

**Last Updated:** January 1, 2026
**Status:** Ready to Use ✅
