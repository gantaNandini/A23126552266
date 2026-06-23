/**
 * Stage 6 — Priority Inbox
 *
 * Determines the top-n most important unread notifications using a
 * min-heap (priority queue). Priority is based on:
 *   1. Type weight: Placement (3) > Result (2) > Event (1)
 *   2. Recency: more recent notifications rank higher (used as tiebreaker)
 *
 * Using a min-heap of size n means we can maintain the top-n efficiently
 * as new notifications arrive — O(m log n) for m notifications.
 */

// Weight map for notification types
const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

/**
 * Compute a numeric priority score for a notification.
 * Higher = more important.
 * Score = typeWeight * 1e13 + timestampMs
 * This ensures type dominates, with recency as tiebreaker.
 */
function score(notification) {
  const weight = TYPE_WEIGHT[notification.Type] ?? 0;
  const ts = new Date(notification.Timestamp).getTime();
  return weight * 1e13 + ts;
}

/**
 * Min-heap implementation keyed on score.
 * The root always holds the lowest-priority item,
 * so we can efficiently evict it when the heap exceeds size n.
 */
class MinHeap {
  constructor() {
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0];
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (score(this.heap[parent]) <= score(this.heap[i])) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && score(this.heap[left]) < score(this.heap[smallest])) {
        smallest = left;
      }
      if (right < n && score(this.heap[right]) < score(this.heap[smallest])) {
        smallest = right;
      }
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

/**
 * Returns the top-n notifications sorted highest priority first.
 * Works efficiently even as new notifications stream in.
 *
 * @param {Array} notifications - array of notification objects
 * @param {number} n            - how many top notifications to return
 * @returns {Array}             - top-n notifications, highest priority first
 */
function getPriorityNotifications(notifications, n = 10) {
  const heap = new MinHeap();

  for (const notification of notifications) {
    heap.push(notification);
    // Keep heap size at most n — evict the lowest priority
    if (heap.size() > n) {
      heap.pop();
    }
  }

  // Extract all items from heap and sort descending (highest priority first)
  const result = [];
  while (heap.size() > 0) {
    result.push(heap.pop());
  }

  return result.sort((a, b) => score(b) - score(a));
}

module.exports = { getPriorityNotifications, score };
