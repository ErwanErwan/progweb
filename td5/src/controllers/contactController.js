import Contact from '../models/contactModel.js';
import { isValidObjectId } from 'mongoose';

// Get all contacts
export async function getAllContacts() {
    try {
        const total = await Contact.countDocuments({});
        const contacts = await Contact.find();
        return {
            success: true,
            data: contacts,
            total: total.toString(),
        }
    } catch (err) {
        return { success: false, status: 500, message: "Contacts not found " + err.message };
    }
}

// Get contact by Id
export async function getContactById(id) {
    if (!isValidObjectId(id)) {
        return { success: false, status: 400, message: "Invalid contact id" };
    }

    try {
        const contact = await Contact.findById(id);
        if (!contact) {
            return { success: false, status: 404, message: "Contact not found" };
        }

        return {
            success: true,
            data: contact
        };
    } catch (err) {
        return { success: false, status: 500, message: "Contacts not found " + err.message };
    }
}

// Add a new contact, returns the added contact
export async function addContact(body) {
    try {
        const contact = new Contact(body);
        await contact.save();

        return {
            success: true,
            data: contact
        };
    } catch (err) {
        return {
            success: false,
            status: 400,
            message: "Contact not added: " + err.message
        };
    }
}
 
// Update an existing contact
export async function updateContact(id, name = null, age = null) {
   if (!isValidObjectId(id)) {
        return { success: false, status: 400, message: "Invalid contact id" };
   }

   try {
        const contact = await Contact.findById(id);
        if (!contact) {
            return { success: false, status: 404, message: "Contact not found" };
        }

        if (name !== null) {
            contact.name = name;
        }
        if (age !== null) {
            contact.age = age;
        }

        await contact.save();

        return {
            success: true,
            data: contact
        };
    } catch (err) {
        return {
            success: false,
            status: 400,
            message: "Contact not updated: " + err.message
        };
    }
}
    
// Remove an existing contact
export async function removeContact(id) {
  if (!isValidObjectId(id)) {
        return { success: false, status: 400, message: "Invalid contact id" };
  }

  try {
        const contact = await Contact.findByIdAndDelete(id);
        if (!contact) {
            return { success: false, status: 404, message: "Contact not found" };
        }

        return {
            success: true,
            data: contact
        };
    } catch (err) {
        return {
            success: false,
            status: 400,
            message: "Contact not removed: " + err.message
        };
    }
}


