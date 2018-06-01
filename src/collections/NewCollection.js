import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import CollectionForm from './components/CollectionForm';
import { parseFormErrors } from '../shared/utils/form_errors';

class NewCollection extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(values) {
    const { createCollection, push } = this.props;
    return createCollection({ variables: { ...values } })
      .then(() => push('/collections'))
      .catch(parseFormErrors);
  }

  render() {
    const { fetchPlaces, fetchUsers } = this.props;

    if (fetchPlaces.loading || fetchUsers.loading) {
      return <div className="loader-indicator" />;
    }

    return (
      <div id="new-collection">
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/collections">Collection</Link></Breadcrumb.Item>
          <Breadcrumb.Item>New сollection</Breadcrumb.Item>
        </Breadcrumb>

        <div className="container">
          <h3>New Collection</h3>

          <CollectionForm
            places={fetchPlaces.allPlaces}
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
    allUsers {
      id
      displayName
    }
  }
`

const FETCH_PLACES = gql`
  query FetchPlaces {
    allPlaces {
      id
      placeName
    }
  }
`

const CREATE_COLLECTION = gql`
  mutation CreateCollection (
    $name: String!,
    $privacy: Boolean,
    $pictureURL: String!,
    $userId: ID!,
  ) {
    createCollection(
      name: $name
      privacy: $privacy
      pictureURL: $pictureURL
      userId: $userId
    ) {
      id
    }
  }
`

const NewCollectionScreen = compose(
  graphql(FETCH_PLACES, {
    name: 'fetchPlaces',
    options: {
      fetchPolicy: 'network-only',
    },
  }),
  graphql(FETCH_USERS, {
    name: 'fetchUsers',
    options: {
      fetchPolicy: 'network-only',
    },
  }),
  graphql(CREATE_COLLECTION, {
    name: 'createCollection',
  }),
)(NewCollection);

export default connect(null, { push })(NewCollectionScreen);
