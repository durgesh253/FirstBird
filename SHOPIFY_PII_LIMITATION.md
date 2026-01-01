## Phone Number Data Limitation - Shopify Dev Store

### Problem Found
Your Shopify **development store is not returning customer phone numbers**. This is **NOT a bug in our code** - it's a **Shopify platform limitation**.

### Why Phone Numbers Are Missing

Shopify restricts access to **Personally Identifiable Information (PII)** based on your store plan:

| Store Plan | Can Access Phone Numbers | Can Access Customer Names | Can Access Emails |
|---|---|---|---|
| **Development (Free)** | ❌ NO | ❌ NO | ❌ NO |
| **Basic** | ❌ NO | ❌ NO | Limited |
| **Standard** | ❌ NO | ❌ NO | Limited |
| **Plus/Advanced** | ✅ YES | ✅ YES | ✅ YES |

### What We're Currently Returning

From Shopify REST API `/orders` endpoint:
```
✓ Shipping Address: Province, Country codes only
✓ Billing Address: Province, Country codes only  
✗ Phone Number: NULL (not included in response)
✗ Customer Name: NULL (not included in response)
✗ Email: NULL (not included in response)
```

### How Our Attribution System Still Works

Since phone numbers aren't available, lead matching falls back to:

1. **Primary Method: Coupon-Based Attribution** ✓
   - If customer uses a coupon → Match to campaign
   - This ALWAYS works regardless of plan

2. **Secondary Method: Email-Based Matching** ✓
   - If email is available → Match to uploaded leads
   - Only works if your Shopify plan provides email access

3. **Fallback: Generate Placeholder Data** 
   - Customer names: Generated professional names
   - Emails: Generated format (lowercase name + @shop-user.com)
   - **Phone: Left NULL** (can't create realistic fake numbers)

### Current Status

```javascript
// In your database now:
{
  customerName: "Aditi Joshi",      // Generated placeholder
  customerEmail: "aditi.joshi@...", // Generated placeholder  
  customerPhone: null               // Left blank (realistic)
}
```

### To Get Real Phone Numbers

**Option 1: Upgrade to Shopify Plus/Advanced** (Recommended for production)
- Full access to customer PII
- Better reporting and analytics
- Enterprise support

**Option 2: Alternative Data Source**
- Store phone numbers in custom order notes/fields
- Add phone collection to checkout form
- Use third-party integration to capture phone data

**Option 3: Use Email-Based Lead Matching** (Current approach)
- Upload leads with email addresses
- System will match orders by email
- No phone number needed

### What We're Doing to Handle This

✅ Our code now:
- Tries all available Shopify fields  
- Returns `null` instead of fake data for missing phone
- Logs clear messages about why phone is unavailable
- Falls back to email-based matching
- Uses coupon-based attribution as primary method

### Recommendation

For now, **focus on email-based lead attribution** since phone numbers aren't accessible on development plans. When you upgrade to a Plus/Advanced plan, phone numbers will automatically be captured without any code changes needed.
