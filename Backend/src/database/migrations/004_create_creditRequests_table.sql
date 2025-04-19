CREATE TABLE IF NOT EXISTS creditRequests (
    requestId TEXT NOT NULL CHECK(length(requestId) >= 8) PRIMARY KEY,
    userId TEXT NOT NULL CHECK(length(userId) >= 8),
    _timestamp TEXT NOT NULL,
    requestedCredits INTEGER NOT NULL CHECK(requestedCredits > 1 AND requestedCredits <= 5),
    flag TEXT NOT NULL CHECK(flag IN ('approved', 'denied', 'pending'))
);