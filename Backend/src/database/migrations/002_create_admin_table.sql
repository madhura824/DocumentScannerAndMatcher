CREATE TABLE IF NOT EXISTS admins (
    adminId TEXT NOT NULL CHECK(length(adminId) >= 8) PRIMARY KEY,
    adminName TEXT NOT NULL CHECK(length(adminName) >= 5),
    _password TEXT NOT NULL
);