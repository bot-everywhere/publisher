module.exports = `
  scalar Date
  scalar Time
  scalar DateTime

  enum QueueName {
    CONTROL
    JOB
  }

  enum TaskStatus {
    QUEUEING
    FAILED
    SUCCESSFUL
  }

  type Task {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    expiredAt: DateTime!
    status: TaskStatus!
    action: String!,
    payload: String! 
    assignedTo: ID
    # in seconds
    timeout: Int!
  }

  type Bot {
    id: ID!
    name: String!
    pendingTask: Int!
    pendingProcess: Int!
    updatedAt: DateTime!
  }

  input CreateTaskInput {
    action: String!
    payload: String! 
    expiredAt: DateTime!
    timeout: Int!
    assignedTo: ID!
  }

  input PingInput {
    name: String!
    pendingTask: Int!
    pendingProcess: Int!
  }

  type Mutation {
    # Send a report to server every interval
    ping(input: PingInput!): Boolean!
    # Create new task for Control or Job queue
    createTask(to: QueueName!, input: CreateTaskInput!): Boolean! 
    # Update task status 
    updateTask(id: ID!, status: TaskStatus!): Boolean! 
  }

  type Query {
    # List of bots
    bots: [Bot!]!
    # Job queue
    jobs(first: Int!): [Task!]!
    # Control queue
    controls(first: Int!): [Task!]!
  }
`
