const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();

require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'cargo_db'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Initialize flight with cargo capacity
app.post('/api/flight/initialize', (req, res) => {
    const { flightId, totalCapacity = 20000 } = req.body; // Default 20000kg capacity
    
    const query = `INSERT INTO flights (flight_id, total_capacity, remaining_capacity) 
                   VALUES (?, ?, ?)`;
    
    connection.query(query, [flightId, totalCapacity, totalCapacity], (err, result) => {
        if (err) {
            console.error('Error initializing flight:', err);
            res.status(500).json({ error: 'Failed to initialize flight' });
            return;
        }
        res.json({ 
            message: 'Flight initialized successfully',
            flightId,
            totalCapacity,
            remainingCapacity: totalCapacity
        });
    });
});

// Handle passenger cargo check-in
app.post('/api/cargo/check-in', (req, res) => {
    const { flightId, passengerId, weight } = req.body;
    const standardWeight = 35; // Standard weight limit
    const baseRate = 100; // Base price per kg

    // Get current flight capacity
    connection.query(
        'SELECT * FROM flights WHERE flight_id = ?',
        [flightId],
        (err, flights) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }

            if (flights.length === 0) {
                res.status(404).json({ error: 'Flight not found' });
                return;
            }

            const flight = flights[0];
            const remainingCapacity = flight.remaining_capacity;

            // Check if there's enough capacity
            if (weight > remainingCapacity) {
                res.status(400).json({
                    error: 'Exceeds remaining capacity',
                    remainingCapacity
                });
                return;
            }

            // Calculate price
            let price = baseRate;
            if (weight > standardWeight) {
                const extraWeight = weight - standardWeight;
                price += extraWeight * (baseRate * 1.5); // 50% extra for additional weight
            } else if (weight < standardWeight) {
                // Calculate discount based on remaining capacity percentage
                const capacityUtilization = (flight.total_capacity - remainingCapacity) / flight.total_capacity;
                if (capacityUtilization < 0.5) {
                    price = price * 0.8; // 20% discount when utilization is low
                }
            }

            // Update remaining capacity and record check-in
            const newRemainingCapacity = remainingCapacity - weight;
            connection.query(
                'UPDATE flights SET remaining_capacity = ? WHERE flight_id = ?',
                [newRemainingCapacity, flightId],
                (updateErr) => {
                    if (updateErr) {
                        res.status(500).json({ error: 'Failed to update capacity' });
                        return;
                    }

                    // Record the check-in
                    const checkInQuery = `
                        INSERT INTO cargo_checkins 
                        (flight_id, passenger_id, weight, price) 
                        VALUES (?, ?, ?, ?)
                    `;
                    
                    connection.query(checkInQuery, 
                        [flightId, passengerId, weight, price],
                        (checkInErr) => {
                            if (checkInErr) {
                                res.status(500).json({ error: 'Failed to record check-in' });
                                return;
                            }

                            res.json({
                                message: 'Cargo checked in successfully',
                                checkedInWeight: weight,
                                price,
                                remainingCapacity: newRemainingCapacity
                            });
                        }
                    );
                }
            );
        }
    );
});

// Get flight cargo status
app.get('/api/flight/:flightId/status', (req, res) => {
    const { flightId } = req.params;
    
    connection.query(
        'SELECT * FROM flights WHERE flight_id = ?',
        [flightId],
        (err, flights) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }

            if (flights.length === 0) {
                res.status(404).json({ error: 'Flight not found' });
                return;
            }

            const flight = flights[0];
            res.json({
                flightId: flight.flight_id,
                totalCapacity: flight.total_capacity,
                remainingCapacity: flight.remaining_capacity,
                usedCapacity: flight.total_capacity - flight.remaining_capacity
            });
        }
    );
});

// Get all check-ins for a flight
app.get('/api/flight/:flightId/check-ins', (req, res) => {
    const { flightId } = req.params;
    
    const query = `
        SELECT c.*, p.passenger_name 
        FROM cargo_checkins c
        JOIN passengers p ON c.passenger_id = p.passenger_id
        WHERE c.flight_id = ?
        ORDER BY c.check_in_time DESC
    `;
    
    connection.query(query, [flightId], (err, checkins) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        
        res.json(checkins);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
