import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "1.0.0", // Your API version
    title: "Skills Management API", // A descriptive title for your API
    description:
      "API documentation for managing skills (Competences) and their associated subjects.", // Description of your API
  },
  servers: [
    {
      url: "", // by default: 'http://localhost:3000'
      description: "", // by default: ''
    },
    // { ... }
  ],
  tags: [
    {
      name: "Skills",
      description: "Operations related to skills (Competences).",
    },
  ],
  components: {
    schemas: {
      Skill: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the skill.",
            example: "Frontend Development",
          },
          description: {
            type: "string",
            description: "A brief description of the skill.",
            example:
              "A skill focused on building user interfaces using modern frameworks.",
          },
          subjects: {
            type: "array",
            items: {
              type: "string",
              description: "MongoDB ObjectID of the subject.",
              example: "5f50c31f1c4ae5124c05e4e1",
            },
          },
        },
      },
      SkillUpdate: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The updated name of the skill.",
            example: "Updated Skill Name",
          },
          description: {
            type: "string",
            description: "The updated description of the skill.",
            example: "Updated description for the skill.",
          },
          subjects: {
            type: "array",
            items: {
              type: "string",
              description: "MongoDB ObjectID of the subject.",
              example: "5f50c31f1c4ae5124c05e4e1",
            },
          },
          force: {
            type: "boolean",
            description:
              "If true, update the skill even if it’s linked to subjects.",
            example: true,
          },
        },
      },
      ArchiveSkill: {
        type: "object",
        properties: {
          archive: {
            type: "boolean",
            description: "If true, archive the skill instead of deleting it.",
            example: true,
          },
        },
      },
    },
  },
};

const outputFile = "./swagger-output.json";
const routes = ["./app.js"];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen({ openapi: "3.0.0" })(outputFile, routes, doc);
