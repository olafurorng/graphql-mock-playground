import ReactDOM from 'react-dom';
import React from 'react';
import GraphiQL from 'graphiql';
// import { addErrorLoggingToSchema } from 'graphql-tools';
require('!style!css!../node_modules/graphiql/graphiql.css');
import { mockServer, MockList } from 'graphql-tools';
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
  }

  schema {
    query: RootQuery
  }
`;

const server = mockServer(shorthand, {
  RootQuery: () => ({
    user: (o, { id }) => ({ id }),
  }),
  List: () => ({
    name: () => casual.word,
    tasks: () => new MockList(4, (o, { completed }) => ({ completed })),
  }),
  Task: () => ({ text: casual.words(10) }),
  User: () => ({ name: casual.name }),
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
  );
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
}`;

const vars = '';

ReactDOM.render(
  <GraphiQL
    fetcher={graphQLFetcher}
    query={query}
    variables={vars} >
    <GraphiQL.Footer>
      <p>
      My Medium post about this demo: <a href="https://medium.com/p/692feda6e9cd">Mocking made easy</a><br/>
      Github for this demo: <a href="https://github.com/apollostack/mock-demo">apollostack/mock-demo</a><br/>
      Github for the graphql-tools project: <a href="https://github.com/apollostack/graphql-tools">apollostack/graphql-tools</a></p>
    </GraphiQL.Footer>
    </GraphiQL>
  , document.getElementById('app'));
