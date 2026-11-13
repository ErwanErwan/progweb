import { Schema, model } from 'mongoose';

// Setup schema
const contactSchema = new Schema({
    name: { type: String, required: true, trim: true, minlength: 1 },
    age: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Age must be an integer'
        }
    }
});

export default model('Contact', contactSchema);