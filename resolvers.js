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
    jobs: (_, { first }, { Job, botId }) => {
      const selector = {
        expiredAt: { $gte: new Date() },
        $or: [
          { type: 'ONE', status: 'QUEUEING', acquiredBy: { $exists: false } },
          { type: 'MULTI', status: 'QUEUEING', acquiredBy: botId },
        ]
      }
      return Job
        .find(selector)
        .limit(first)
        .toArray()
    },
    bots: (_, {}, { Bot }) => {
      const selector = {}
      return Bot 
        .find(selector)
        .toArray()
    },
  },
  Mutation: {
    createTask: (_, { input, to }, { Job }) => {
      const doc = {
        id: shortid.generate(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'QUEUEING',
        ...input,
      }
      return Job 
        .insertOne(doc)
        .then(({ result: { ok } }) => ok ? doc : null)
    },
    ping: (_, {}, { Bot, botId }) => {
      if (!botId) return false
      const selector = { id: botId }
      const doc = { $set: { updatedAt: new Date() } }
      const options = { upsert: true }
      return Bot
        .updateOne(selector, doc, options)
        .then(({ result: { ok } }) => !!ok)
    }
  }
}
