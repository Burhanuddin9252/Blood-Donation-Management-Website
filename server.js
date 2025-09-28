var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var path = require('path');
var database = require('./database');

var app = express();
var port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));

var db = database.getDatabase();

database.createTables();

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/stats', function(req, res) {
    var stats = {};
    
    db.get("SELECT COUNT(*) as count FROM donors", function(err, row) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        stats.total_donors = row.count;
        
        db.get("SELECT COUNT(*) as count FROM hospitals", function(err, row) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            stats.total_hospitals = row.count;
            
            db.get("SELECT COUNT(*) as count FROM blood_requests WHERE status = 'pending'", function(err, row) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                stats.pending_requests = row.count;
                res.json(stats);
            });
        });
    });
});

app.get('/api/donors', function(req, res) {
    var sql = "SELECT d.*, bt.type_name as blood_type, COALESCE(SUM(dn.quantity), 0) as total_donated FROM donors d JOIN blood_types bt ON d.blood_type_id = bt.id LEFT JOIN donations dn ON d.id = dn.donor_id GROUP BY d.id ORDER BY d.created_at DESC";
    
    db.all(sql, function(err, rows) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/donors', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var blood_type = req.body.blood_type;
    var age = req.body.age;
    var weight = req.body.weight;
    var address = req.body.address;
    
    var sql = "SELECT id FROM blood_types WHERE type_name = ?";
    db.get(sql, [blood_type], function(err, row) {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        
        if (!row) {
            res.json({ success: false, message: 'Invalid blood type' });
            return;
        }
        
        var insertSql = "INSERT INTO donors (name, email, phone, blood_type_id, age, weight, address) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.run(insertSql, [name, email, phone, row.id, age, weight, address], function(err) {
            if (err) {
                res.json({ success: false, message: err.message });
                return;
            }
            res.json({ success: true, message: 'Donor registered successfully' });
        });
    });
});

app.get('/api/hospitals', function(req, res) {
    var sql = "SELECT * FROM hospitals ORDER BY created_at DESC";
    
    db.all(sql, function(err, rows) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/hospitals', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var license_number = req.body.license_number;
    var address = req.body.address;
    
    var sql = "INSERT INTO hospitals (name, email, phone, license_number, address) VALUES (?, ?, ?, ?, ?)";
    
    db.run(sql, [name, email, phone, license_number, address], function(err) {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        res.json({ success: true, message: 'Hospital registered successfully' });
    });
});

app.get('/api/requests', function(req, res) {
    var sql = "SELECT br.*, h.name as hospital_name, bt.type_name as blood_type FROM blood_requests br JOIN hospitals h ON br.hospital_id = h.id JOIN blood_types bt ON br.blood_type_id = bt.id ORDER BY br.request_date DESC";
    
    db.all(sql, function(err, rows) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/requests', function(req, res) {
    var hospital_id = req.body.hospital_id;
    var blood_type = req.body.blood_type;
    var quantity = req.body.quantity;
    var urgency = req.body.urgency;
    var required_date = req.body.required_date;
    var notes = req.body.notes;
    
    var sql = "SELECT id FROM blood_types WHERE type_name = ?";
    db.get(sql, [blood_type], function(err, row) {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        
        if (!row) {
            res.json({ success: false, message: 'Invalid blood type' });
            return;
        }
        
        var insertSql = "INSERT INTO blood_requests (hospital_id, blood_type_id, quantity, urgency, required_date, notes) VALUES (?, ?, ?, ?, ?, ?)";
        db.run(insertSql, [hospital_id, row.id, quantity, urgency, required_date, notes], function(err) {
            if (err) {
                res.json({ success: false, message: err.message });
                return;
            }
            res.json({ success: true, message: 'Blood request submitted successfully' });
        });
    });
});

app.get('/api/search', function(req, res) {
    var blood_type = req.query.blood_type;
    var name = req.query.name;
    
    var sql, params;
    
    if (name) {
        sql = "SELECT d.*, bt.type_name as blood_type, COALESCE(SUM(dn.quantity), 0) as total_donated FROM donors d JOIN blood_types bt ON d.blood_type_id = bt.id LEFT JOIN donations dn ON d.id = dn.donor_id WHERE d.name LIKE ? GROUP BY d.id ORDER BY d.name ASC";
        params = ['%' + name + '%'];
    } else if (blood_type) {
        sql = "SELECT d.*, bt.type_name as blood_type, COALESCE(SUM(dn.quantity), 0) as total_donated FROM donors d JOIN blood_types bt ON d.blood_type_id = bt.id LEFT JOIN donations dn ON d.id = dn.donor_id WHERE bt.type_name = ? GROUP BY d.id ORDER BY d.last_donation ASC";
        params = [blood_type];
    } else {
        sql = "SELECT d.*, bt.type_name as blood_type, COALESCE(SUM(dn.quantity), 0) as total_donated FROM donors d JOIN blood_types bt ON d.blood_type_id = bt.id LEFT JOIN donations dn ON d.id = dn.donor_id GROUP BY d.id ORDER BY bt.type_name, d.last_donation ASC";
        params = [];
    }
    
    db.all(sql, params, function(err, rows) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/donations', function(req, res) {
    var donor_id = req.body.donor_id;
    var hospital_id = req.body.hospital_id;
    var blood_type = req.body.blood_type;
    var quantity = req.body.quantity;
    var donation_date = req.body.donation_date;
    var notes = req.body.notes;
    
    var sql = "SELECT id FROM blood_types WHERE type_name = ?";
    db.get(sql, [blood_type], function(err, row) {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        
        if (!row) {
            res.json({ success: false, message: 'Invalid blood type' });
            return;
        }
        
        var insertSql = "INSERT INTO donations (donor_id, hospital_id, blood_type_id, donation_date, quantity, notes) VALUES (?, ?, ?, ?, ?, ?)";
        db.run(insertSql, [donor_id, hospital_id, row.id, donation_date, quantity, notes], function(err) {
            if (err) {
                res.json({ success: false, message: err.message });
                return;
            }
            
            var updateSql = "UPDATE donors SET last_donation = ? WHERE id = ?";
            db.run(updateSql, [donation_date, donor_id], function(err) {
                if (err) {
                    console.log('Error updating last donation date: ' + err.message);
                }
            });
            
            res.json({ success: true, message: 'Blood donation recorded successfully' });
        });
    });
});

app.delete('/api/donors/:id', function(req, res) {
    var donorId = req.params.id;
    
    var sql = "DELETE FROM donors WHERE id = ?";
    db.run(sql, [donorId], function(err) {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        res.json({ success: true, message: 'Donor deleted successfully' });
    });
});

app.delete('/api/hospitals/:id', function(req, res) {
    var hospitalId = req.params.id;
    
    var sql = "DELETE FROM hospitals WHERE id = ?";
    db.run(sql, [hospitalId], function(err) {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        res.json({ success: true, message: 'Hospital deleted successfully' });
    });
});

app.put('/api/requests/:id/status', function(req, res) {
    var requestId = req.params.id;
    var newStatus = req.body.status;
    
    var sql = "UPDATE blood_requests SET status = ? WHERE id = ?";
    db.run(sql, [newStatus, requestId], function(err) {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        res.json({ success: true, message: 'Request status updated successfully' });
    });
});

app.listen(port, function() {
    console.log('Blood Bank System is running at http://localhost:' + port);
    console.log('Press Ctrl+C to stop the server');
});