# ADMIN PORTAL - CRITICAL BUGS REPORT
**Date:** April 17, 2026

## Critical Issues Found

### 🔴 BUG #1: Race Condition - Jobs List Overwrites Save Changes

**File:** apps/admin-portal/src/pages/Dashboard.jsx  
**Lines:** 356  
**Severity:** CRITICAL - Destroys data integrity

**Description:**
When editing a job, the `openEdit()` function calls `load()` without awaiting it. This causes:
1. Form populates with job data
2. User changes status and saves (works)
3. `load()` finishes in background (1-2 sec later)
4. State is overwritten with OLD data
5. Status change disappears

**Current Code (Line 356):**
```javascript
function openEdit(j) {
  load();  // ❌ NOT AWAITED
```

**Fix:**
```javascript
async function openEdit(j) {
  await load();  // ✅ AWAIT THE LOAD
```

**Impact:** Users cannot save status changes, closing jobs, or any other modification because changes revert after 1-2 seconds.

---

### 🔴 BUG #2: Missing Job Object in PUT Handler

**File:** packages/backend-api/server.js  
**Lines:** 668  
**Severity:** HIGH - Causes 500 errors on assignment changes

**Description:**
The PUT /api/jobs/:id endpoint references `job` variable but never fetches it:

```javascript
// Line 668: Uses undefined variable
const oldTechName = job.technician || '';  // ❌ ReferenceError
```

**Current Code:**
```javascript
app.put('/api/jobs/:id', auth, async (req, res) => {
  const update = { ...req.body };
  // ... validation ...
  
  // MISSING: const job = await Job.findOne({ _id: req.params.id, owner: req.user.sub });
  
  const oldTechName = job.technician || '';  // ❌ CRASHES HERE
```

**Fix:**
Add before line 668:
```javascript
const job = await Job.findOne({ _id: req.params.id, owner: req.user.sub });
if (!job) return sendErr(res, 404, 'Job not found');
```

**Impact:** Any job update fails if technician assignment tracking is involved.

---

### 🟡 BUG #3: openNew() Also Has Unclean Load Pattern

**File:** apps/admin-portal/src/pages/Dashboard.jsx  
**Lines:** 307  
**Severity:** MEDIUM - Potential stale data

**Current Code:**
```javascript
async function openNew(prefill = {}) {
  await load();  // ✅ This one IS awaited, good
```

**Status:** NOT A BUG, but important it stays awaited.

---

## Impact Summary

| Bug | Feature Broken | User Impact |
|-----|---------------|----|
| #1 Race Condition | Job editing | Cannot change job status, technician, or any field - changes revert in 1-2 sec |
| #2 Missing job variable | Job updates | 500 error when changing technician; other updates might fail |
| #3 (N/A) | N/A | N/A |

**Overall:** Admin portal job editing is **BROKEN**. Users cannot make persistent changes.

