import React, {useState, useEffect} from 'react'
import {useMutation} from '@apollo/client'
import {LOGIN} from '../queries'

const LoginForm = ({show, setShow, notify, setToken}) => {
    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)

    const [login, result] = useMutation(LOGIN, {
        onError: (error) => {
            notify('wrong credentials')
        }
    })

    useEffect(()=> {
        if(result.data) {
            const token = result.data.login.value
//            setToken(token)
            localStorage.setItem('library-user-token', token)
        }
    }, [result.data]) //eslint-disable-line

    

    const submit= async(event) => {
        event.preventDefault()

        login({ variables: {username, password}})

        setShow('books')
    }

    if(!show){
        return null
    }
    return (
        <div>
            <form onSubmit={submit}>
                <div>
                    username <input value={username} onChange={({target}) => setUsername(target.value)}/>
                </div>
                <div>
                    password <input type="password" value={password} onChange={({target})=> setPassword(target.value)}/>
                </div>
                <button type="submit">login</button>
            </form>
        </div>
    )

}

export default LoginForm