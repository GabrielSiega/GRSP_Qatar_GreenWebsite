const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000;

app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.json());

const availableFlights = require('./flights');
const bookings = []; // separate array for user bookings

// Available flights (for dropdowns)
app.get('/api/flights', (req, res) => {
  res.json(availableFlights);
});

// Bookings API (for table)
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// Book a flight
app.post('/api/bookings', (req, res) => {
  const { origin, destination, passengerName } = req.body;

  if (!origin || !destination || !passengerName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newBooking = {
    id: bookings.length + 1,
    origin,
    destination,
    passengerName,
    status: 'Confirmed'
  };

  bookings.push(newBooking);
  res.status(201).json({ message: 'Booking added successfully', booking: newBooking });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
