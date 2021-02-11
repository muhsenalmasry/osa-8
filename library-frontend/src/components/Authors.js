import React, { useState, useEffect } from 'react'
import {useQuery} from '@apollo/client'
import {ALL_AUTHORS} from '../queries'
import EditAuthor from './EditAuthor'

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)
  const [authors, setAuthors] = useState(null)
  useEffect(()=> {
    if(result.data){
      setAuthors(result.data.allAuthors)
    }
  }, [result.data])
  
  if (!props.show) {
    return null
  }

  if(!authors){
    return <div>loading...</div>
  }
  return (
    <div>
      <h2>authors</h2>
      <div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      <EditAuthor notify={props.notify} authors={authors}/>

    </div>
  )
}

export default Authors
