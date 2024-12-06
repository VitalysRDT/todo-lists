import { FastifyReply, FastifyRequest } from "fastify";
import { ITodoList, ITaskItem } from "../interfaces";
import { redisClient } from "../db";

// Créer une liste
export const createList = async function (
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const list = request.body as ITodoList;

    // Validation
    if (!list.id) {
      return reply.status(400).send({ error: "Un identifiant unique est requis pour la liste." });
    }

    const redisObject = {
      id: String(list.id),
      name: String(list.name || ""),
      items: JSON.stringify([]),
      isDone: String(list.isDone ?? false)
    };

    await redisClient().then(c => {
      c.hSet(`todo-list:${list.id}`, redisObject);
    });

    reply.status(201).send({ message: "Liste créée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la création de la liste :", error);
    reply.status(500).send({ error: "Impossible de créer la liste." });
  }
};

// Récupérer toutes les listes
export const getLists = async function (
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const keys = await redisClient().then(c => c.keys('todo-list:*'));
    const result: ITodoList[] = [];

    for (const key of keys) {
      const value = await redisClient().then(c => c.hGetAll(key));
      if (value && value.id) {
        // value.items est une chaîne JSON, on la parse
        const items = JSON.parse(value.items || "[]");
        const isDone = value.isDone === "true";
        result.push({
          id: value.id,
          name: value.name,
          items,
          isDone
        });
      }
    }

    reply.send(result);
  } catch (error) {
    console.error("Erreur lors de la récupération des listes :", error);
    reply.status(500).send({ error: "Impossible de récupérer les listes." });
  }
};

// Ajouter un item à une liste
export const addItemToList = async function (
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { listId } = request.params as { listId: string };
    const item = request.body as ITaskItem;

    // Validation
    if (!item.id || !item.description || !["PENDING", "IN-PROGRESS", "DONE"].includes(item.status)) {
      return reply.status(400).send({ error: "Données de l'item invalides." });
    }

    const listData = await redisClient().then(c => c.hGetAll(`todo-list:${listId}`));
    if (!listData || !listData.id) {
      return reply.status(404).send({ error: "Liste introuvable." });
    }

    const list: ITodoList = {
      id: listData.id,
      name: listData.name,
      items: JSON.parse(listData.items || "[]"),
      isDone: listData.isDone === "true"
    };

    list.items.push(item);

    await redisClient().then(c => {
      c.hSet(`todo-list:${listId}`, {
        id: list.id,
        name: list.name,
        items: JSON.stringify(list.items),
        isDone: String(list.isDone)
      });
    });

    reply.status(201).send(list);
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'item à la liste :", error);
    reply.status(500).send({ error: "Impossible d'ajouter l'item à la liste." });
  }
};

// Supprimer une liste
export async function deleteList(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { listId } = request.params as { listId: string };

    await redisClient().then(c => c.del(`todo-list:${listId}`));
    reply.status(204).send();
  } catch (error) {
    console.error("Erreur lors de la suppression de la liste :", error);
    reply.status(500).send({ error: "Impossible de supprimer la liste." });
  }
}

// Changer l'état d'un item
export async function updateItemStatus(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { listId, itemId } = request.params as { listId: string; itemId: string };
    const { status } = request.body as { status: "PENDING" | "IN-PROGRESS" | "DONE" };

    const listData = await redisClient().then(c => c.hGetAll(`todo-list:${listId}`));
    if (!listData || !listData.id) {
      return reply.status(404).send({ error: "Liste introuvable." });
    }

    const list: ITodoList = {
      id: listData.id,
      name: listData.name,
      items: JSON.parse(listData.items || "[]"),
      isDone: listData.isDone === "true"
    };

    const item = list.items.find((i) => i.id === itemId);
    if (!item) {
      return reply.status(404).send({ error: "Item introuvable." });
    }

    item.status = status;

    await redisClient().then(c => {
      c.hSet(`todo-list:${listId}`, {
        id: list.id,
        name: list.name,
        items: JSON.stringify(list.items),
        isDone: String(list.isDone)
      });
    });

    reply.send(list);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de l'item :", error);
    reply.status(500).send({ error: "Impossible de mettre à jour le statut de l'item." });
  }
}

