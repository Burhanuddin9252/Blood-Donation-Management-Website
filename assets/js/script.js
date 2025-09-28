window.onload = function() {
    loadStats();
    loadDonors();
    loadHospitals();
    loadRequests();
    loadHospitalOptions();
    loadDonorOptions();
    loadHospitalOptionsForDonation();
};

function showPage(pageName) {
    var pages = document.getElementsByClassName('page');
    for (var i = 0; i < pages.length; i++) {
        pages[i].style.display = 'none';
    }
    document.getElementById(pageName).style.display = 'block';
}

function loadStats() {
    fetch('/api/stats')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            document.getElementById('donorCount').textContent = data.total_donors;
            document.getElementById('hospitalCount').textContent = data.total_hospitals;
            document.getElementById('requestCount').textContent = data.pending_requests;
        })
        .catch(function(error) {
            console.log('Error loading stats: ' + error);
        });
}

function loadDonors() {
    fetch('/api/donors')
        .then(function(response) {
            return response.json();
        })
        .then(function(donors) {
            var donorsList = document.getElementById('donorsList');
            if (donors.length === 0) {
                donorsList.innerHTML = '<p>No donors registered yet.</p>';
                return;
            }
            
            var html = '';
            for (var i = 0; i < donors.length; i++) {
                var donor = donors[i];
                html += '<div class="donor-item">';
                html += '<h4>' + donor.name + '</h4>';
                html += '<p><strong>Blood Type:</strong> <span class="blood-type">' + donor.blood_type + '</span></p>';
                html += '<p><strong>Email:</strong> ' + donor.email + '</p>';
                html += '<p><strong>Phone:</strong> ' + donor.phone + '</p>';
                html += '<p><strong>Age:</strong> ' + donor.age + ' years</p>';
                html += '<p><strong>Weight:</strong> ' + donor.weight + ' kg</p>';
                html += '<p><strong>Available:</strong> ' + (donor.is_available ? 'Yes' : 'No') + '</p>';
                html += '<p><strong>Blood Donated:</strong> <span class="donation-amount">' + (donor.total_donated || 0) + ' units</span></p>';
                html += '<button onclick="deleteDonor(' + donor.id + ')" class="btn btn-danger btn-small">Delete Donor</button>';
                html += '</div>';
            }
            donorsList.innerHTML = html;
        })
        .catch(function(error) {
            console.log('Error loading donors: ' + error);
        });
}

function loadHospitals() {
    fetch('/api/hospitals')
        .then(function(response) {
            return response.json();
        })
        .then(function(hospitals) {
            var hospitalsList = document.getElementById('hospitalsList');
            if (hospitals.length === 0) {
                hospitalsList.innerHTML = '<p>No hospitals registered yet.</p>';
                return;
            }
            
            var html = '';
            for (var i = 0; i < hospitals.length; i++) {
                var hospital = hospitals[i];
                html += '<div class="hospital-item">';
                html += '<h4>' + hospital.name + '</h4>';
                html += '<p><strong>Email:</strong> ' + hospital.email + '</p>';
                html += '<p><strong>Phone:</strong> ' + hospital.phone + '</p>';
                html += '<p><strong>License:</strong> ' + hospital.license_number + '</p>';
                html += '<p><strong>Address:</strong> ' + hospital.address + '</p>';
                html += '<button onclick="deleteHospital(' + hospital.id + ')" class="btn btn-danger btn-small">Delete Hospital</button>';
                html += '</div>';
            }
            hospitalsList.innerHTML = html;
        })
        .catch(function(error) {
            console.log('Error loading hospitals: ' + error);
        });
}

