import { FastifyReply, FastifyRequest } from "fastify"
import { ITodoList } from "../interfaces"

const staticLists: ITodoList[] = [
  {
	id: 'l-1',
	description: 'Dev tasks',
    done: false
  },
  {
    id: 'l-2',
    description: 'Shopping list',
    done: false
  },
]

export const listLists = async (
 request: FastifyRequest, 
 reply: FastifyReply) => {

  Promise.resolve(staticLists)
  .then((result) => {
	reply.send( result )
  })
}

export async function addList(
    request: FastifyRequest<{ Body: { name: string } }>,
    reply: FastifyReply
  ) {
    const { name } = request.body;
  
    // Validation de l'entrée
    if (!name) {
      return reply.status(400).send({ error: 'Name is required' });
    }
  
    // Génération d'un ID unique pour la nouvelle liste
    const newId = `l-${staticLists.length + 1}`;
  
    // Création de la nouvelle liste
    const newList: ITodoList = {
      id: newId,
      description: name,
      done: false,
    };
  
    // Ajout de la nouvelle liste au tableau statique
    staticLists.push(newList);
  
    // Retourne la nouvelle liste créée
    return reply.status(201).send({ message: 'List added successfully', list: newList });
  }
