module.exports = `
  scalar Date
  scalar Time
  scalar DateTime

  enum JobStatus {
    QUEUEING
    FAILED
    SUCCESSFUL
  }

  enum JobType {
    ONE
    MULTI
  }

  type Job {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    expiredAt: DateTime!
    status: JobStatus!
    type: JobType!
    action: String!,
    payload: String! 
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
    payload: String! 
    expiredAt: DateTime!
  }

  type Mutation {
    # Send a report to server every interval
    ping: Boolean!
    createJob(input: CreateJobInput!): Job
  }

  type Query {
    bots: [Bot!]!
    # Job queue
    jobs(first: Int!): [Job!]!
    # Control queue
    controls: [Control!]!
  }
`