function loadRequests() {
    fetch('/api/requests')
        .then(function(response) {
            return response.json();
        })
        .then(function(requests) {
            var requestsList = document.getElementById('requestsList');
            if (requests.length === 0) {
                requestsList.innerHTML = '<p>No blood requests yet.</p>';
                return;
            }
            
            var html = '';
            for (var i = 0; i < requests.length; i++) {
                var request = requests[i];
                html += '<div class="request-item urgency-' + request.urgency + '">';
                html += '<h4>' + request.hospital_name + '</h4>';
                html += '<p><strong>Blood Type:</strong> <span class="blood-type">' + request.blood_type + '</span></p>';
                html += '<p><strong>Quantity:</strong> ' + request.quantity + ' units</p>';
                html += '<p><strong>Urgency:</strong> ' + request.urgency.toUpperCase() + '</p>';
                html += '<p><strong>Required Date:</strong> ' + request.required_date + '</p>';
                html += '<p><strong>Status:</strong> ' + request.status.toUpperCase() + '</p>';
                if (request.notes) {
                    html += '<p><strong>Notes:</strong> ' + request.notes + '</p>';
                }
                html += '<button onclick="changeRequestStatus(' + request.id + ', \'' + request.status + '\')" class="btn btn-primary btn-small">Change Status</button>';
                html += '</div>';
            }
            requestsList.innerHTML = html;
        })
        .catch(function(error) {
            console.log('Error loading requests: ' + error);
        });
}

function loadHospitalOptions() {
    fetch('/api/hospitals')
        .then(function(response) {
            return response.json();
        })
        .then(function(hospitals) {
            var select = document.getElementById('requestHospital');
            select.innerHTML = '<option value="">Choose Hospital</option>';
            for (var i = 0; i < hospitals.length; i++) {
                select.innerHTML += '<option value="' + hospitals[i].id + '">' + hospitals[i].name + '</option>';
            }
        })
        .catch(function(error) {
            console.log('Error loading hospitals for request form: ' + error);
        });
}

function loadDonorOptions() {
    fetch('/api/donors')
        .then(function(response) {
            return response.json();
        })
        .then(function(donors) {
            var select = document.getElementById('donationDonor');
            select.innerHTML = '<option value="">Choose Donor</option>';
            for (var i = 0; i < donors.length; i++) {
                select.innerHTML += '<option value="' + donors[i].id + '">' + donors[i].name + ' (' + donors[i].blood_type + ')</option>';
            }
        })
        .catch(function(error) {
            console.log('Error loading donors for donation form: ' + error);
        });
}

function loadHospitalOptionsForDonation() {
    fetch('/api/hospitals')
        .then(function(response) {
            return response.json();
        })
        .then(function(hospitals) {
            var select = document.getElementById('donationHospital');
            select.innerHTML = '<option value="">Choose Hospital</option>';
            for (var i = 0; i < hospitals.length; i++) {
                select.innerHTML += '<option value="' + hospitals[i].id + '">' + hospitals[i].name + '</option>';
            }
        })
        .catch(function(error) {
            console.log('Error loading hospitals for donation form: ' + error);
        });
}

function searchByName() {
    var name = document.getElementById('searchName').value;
    if (name === '') {
        alert('Please enter a name to search');
        return;
    }
    
    fetch('/api/search?name=' + encodeURIComponent(name))
        .then(function(response) {
            return response.json();
        })
        .then(function(donors) {
            displaySearchResults(donors);
        })
        .catch(function(error) {
            console.log('Error searching donors: ' + error);
        });
}

function searchByBloodType() {
    var bloodType = document.getElementById('searchBloodType').value;
    var url = bloodType ? '/api/search?blood_type=' + bloodType : '/api/search';
    
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(donors) {
            displaySearchResults(donors);
        })
        .catch(function(error) {
            console.log('Error searching donors: ' + error);
        });
}

function showAllDonors() {
    fetch('/api/donors')
        .then(function(response) {
            return response.json();
        })
        .then(function(donors) {
            displaySearchResults(donors);
        })
        .catch(function(error) {
            console.log('Error loading all donors: ' + error);
        });
}

function displaySearchResults(donors) {
    var searchResults = document.getElementById('searchResults');
    if (donors.length === 0) {
        searchResults.innerHTML = '<p>No donors found.</p>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < donors.length; i++) {
        var donor = donors[i];
        html += '<div class="donor-item">';
        html += '<h4>' + donor.name + '</h4>';
        html += '<p><strong>Blood Type:</strong> <span class="blood-type">' + donor.blood_type + '</span></p>';
        html += '<p><strong>Email:</strong> ' + donor.email + '</p>';
        html += '<p><strong>Phone:</strong> ' + donor.phone + '</p>';
        html += '<p><strong>Age:</strong> ' + donor.age + ' years</p>';
        html += '<p><strong>Weight:</strong> ' + donor.weight + ' kg</p>';
        html += '<p><strong>Available:</strong> ' + (donor.is_available ? 'Yes' : 'No') + '</p>';
        html += '<p><strong>Blood Donated:</strong> <span class="donation-amount">' + (donor.total_donated || 0) + ' units</span></p>';
        html += '</div>';
    }
    searchResults.innerHTML = html;
}

