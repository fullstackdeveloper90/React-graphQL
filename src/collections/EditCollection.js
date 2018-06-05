import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Divider, Table, Button, Icon, Modal } from 'antd';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import CollectionForm from './components/CollectionForm';
import { parseFormErrors } from '../shared/utils/form_errors';
import { parseError } from '../shared/utils/parse_errors';

import { collectionPlacesColumns } from '../shared/constants/collectionConstants';

class EditCollection extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleDeletePlace = this.handleDeletePlace.bind(this);
  }

  handleSubmit(values) {
    const { match: { params }, updateCollection, push } = this.props;
    return updateCollection({ variables: { ...values, id: params.id } })
      .then(() => push('/collections'))
      .catch(parseFormErrors);
  }

  handleDelete() {
    const { match: { params }, deleteCollection, push } = this.props;
    Modal.confirm({
      title: 'Are you sure delete?',
      content: 'Delete collection can not be undone',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteCollection({ variables: { id: params.id } })
          .then(() => push('/collections'))
          .catch(() => parseError('Failed to delete collection'));
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  handleDeletePlace(value) {
    const { match: { params }, updateCollectionPlaces, fetchCollection: { Collection } } = this.props;
    const places = Collection.places.map(({ id }) => id).filter(val => val != value);
    Modal.confirm({
      title: 'Are you sure delete?',
      content: 'You can add it again :)',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        updateCollectionPlaces({ variables: { id: params.id, places } })
          .catch(parseError);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  render() {
    const { fetchCollection, fetchPlaces, fetchUsers, match: { params } } = this.props;

    if (fetchCollection.loading || fetchPlaces.loading || fetchUsers.loading) {
      return <div className="loader-indicator" />;
    }

    const initialValues = {
      ...fetchCollection.Collection,
      userId: fetchCollection.Collection.user.id
    };

    const dataSourcePlaces = initialValues.places.map(place =>
      ({ key: place.id, ...place, onDelete: this.handleDeletePlace }));

    return (
      <div id="edit-collection">
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/collections">Collections</Link></Breadcrumb.Item>
          <Breadcrumb.Item>Edit Collection</Breadcrumb.Item>
        </Breadcrumb>

        <div className="container">
          <h3>Edit Collection</h3>

          <CollectionForm
            initialValues={initialValues}
            pictureURL={initialValues.pictureURL}
            places={fetchPlaces.allPlaces}
            users={fetchUsers.allUsers}
            onSubmit={this.handleSubmit}
            onDelete={this.handleDelete}
          />

          <Divider />

          <h4>
            Places list in Collection
            <div className="is-right">
              <Button.Group size="small">
                <Button>
                  <Link to={`/places/new`}>
                    <Icon type="plus" />New Place
                  </Link>
                </Button>
                <Button>
                  <Link to={`/collections/edit/${params.id}/add`}>
                    <Icon type="plus" />Add place
                  </Link>
                </Button>
                <Button>
                  Report<Icon type="down" />
                </Button>
              </Button.Group>
            </div>
          </h4>

          <Table
            columns={collectionPlacesColumns}
            dataSource={dataSourcePlaces}
          />
        </div>
      </div>
    );
  }
}

const FETCH_COLLECTION = gql`
  query FetchCollection($id: ID!) {
    Collection(id: $id) {
      id
      createdAt
      name
      privacy
      pictureURL
    	user {
    	  id
        displayName
    	}
    	places {
    	  id
        placeName
    	}
    }
  }
`

const UPDATE_COLLECTION = gql`
  mutation UpdateCollection(
    $id: ID!,
    $name: String!,
    $privacy: Boolean,
    $pictureURL: String!,
    $userId: ID!,
  ) {
    updateCollection (
      id: $id
      name: $name
      privacy: $privacy
      pictureURL: $pictureURL
      userId: $userId
    ) {
      id
    }
  }
`

const DELETE_COLLECTION = gql`
  mutation DeleteCollection($id: ID!) {
    deleteCollection(id: $id) {
      id
    }
  }
`

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

const UPDATE_COLLECTION_PLACES = gql`
  mutation UpdateCollection(
    $id: ID!,
    $places: [ID!]
  ) {
    updateCollection (
      id: $id
      placesIds: $places
    ) {
      id
      places {
        id
        placeName
      }
    }
  }
`


const EditCollectionScreen = compose(
  graphql(FETCH_COLLECTION, {
    name: 'fetchCollection',
    options: ({ match }) => ({
      variables: {
        id: match.params.id,
      },
    }),
  }),
  graphql(UPDATE_COLLECTION, {
    name: 'updateCollection',
  }),
  graphql(DELETE_COLLECTION, {
    name: 'deleteCollection',
  }),
  graphql(FETCH_PLACES, {
    name: 'fetchPlaces',
  }),
  graphql(FETCH_USERS, {
    name: 'fetchUsers',
  }),
  graphql(UPDATE_COLLECTION_PLACES, {
    name: 'updateCollectionPlaces',
  }),

)(EditCollection);

export default connect(null, { push })(EditCollectionScreen);
