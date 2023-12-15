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

    app.get(
        '/',
        {
            preHandler: [checkSessionIdExists],
        },
        async (request) => {
            const { sessionId } = request.cookies
            const meals = await knex('meals')
                .where('user_id', sessionId)
                .select()
            return { meals }
        }
    )

    app.get(
        '/:id',
        {
            preHandler: [checkSessionIdExists],
        },

        async (request, reply) => {
            const getMealParamsSchema = z.object({
                id: z.string().uuid(),
            })

            const { id } = getMealParamsSchema.parse(request.params)
            const { sessionId } = request.cookies

            const meal = await knex('meals')
                .where({
                    id,
                    user_id: sessionId,
                })
                .first()

            if (meal) {
                return reply.status(200).send(meal)
            } else {
                return reply.status(404).send('Meal not found or unauthorized')
            }
        }
    )

    app.patch(
        '/:id',
        {
            preHandler: [checkSessionIdExists],
        },

        async (request, reply) => {
            const getMealParamsSchema = z.object({
                id: z.string().uuid(),
            })

            const updateMealBodySchema = z.object({
                name: z.string(),
                description: z.string(),
                insideDiet: z.boolean(),
            })
            const { id } = getMealParamsSchema.parse(request.params)
            const { name, description, insideDiet } =
                updateMealBodySchema.parse(request.body)

            const { sessionId } = request.cookies

            const updatedRows = await knex('meals')
                .where({
                    id,
                    user_id: sessionId,
                })
                .update({
                    name,
                    description,
                    inside_diet: insideDiet,
                })

            if (updatedRows > 0) {
                return reply.status(200).send('Meal updated successfully')
            } else {
                return reply.status(404).send('Meal not found or unauthorized')
            }
        }
    )

    app.delete(
        '/:id',
        {
            preHandler: [checkSessionIdExists],
        },

        async (request, reply) => {
            const getMealParamsSchema = z.object({
                id: z.string().uuid(),
            })

            const { id } = getMealParamsSchema.parse(request.params)
            const { sessionId } = request.cookies

            const deletedRows = await knex('meals')
                .where({
                    id,
                    user_id: sessionId,
                })
                .del()

            if (deletedRows > 0) {
                return reply.status(200).send('Meal deleted successfully')
            } else {
                return reply.status(404).send('Meal not found or unauthorized')
            }
        }
    )
}
