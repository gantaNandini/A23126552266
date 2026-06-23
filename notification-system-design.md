# Notification System Design

**Author:** Nandini Ganta | Roll No: A23126552266

---

## Stage 1

### REST API Design for Campus Notification Platform

The platform delivers real-time notifications to students for three event types: **Placement**, **Result**, and **Event**.

---

### Core Endpoints

#### 1. Get All Notifications for a Student

```
GET /notifications
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "notifications": [
    {
      "ID": "d146095a-0d86-4a34-9e69-3900a14576bc",
      "Type": "Result",
      "Message": "mid-sem",
      "Timestamp": "2026-04-22 17:51:30",
      "isRead": false
    }
  ]
}
```

---

#### 2. Mark a Notification as Read

```
PUT /notifications/:id/read
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "message": "Notification marked as read",
  "notificationId": "d146095a-0d86-4a34-9e69-3900a14576bc"
}
```

---

#### 3. Get Unread Notification Count

```
GET /notifications/unread-count
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "studentId": 1042,
  "unreadCount": 5
}
```

---

#### 4. Get Priority Inbox (Top-N)

```
GET /notifications/priority?n=10
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "count": 10,
  "notifications": [
    {
      "ID": "abc123",
      "Type": "Placement",
      "Message": "Interview scheduled with TCS",
      "Timestamp": "2026-06-23 09:00:00",
      "isRead": false
    }
  ]
}
```

---

### Real-Time Notification Mechanism

**Chosen approach: WebSocket (Socket.io)**

When a new notification is created server-side, it is pushed instantly to the connected student's socket room without polling.

**Flow:**
1. Student connects to WebSocket server on login → joins room `student:<studentId>`
2. When an event occurs (placement drive posted, result published), the backend emits to the room
3. Client receives it instantly and updates the UI

**Fallback:** If WebSocket is unavailable, the client polls `GET /notifications` every 30 seconds.

**Headers for REST endpoints:**

| Header | Value |
|--------|-------|
| Authorization | Bearer \<token\> |
| Content-Type | application/json |
| Accept | application/json |

---

## Stage 2

### Persistent Storage — Database Choice

**Recommended DB: PostgreSQL (Relational)**

**Reason:** Notifications are structured, have clear relationships (student → notification), require ordered queries (ORDER BY createdAt), and need reliable read/unread state tracking. PostgreSQL handles all of this with ACID guarantees and efficient indexing.

---

### DB Schema

```sql
CREATE TABLE students (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TYPE notification_type AS ENUM ('Placement', 'Result', 'Event');

CREATE TABLE notifications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       INT NOT NULL REFERENCES students(id),
  type             notification_type NOT NULL,
  message          TEXT NOT NULL,
  is_read          BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMP DEFAULT NOW()
);
```

---

### Problems as Data Volume Grows

| Problem | Description |
|---------|-------------|
| Slow reads | `SELECT * FROM notifications WHERE student_id = ?` becomes slow without indexes |
| Table bloat | Millions of read notifications accumulate and slow down queries |
| Lock contention | High-frequency writes (50k students notified at once) cause row-level lock pressure |
| Storage cost | Unlimited notification history is expensive at scale |

**Solutions:**
- Add composite index on `(student_id, is_read, created_at DESC)`
- Archive old notifications (> 90 days) to a cold storage table
- Use connection pooling (e.g., PgBouncer)
- Partition the `notifications` table by `created_at` (range partitioning)

---

### SQL Queries Based on Stage 1 APIs

**Fetch all notifications for a student:**
```sql
SELECT id, type, message, is_read, created_at
FROM notifications
WHERE student_id = $1
ORDER BY created_at DESC;
```

**Mark notification as read:**
```sql
UPDATE notifications
SET is_read = TRUE
WHERE id = $1 AND student_id = $2;
```

**Get unread count:**
```sql
SELECT COUNT(*) AS unread_count
FROM notifications
WHERE student_id = $1 AND is_read = FALSE;
```

