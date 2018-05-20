import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { ApolloLink, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { onError } from "apollo-link-error";

import { store, history } from './store';
import AppRouter from './Router';
import { parseError } from './shared/utils/parse_errors';

const httpUri = 'https://api.graph.cool/simple/v1/cjb30vkvv434c0146sjjn4d4w';
const wsUri = 'wss://subscriptions.ap-northeast-1.graph.cool/v1/cjb30vkvv434c0146sjjn4d4w';

const httpLink = createHttpLink({ uri: httpUri });

const middlewareLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('graphcoolToken');
  const authorizationHeader = token ? `Bearer ${token}` : null;
  operation.setContext({
    headers: {
      authorization: authorizationHeader
    }
  });
  return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) parseError(networkError);
});

const authToken = () => {
  const token = localStorage.getItem("graphcoolToken");
  return token ? `Bearer ${token}` : null;
};

const withErrLink = errorLink.concat(httpLink);

const httpLinkWithAuthToken = middlewareLink.concat(withErrLink);

const wsLink = new WebSocketLink({
  uri: wsUri,
  options: {
    reconnect: true,
    connectionParams: () => {
      return { Authorization: authToken() }
    }
  }
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLinkWithAuthToken,
);

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
});

class App extends Component {
  render() {
    return (
      <ApolloProvider client={apolloClient}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <AppRouter />
          </ConnectedRouter>
        </Provider>
      </ApolloProvider>
    );
  }
}

export default App;
