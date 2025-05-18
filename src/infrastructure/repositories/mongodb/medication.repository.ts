import { injectable } from 'tsyringe';
import { Model } from 'mongoose';
import { IMedicationRepository } from '../../../../core/domain/interfaces/repositories/medication.repository.interface';
import { Medication as MedicationEntity } from '../../../../core/domain/entities/medication.entity';
import { Medication as MedicationModel, IMedicationDocument } from './models/medication.model';

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

  async create(medication: Omit<MedicationEntity, 'id'>): Promise<MedicationEntity> {
    const newMedication = new MedicationModel(medication);
    const saved = await newMedication.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<MedicationEntity | null> {
    const medication = await MedicationModel.findById(id).exec();
    return medication ? this.toDomain(medication) : null;
  }

  async findAll(): Promise<MedicationEntity[]> {
    const medications = await MedicationModel.find().exec();
    return medications.map(this.toDomain.bind(this));
  }

  async update(id: string, updates: Partial<Omit<MedicationEntity, 'id'>>): Promise<MedicationEntity | null> {
    const updated = await MedicationModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).exec();
    return updated ? this.toDomain(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await MedicationModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async search(query: string): Promise<MedicationEntity[]> {
    const medications = await MedicationModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'indications.description': { $regex: query, $options: 'i' } },
      ],
    }).exec();
    return medications.map(this.toDomain.bind(this));
  }
}
