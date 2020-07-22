const dotenv = require('dotenv')
const log4js = require('log4js')
const { GraphQLServer } = require('graphql-yoga')
const { MongoClient } = require('mongodb')
const resolvers = require('./resolvers')
const typeDefs = require('./typedefs')

/* Load config from .env to process.env */
dotenv.config()

/* Setup logger */
const logger = log4js.getLogger()
logger.level = 'debug'

/* Connect to mongo */
MongoClient.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (error, client ) => {
    if (error) return logger.debug(`Failed to connect to MONGO`)
    /* Start server */
    const server = new GraphQLServer({
      typeDefs,
      resolvers,
      context: ({ request }) => {
        const db = client.db(process.env.DB_NAME)
        return {
          Job: db.collection('jobs'),
          Control: db.collection('controls'),
          Bot: db.collection('bots'),
          botId: request.headers['bot-id'],
        }
      }
    })

    const options = {
      port: process.env.PORT,
      endpoint: process.env.ENDPOINT,
      playground: process.env.PLAYGROUND,
    }

    server.start(options, () => {
      console.log(`Server is running on localhost: ${process.env.PORT}`)
    })
  }
)