**Fetch top 10 priority (Placement first, then recency):**
```sql
SELECT id, type, message, is_read, created_at
FROM notifications
WHERE student_id = $1 AND is_read = FALSE
ORDER BY
  CASE type WHEN 'Placement' THEN 1 WHEN 'Result' THEN 2 ELSE 3 END,
  created_at DESC
LIMIT 10;
```

---

## Stage 3

### Query Optimization Analysis

**Original slow query:**
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

**Why is it slow?**

With 50,000 students and 5,000,000 notifications, this query performs a **full table scan** on every execution. There is no index on `(studentID, isRead)`, so PostgreSQL reads all 5M rows, filters them in memory, then sorts — O(n) scan + O(k log k) sort for k matching rows.

**Fix — Composite Index:**
```sql
CREATE INDEX idx_notifications_student_read_time
ON notifications (studentID, isRead, createdAt DESC);
```

This turns the query into an **index range scan** — it jumps directly to rows for `studentID = 1042` where `isRead = false`, already sorted. Cost drops from O(n) to O(log n + k).

**Should we add indexes on every column?**

No. Adding indexes on every column is bad advice:
- Every index adds write overhead — INSERT/UPDATE/DELETE must maintain all indexes
- Indexes consume disk space
- The query planner can only use one index efficiently per query anyway
- Only add indexes for columns actually used in WHERE, ORDER BY, or JOIN clauses

**Query to find all students who got a Placement notification in the last 7 days:**
```sql
SELECT DISTINCT student_id
FROM notifications
WHERE notification_type = 'Placement'
  AND created_at >= NOW() - INTERVAL '7 days';
```

**Supporting index:**
```sql
CREATE INDEX idx_notifications_type_time
ON notifications (notification_type, created_at DESC);
```

---

## Stage 4

### Caching Strategy for Notification Fetches

**Problem:** Notifications are fetched on every page load for every student, overwhelming the DB.

---

### Proposed Solutions & Tradeoffs

#### Option 1: Redis Cache (Recommended)

Cache each student's notification list with a short TTL.

```
Key:   notifications:<studentId>
Value: JSON array of notifications
TTL:   60 seconds
```

**Flow:**
1. Request comes in → check Redis
2. Cache hit → return immediately (sub-millisecond)
3. Cache miss → query DB → store in Redis → return

**Tradeoffs:**

| Benefit | Tradeoff |
|---------|----------|
| Dramatically reduces DB load | Slight staleness (up to TTL seconds) |
| Sub-millisecond reads | Extra infrastructure (Redis server) |
| Easy to implement | Cache invalidation complexity on new notification |

**Cache invalidation:** When a new notification is created for a student, delete their cache key so the next request repopulates it fresh.

```js
// On new notification created for studentId:
redis.del(`notifications:${studentId}`);
```

---

#### Option 2: HTTP Response Caching (CDN / Reverse Proxy)

Add `Cache-Control: max-age=30` headers for the notifications endpoint. Works well if notifications are not user-specific (not suitable here since they are per-student).

---

#### Option 3: Pagination

Instead of fetching all notifications, fetch only the latest 20 per page. Reduces payload and DB read time significantly.

```
GET /notifications?page=1&limit=20
```

**Tradeoff:** Slightly more complex client-side pagination logic, but massively reduces DB and network load.

---

### Recommended Combined Strategy

- Redis cache with 60s TTL for the notification list
- Invalidate on write (new notification or mark-as-read)
- Paginate to limit rows returned per query
- Index on `(studentId, isRead, createdAt DESC)`

---

## Stage 5

### Redesigning `notify_all` for Reliability

**Original pseudocode:**
```
function notify_all(student_ids: array, message: string):
    for student_id in student_ids:
        send_email(student_id, message)   # calls Email API
        save_to_db(student_id, message)   # DB insert
        push_to_app(student_id, message)  # real-time push
```

---

### Problems with This Implementation

