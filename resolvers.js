const shortid = require('shortid')
const { GraphQLDate, GraphQLTime, GraphQLDateTime } = require('graphql-iso-date')

const PING_INTERVAL = 1 // mins

module.exports = {
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  Time: GraphQLTime,
  Bot: {
    live: ({ updatedAt }) => {
      const t = new Date(updatedAt).getTime()
      return Date.now() - t < PING_INTERVAL * 60 * 1000
    }
  },
  Query: {
    controls: () => [],
    jobs: (_, { first }, { db, botId }) => {
      const jobs = db.collection('jobs')
      const selector = {
        $or: [
          { type: 'ONE', status: 'QUEUEING', acquiredBy: { $exists: false } },
          { type: 'MULTI', status: 'QUEUEING', acquiredBy: botId },
        ]
      }
      return jobs
        .find(selector)
        .limit(first)
        .toArray()
    },
    bots: (_, {}, { db }) => {
      const bots = db.collection('bots')
      const selector = {}
      return bots
        .find(selector)
        .toArray()
    },
  },
  Mutation: {
    createJob: (_, { input }, { db }) => {
      const jobs = db.collection('jobs')
      const doc = {
        id: shortid.generate(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'QUEUEING',
        ...input,
      }
      return jobs
        .insertOne(doc)
        .then(({ result: { ok } }) => ok ? doc : null)
    },
    ping: (_, {}, { db, botId }) => {
      if (!botId) return false
      const bots = db.collection('bots')
      const selector = { id: botId }
      const doc = { $set: { updatedAt: new Date() } }
      const options = { upsert: true }
      return bots
        .updateOne(selector, doc, options)
        .then(({ result: { ok } }) => !!ok)
    }
  }
}