export async function updateList(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const updates = request.body as Partial<ITodoList>;

    const listData = await redisClient().then(c => c.hGetAll(`todo-list:${id}`));
    if (!listData || !listData.id) {
      return reply.status(404).send({ error: "Liste introuvable." });
    }

    const list: ITodoList = {
      id: listData.id,
      name: listData.name,
      items: JSON.parse(listData.items || "[]"),
      isDone: listData.isDone === "true"
    };

    if (updates.name !== undefined) list.name = updates.name;
    if (updates.isDone !== undefined) list.isDone = updates.isDone;

    await redisClient().then(c => {
      c.hSet(`todo-list:${id}`, {
        id: list.id,
        name: list.name,
        items: JSON.stringify(list.items),
        isDone: String(list.isDone)
      });
    });
    reply.send(list);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la liste :", error);
    reply.status(500).send({ error: "Impossible de mettre à jour la liste." });
  }
}

export async function removeItemFromList(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id, itemId } = request.params as { id: string; itemId: string };

    const listData = await redisClient().then(c => c.hGetAll(`todo-list:${id}`));
    if (!listData || !listData.id) {
      return reply.status(404).send({ error: "Liste introuvable." });
    }

    const list: ITodoList = {
      id: listData.id,
      name: listData.name,
      items: JSON.parse(listData.items || "[]"),
      isDone: listData.isDone === "true"
    };

    list.items = list.items.filter((item) => item.id !== itemId);

    await redisClient().then(c => {
      c.hSet(`todo-list:${id}`, {
        id: list.id,
        name: list.name,
        items: JSON.stringify(list.items),
        isDone: String(list.isDone)
      });
    });

    reply.send(list);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'item :", error);
    reply.status(500).send({ error: "Impossible de supprimer l'item de la liste." });
  }
}

export async function updateItem(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id, itemId } = request.params as { id: string; itemId: string };
    const updates = request.body as Partial<ITaskItem>;

    const listData = await redisClient().then(c => c.hGetAll(`todo-list:${id}`));
    if (!listData || !listData.id) {
      return reply.status(404).send({ error: "Liste introuvable." });
    }

    const list: ITodoList = {
      id: listData.id,
      name: listData.name,
      items: JSON.parse(listData.items || "[]"),
      isDone: listData.isDone === "true"
    };

    const item = list.items.find((i) => i.id === itemId);

    if (!item) {
      return reply.status(404).send({ error: "Item introuvable." });
    }

    if (updates.description !== undefined) item.description = updates.description;
    if (updates.status !== undefined) item.status = updates.status;
    if (updates.assignedTo !== undefined) item.assignedTo = updates.assignedTo;

    await redisClient().then(c => {
      c.hSet(`todo-list:${id}`, {
        id: list.id,
        name: list.name,
        items: JSON.stringify(list.items),
        isDone: String(list.isDone)
      });
    });
    reply.send(list);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'item :", error);
    reply.status(500).send({ error: "Impossible de mettre à jour l'item." });
  }
}

export async function updateItemInList(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { listId, itemId } = request.params as { listId: string; itemId: string };
    const newItemData = request.body as Partial<ITaskItem>;

    const listData = await redisClient().then(c => c.hGetAll(`todo-list:${listId}`));
    if (!listData || !listData.id) {
      return reply.status(404).send({ error: "Liste introuvable." });
    }

    const list: ITodoList = {
      id: listData.id,
      name: listData.name,
      items: JSON.parse(listData.items || "[]"),
      isDone: listData.isDone === "true"
    };

    const itemIndex = list.items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) {
      return reply.status(404).send({ error: "Item introuvable." });
    }

    // Mettre à jour l'item
    list.items[itemIndex] = { ...list.items[itemIndex], ...newItemData };

    // Sauvegarder la liste mise à jour
    await redisClient().then(c => {
      c.hSet(`todo-list:${listId}`, {
        id: list.id,
        name: list.name,
        items: JSON.stringify(list.items),
        isDone: String(list.isDone)
      });
    });

    reply.send(list.items[itemIndex]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'item dans la liste :", error);
    reply.status(500).send({ error: "Impossible de mettre à jour l'item dans la liste." });
  }
}
