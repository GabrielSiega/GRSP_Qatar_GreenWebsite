const form = document.getElementById('bookingForm');
const bookingsTableBody = document.querySelector('#bookingsTable tbody');   // bookings table
const availableFlightsTableBody = document.querySelector('#availableFlightsTable tbody'); // schedule table
const originDropdown = document.getElementById('origin');
const destinationDropdown = document.getElementById('destination');

// Load available flights for dropdowns and schedule table
async function loadAvailableFlights() {
  try {
    const response = await fetch('/api/flights');
    const flights = await response.json();

    // Populate dropdowns
    const origins = [...new Set(flights.map(f => f.origin))];
    const destinations = [...new Set(flights.map(f => f.destination))];

    originDropdown.innerHTML = '<option value="">-- Select origin --</option>';
    origins.forEach(origin => {
      const option = document.createElement('option');
      option.value = origin;
      option.textContent = origin;
      originDropdown.appendChild(option);
    });

    destinationDropdown.innerHTML = '<option value="">-- Select destination --</option>';
    destinations.forEach(dest => {
      const option = document.createElement('option');
      option.value = dest;
      option.textContent = dest;
      destinationDropdown.appendChild(option);
    });

    // Populate available flights table
    availableFlightsTableBody.innerHTML = '';
    flights.forEach(flight => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${flight.flightNumber}</td>
        <td>${flight.origin}</td>
        <td>${flight.destination}</td>
        <td>${flight.departureDate}</td>
        <td>${flight.arrivalDate}</td>
      `;
      availableFlightsTableBody.appendChild(row);
    });
  } catch (err) {
    console.error('Error loading available flights:', err);
  }
}

// Load bookings into table
async function loadBookings(highlightId = null) {
  try {
    const response = await fetch('/api/bookings');
    const bookings = await response.json();

    bookingsTableBody.innerHTML = '';
    bookings.forEach(booking => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${booking.id}</td>
        <td>${booking.passengerName || '-'}</td>
        <td>${booking.origin || '-'}</td>
        <td>${booking.destination || '-'}</td>
        <td>${booking.departureDate || '-'}</td>
        <td>${booking.arrivalDate || '-'}</td>
        <td>${booking.class || '-'}</td>
        <td>${booking.status || 'Confirmed'}</td>
      `;
      if (highlightId && booking.id === highlightId) {
        row.style.backgroundColor = '#d4edda';
        setTimeout(() => { row.style.backgroundColor = ''; }, 2000);
      }
      bookingsTableBody.appendChild(row);
    });
  } catch (err) {
    console.error('Error loading bookings:', err);
  }
}

// Check if a booking with same origin → destination exists (case-insensitive, ignoring dates)
async function checkExistingBooking(origin, destination) {
  try {
    const response = await fetch('/api/bookings');
    const bookings = await response.json();
    return bookings.some(
      b => b.origin.toLowerCase() === origin.toLowerCase() &&
           b.destination.toLowerCase() === destination.toLowerCase()
    );
  } catch (err) {
    console.error('Error checking existing bookings:', err);
    return false;
  }
}

async function loadBookings(highlightId = null) {
  try {
    const response = await fetch('/api/bookings');
    const bookings = await response.json();

    bookingsTableBody.innerHTML = '';
    bookings.forEach(booking => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${booking.id}</td>
        <td>${booking.passengerName}</td>
        <td>${booking.origin}</td>
        <td>${booking.destination}</td>
        <td>${booking.status}</td>
      `;
      if (highlightId && booking.id === highlightId) {
        row.style.backgroundColor = '#d4edda';
        setTimeout(() => { row.style.backgroundColor = ''; }, 2000);
      }
      bookingsTableBody.appendChild(row);
    });
  } catch (err) {
    console.error('Error loading bookings:', err);
  }
}


// Handle booking form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const booking = Object.fromEntries(formData.entries());

  // Check for duplicate route (ignoring dates)
  const duplicate = await checkExistingBooking(booking.origin, booking.destination);
  if (duplicate) {
    alert(`A booking from ${booking.origin} to ${booking.destination} already exists!`);
    return; // stop submission
  }

  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });

    const result = await response.json();
    alert(`Flight booked for ${result.booking.passengerName}`);
    loadBookings(result.booking.id);
  } catch (err) {
    console.error('Error booking flight:', err);
    alert('Failed to book flight. Please try again.');
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadAvailableFlights();  // show schedule
  loadBookings();          // show bookings
});
