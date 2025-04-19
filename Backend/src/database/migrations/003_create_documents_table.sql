CREATE TABLE IF NOT EXISTS documents (
    documentId TEXT NOT NULL CHECK(length(documentId) >= 8) PRIMARY KEY,
    documentSize INTEGER NOT NULL CHECK(documentSize >= 0),
    _timestamp TEXT NOT NULL,
    userId TEXT NOT NULL CHECK(length(userId) >= 8),
    documentName TEXT NOT NULL,
    storageUrl TEXT NOT NULL,
    category TEXT NOT NULL
);