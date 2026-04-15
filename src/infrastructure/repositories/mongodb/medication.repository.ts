import { injectable } from 'tsyringe';
import mongoose from 'mongoose';
import { IMedicationRepository } from '../../../../core/domain/interfaces/repositories/medication.repository.interface';
import { Medication as MedicationEntity } from '../../../../core/domain/entities/medication.entity';
import { Medication as MedicationModel, IMedicationDocument } from './models/medication.model';
import { AppError, BadRequestError } from '../../../../core/errors/app-error';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

@injectable()
export class MedicationRepository implements IMedicationRepository {
  private toDomain(medication: IMedicationDocument): MedicationEntity {
    return {
      id: medication._id.toString(),
      name: medication.name,
      description: medication.description,
      dosage: medication.dosage,
      frequency: medication.frequency,
      activeIngredients: medication.activeIngredients,
      sideEffects: medication.sideEffects,
      indications: medication.indications,
      createdAt: medication.createdAt,
      updatedAt: medication.updatedAt,
    };
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof mongoose.Error.CastError) {
      throw new BadRequestError(`Invalid ID format: ${error.value}`);
    }

    if (error instanceof mongoose.Error.ValidationError) {
      const details = Object.values(error.errors).map(e => e.message);
      throw new BadRequestError('Validation failed', details);
    }

    if (
      error instanceof Error &&
      'code' in error &&
      (error as Record<string, unknown>).code === 11000
    ) {
      throw new AppError('Duplicate entry', 409, 'CONFLICT');
    }

    throw new AppError(
      `Database error during ${operation}`,
      500,
      'DATABASE_ERROR',
      error instanceof Error ? error.message : undefined,
    );
  }

  async create(medication: Omit<MedicationEntity, 'id'>): Promise<MedicationEntity> {
    try {
      const newMedication = new MedicationModel(medication);
      const saved = await newMedication.save();
      return this.toDomain(saved);
    } catch (error) {
      this.handleDatabaseError(error, 'create');
    }
  }

  async findById(id: string): Promise<MedicationEntity | null> {
    if (!isValidObjectId(id)) {
      throw new BadRequestError(`Invalid medication ID format: "${id}"`);
    }

    try {
      const medication = await MedicationModel.findById(id).exec();
      return medication ? this.toDomain(medication) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findAll(): Promise<MedicationEntity[]> {
    try {
      const medications = await MedicationModel.find().exec();
      return medications.map(this.toDomain.bind(this));
    } catch (error) {
      this.handleDatabaseError(error, 'findAll');
    }
  }

  async update(id: string, updates: Partial<Omit<MedicationEntity, 'id'>>): Promise<MedicationEntity | null> {
    if (!isValidObjectId(id)) {
      throw new BadRequestError(`Invalid medication ID format: "${id}"`);
    }

    try {
      const updated = await MedicationModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).exec();
      return updated ? this.toDomain(updated) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'update');
    }
  }

  async delete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      throw new BadRequestError(`Invalid medication ID format: "${id}"`);
    }

    try {
      const result = await MedicationModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
    }
  }

  async search(query: string): Promise<MedicationEntity[]> {
    try {
      const escapedQuery = escapeRegex(query);
      const medications = await MedicationModel.find({
        $or: [
          { name: { $regex: escapedQuery, $options: 'i' } },
          { description: { $regex: escapedQuery, $options: 'i' } },
          { 'indications.description': { $regex: escapedQuery, $options: 'i' } },
        ],
      }).exec();
      return medications.map(this.toDomain.bind(this));
    } catch (error) {
      this.handleDatabaseError(error, 'search');
    }
  }
}
