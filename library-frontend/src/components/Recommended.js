import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { FavouriteGenre} from '../queries'

const Recommended = ({ show, books }) => {
    const [favouriteGenre, setFavouriteGenre] = useState(null)
    const result = useQuery(FavouriteGenre)

    useEffect(() => {
        if (result.data) {
            if (result.data.me) {
                setFavouriteGenre(result.data.me.favouriteGenre)
            }
        }
    }, [result.data])

    if (!show) {
        return null
    }
    
    const recommendations = books.filter(b=> b.genres.includes(favouriteGenre))

    return (
        <div>
            <h2>Recommendations</h2>
            <div>
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
                        {recommendations.map(a =>
                            <tr key={a.title}>
                                <td>{a.title}</td>
                                <td>{a.author.name}</td>
                                <td>{a.published}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    )
}

export default Recommended