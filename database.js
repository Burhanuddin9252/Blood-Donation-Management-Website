var sqlite3 = require('sqlite3').verbose();
var path = require('path');

var dbPath = path.join(__dirname, 'bloodbank.db');
var db = new sqlite3.Database(dbPath);

function createTables() {
    db.run("CREATE TABLE IF NOT EXISTS blood_types (id INTEGER PRIMARY KEY AUTOINCREMENT, type_name TEXT NOT NULL, description TEXT)");
    
    db.run("CREATE TABLE IF NOT EXISTS donors (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, phone TEXT NOT NULL, blood_type_id INTEGER NOT NULL, age INTEGER NOT NULL, weight REAL NOT NULL, last_donation DATE, is_available BOOLEAN DEFAULT 1, address TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (blood_type_id) REFERENCES blood_types(id))");
    
    db.run("CREATE TABLE IF NOT EXISTS hospitals (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL, license_number TEXT UNIQUE NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
    
    db.run("CREATE TABLE IF NOT EXISTS blood_requests (id INTEGER PRIMARY KEY AUTOINCREMENT, hospital_id INTEGER NOT NULL, blood_type_id INTEGER NOT NULL, quantity INTEGER NOT NULL, urgency TEXT DEFAULT 'medium', status TEXT DEFAULT 'pending', request_date DATETIME DEFAULT CURRENT_TIMESTAMP, required_date DATE, notes TEXT, FOREIGN KEY (hospital_id) REFERENCES hospitals(id), FOREIGN KEY (blood_type_id) REFERENCES blood_types(id))");
    
    db.run("CREATE TABLE IF NOT EXISTS donations (id INTEGER PRIMARY KEY AUTOINCREMENT, donor_id INTEGER NOT NULL, hospital_id INTEGER NOT NULL, blood_type_id INTEGER NOT NULL, donation_date DATE NOT NULL, quantity INTEGER NOT NULL, status TEXT DEFAULT 'scheduled', notes TEXT, FOREIGN KEY (donor_id) REFERENCES donors(id), FOREIGN KEY (hospital_id) REFERENCES hospitals(id), FOREIGN KEY (blood_type_id) REFERENCES blood_types(id))");
    
    insertBloodTypes();
}

function insertBloodTypes() {
    var bloodTypes = [
        ['A+', 'A positive blood type'],
        ['A-', 'A negative blood type'],
        ['B+', 'B positive blood type'],
        ['B-', 'B negative blood type'],
        ['AB+', 'AB positive blood type'],
        ['AB-', 'AB negative blood type'],
        ['O+', 'O positive blood type'],
        ['O-', 'O negative blood type']
    ];
    
    var stmt = db.prepare("INSERT OR IGNORE INTO blood_types (type_name, description) VALUES (?, ?)");
    for (var i = 0; i < bloodTypes.length; i++) {
        stmt.run(bloodTypes[i][0], bloodTypes[i][1]);
    }
    stmt.finalize();
}

function getDatabase() {
    return db;
}

module.exports = {
    createTables: createTables,
    getDatabase: getDatabase
};