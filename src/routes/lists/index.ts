import { FastifyInstance } from "fastify";
import * as listsController from "../../controllers/lists.controller";
import { ListSchema } from "../../schemas/index";

async function lists(fastify: FastifyInstance) {
  // Créer une liste
  fastify.post("/", listsController.createList);

  // Récupérer toutes les listes
  fastify.get("/", { schema: ListSchema }, listsController.getLists);

  // Ajouter un item à une liste
  fastify.post("/:listId/items", listsController.addItemToList);

  // Supprimer une liste
  fastify.delete("/:listId", listsController.deleteList);

  // Mettre à jour le statut d'un item
  fastify.patch("/:listId/items/:itemId", listsController.updateItemStatus);

  // Mettre à jour une liste
  fastify.put("/:listId", listsController.updateList);

  // Supprimer un item d'une liste
  fastify.delete("/:listId/items/:itemId", listsController.removeItemFromList);

  // Mettre à jour un item d'une liste
  fastify.put("/:listId/items/:itemId", listsController.updateItemInList);
}

export default lists;
