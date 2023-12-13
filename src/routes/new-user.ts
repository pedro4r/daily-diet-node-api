import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function TransactionsRoutes(app: FastifyInstance) {
    app.post('/', async (request, reply) => {
        // {title, amount, type: credit of debit}
        const createTransactionBodySchema = z.object({
            email: z.string(),
            password: z.string(),
        })

        const { email, password } = createTransactionBodySchema.parse(
            request.body
        )
        const user_id = randomUUID()
        let sessionId = request.cookies.sessionId

        if (!sessionId) {
            sessionId = user_id
            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 Days
            })
        }

        await knex('users').insert({
            id: user_id,
            email,
            password,
        })

        return reply.status(201).send()
    })
}
