import React, { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommended from './components/Recommended'

import {useQuery, useApolloClient, useSubscription} from '@apollo/client'
import {ALL_BOOKS, BOOK_ADDED} from './queries'

const Notify = ({ message }) => {
  if (!message) {
    return null
  }

  return (
    <div style={{ color: 'red' }}>
      {message}
    </div>
  )
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [message, setMessage] = useState(null)
  const client = useApolloClient()
  const [books, setBooks] = useState(null)
  const bookResult = useQuery(ALL_BOOKS)
  useEffect(()=> {
    if(bookResult.data) {
      setBooks(bookResult.data.allBooks)
    }
  }, [bookResult.data])
  
console.log('books', books)
  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => 
      set.map(b=> b.id).includes(object.id)

      const dataInStore = client.readQuery({query: ALL_BOOKS,
        variables: {genre: null}
      })
      console.log(dataInStore)
      console.log('dataInStore', dataInStore)
      if(!includedIn(dataInStore.allBooks, addedBook)){
        client.writeQuery({
          query: ALL_BOOKS,
          data: { allBooks: dataInStore.allBooks.concat(addedBook)}
        })
      }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({subscriptionData}) => {
      console.log(subscriptionData)
      const addedBook = subscriptionData.data.bookAdded
      updateCacheWith(addedBook)
    }
  })

  useEffect(() => {
    const token = localStorage.getItem('library-user-token')
    if (token) {
      setToken(token)
    }
  }, [token])

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }


  const notify = (message) => {
    setMessage(message)
    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }


  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>

        {token
          ? <em><button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommended')}>recommended</button>
            <button onClick={logout}>logout</button></em>
          : <button onClick={() => setPage('login')}>login</button>}
      </div>

      <Notify message={message} />
      <Authors
        show={page === 'authors'}
        notify={notify}
      />

      <Books
        show={page === 'books'}
        books= {books}
      />

      <NewBook
        show={page === 'add'}
        notify={notify}
        updateCacheWith={updateCacheWith}
      />

      <LoginForm
        show={page === 'login'}
        setShow={setPage}
        notify={notify}
        setToken={setToken}
      />

      <Recommended
        show={page === 'recommended'}
        books= {books}
      />
    </div>
  )
}

export default App