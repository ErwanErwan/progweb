import Contact from '../models/Contact.js';
import mongoose from 'mongoose';

function hasValidId(id) {
    return mongoose.isValidObjectId(id);
}

// Lister tous les contacts
export const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un contact par ID
export const getContactById = async (req, res) => {
    if (!hasValidId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant de contact invalide' });
    }

    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact non trouvé' });
        }
        res.json(contact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer un nouveau contact
export const createContact = async (req, res) => {
    try {
        const contact = new Contact({
            name: req.body.name,
            age: req.body.age
        });
        const newContact = await contact.save();
        res.status(201).json(newContact);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mettre à jour un contact
export const updateContact = async (req, res) => {
    if (!hasValidId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant de contact invalide' });
    }

    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                age: req.body.age
            },
            { returnDocument: 'after', runValidators: true }
        );
        if (!contact) {
            return res.status(404).json({ message: 'Contact non trouvé' });
        }
        res.json(contact);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un contact
export const deleteContact = async (req, res) => {
    if (!hasValidId(req.params.id)) {
        return res.status(400).json({ message: 'Identifiant de contact invalide' });
    }

    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact non trouvé' });
        }
        res.json({ message: 'Contact supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
