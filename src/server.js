import { Server, Response } from 'miragejs'

new Server({
  seeds(server) {
    server.db.loadData({
      todos: [
        {
          'title': 'Finish Vue Screencast',
          'completed': false,
          'editing': false,
        },
        {
          'title': 'Take over world',
          'completed': false,
          'editing': false,
        },
      ]
    })
  },

  routes() {
    this.timing = 50
    this.namespace = 'api'

    this.get('/todos', (schema) => {
      return schema.db.todos
      // return new Response(
      //     400,
      //     { some: "header" },
      //     { errors: ["name cannot be blank"] }
      //   )
    })

    this.post('/todos', (schema, request) => {
      const todo = JSON.parse(request.requestBody).data

      return schema.db.todos.insert({
        'title': todo,
        'completed': false,
        'editing': false,
      })
    })

    this.patch('/todos/:id', (schema, request) => {
      const todo = JSON.parse(request.requestBody).data

      return schema.db.todos.update(todo.id, todo)
    })

    this.delete('/todos/:id', (schema, request) => {
      return schema.db.todos.remove(request.params.id)
    })
  }
})
