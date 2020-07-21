const { GraphQLServer } = require('graphql-yoga')
const assert = require('assert')
const dotenv = require('dotenv')
const log4js = require('log4js')
const Redis = require('redis')

/* Load config from .env to process.env */
dotenv.config()

/* Setup logger */
const logger = log4js.getLogger()
logger.level = 'debug'

/* Connect to redis */
const redis = Redis.createClient(process.env.REDIS_URL)
redis.on('ready', () => logger.debug(`Connected to redis`))

/* Define schema */
const typeDefs = `
  type Mutation {
    ping(id: ID!): Boolean!
  }
  type Query {
    hello(name: String!): String!
  }
`

/* Define solver */
const resolvers = {
  Query: {
    hello(_, { name }) {
      return `hello ${name}`
    },
  },
  Mutation: {
    ping() {
      return true
    },
  }
}

/* Start server */
const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: { redis },
})

const options = {
  port: process.env.PORT,
  endpoint: process.env.ENDPOINT,
  playground: process.env.PLAYGROUND,
}

server.start(options, () => {
  console.log(`Server is running on localhost: ${process.env.PORT}`)
})
