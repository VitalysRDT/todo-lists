import { OpenAPIV3 } from 'openapi-types';

// Schéma pour un élément de liste
const ListItemSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      description: 'Identifiant unique de l\'élément de liste',
    },
    name: {
      type: 'string',
      description: 'Nom de l\'élément de liste',
    },
    description: {
      type: 'string',
      description: 'Description de l\'élément de liste',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Date de création de l\'élément',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Date de dernière mise à jour de l\'élément',
    },
    // Ajoutez d'autres propriétés selon votre modèle
  },
  required: ['id', 'name'], // Ajoutez les champs obligatoires
};

// Schéma pour une liste
const ListSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      description: 'Identifiant unique de la liste',
    },
    title: {
      type: 'string',
      description: 'Titre de la liste',
    },
    description: {
      type: 'string',
      description: 'Description de la liste',
    },
    items: {
      type: 'array',
      items: ListItemSchema,
      description: 'Liste des éléments',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Date de création de la liste',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Date de dernière mise à jour de la liste',
    },
    // Ajoutez d'autres propriétés selon votre modèle
  },
  required: ['id', 'title', 'items'], // Ajoutez les champs obligatoires
};

// Exportation des schémas
export const schemas = {
  ListItem: ListItemSchema,
  List: ListSchema,
};

// Ajoutez cette ligne pour exporter ListSchema individuellement
export { ListSchema };
