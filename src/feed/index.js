import React, { Component } from 'react';
import { Breadcrumb, Table, Button, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import { feedColumns } from '../shared/constants/feedConstants';
import { parseError } from '../shared/utils/parse_errors';

class Feed extends Component {

  componentDidMount() {
    this.updateUserSubscription = this.props.fetchUsers.subscribeToMore({
      document: gql`
        subscription {
          User(filter: {
            mutation_in: [UPDATED]
          }) {
            mutation
            node {
              id
              firstName
              lastName
              isSuggest
              displayName
            }
            previousValues {
              id
            }
          }
        }
      `,
      updateQuery: (previousState, { subscriptionData }) => {
        this.props.fetchUsers.refetch()
      },
      onError: (err) => console.error(err),
    });
  }

  render() {
    const { fetchUsers: { loading, allUsers }, updateUser } = this.props;
    if (loading) {
      return <div className="loader-indicator" />;
    }

    const onDelete = (id) => {
      updateUser({ variables: { id: id, isSuggest: false } })
        .catch(() => parseError('Failed to delete feed'));
    }

    const suggestDataSource = allUsers.map(feed => ({ ...feed, key: feed.id, onDelete }));

    return (
      <div id="places">
        <Breadcrumb>
          <Breadcrumb.Item>Suggest Users</Breadcrumb.Item>
        </Breadcrumb>

        <div className="container">
          <h4>
            Manage Suggestions
            <div className="is-right">
              <Button.Group size="small">
                <Button>
                  <Link to="/feed/suggest/new"><Icon type="plus" />New Suggest</Link>
                </Button>
                <Button>
                  Report<Icon type="down" />
                </Button>
              </Button.Group>
            </div>
          </h4>

          <Table
            columns={feedColumns}
            dataSource={suggestDataSource}
          />
        </div>
      </div>
    )
  }
}

const FETCH_USERS = gql`
  query FetchUsers($search: String) {
    allUsers (filter: {
      AND: [
        { isSuggest: true },
        { displayName: $search },
      ]
    }) {
      id
      firstName
      lastName
      isSuggest
      displayName
    }
  }
`

const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!,
    $isSuggest: Boolean,
  ) {
    updateUser (
      id: $id
      isSuggest: $isSuggest
    ) {
      id
    }
  }
`

const FeedScreen = compose(
  graphql(FETCH_USERS, {
    name: 'fetchUsers',
    options: ({ search }) => {
      let variables = {};
      if (search) {
        variables = { ...variables, search };
      }
      return { variables };
    },
  }),
  graphql(UPDATE_USER, {
    name: 'updateUser',
  }),
)(Feed);

export default FeedScreen;
