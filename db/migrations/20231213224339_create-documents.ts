import { Knex } from 'knex'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10 // Define o número de rounds para o algoritmo de hashing

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', (table) => {
        table.string('id').primary()
        table.string('email').notNullable()
        table.string('passwordHash').notNullable()
        table.string('salt').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users')
}