import ReactDOM from 'react-dom';
import React from 'react';
import GraphiQL from 'graphiql';
// import { addErrorLoggingToSchema } from 'graphql-tools';
require('!style!css!../node_modules/graphiql/graphiql.css');
import { mockServer, MockList } from 'graphql-tools';
import { formatError } from 'graphql';
import casual from 'casual-browserify';

const shorthand = `
  type User {
    id: ID!
    name: String
    lists: [List]
  }

  type List {
    id: ID!
    name: String
    owner: User
    incomplete_count: Int
    tasks(completed: Boolean): [Task]
  }

  type Task {
    id: ID!
    text: String
    completed: Boolean
    list: List
  }

  type RootQuery {
    user(id: ID): User
    users(num: Int): [User]
  }

  schema {
    query: RootQuery
  }
`;

const server = mockServer(shorthand, {
  RootQuery: () => ({
    // return a user whose id matches that of the request
    user: (o, { id }) => ({ id }),
    // return a list with num users in it
    users: (o, { num }) => new MockList(num),
  }),
  List: () => ({
    name: () => casual.title,
    // return a list with 2 - 6 tasks
    tasks: () => new MockList([2, 6], (o, { completed }) => ({ completed })),
  }),
  Task: () => ({ text: casual.sentence }),
  User: () => ({
    name: casual.full_name,
    lists: () => new MockList(3, (user) => ({ owner: user.id })),
  }),
});

// addErrorLoggingToSchema(schema, { log: (err) => console.log(err) });

function graphQLFetcher(graphQLParams) {
  let variables = {};
  try {
    variables = JSON.parse(graphQLParams.variables);
  } catch (e) {
    // do nothing
  }
  return server.query(
    graphQLParams.query,
    variables
  ).then((res) => {
    console.log(res);
    if (res.errors){
      res.errors = res.errors.map(formatError)
    }
    return res;
  });
}


const query = `query tasksForUser{
  user(id: 6) {
    id
    name
    lists {
      name
      completeTasks: tasks(completed: true) {
        completed
        text
      }
      incompleteTasks: tasks(completed: false) {
        completed
        text
      }
      anyTasks: tasks {
        completed
        text
      }
    }
  }
  users(num: 3){
    name
  }
}`;

const vars = '';

ReactDOM.render(
  <GraphiQL
    fetcher={graphQLFetcher}
    query={query}
    variables={vars} >
    <GraphiQL.Footer>
      <p>
      <h2>More information about this demo:</h2>
      Medium post: <a href="https://medium.com/p/692feda6e9cd">Mocking your backend with just one line of code</a><br/>
      GitHub repository for this demo: <a href="https://github.com/apollostack/mock-demo">apollostack/mock-demo</a><br/>
      GitHub repository for the graphql-tools project: <a href="https://github.com/apollostack/graphql-tools">apollostack/graphql-tools</a><br/>
      More information about Apollo <a href="http://www.apollostack.com">apollostack.com</a>
      </p>
    </GraphiQL.Footer>
    </GraphiQL>
  , document.getElementById('app'));
