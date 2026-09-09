import * as mockData from '../src/lib/mock-data.ts';
import * as fs from 'fs';

const data = {
  vehicles: mockData.vehicles,
  customers: mockData.customers,
  employees: mockData.employees,
  bookings: mockData.bookings,
  rentalAgreements: mockData.rentalAgreements,
  payments: mockData.payments,
  maintenanceRecords: mockData.maintenanceRecords,
  documents: mockData.documents,
  reviews: mockData.reviews,
  notifications: mockData.notifications,
  bookRelations: mockData.bookRelations,
  serviceAssignments: mockData.serviceAssignments
};

fs.writeFileSync('./seed_data.json', JSON.stringify(data, null, 2));
console.log('Seed data dumped to seed_data.json');
