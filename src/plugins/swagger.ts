import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import { FastifySwaggerOptions } from '@fastify/swagger'
import JsonSchemas from '../schemas/all.json'

export default fp<FastifySwaggerOptions>(async (fastify) => {
  fastify.addSchema({
    $id: 'ITodoList',
    ...JsonSchemas.definitions.ITodoList
  })
  fastify.addSchema({
    $id: 'ITaskItem',
    ...JsonSchemas.definitions.ITaskItem
  })
  fastify.addSchema({
    $id: 'IUser',
    ...JsonSchemas.definitions.IUser
  })

  fastify.register(swagger, {
    openapi: {
      info: { title: 'Todo API', version: '1.0.0' },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server'
        }
      ]  
    },
  })
})