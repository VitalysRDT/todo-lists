import { FastifyReply, FastifyRequest } from "fastify";
import { ITodoList, ITaskItem } from "../interfaces";

// Créer une liste
export async function createList(request: FastifyRequest, reply: FastifyReply) {
  try {
    const list = request.body as ITodoList;

    // Validation
    if (!list.id) {
      return reply.status(400).send({ error: "A unique id is required for a list." });
    }

    list.items = []; // Initialise les items

    await this.level.listsdb.put(list.id, JSON.stringify(list));
    reply.status(201).send(list);
  } catch (error) {
    console.error("Error creating list:", error);
    reply.status(500).send({ error: "Failed to create list." });
  }
}

// Récupérer toutes les listes
export async function getLists(request: FastifyRequest, reply: FastifyReply) {
  try {
    const listsIter = this.level.listsdb.iterator();
    const result: ITodoList[] = [];

    for await (const [key, value] of listsIter) {
      result.push(JSON.parse(value));
    }

    reply.send(result);
  } catch (error) {
    console.error("Error fetching lists:", error);
    reply.status(500).send({ error: "Failed to fetch lists." });
  }
}

// Ajouter un item à une liste
export async function addItemToList(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { listId } = request.params as { listId: string };
    const item = request.body as ITaskItem;

    // Validation
    if (!item.id || !item.description || !["PENDING", "IN-PROGRESS", "DONE"].includes(item.status)) {
      return reply.status(400).send({ error: "Invalid item data." });
    }

    const list = JSON.parse(await this.level.listsdb.get(listId)) as ITodoList;
    list.items.push(item);

    await this.level.listsdb.put(listId, JSON.stringify(list));
    reply.status(201).send(list);
  } catch (error) {
    console.error("Error adding item to list:", error);
    reply.status(500).send({ error: "Failed to add item to list." });
  }
}

// Supprimer une liste
export async function deleteList(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { listId } = request.params as { listId: string };

    await this.level.listsdb.del(listId);
    reply.status(204).send();
  } catch (error) {
    console.error("Error deleting list:", error);
    reply.status(500).send({ error: "Failed to delete list." });
  }
}

// Changer l'état d'un item
export async function updateItemStatus(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { listId, itemId } = request.params as { listId: string; itemId: string };
    const { status } = request.body as { status: "PENDING" | "IN-PROGRESS" | "DONE" };

    const list = JSON.parse(await this.level.listsdb.get(listId)) as ITodoList;
    const item = list.items.find((i) => i.id === itemId);

    if (!item) {
      return reply.status(404).send({ error: "Item not found." });
    }

    item.status = status;
    await this.level.listsdb.put(listId, JSON.stringify(list));

    reply.send(list);
  } catch (error) {
    console.error("Error updating item status:", error);
    reply.status(500).send({ error: "Failed to update item status." });
  }
}

export async function updateList(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const updates = request.body as Partial<ITodoList>;

    const list = JSON.parse(await this.level.listsdb.get(id)) as ITodoList;

    if (updates.name !== undefined) list.name = updates.name;
    if (updates.isDone !== undefined) list.isDone = updates.isDone;

    await this.level.listsdb.put(id, JSON.stringify(list));
    reply.send(list);
  } catch (error) {
    console.error("Error updating list:", error);
    reply.status(500).send({ error: "Failed to update list." });
  }
}

export async function removeItemFromList(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id, itemId } = request.params as { id: string; itemId: string };

    const list = JSON.parse(await this.level.listsdb.get(id)) as ITodoList;
    list.items = list.items.filter((item) => item.id !== itemId);

    await this.level.listsdb.put(id, JSON.stringify(list));
    reply.send(list);
  } catch (error) {
    console.error("Error removing item from list:", error);
    reply.status(500).send({ error: "Failed to remove item from list." });
  }
}

export async function updateItem(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { id, itemId } = request.params as { id: string; itemId: string };
        const updates = request.body as Partial<ITaskItem>;

        const list = JSON.parse(await this.level.listsdb.get(id)) as ITodoList;
        const item = list.items.find((i) => i.id === itemId);

        if (!item) {
            return reply.status(404).send({ error: "Item not found." });
        }

        if (updates.description !== undefined) item.description = updates.description;
        if (updates.status !== undefined) item.status = updates.status;
        if (updates.assignedTo !== undefined) item.assignedTo = updates.assignedTo;

        await this.level.listsdb.put(id, JSON.stringify(list));
        reply.send(list);
    } catch (error) {
        console.error("Error updating item:", error);
        reply.status(500).send({ error: "Failed to update item." });
    }
}

