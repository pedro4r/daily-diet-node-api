import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function MetricsRoutes(app: FastifyInstance) {
    app.get(
        '/',
        {
            preHandler: [checkSessionIdExists],
        },
        async (request, reply) => {
            const { sessionId } = request.cookies

            const meals = await knex('meals')
                .where('user_id', sessionId)
                .select()

            let sequence: number[] = []

            const bestSequence = meals.reduce((acc, meal, index) => {
                if (meal.inside_diet) {
                    sequence.push(index)
                } else {
                    if (sequence.length > acc.length) {
                        acc = sequence.map((seqIndex) => meals[seqIndex])
                        sequence = []
                    } else {
                        sequence = []
                    }
                }

                if (index === meals.length - 1) {
                    if (sequence.length > acc.length) {
                        acc = sequence.map((seqIndex) => meals[seqIndex])
                    }
                }

                return acc
            }, [])

            const withinTheDiet = await knex('meals')
                .where({
                    user_id: sessionId,
                    inside_diet: true,
                })
                .select()

            const outsideTheDiet = await knex('meals')
                .where({
                    user_id: sessionId,
                    inside_diet: false,
                })
                .select()

            const response = {
                numberOfMeals: meals.length,
                withinTheDiet: withinTheDiet.length,
                outsideTheDiet: outsideTheDiet.length,
                bestSequence,
            }

            return reply.status(200).send(response)
        }
    )
}
