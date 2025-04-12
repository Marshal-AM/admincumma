# **Super Admin Dashboard: Metrics & Analytics**  
**Version 1.0**  

---

## **Dashboard Metrics**  
### **Key Performance Indicators (KPIs)**  
1. **Total Facilities**:  
   - `COUNT` all facilities where `status = "active"`  
   - **Query**:  
     ```javascript  
     db.facilities.countDocuments({ status: "active" })  
     ```  

2. **New Facilities (Past 30 Days)**:  
   - `COUNT` facilities created in the last 30 days  
   - **Query**:  
     ```javascript  
     db.facilities.countDocuments({  
       status: "active",  
       createdAt: { $gte: new Date(Date.now() - 30 * 86400000) }  
     })  
     ```  

3. **Total Bookings**:  
   - `COUNT` approved bookings (`status: "approved"`)  
   - **Query**:  
     ```javascript  
     db.bookings.countDocuments({ status: "approved" })  
     ```  

4. **Earnings**:  
   - **All Time**: `SUM(amount)` from all approved bookings  
     ```javascript  
     db.bookings.aggregate([  
       { $match: { status: "approved" } },  
       { $group: { _id: null, total: { $sum: "$amount" } } }  
     ])  
     ```  
   - **This Month**: `SUM(amount)` from current month  
     ```javascript  
     db.bookings.aggregate([  
       {  
         $match: {  
           status: "approved",  
           createdAt: {  
             $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),  
             $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)  
           }  
         }  
       },  
       { $group: { _id: null, total: { $sum: "$amount" } } }  
     ])  
     ```  
   - **Earnings Change (%)**:  
     ```  
     ((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100  
     ```  

---

## **Graphs**  
### **1. Monthly Earnings**  
- **X-axis**: Months of the current year (e.g., "Jan 2025", "Feb 2025").  
- **Y-axis**: Total earnings per month.  
- **Query**:  
  ```javascript  
  db.bookings.aggregate([  
    { $match: { status: "approved" } },  
    {  
      $group: {  
        _id: { $month: "$createdAt" },  
        total: { $sum: "$amount" }  
      }  
    },  
    { $sort: { "_id": 1 } }  
  ])  
  ```  

---

### **2. Startups Created Per Month**  
- **X-axis**: Months of the current year.  
- **Y-axis**: Number of startups registered.  
- **Query**:  
  ```javascript  
  db.startups.aggregate([  
    {  
      $group: {  
        _id: { $month: "$createdAt" },  
        count: { $sum: 1 }  
      }  
    },  
    { $sort: { "_id": 1 } }  
  ])  
  ```  

---

### **3. Facility Categories (Past Month)**  
- **Categories**:  
  | Group        | Facility Types Included                                  |  
  |--------------|---------------------------------------------------------|  
  | **Offices**  | `individual-cabin`, `coworking-spaces`, `meeting-rooms`, `raw-space-office` |  
  | **Labs**     | `bio-allied-labs`, `manufacturing-labs`, `prototyping-labs`, `raw-space-lab` |  
  | **Software** | `software`, `saas-allied`                               |  

- **Query**:  
  ```javascript  
  db.facilities.aggregate([  
    {  
      $match: {  
        createdAt: { $gte: new Date(Date.now() - 30 * 86400000) },  
        status: "active"  
      }  
    },  
    {  
      $bucket: {  
        groupBy: "$facilityType",  
        boundaries: ["individual-cabin", "raw-space-office", "saas-allied"],  
        default: "Other",  
        output: {  
          "Offices": {  
            $sum: {  
              $cond: [  
                { $in: ["$facilityType", ["individual-cabin", "coworking-spaces", "meeting-rooms", "raw-space-office"]] },  
                1,  
                0  
              ]  
            }  
          },  
          "Labs": {  
            $sum: {  
              $cond: [  
                { $in: ["$facilityType", ["bio-allied-labs", "manufacturing-labs", "prototyping-labs", "raw-space-lab"]] },  
                1,  
                0  
              ]  
            }  
          },  
          "Software": {  
            $sum: {  
              $cond: [  
                { $in: ["$facilityType", ["software", "saas-allied"]] },  
                1,  
                0  
              ]  
            }  
          }  
        }  
      }  
    }  
  ])  
  ```  

---

## **Technical Implementation**  
### **Backend Optimization**  
1. **Indexing**:  
   - Create indexes for frequently queried fields:  
     ```javascript  
     db.facilities.createIndex({ status: 1, createdAt: -1 })  
     db.bookings.createIndex({ status: 1, createdAt: -1 })  
     db.startups.createIndex({ createdAt: -1 })  
     ```  

2. **Caching**:  
   - Precompute monthly metrics using scheduled jobs (e.g., CRON) and store in an `analytics` collection.  

---

### **Frontend Components**  
1. **KPI Cards**:  
   - Use a grid layout with 5 cards for metrics (Total Facilities, New Facilities, Total Bookings, Earnings).  
   - Display percentage change with ▲/▼ icons.  

2. **Charts**:  
   - Use `recharts` or `Chart.js` for interactive graphs.  
   - Example for Monthly Earnings:  
     ```jsx  
     <LineChart data={monthlyEarnings}>  
       <XAxis dataKey="month" />  
       <YAxis />  
       <Tooltip />  
       <Line type="monotone" dataKey="total" stroke="#8884d8" />  
     </LineChart>  
     ```  

3. **Category Comparison**:  
   - Use a `PieChart` or `BarChart` to visualize facility distribution.  

---

## **Security**  
1. **Authentication**:  
   - Restrict access to super admins using role-based checks in NextAuth.js.  
2. **Rate Limiting**:  
   - Apply Redis-based rate limiting to API routes.  

---

## **Sample Data Flow**  
1. **Fetch Total Facilities**:  
   ```javascript  
   // API Route: /api/metrics/total-facilities  
   const totalFacilities = await db.facilities.countDocuments({ status: "active" });  
   res.json({ totalFacilities });  
   ```  

2. **Fetch Earnings Change**:  
   ```javascript  
   // API Route: /api/metrics/earnings-change  
   const currentMonth = await db.bookings.aggregate([...]);  
   const previousMonth = await db.bookings.aggregate([...]);  
   const change = ((currentMonth - previousMonth) / previousMonth) * 100;  
   res.json({ change });  
   ```  

---

## **Summary**  
| Component               | Data Source                          | Tools/Techniques              |  
|-------------------------|--------------------------------------|-------------------------------|  
| **Total Facilities**    | `facilities` collection              | `countDocuments()`            |  
| **Monthly Earnings**    | `bookings` collection                | Aggregation + `$group`        |  
| **Startups Created**    | `startups` collection                | Aggregation + `$group`        |  
| **Facility Categories** | `facilities` collection              | Bucket aggregation            |  
| **Frontend Charts**     | Precomputed metrics                  | Recharts/Chart.js             |  

--- 

**This implementation ensures real-time analytics with efficient queries and a responsive UI.**