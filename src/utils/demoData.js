// Initialize demo data on first registration
export const initDemoData = (userId) => {
  const demoVehicles = [
    {
      id: Date.now(),
      userId,
      make: 'Tesla',
      model: 'Model 3',
      year: 2022,
      mileage: 18500,
      licensePlate: 'TESLA123',
      vin: '5YJ3E1EAXNF123456',
      fuelType: 'Electric',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: Date.now() + 1,
      userId,
      make: 'BMW',
      model: 'X5',
      year: 2021,
      mileage: 32450,
      licensePlate: 'BMWX5',
      vin: '5UXCR6C56M9X12345',
      fuelType: 'Gasoline',
      status: 'Active',
      createdAt: new Date().toISOString()
    }
  ];

  const demoAppointments = [
    {
      id: Date.now(),
      userId,
      vehicleId: Date.now(),
      service: 'Annual Maintenance',
      date: '2024-03-15',
      time: '10:00 AM',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }
  ];

  // Save to localStorage
  localStorage.setItem(`vehicles_${userId}`, JSON.stringify(demoVehicles));
  localStorage.setItem(`appointments_${userId}`, JSON.stringify(demoAppointments));

  return { vehicles: demoVehicles, appointments: demoAppointments };
};