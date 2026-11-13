import express from 'express';
import {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact
} from '../controllers/contactController.js';

const router = express.Router();

// Routes des contacts
router.route('/')
    .get(getAllContacts)      // Lister tous les contacts
    .post(createContact);     // Créer un nouveau contact

router.route('/:id')
    .get(getContactById)      // Obtenir un contact par ID
    .put(updateContact)       // Mettre à jour un contact
    .delete(deleteContact);   // Supprimer un contact

export default router;
