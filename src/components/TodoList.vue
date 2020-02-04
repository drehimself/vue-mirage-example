<template>
  <div>
    <input type="text" class="todo-input" placeholder="What needs to be done" v-model="newTodo" @keyup.enter="addTodo">
    <div v-if="isLoading">Loading...</div>
    <transition-group v-else name="fade" enter-active-class="animated fadeInUp" leave-active-class="animated fadeOutDown">
      <div v-for="todo in todosFiltered" :key="todo.id" class="todo-item">
        <div class="todo-item-left">
          <input type="checkbox" v-model="todo.completed" @change=checkTodo(todo)>
          <div v-if="!todo.editing" @dblclick="editTodo(todo)" class="todo-item-label" :class="{ completed : todo.completed }">{{ todo.title }}</div>
          <input v-else class="todo-item-edit" type="text" v-model="todo.title" @blur="doneEdit(todo)" @keyup.enter="doneEdit(todo)" @keyup.esc="cancelEdit(todo)" v-focus>
        </div>
        <div class="remove-item" @click="removeTodo(todo.id)">
          &times;
        </div>
      </div>
    </transition-group>

    <div class="extra-container">
      <div><label><input type="checkbox" :checked="!anyRemaining" @change="checkAllTodos"> Check All</label></div>
      <div>{{ remaining }} items left</div>
    </div>

    <div class="extra-container">
      <div>
        <button :class="{ active: filter == 'all' }" @click="filter = 'all'">All</button>
        <button :class="{ active: filter == 'active' }" @click="filter = 'active'">Active</button>
        <button :class="{ active: filter == 'completed' }" @click="filter = 'completed'">Completed</button>
      </div>

      <div>
        <transition name="fade">
        <button v-if="showClearCompletedButton" @click="clearCompleted">Clear Completed</button>
        </transition>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'todo-list',
  created() {
    this.isLoading = true
    axios.get('/api/todos')
      .then(response => {
        this.todos = response.data
        this.isLoading = false
      })
      .catch(error => {
        console.log(error.response)
      })

  },
  data () {
    return {
      newTodo: '',
      idForTodo: 3,
      beforeEditCache: '',
      filter: 'all',
      todos: [],
      isLoading: false,
    }
  },
  computed: {
    remaining() {
      return this.todos.filter(todo => !todo.completed).length
    },

    anyRemaining() {
      return this.remaining !== 0
    },

    todosFiltered() {
      if (this.filter == 'all') {
        return this.todos
      } else if (this.filter == 'active') {
        return this.todos.filter(todo => !todo.completed)
      } else if (this.filter == 'completed') {
        return this.todos.filter(todo => todo.completed)
      }

      return this.todos
    },

    showClearCompletedButton() {
      return this.todos.filter(todo => todo.completed).length > 0
    }
  },
  directives: {
    focus: {
      inserted(el) {
        el.focus()
      }
    }
  },
  methods: {

    addTodo() {
      if (this.newTodo.trim().length === 0) {
        return
      }

        axios.post('/api/todos', { data: this.newTodo })
          .then(response => {
            this.todos.push({
              id: response.data.id,
              title: response.data.title,
              completed: false,
              editing: false,
            })
          })

        this.newTodo = ''
    },

    // Edit todo
    editTodo(todo) {
      this.beforeEditCache = todo.title
      todo.editing = true
    },

    // Edit todo
    doneEdit(todo) {
      if (todo.title.trim() === '') {
        todo.title = this.beforeEditCache
      }
      todo.editing = false

      axios.patch(`/api/todos/${todo.id}`, { data: todo })
    },

    // Edit todo
    cancelEdit(todo) {
      todo.title = this.beforeEditCache
      todo.editing = false
    },

    // Delete todo
    removeTodo(id) {
      axios.delete(`/api/todos/${id}`)
        .then(response => {
          this.todos = this.todos.filter(todo => id !== todo.id)
        })
    },

    // Check all todos
    checkAllTodos() {
      this.todos.forEach(todo => todo.completed = event.target.checked)
    },

    // Clear completed
    clearCompleted() {
      this.todos = this.todos.filter(todo => !todo.completed)
    },

    checkTodo(todo) {
      axios.patch(`/api/todos/${todo.id}`, { data: todo })
    }
  }
}
</script>

<style lang="scss">
  @import url("https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css");

  .todo-input {
    width: 100%;
    padding: 10px 18px;
    font-size: 18px;
    margin-bottom: 16px;

    &:focus {
      outline: 0;
    }
  }

  .todo-item {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    animation-duration: 0.3s;
  }

  .remove-item {
    cursor: pointer;
    margin-left: 14px;
    &:hover {
      color: black;
    }
  }

  .todo-item-left {
    display: flex;
    align-items: center;
  }

  .todo-item-label {
    padding: 10px;
    border: 1px solid white;
    margin-left: 12px;
  }

  .todo-item-edit {
    font-size: 24px;
    color: #2c3e50;
    margin-left: 12px;
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;

    &:focus {
      outline: none;
    }
  }

  .completed {
    text-decoration: line-through;
    color: grey;
  }

  .extra-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    border-top: 1px solid lightgrey;
    padding-top: 14px;
    margin-bottom: 14px;
  }

  button {
    font-size: 14px;
    background-color: white;
    appearance: none;

    &:hover {
      background: lightgreen;
    }

    &:focus {
      outline: none;
    }
  }

  .active {
    background: lightgreen;
  }

  // CSS Transitions
  .fade-enter-active, .fade-leave-active {
    transition: opacity .2s;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