function deleteDonor(donorId) {
    if (confirm('Are you sure you want to delete this donor?')) {
        fetch('/api/donors/' + donorId, {
            method: 'DELETE'
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                alert('Donor deleted successfully!');
                loadDonors();
                loadStats();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(function(error) {
            console.log('Error: ' + error);
            alert('An error occurred while deleting the donor.');
        });
    }
}

function deleteHospital(hospitalId) {
    if (confirm('Are you sure you want to delete this hospital?')) {
        fetch('/api/hospitals/' + hospitalId, {
            method: 'DELETE'
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                alert('Hospital deleted successfully!');
                loadHospitals();
                loadHospitalOptions();
                loadHospitalOptionsForDonation();
                loadStats();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(function(error) {
            console.log('Error: ' + error);
            alert('An error occurred while deleting the hospital.');
        });
    }
}

function changeRequestStatus(requestId, currentStatus) {
    var newStatus;
    if (currentStatus === 'pending') {
        newStatus = 'fulfilled';
    } else if (currentStatus === 'fulfilled') {
        newStatus = 'cancelled';
    } else {
        newStatus = 'pending';
    }
    
    if (confirm('Change status from ' + currentStatus + ' to ' + newStatus + '?')) {
        fetch('/api/requests/' + requestId + '/status', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                alert('Request status updated successfully!');
                loadRequests();
                loadStats();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(function(error) {
            console.log('Error: ' + error);
            alert('An error occurred while updating the request status.');
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('donorForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        var donorData = {
            name: document.getElementById('donorName').value,
            email: document.getElementById('donorEmail').value,
            phone: document.getElementById('donorPhone').value,
            blood_type: document.getElementById('donorBloodType').value,
            age: document.getElementById('donorAge').value,
            weight: document.getElementById('donorWeight').value,
            address: document.getElementById('donorAddress').value
        };
        
        fetch('/api/donors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(donorData)
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                alert('Donor registered successfully!');
                document.getElementById('donorForm').reset();
                loadDonors();
                loadStats();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(function(error) {
            console.log('Error: ' + error);
            alert('An error occurred while registering the donor.');
        });
    });
    
    document.getElementById('hospitalForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        var hospitalData = {
            name: document.getElementById('hospitalName').value,
            email: document.getElementById('hospitalEmail').value,
            phone: document.getElementById('hospitalPhone').value,
            license_number: document.getElementById('hospitalLicense').value,
            address: document.getElementById('hospitalAddress').value
        };
        
        fetch('/api/hospitals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(hospitalData)
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                alert('Hospital registered successfully!');
                document.getElementById('hospitalForm').reset();
                loadHospitals();
                loadHospitalOptions();
                loadStats();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(function(error) {
            console.log('Error: ' + error);
            alert('An error occurred while registering the hospital.');
        });
    });
    
    document.getElementById('requestForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        var requestData = {
            hospital_id: document.getElementById('requestHospital').value,
            blood_type: document.getElementById('requestBloodType').value,
            quantity: document.getElementById('requestQuantity').value,
            urgency: document.getElementById('requestUrgency').value,
            required_date: document.getElementById('requestDate').value,
            notes: document.getElementById('requestNotes').value
        };
        
        fetch('/api/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                alert('Blood request submitted successfully!');
                document.getElementById('requestForm').reset();
                loadRequests();
                loadStats();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(function(error) {
            console.log('Error: ' + error);
            alert('An error occurred while submitting the request.');
        });
    });
    
    document.getElementById('donationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        var donationData = {
            donor_id: document.getElementById('donationDonor').value,
            hospital_id: document.getElementById('donationHospital').value,
            blood_type: document.getElementById('donationBloodType').value,
            quantity: document.getElementById('donationQuantity').value,
            donation_date: document.getElementById('donationDate').value,
            notes: document.getElementById('donationNotes').value
        };
        
        fetch('/api/donations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(donationData)
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                alert('Blood donation recorded successfully!');
                document.getElementById('donationForm').reset();
                loadDonors();
                loadStats();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(function(error) {
            console.log('Error: ' + error);
            alert('An error occurred while recording the donation.');
        });
    });
});