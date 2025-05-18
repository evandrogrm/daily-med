import request from 'supertest';
import { Medication } from '../../core/domain/entities/medication.entity';
import { connect, disconnect } from '../../infrastructure/config/database';
import { Server } from '../../infrastructure/server';

describe('Medication API Integration Tests', () => {
  let server: any;

  beforeAll(async () => {
    await connect();
    const testServer = new Server(0); // Use port 0 to get a random available port
    server = testServer.app;
  });

  afterAll(async () => {
    await disconnect();
  });

  describe('POST /api/medications', () => {
    it('should create a new medication', async () => {
      const medicationData = {
        name: 'Test Medication',
        dosage: '100mg',
        frequency: 'Once daily',
        description: 'A test medication',
        activeIngredients: ['Test Ingredient'],
        sideEffects: ['Test Side Effect'],
      };

      const response = await request(server)
        .post('/api/medications')
        .send(medicationData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toMatchObject({
        name: medicationData.name,
        dosage: medicationData.dosage,
        frequency: medicationData.frequency,
        description: medicationData.description,
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });
  });

  describe('GET /api/medications/:id', () => {
    let createdMedication: Medication;

    beforeEach(async () => {
      const medicationData = {
        name: 'Test Get Medication',
        dosage: '50mg',
        frequency: 'Twice daily',
      };

      const response = await request(server)
        .post('/api/medications')
        .send(medicationData);

      createdMedication = response.body;
    });

    it('should get a medication by id', async () => {
      const response = await request(server)
        .get(`/api/medications/${createdMedication.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdMedication.id,
        name: createdMedication.name,
        dosage: createdMedication.dosage,
        frequency: createdMedication.frequency,
      });
    });

    it('should return 404 for non-existent medication', async () => {
      const nonExistentId = '5f8d0a8b7d1e8f3d8c6e5d4f';

      await request(server)
        .get(`/api/medications/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('GET /api/medications', () => {
    beforeEach(async () => {
      const medications = [
        { name: 'Medication 1', dosage: '100mg', frequency: 'Once daily' },
        { name: 'Medication 2', dosage: '200mg', frequency: 'Twice daily' },
        { name: 'Another Medication', dosage: '50mg', frequency: 'As needed' },
      ];

      for (const med of medications) {
        await request(server).post('/api/medications').send(med);
      }
    });

    it('should get all medications', async () => {
      const response = await request(server)
        .get('/api/medications')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
    });

    it('should search medications by name', async () => {
      const response = await request(server)
        .get('/api/medications/search?q=Medication')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });
  });

  describe('PUT /api/medications/:id', () => {
    let createdMedication: Medication;

    beforeEach(async () => {
      const medicationData = {
        name: 'Test Update Medication',
        dosage: '10mg',
        frequency: 'Once daily',
      };

      const response = await request(server)
        .post('/api/medications')
        .send(medicationData);

      createdMedication = response.body;
    });

    it('should update a medication', async () => {
      const updateData = {
        dosage: '20mg',
        frequency: 'Twice daily',
      };

      const response = await request(server)
        .put(`/api/medications/${createdMedication.id}`)
        .send(updateData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdMedication.id,
        name: createdMedication.name,
        dosage: updateData.dosage,
        frequency: updateData.frequency,
      });
    });
  });

  describe('DELETE /api/medications/:id', () => {
    let createdMedication: Medication;

    beforeEach(async () => {
      const medicationData = {
        name: 'Test Delete Medication',
        dosage: '5mg',
        frequency: 'Once daily',
      };

      const response = await request(server)
        .post('/api/medications')
        .send(medicationData);

      createdMedication = response.body;
    });

    it('should delete a medication', async () => {
      await request(server)
        .delete(`/api/medications/${createdMedication.id}`)
        .expect(204);

      await request(server)
        .get(`/api/medications/${createdMedication.id}`)
        .expect(404);
    });
  });
});
