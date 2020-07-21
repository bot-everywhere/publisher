const assert = require('assert')
const dotenv = require('dotenv')
const log4js = require('log4js')
const Redis = require('redis')
const { promisify } = require('util')
const { GraphQLServer } = require('graphql-yoga')

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
  type Bot {
    id: ID!
    live: Boolean!
  }

  type Mutation {
    ping(id: ID!): Boolean!
  }

  type Query {
    bot(id: ID!): Bot
  }
`

/* Define solver */
const resolvers = {
  Query: {
    bot: (_, { id }, { redis }) => promisify(callback => {
      redis.multi()
        .sscan(['bots', 0, 'MATCH', id])
        .exists([`bots:${id}:live`])
        .exec((error, replies) => {
          if (error || !!replies.find(r => r instanceof Redis.RedisError))
            return callback()
          const [[cursor, values], live] = replies 
          if (!values.length) return callback()
          return callback(null, { id, live: !!live })
        })
    })()
  },
  Mutation: {
    ping: (_, { id }, { redis }) => promisify(callback => {
      redis.multi()
        .sadd(['bots', id])
        .set([`bots:${id}:live`, 'ok', 'EX', 60])
        .exec(error => callback(error, true))
    })()
  }
}

/* Start server */
const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: () => ({
    redis,
  })
})

const options = {
  port: process.env.PORT,
  endpoint: process.env.ENDPOINT,
  playground: process.env.PLAYGROUND,
}

server.start(options, () => {
  console.log(`Server is running on localhost: ${process.env.PORT}`)
})
