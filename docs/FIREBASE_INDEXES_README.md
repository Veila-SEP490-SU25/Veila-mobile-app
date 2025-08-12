# Firebase Firestore Indexes Guide

## 🚨 Common Error: "The query requires an index"

### **Error Message:**

```
FirebaseError: [code=failed-precondition]: The query requires an index.
You can create it here: https://console.firebase.google.com/v1/r/project/veilastudio/firestore/indexes?create_composite=...
```

### **Why This Happens:**

Firestore requires composite indexes when you query collections with:

- Multiple `where` clauses
- `where` + `orderBy` combinations
- Complex filtering and sorting

### **🔧 Firebase Setup (First Time):**

#### **Option 1: Auto-find Veila Project (Recommended)**

```bash
npm run find-project
```

#### **Option 2: Use Setup Script**

```bash
npm run setup-firebase
```

#### **Option 3: Manual Setup**

```bash
# 1. Login to Firebase
firebase login

# 2. List available projects
firebase projects:list

# 3. Find your project ID in the list
# 4. Set project
firebase use <PROJECT_ID>

# 5. Verify project is set
firebase use
```

### **Quick Fix - Deploy Indexes:**

#### **Option 1: Use NPM Script (Recommended)**

```bash
npm run deploy-indexes
```

#### **Option 2: Force Rebuild All Indexes (if still having issues)**

```bash
npm run rebuild-indexes
```

#### **Option 3: Manual Firebase CLI**

```bash
firebase deploy --only firestore:indexes
```

#### **Option 4: Deploy All**

```bash
firebase deploy
```

### **Manual Index Creation (if needed):**

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com
   - Select project: `veilastudio`

2. **Navigate to Indexes:**
   - Firestore Database → Indexes tab

3. **Create Composite Index:**
   ```
   Collection ID: messages
   Fields:
   - chatRoomId (Ascending)
   - timestamp (Ascending)
   - __name__ (Ascending)
   ```

### **Current Indexes in Project:**

#### **Chat Rooms:**

- `customerId` + `updatedAt` (DESC)
- `shopId` + `updatedAt` (DESC)

#### **Messages:**

- `chatRoomId` + `timestamp` + `__name__` (ASC) ← **This fixes the current error**

**Note:** The `__name__` field is required by Firestore for composite indexes with `orderBy`.

#### **Notifications:**

- `userId` + `timestamp` (DESC)
- `userId` + `isRead` (ASC)

### **Index Building Time:**

- ⏱️ **Small collections:** 1-2 minutes
- ⏱️ **Medium collections:** 5-10 minutes
- ⏱️ **Large collections:** 15-30 minutes

### **Troubleshooting:**

#### **1. Index Still Building:**

```bash
# Check index status
firebase firestore:indexes
```

#### **2. Index Build Failed:**

- Delete failed index
- Recreate with correct field order
- Ensure all required fields exist

#### **3. Query Still Failing:**

- Verify field names match exactly
- Check field types (string vs number)
- Ensure index is fully built (not "Building" status)
- **Important:** Composite indexes with `orderBy` require the `__name__` field

#### **4. **name** Field Required:**

Firestore automatically adds the `__name__` field to composite indexes when using `orderBy`. This field represents the document ID and ensures unique ordering.

### **Best Practices:**

#### **1. Always Use Indexes:**

```tsx
// ✅ Good - Uses index
query(
  collection(db, "messages"),
  where("chatRoomId", "==", chatRoomId),
  orderBy("timestamp", "asc")
);

// ❌ Bad - No index, will fail
query(
  collection(db, "messages"),
  where("chatRoomId", "==", chatRoomId),
  orderBy("timestamp", "desc") // Different order than index
);
```

#### **2. Consistent Field Order:**

- Index: `chatRoomId` + `timestamp` (ASC)
- Query: Must use same order and direction

#### **3. Fallback Queries:**

```tsx
try {
  // Try with index
  const q = query(collection(db, "messages"), ...);
} catch (error) {
  if (error.code === "failed-precondition") {
    // Fallback without ordering
    const q = query(collection(db, "messages"), ...);
    // Sort manually in JavaScript
  }
}
```

### **Monitoring Indexes:**

#### **Firebase Console:**

- Firestore Database → Indexes
- Check status: "Building", "Enabled", "Error"

#### **Firebase CLI:**

```bash
# List all indexes
firebase firestore:indexes

# Check specific collection
firebase firestore:indexes --collection=messages
```

### **Common Index Patterns:**

#### **Chat Applications:**

```
messages: chatRoomId + timestamp
chatRooms: userId + updatedAt
```

#### **User Content:**

```
posts: userId + createdAt
comments: postId + timestamp
```

#### **Notifications:**

```
notifications: userId + timestamp
notifications: userId + isRead + timestamp
```

### **Need Help?**

#### **1. Project Not Found:**

```bash
# Auto-find Veila project
npm run find-project

# Or manual search
firebase projects:list
# Look for projects with: veila, wedding, dress, studio
```

#### **2. Check Firebase Console:**

1. Open: https://console.firebase.google.com
2. Check if you're logged in with the correct account
3. Look for your project in the project list
4. Note the exact project ID

#### **3. Common Project Names:**

- `veilastudio`
- `veila-mobile`
- `veila-app`
- `wedding-app`
- `dress-app`
- `veila-studio`

#### **4. Still Can't Find:**

1. **Check Firebase Console** for project status
2. **Run find script:** `npm run find-project`
3. **Wait for index building** (usually 5-15 minutes)
4. **Verify query matches index** exactly
5. **Check field types** and names

### **Quick Commands:**

```bash
# Deploy indexes
npm run deploy-indexes

# Check Firebase status
firebase projects:list

# View all indexes
firebase firestore:indexes

# Deploy everything
firebase deploy
```
