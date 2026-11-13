import express from 'express';
import connectDB from "./config/db.js";
import routes from './routes/index.js';
import swaggerJsDoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.loadEnvFile();

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 8080;

const app = express();
connectDB();

app.use(express.json());
app.use('/api', routes);

/**
 * @openapi
 * /docs:
 *   get:
 *     description: API documentation
 *     responses:
 *       '200':
 *         description: Returns the API documentation
 */
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Contact REST API',
            description: "A REST API built with Express and MongoDB.",
            version: '0.1',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        servers: [
            {
                url: `http://${host}:${port}/api`,
                description: 'Development server',
            },
        ],
    },
    apis: [path.join(path.dirname(fileURLToPath(import.meta.url)), 'routes/*.js')],
}

const openapiSpecification = swaggerJsDoc(options);
app.get('/docs/openapi.json', (req, res) => {
    res.json(openapiSpecification);
});
app.use('/docs', serve, setup(openapiSpecification));

app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
});