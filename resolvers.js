const shortid = require('shortid')
const { GraphQLDate, GraphQLTime, GraphQLDateTime } = require('graphql-iso-date')

const PING_INTERVAL = 60 // seconds

module.exports = {
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  Time: GraphQLTime,
  Bot: {
    live: ({ updatedAt }) => {
      return Date.now() - new Date(updatedAt).getTime() < PING_INTERVAL * 1000
    }
  },
  Query: {
    controls: (_, { first }, { Control, botId }) => {
      const selector = {
        assignedTo: botId,
        expiredAt: { $gte: new Date() },
      }
      return Control
        .find(selector)
        .limit(first)
        .toArray()
    },
    jobs: (_, { first }, { Job, botId }) => {
      const selector = {
        assignedTo: botId,
        expiredAt: { $gte: new Date() },
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
    createTask: (_, { input, to }, { Job, Control }) => {
      const Task = to == 'CONTROL' ? Control : Job 
      const doc = {
        id: `${to}:${shortid.generate()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'QUEUEING',
        ...input,
      }
      return Task 
        .insertOne(doc)
        .then(({ result: { ok } }) => !!ok)
    },
    updateTask: (_, { id, status }, { Job, Control, botId }) => {
      if (!botId) return null 
      const selector = { id, assignedTo: botId }
      const modifier = { $set: { status } }
      switch (id.split(':')[0]) {
        case 'JOB': {
          return Job
            .updateOne(selector, modifier)
            .then(({ result: { ok } }) => !!ok)
        }
        case 'CONTROL': {
          return Control
            .updateOne(selector, modifier)
            .then(({ result: { ok } }) => !!ok)
        }
      }
      return false
    },
    ping: (_, { input }, { Bot, botId }) => {
      if (!botId) return false
      const selector = { id: botId }
      const modifier = { $set: { updatedAt: new Date(), ...input } }
      const options = { upsert: true }
      return Bot
        .updateOne(selector, modifier, options)
        .then(({ result: { ok } }) => !!ok)
    },
  }
}
