import React from 'react';
import ReactDOM from 'react-dom';
import GraphiQL from 'graphiql';
import { addErrorLoggingToSchema } from 'graphql-tools';
require('!style!css!../node_modules/graphiql/graphiql.css')

import {
  graphql,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
      leftpad: {
        type: GraphQLString,
        args: {
          str: { type: new GraphQLNonNull(GraphQLString) },
          len: { type: new GraphQLNonNull(GraphQLInt) },
          ch: { type: GraphQLString, defaultValue: ' ' },
        },
        resolve: (root, { str, len, ch }) => {
          return leftpad(str, len, ch);
        },
      },
    },
    description: 'Left-pad a string with a character until it has length len',
  }),
});

addErrorLoggingToSchema(schema, { log: (err) => console.log(err) });

function graphQLFetcher(graphQLParams) {
  let variables = {};
  try {
    variables = JSON.parse(graphQLParams.variables);
  } catch (e) {
    // do nothing
  }
  return graphql(
    schema,
    graphQLParams.query,
    {},
    {},
    variables,
    graphQLParams.operationName
  );
}

// left-pad function from https://github.com/azer/left-pad/pull/11
const leftpad = (str, len, ch) => {
  str = String(str);

  if (!ch && ch !== 0) ch = ' ';

  len = len - str.length;
  if (len <= 0) return str;

  ch = ch + '';
  var pad = '';
  while (true) {
    if (len & 1) pad += ch;
    len >>= 1;
    if (len) ch += ch;
    else break;
  }
  return pad + str;
};

const query = `query pad($str: String!, $len: Int!, $ch: String){
  pad_with_space: leftpad(str:"foo", len: 5),
  pad_too_short: leftpad(str: "foobar", len: 6),
  pad_with_zero: leftpad(str: "1", len: 2, ch: "0"),
  pad_using_var: leftpad(str: $str, len: $len, ch: $ch)
}`;

const vars = `{
  "str": "> apollostack.com",
  "len": 25,
  "ch": "~"
}`;

graphql(schema, query)

ReactDOM.render(
  <GraphiQL
    fetcher={graphQLFetcher}
    query={query}
    variables={vars} >
    <GraphiQL.Footer>
      <h1>Hello World!</h1>
    </GraphiQL.Footer>
    </GraphiQL>
  , document.getElementById('app'));
