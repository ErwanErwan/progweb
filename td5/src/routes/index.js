import { Router } from 'express';
import express from 'express';
import { getAllContacts, getContactById, updateContact, removeContact, addContact } from '../controllers/contactController.js';
import { registerUser, loginUser } from '../controllers/authController.js';
import requireAuth from '../middleware/authMiddleware.js';


const router = Router();
router.use(express.json());

router.get('/', function (req, res) {
    res.status(200).json({
        status: 'API is Working',
        message: 'Welcome!',
    });
});

/**
 * @openapi
 * /auth/register:
 *   post:
 *     description: Create a user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '201':
 *         description: User created
 *       '400':
 *         description: Invalid request or user already exists
 */
router.post('/auth/register', async (req, res) => {
    const response = await registerUser(req.body.email, req.body.password);
    res.status(response.success ? 201 : 400).json(response);
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     description: Authenticate a user and return a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login successful
 *       '401':
 *         description: Invalid credentials
 */
router.post('/auth/login', async (req, res) => {
    const response = await loginUser(req.body.email, req.body.password);
    res.status(response.success ? 200 : 401).json(response);
});


/**
 * @openapi
 * /contacts:
 *   get:
 *     description: All contacts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Returns all the contacts
 */
router.route('/contacts').get(requireAuth, async (req, res) => {
    let response = await getAllContacts();
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(404).json(response);
    }
});

/**
 * @openapi
 * /contacts/{id}:
 *   get:
 *     description: Get a contact by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Returns the contact with the specified ID
 */
router.route('/contacts/:id').get(requireAuth, async (req, res) => {
    let response = await getContactById(req.params.id);
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(404).json(response);
    }
});

/**
 * @openapi
 * /contacts:
 *   post:
 *     description: Add a new contact
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Returns the newly added contact
 */
router.route('/contacts').post(requireAuth, async (req, res) => {
    let response = await addContact(req.body);
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(404).json(response);
    }
});

/**
 * @openapi
 * /contacts/{id}:
 *   put:
 *     description: Update a contact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Returns the updated contact
 */
router.route('/contacts/:id').put(requireAuth, async (req, res) => {
    let response = await updateContact(req.params.id, req.body.name, req.body.age);
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(404).json(response);
    }
});

/**
 * @openapi
 * /contacts/{id}:
 *   delete:
 *     description: Delete a contact
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Returns the deleted contact
 */
router.route('/contacts/:id').delete(requireAuth, async (req, res) => {
    let response = await removeContact(req.params.id);
    if (response.success == true) {
        res.status(200).json(response);
    } else {
        res.status(404).json(response);
    }
});

export default router;
