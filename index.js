const choo = require('choo')
const html = require('choo/html')
const extend = require('xtend')

const app = choo()

app.model({
  state: {
    todos: []
  },
  reducers: {
    receiveTodos: (data, state) => {
      return { todos: data }
    },
    receiveNewTodo: (data, state) => {
      const newTodos = state.todos.slice()
      newTodos.push(data)
      return { todos: newTodos }
    },
    replaceTodo: (data, state) => {
      const newTodos = state.todos.slice()
      newTodos[data.index] = data.todo
      return { todos: newTodos }
    },
  },
  effects: {
    getTodos: (data, state, send, done) => {
      store.getAll('todos', todos => {
        send('receiveTodos', todos, done)
      })
    },
    addTodo: (data, state, send, done) => {
      const todo = extend(data, {
        completed: false
      })
      store.add('todos', todo, () => {
        send('receiveNewTodo', todo, done)
      })
    },
    updateTodo: (data, state, send, done) => {
      const oldTodo = state.todos[data.index]
      const newTodo = extend(oldTodo, data.updates)

      store.replace('todos', data.index, newTodo, () => {
        send('replaceTodo', { index: data.index, todo: newTodo }, done)
      })
    },
  }
})

const view = (state, prev, send) => {
  return html`
    <div onload=${() => send('getTodos')}>
      <h1>It had a blue cover</h1>
      <h2>Search</h2>
      <form onsubmit=${onSubmit}>
        <input type='text' placeholder='Add item' id='title'/>
      </form>
      <ul>
        ${state.todos.map((todo, i) => html`
          <li>
            <input type='checkbox' ${todo.completed ? 'checked' : ''} onchange=${ e => onChange(e, i) } />
            ${todo.title}
          </li>`)}
      </ul>
    </div>`


  function onSubmit(e) {
    const input = e.target.children[0]
    send('addTodo', { title: input.value })
    input.value = ''
    e.preventDefault()
  }

  function onChange(e, index) {
    const updates = { completed: e.target.checked }
    send('updateTodo', { index: index, updates: updates })
  }
}

const store = {
  getAll: (storeName, cb) => {
    try {
      cb(JSON.parse(localStorage[storeName]))
    } catch(e) {
      cb([])
    }
  },
  add: (storeName, item, cb) => {
    store.getAll(storeName, items => {
      items.push(item)
      localStorage[storeName] = JSON.stringify(items)
      cb()
    })
  },
  replace: (storeName, index, item, cb) => {
    store.getAll(storeName, items => {
      items[index] = item
      localStorage[storeName] = JSON.stringify(items)
      cb()
    })
  }
}

app.router((route) => [
  route('/', view)
])

const tree = app.start()
document.body.appendChild(tree)
