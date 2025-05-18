import { Schema, model, Document } from 'mongoose';
import { Medication as MedicationEntity } from '../../../../../core/domain/entities/medication.entity';

export interface IMedicationDocument extends Omit<MedicationEntity, 'id'>, Document {}

const IndicationSchema = new Schema({
  description: { type: String, required: true },
  icd10Code: { type: String },
  icd10Description: { type: String },
  confidence: { type: Number, min: 0, max: 1 }
});

const MedicationSchema = new Schema<IMedicationDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, trim: true },
    activeIngredients: [{ type: String, trim: true }],
    sideEffects: [{ type: String, trim: true }],
    indications: [IndicationSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Medication = model<IMedicationDocument>('Medication', MedicationSchema);
