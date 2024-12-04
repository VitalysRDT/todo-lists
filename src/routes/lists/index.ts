import { FastifyInstance } from "fastify";
import * as listsController from "../../controllers/lists.controller";

async function lists(fastify: FastifyInstance) {
  // Créer une liste
  fastify.post("/", listsController.createList);

  // Récupérer toutes les listes
  fastify.get("/", listsController.getLists);

  // Ajouter un item à une liste
  fastify.post("/:listId/items", listsController.addItemToList);

  // Supprimer une liste
  fastify.delete("/:listId", listsController.deleteList);

  // Mettre à jour le statut d'un item
  fastify.patch("/:listId/items/:itemId", listsController.updateItemStatus);
}

export default lists;