1. **Sequential loop over 50,000 students** — takes far too long (minutes)
2. **No fault isolation** — if `send_email` fails for student 200, the loop stops; students 201–50000 get nothing
3. **Tight coupling** — email, DB, and push happen in the same transaction; one failure breaks all three
4. **No retry logic** — transient failures cause permanent delivery gaps
5. **DB and email in same transaction** — they should not be coupled; DB insert is fast and reliable, email API is slow and flaky

---

### Should DB save and email send happen together?

**No.** They are different concerns with different failure modes:
- DB inserts are fast and reliable — do this first
- Email delivery is slow, external, and can fail — do this asynchronously

If you tie them together, a failed email will prevent the notification from being saved at all — the student won't even see it in-app.

---

### Redesigned Pseudocode (Reliable & Fast)

```
function notify_all(student_ids: array, message: string):

    // Step 1: Save all notifications to DB first (fast, reliable)
    // Do in bulk — single INSERT with all rows
    bulk_insert_notifications(student_ids, message)

    // Step 2: Push real-time in-app notifications via WebSocket
    // Non-blocking — fire and forget per student room
    for student_id in student_ids:
        push_to_app(student_id, message)   // async, no await

    // Step 3: Enqueue email jobs into a message queue (e.g., Redis Queue / BullMQ)
    // Do NOT call Email API directly in this loop
    for student_id in student_ids:
        enqueue_email_job({ student_id, message })

    return { status: "queued", count: len(student_ids) }


// Separate worker process consumes the queue
function email_worker():
    while true:
        job = dequeue_email_job()
        success = send_email(job.student_id, job.message)
        if not success:
            if job.retries < 3:
                re_enqueue(job, delay=exponential_backoff(job.retries))
            else:
                log_failed_delivery(job.student_id)
```

---

### Key Improvements

| Issue | Fix |
|-------|-----|
| Sequential loop is slow | Bulk DB insert + async queue |
| Email failure stops all | Queue isolates each job |
| No retry | Worker retries with exponential backoff |
| DB + email coupled | DB first, email via queue separately |
| 200 email failures midway | Already saved to DB; queue retries only failed jobs |

---

## Stage 6

### Priority Inbox — Top-N Notifications

**Requirement:** Display the top `n` most important unread notifications first. Priority = type weight + recency.

**Type weights:** Placement (3) > Result (2) > Event (1)

---

### Approach: Min-Heap of Size N

To efficiently maintain the top-n notifications as new ones arrive:

1. Iterate through all notifications
2. Compute a **priority score** = `typeWeight × 10^13 + timestampMs`
   - Type weight dominates; recency is the tiebreaker
3. Maintain a **min-heap of size n** — the root is always the lowest-priority item in the current top-n
4. For each notification: push to heap, if size > n, pop the minimum (evict the least important)
5. Result: heap contains exactly the top-n; sort descending to return

**Time complexity:** O(m log n) for m notifications — efficient even as notifications stream in  
**Space complexity:** O(n)

---

### Implementation

See: [`notification-app-be/services/priorityService.js`](./notification-app-be/services/priorityService.js)

**API Endpoint:**
```
GET /notifications/priority?n=10
Authorization: Bearer <token>
```

**Sample Response:**
```json
{
  "count": 10,
  "notifications": [
    {
      "ID": "abc123",
      "Type": "Placement",
      "Message": "Interview scheduled with TCS",
      "Timestamp": "2026-06-23 09:00:00"
    },
    {
      "ID": "def456",
      "Type": "Placement",
      "Message": "Placement drive: Infosys",
      "Timestamp": "2026-06-22 14:30:00"
    },
    {
      "ID": "ghi789",
      "Type": "Result",
      "Message": "End-sem results published",
      "Timestamp": "2026-06-21 10:00:00"
    }
  ]
}
```

---

### Maintaining Top-N Efficiently as New Notifications Arrive

The min-heap approach handles this naturally:

- **New notification comes in** → push to heap → if `heap.size() > n`, pop minimum
- The heap always holds exactly the top-n seen so far
- Each new notification takes O(log n) time — no need to re-sort the full list
- This scales to millions of notifications without degradation
