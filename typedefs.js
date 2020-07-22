module.exports = `
  scalar Date
  scalar Time
  scalar DateTime
  scalar JSON
  scalar JSONObject

  type Job {
    id: ID!
    createdAt: DateTime!
    action: String,
    acquiredBy: ID!
  }

  type Control {
    id: ID!
  }

  type Bot {
    id: ID!
    updatedAt: DateTime!
    live: Boolean!
  }

  type Mutation {
    # Send a report to server every interval
    ping(id: ID!): Boolean!
  }

  type Query {
    bots: [Bot!]!
    # Job queue
    jobs(botId: ID!): [Job!]!
    # Control queue
    controls(botId: ID!): [Control!]!
  }
`

