import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import bcrypt from 'bcrypt'

export async function UserRoutes(app: FastifyInstance) {
    app.post('/', async (request, reply) => {
        // {title, amount, type: credit of debit}
        const createTransactionBodySchema = z.object({
            email: z.string(),
            password: z.string(),
        })

        const { email, password } = createTransactionBodySchema.parse(
            request.body
        )
        const userId = randomUUID()
        let sessionId = request.cookies.sessionId

        const SALT_ROUNDS = 10
        const salt = await bcrypt.genSalt(SALT_ROUNDS)
        const passwordHash = await bcrypt.hash(password, salt)

        if (!sessionId) {
            sessionId = userId
            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 Days
            })
        }

        await knex('users').insert({
            id: userId,
            email,
            passwordHash,
            salt,
        })

        return reply.status(201).send()
    })

    app.post('/login', async (request, reply) => {
        // {title, amount, type: credit of debit}
        const createTransactionBodySchema = z.object({
            email: z.string(),
            password: z.string(),
        })
        const { email, password } = createTransactionBodySchema.parse(
            request.body
        )

        const user = await knex('users').where({ email }).first()

        if (!user) {
            return false
        }

        const hashedPassword = await bcrypt.hash(password, user.salt)

        if (hashedPassword === user.passwordHash) {
            return reply.status(200).send()
        } else {
            return reply.status(401).send()
        }
    })

    app.get(
        '/',
        {
            preHandler: [checkSessionIdExists],
        },
        async (request) => {
            const { sessionId } = request.cookies
            const transactions = await knex('users')
                .where('id', sessionId)
                .select()
            return { transactions }
        }
    )
}
