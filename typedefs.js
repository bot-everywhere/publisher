module.exports = `
  scalar Date
  scalar Time
  scalar DateTime

  enum PipeType {
    CONTROL
    JOB
  }

  enum TaskStatus {
    QUEUEING
    FAILED
    SUCCESSFUL
  }

  enum TaskType {
    ONE
    MULTI
  }

  type Task {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    expiredAt: DateTime!
    status: TaskStatus!
    type: TaskType!
    action: String!,
    payload: String! 
    # in seconds
    timeout: Int!
    # if jobType is ONE
    acquiredBy: ID
  }

  type Bot {
    id: ID!
    updatedAt: DateTime!
    live: Boolean!
  }

  input CreateTaskInput {
    type: TaskType!
    action: String!
    payload: String! 
    expiredAt: DateTime!
    timeout: Int!
  }

  type Mutation {
    # Send a report to server every interval
    ping: Boolean!
    createTask(to: PipeType!, input: CreateTaskInput!): Task
  }

  type Query {
    bots: [Bot!]!
    # Job queue
    jobs(first: Int!): [Task!]!
    # Control queue
    controls(first: Int!): [Task!]!
  }
`
