import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.string('id').primary()
        table.string('user_id').notNullable()
        table.string('name').notNullable()
        table.string('description').notNullable()
        table.boolean('inside_diet').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals')
}
