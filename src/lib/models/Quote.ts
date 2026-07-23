import mongoose, { Schema } from 'mongoose';

const QuoteSchema = new Schema({
  id: { type: String, required: true, unique: true },
  quoteNumber: { type: String, required: true },
  createdAt: { type: String, required: true },
  form: Schema.Types.Mixed,
  calc: Schema.Types.Mixed,
  settings: Schema.Types.Mixed,
});

export default mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);
