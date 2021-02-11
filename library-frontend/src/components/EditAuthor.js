import React, { useState } from 'react'
import Select from 'react-select'
import { useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

const EditAuthor = ({ authors, notify }) => {
    const [name, setName] = useState('')
    const [born, setBorn] = useState('')

    const [setBornTo] = useMutation(EDIT_AUTHOR, {
        onError: (error) => {
            notify(error.message)
        },
        refetchQueries: [{ query: ALL_AUTHORS }]
    })


    const submit = async (event) => {
        event.preventDefault()

        setBornTo({ variables: { name: name.value, born } })

        setName('')
        setBorn('')
    }

    const options = [authors.map(a => {
        return { value: a.name, label: a.name }
    })]

    return (
        <div>
            <h2>Set birthyear</h2>

            <form onSubmit={submit}>
                <div>
                    name <Select value={name} onChange={setName} options={options[0]} />
                </div>
                <div>
                    born <input value={born} onChange={({ target }) => setBorn(parseInt(target.value))} />
                </div>
                <button type="submit">update author</button>
            </form>
        </div>
    )
}

export default EditAuthor