const shortid = require('shortid')
const { GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json')
const { GraphQLDate, GraphQLTime, GraphQLDateTime } = require('graphql-iso-date')

const PING_INTERVAL = 1 // mins

module.exports = {
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  Time: GraphQLTime,
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
  Bot: {
    live: ({ updatedAt }) => {
      const t = new Date(updatedAt).getTime()
      return Date.now() - t < PING_INTERVAL * 60 * 1000
    }
  },
  Query: {
    controls: () => [],
    jobs: () => [],
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
    ping: (_, { id }, { db }) => {
      const bots = db.collection('bots')
      const selector = { id }
      const doc = { $set: { updatedAt: new Date() } }
      const options = { upsert: true }
      return bots
        .updateOne(selector, doc, options)
        .then(({ result: { ok } }) => !!ok)
    }
  }
}
