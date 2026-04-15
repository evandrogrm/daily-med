import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { IMedicationService } from '@core/domain/interfaces/services/medication.service.interface';
import { CreateMedicationDtoSchema } from '@application/dtos/create-medication.dto';
import { UpdateMedicationDtoSchema } from '@application/dtos/update-medication.dto';
import { validateRequest } from '@infrastructure/middlewares/validation.middleware';

@injectable()
export class MedicationController {
  constructor(
    @inject('IMedicationService') private medicationService: IMedicationService,
  ) {}

  createMedication = [
    validateRequest(CreateMedicationDtoSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const medication = await this.medicationService.createMedication(req.body);
        res.status(201).json(medication);
      } catch (error) {
        next(error);
      }
    }
  ];

  getMedication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const medication = await this.medicationService.getMedicationById(req.params.id);
      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }
      res.json(medication);
    } catch (error) {
      next(error);
    }
  };

  getAllMedications = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const medications = await this.medicationService.getAllMedications();
      res.json(medications);
    } catch (error) {
      next(error);
    }
  };

  updateMedication = [
    validateRequest(UpdateMedicationDtoSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const updated = await this.medicationService.updateMedication(req.params.id, req.body);
        if (!updated) {
          return res.status(404).json({ message: 'Medication not found' });
        }
        res.json(updated);
      } catch (error) {
        next(error);
      }
    }
  ];

  deleteMedication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await this.medicationService.deleteMedication(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Medication not found' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  searchMedications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: 'Query parameter "q" is required' });
      }
      const medications = await this.medicationService.searchMedications(q);
      res.json(medications);
    } catch (error) {
      next(error);
    }
  };

  extractIndications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: 'Text is required' });
      }
      const indications = await this.medicationService.extractAndMapIndications(text);
      res.json(indications);
    } catch (error) {
      next(error);
    }
  };
}
