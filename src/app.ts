import fastify from 'fastify'
import { UserRoutes } from './routes/user'
import cookie from '@fastify/cookie'
import { MealRoutes } from './routes/meal'
import { MetricsRoutes } from './routes/metrics'

export const app = fastify()

app.register(cookie)

app.register(UserRoutes, {
    prefix: 'user',
})

app.register(MealRoutes, {
    prefix: 'meal',
})

app.register(MetricsRoutes, {
    prefix: 'metrics',
})
