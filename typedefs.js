module.exports = `
  scalar Date
  scalar Time
  scalar DateTime
  scalar JSON
  scalar JSONObject

  enum JobStatus {
    QUEUEING
    FAILED
    SUCCESSFUL
  }

  enum JobType {
    ONE
    ALL
  }

  type Job {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    expiredAt: DateTime!
    status: JobStatus!
    type: JobType!
    action: String!,
    payload: JSON!
    # if jobType is ONE
    acquiredBy: ID
  }

  type Control {
    id: ID!
  }

  type Bot {
    id: ID!
    updatedAt: DateTime!
    live: Boolean!
  }

  input CreateJobInput {
    type: JobType!
    action: String!
    payload: JSON! 
    expiredAt: DateTime!
  }

  type Mutation {
    # Send a report to server every interval
    ping(id: ID!): Boolean!
    createJob(input: CreateJobInput!): Job
  }

  type Query {
    bots: [Bot!]!
    # Job queue
    jobs(botId: ID!): [Job!]!
    # Control queue
    controls(botId: ID!): [Control!]!
  }
`
