import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Products API Documentation",
      version: "1.0.0",
      description: `
## API Dokumentacija za Products servis

Ova dokumentacija opisuje sve dostupne endpoint-e za upravljanje proizvodima.

### Funkcionalnosti:
- Pregled svih proizvoda
- Pregled pojedinacnog proizvoda
- Kreiranje novog proizvoda
- Azuriranje postojeceg proizvoda
- Brisanje proizvoda

### Autentifikacija:
Neki endpoint-i zahtevaju Bearer token u Authorization header-u.
      `,
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Lokalni development server",
      },
      {
        url: "https://api.production.com",
        description: "Production server",
      },
    ],
    tags: [
      {
        name: "Products",
        description: "Operacije vezane za proizvode",
      },
      {
        name: "Health",
        description: "Health check endpoint-i",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Unesite JWT token",
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "../routes/*.js"),
    path.join(__dirname, "../index.js"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
