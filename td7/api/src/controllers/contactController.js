import Contact from '../models/contactModel.js';
import { redisClient } from '../config/redis.js';

const ALL_CONTACTS_KEY = 'contacts:all';
const DB_DELAY_MS = 300;

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function invalidateContactCache(id = null) {
    await redisClient.del(ALL_CONTACTS_KEY);
    if (id) {
        await redisClient.del(`contacts:${id}`);
    }
}

// Get all contacts
export async function getAllContacts() {
  try {
    const cached = await redisClient.get(ALL_CONTACTS_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    await delay(DB_DELAY_MS);
    let total = await Contact.countDocuments({});
    let limit = parseInt(total);
    const contacts = await Contact.find().limit(limit);
    const response = {
      success: true,
      data: contacts,
      total: total.toString(),
    };
    await redisClient.set(ALL_CONTACTS_KEY, JSON.stringify(response), { EX: 60 });
    return response;
  } catch (err) {
    return { success: false, message: "Contacts not found " + err };
  }
}

// Get contact by Id
export async function getContactById(id) {
  try {
    const key = `contacts:${id}`;
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    await delay(DB_DELAY_MS);
    const contact = await Contact.findById(id);
    if (!contact) {
      return { success: false, message: "Contact not found" };
    }
    const response = { success: true, data: contact };
    await redisClient.set(key, JSON.stringify(response), { EX: 60 });
    return response;
  } catch (err) {
    return { success: false, message: "Error finding contact " + err };
  }
}

// Add a new contact, returns the added contact
export async function addContact(body) {
  try {
    const contact = new Contact(body);
    await contact.save();
    await invalidateContactCache();
    return { success: true, data: contact };
  } catch (err) {
    return { success: false, message: "Error adding contact " + err };
  }
}

// Update an existing contact
export async function updateContact(id, name = null, age = null) {
  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      return { success: false, message: "Contact not found" };
    }
    if (name !== null) contact.name = name;
    if (age !== null) contact.age = age;
    await contact.save();
    await invalidateContactCache(id);
    return { success: true, data: contact };
  } catch (err) {
    return { success: false, message: "Error updating contact " + err };
  }
}


// Remove an existing contact
export async function removeContact(id) {
  try {
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return { success: false, message: "Contact not found" };
    }
    await invalidateContactCache(id);
    return { success: true, message: "Contact deleted successfully" };
  } catch (err) {
    return { success: false, message: "Error deleting contact " + err };
  }
}
