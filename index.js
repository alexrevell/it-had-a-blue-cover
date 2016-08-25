const choo = require('choo')
const html = require('choo/html')
const extend = require('xtend')

const app = choo()

app.model({
  state: {
    items: []
  },
  reducers: {
    receiveItems: (data, state) => {
      return { items: data }
    },
    receiveNewItem: (data, state) => {
      const newItems = state.items.slice()
      newItems.push(data)
      return { items: newItems }
    },
    removeItem: (data, state) => {
      const newItems = state.items.filter((it, idx) => idx !== data.index)
      return { items: newItems }
    },
    replaceItem: (data, state) => {
      const newItems = state.items.slice()
      newItems[data.index] = data.item
      return { items: newItems }
    },
  },
  effects: {
    getItems: (data, state, send, done) => {
      store.getAll('items', items => {
        send('receiveItems', items, done)
      })
    },
    addItem: (data, state, send, done) => {
      const item = extend(data, {
        completed: false
      })
      store.add('items', item, () => {
        send('receiveNewItem', item, done)
      })
    },
    deleteItem: (data, state, send, done) => {
      store.remove('items', data.index, () => {
        send('removeItem', { index: data.index }, done)
      })
    },
    updateItem: (data, state, send, done) => {
      const oldItem = state.items[data.index]
      const newItem = extend(oldItem, data.updates)

      store.replace('items', data.index, newItem, () => {
        send('replaceItem', { index: data.index, item: newItem }, done)
      })
    },
  }
})

const view = (state, prev, send) => {
  return html`
    <div onload=${() => send('getItems')}>
      <h1>It had a blue cover</h1>
      <h2>Search</h2>
      <form onsubmit=${onSubmit}>
        <input type='text' placeholder='Add item' id='title'/>
      </form>
      <ul>
        ${state.items.map((item, i) => html`
          <li>
            <input type='checkbox' ${item.completed ? 'checked' : ''} onchange=${ e => onChange(e, i) } />
            ${item.title}
            <span onclick=${ e => onDelete(e, i) }>x</span>
          </li>`)}
      </ul>
    </div>`


  function onSubmit(e) {
    const input = e.target.children[0]
    send('addItem', { title: input.value })
    input.value = ''
    e.preventDefault()
  }

  function onChange(e, index) {
    const updates = { completed: e.target.checked }
    send('updateItem', { index: index, updates: updates })
    e.preventDefault()
  }

  function onDelete(e, index) {
    send('deleteItem', { index: index })
    e.preventDefault()
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
  remove: (storeName, index, cb) => {
    store.getAll(storeName, items => {
      const nextItems = items.splice(index, 1)
      localStorage[storeName] = JSON.stringify(nextItems)
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
