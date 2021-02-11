import React, { useState} from 'react'

const Books = (props) => {
  const [genre, setGenre] = useState(null)
  let books

  const Buttons = () => {
    return (
      <div>
        <button onClick={()=> setGenre('refactoring')}>refactoring</button>
        <button onClick={()=> setGenre('agile')}>agile</button>
        <button onClick={()=> setGenre('patterns')}>patterns</button>
        <button onClick={()=> setGenre('design')}>design</button>
        <button onClick={()=> setGenre('crime')}>crime</button>
        <button onClick={()=> setGenre('classic')}>classic</button>
        <button onClick={()=> setGenre(null)}>all genres</button>
      </div>
    )
  }

  if (!props.show) {
    return null
  }

  if(genre){
    books = props.books.filter(b=> b.genres.includes(genre))
  } else {
    books = props.books
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <Buttons />
    </div>
  )
}

export default Books