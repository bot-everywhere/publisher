const { GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json')
const { GraphQLDate, GraphQLTime, GraphQLDateTime } = require('graphql-iso-date')

module.exports = {
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  Time: GraphQLTime,
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
  Bot: {
    live: ({ updatedAt }) => {
      const t = new Date(updatedAt).getTime()
      return Date.now() - t < 60 * 1000
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
