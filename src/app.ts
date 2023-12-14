import fastify from 'fastify'
import { UserRoutes } from './routes/user'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.register(UserRoutes, {
    prefix: 'user',
})
