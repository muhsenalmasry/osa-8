const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')
const config = require('./config')
const jwt = require('jsonwebtoken')

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log('connected to MongoDB')
    }).catch((error) => {
        console.log('error connecting to MongoDB: ', error.message)
    })


const typeDefs = gql`
type User {
    username: String
    favouriteGenre: String
}
type Token {
    value: String!
} 
type Author {
    name: String!
    born: Int
    id: ID!
    bookCount: Int
}
type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String]!
    id: ID!
} 
type Query {
      bookCount: Int!
      authorCount: Int!
      allBooks(author: String, genre: String): [Book!]!
      allAuthors: [Author!]!
      me: User
  }

  type Mutation {
      addBook(
          title: String!
          author: String!
          published: Int!
          genres: [String!]!
      ): Book
      addAuthor(
          name: String!
          born: Int
      ):Author
      editAuthor(
        name: String!
        setBornTo: Int!
      ): Author
      createUser(
          username: String!
          favouriteGenre: String!
      ): User
      login(
          username: String!
          password: String!
      ): Token
  }
  type Subscription {
      bookAdded: Book!
  }
`
const {PubSub} = require('apollo-server')
const pubsub = new PubSub()

const resolvers = {
    Query: {
        bookCount: () => Book.collection.countDocuments(),
        authorCount: () => Author.collection.countDocuments(),
        allBooks: (root, args) => {
            const author = Author.find({ name: args.author })
            if (!args.author) {
                if (!args.genre) {
                    return Book.find({}).populate('author')
                }
                return Book.find({ genres: { $in: [args.genre] } }).populate('author')
            }
            if (!args.genre) {
                return Book.find({ author: author._id }).populate('author')
            }
            return Book.find({ author: author._id, genres: { $in: args.genre } }).populate('author')
        },
        allAuthors: () => {
            return Author.find({}).populate('books')
        },
        me: async (root, args, context) => {
            return context.currentUser
        }

    },

    Author: {
        bookCount: (root) => {
            const books = root.books.length
            return (
                books
            )
        }
    },

    Book: {
        author: (root) => {
            return {
                name: root.author.name,
                born: root.author.born,
                id: root.author._id
            }
        }
    },

    Mutation: {
        addBook: async (root, args, context) => {
            const currentUser = context.currentUser

            if (!currentUser) {
                throw new AuthenticationError("not authenticated")
            }

            const author = await Author.findOne({ name: args.author })
            const book = new Book({ ...args, author: author })
            try {
                await book.save()
                author.books = author.books.concat(book)
                await author.save()
            } catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args
                })
            }

            pubsub.publish('BOOK_ADDED', {bookAdded: book})

            return book
        },

        addAuthor: async (root, args) => {
            const author = new Author({ ...args })
            try {
                await author.save()
            } catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args
                })
            }
            return author
        },

        editAuthor: async (root, args, context) => {
            const currentUser = context.currentUser
            if (!currentUser) {
                throw new AuthenticationError("not authenticated")
            }
            const author = await Author.findOne({ name: args.name })
            author.born = args.setBornTo

            try {
                await author.save()
            } catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args
                })
            }

            return author
        },

        createUser: async (root, args) => {
            const user = new User({ username: args.username, favouriteGenre: args.favouriteGenre })

            return user.save()
                .catch(error => {
                    throw new UserInputError(error.messgae, {
                        invalidArgs: args,
                    })
                })
        },

        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })
            if (!user || args.password !== 'secret') {
                throw new UserInputError("wrong credentials")
            }

            const userForToken = {
                username: user.username,
                id: user._id
            }

            return { value: jwt.sign(userForToken, config.SECRET) }
        }
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
        },
    },
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            const decodedToken = jwt.verify(
                auth.substring('7'), config.SECRET
            )
            const currentUser = await User.findById(decodedToken.id)
            return { currentUser }
        }
    }
})

server.listen().then(({ url , subscriptionsUrl}) => {
    console.log(`Server ready at ${url}`)
    console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})