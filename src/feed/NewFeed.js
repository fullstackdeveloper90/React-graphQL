import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import FeedForm from './components/FeedForm';
import { parseFormErrors } from '../shared/utils/form_errors';

class NewFeed extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(values) {
    const { updateUser, push } = this.props;
    return updateUser({ variables: { ...values } })
      .then(() => push('/feed/suggest'))
      .catch(parseFormErrors);
  }

  render() {
    const { fetchUsers } = this.props;
    if (fetchUsers.loading) {
      return <div className="loader-indicator" />;
    }

    return (
      <div id="new-story">
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/feed/suggest">Suggest Users</Link></Breadcrumb.Item>
          <Breadcrumb.Item>New Suggest</Breadcrumb.Item>
        </Breadcrumb>

        <div className="container">
          <h3>New Suggest</h3>

          <FeedForm
            users={fetchUsers.allUsers}
            onSubmit={this.handleSubmit}
          />
        </div>
      </div>
    );
  }
}

const FETCH_USERS = gql`
  query FetchUsers {
    allUsers (filter: {
      isSuggest: false
    }) {
      id
      displayName
      isSuggest
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

const NewFeedScreen = compose(
  graphql(FETCH_USERS, {
    name: 'fetchUsers',
    options: {
      fetchPolicy: 'network-only',
    },
  }),
  graphql(UPDATE_USER, {
    name: 'updateUser',
  }),
)(NewFeed);

export default connect(null, { push })(NewFeedScreen);
