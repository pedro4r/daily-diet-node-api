import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import bcrypt from 'bcrypt'

export async function MealRoutes(app: FastifyInstance) {
    app.post(
        '/',
        {
            preHandler: [checkSessionIdExists],
        },
        async (request, reply) => {
            // {title, amount, type: credit of debit}
            const createTransactionBodySchema = z.object({
                name: z.string(),
                description: z.string(),
                insideDiet: z.boolean(),
            })

            const { name, description, insideDiet } =
                createTransactionBodySchema.parse(request.body)

            const { sessionId } = request.cookies

            await knex('meals').insert({
                id: randomUUID(),
                user_id: sessionId,
                name,
                description,
                inside_diet: insideDiet,
            })

            return reply.status(201).send()
        }
    )
}
