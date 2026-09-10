import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition: swaggerJSDoc.Options["definition"] = {
  openapi: "3.0.3",
  info: {
    title: "Quimera API",
    version: "1.0.0",
    description: "Documentação da API do projeto Quimera",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: "Ambiente local",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const swaggerOptions: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: [path.join(__dirname, "../modules/**/*.routes.*")],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
