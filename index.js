const choo = require('choo')
const html = require('choo/html')
const extend = require('xtend')

const app = choo()

app.model({
  state: {
    todos: []
  },
  reducers: {
    addTodo: (data, state) => {
      const todo = extend(data, {
        completed: false
      })

      const newTodos = state.todos.concat(todo)
      return { todos: newTodos }
    },
    updateTodo: (data, state) => {
      const newTodos = state.todos.slice()
      const oldItem = newTodos[data.index]
      const newItem = extend(oldItem, data.updates)
      newTodos[data.index] = newItem
      return { todos: newTodos }
    }
  }
})

const view = (state, prev, send) => {
  return html`
    <div>
      <h1>It had a blue cover</h1>
      <h2>Search</h2>
      <form onsubmit=${onSubmit}>
        <input type='text' placeholder='Add item' id='title'/>
      </form>
      <ul>
        ${state.todos.map((todo, i) => html`
          <li>
            <input type='checkbox' ${todo.completed ? 'checked' : ''} onchange=${ e => {
              const updates = { completed: e.target.checked }
              send('updateTodo', { index: i, updates: updates })
            }} />
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
}


app.router((route) => [
  route('/', view)
])

const tree = app.start()
document.body.appendChild(tree)
