import mongoose, { Schema } from 'mongoose';

const AppSettingsSchema = new Schema({
  key: { type: String, default: 'global', unique: true },
  data: Schema.Types.Mixed,
});

export default mongoose.models.AppSettings || mongoose.model('AppSettings', AppSettingsSchema);
