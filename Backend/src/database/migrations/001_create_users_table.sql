CREATE TABLE IF NOT EXISTS users (
    userId TEXT NOT NULL CHECK(length(userId) >= 8) PRIMARY KEY,
    userName TEXT NOT NULL CHECK(length(userName) >= 5),
    totalCredits INTEGER NOT NULL DEFAULT 20,
    creditsUsed INTEGER NOT NULL CHECK(creditsUsed >= 0),
    _password TEXT NOT NULL
);