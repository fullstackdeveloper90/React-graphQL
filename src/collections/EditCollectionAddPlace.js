import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import AddPlaceToCollectionForm from './components/AddPlaceToCollectionForm';
import { parseFormErrors } from '../shared/utils/form_errors';

class EditCollectionAddPlace extends Component {
  constructor(props) {
    super(props);
    
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(values) {
    const { match: { params }, updateCollectionPlaces, push, fetchCollection } = this.props;
    const places = fetchCollection.Collection.places.map(place => place.id).concat(values.placeId);
    
    return updateCollectionPlaces({ variables: { id: params.id, places } })
      .then(() => push(`/collections/edit/${params.id}`))
      .catch(parseFormErrors);
  }

  render() {
    const { fetchCollection, fetchPlaces, match: { params } } = this.props;

    if (fetchCollection.loading || fetchPlaces.loading) {
      return <div className="loader-indicator" />;
    }

    return (
      <div id="edit-collection">
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/collections">Collections</Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to={`/collections/edit/${params.id}`}>Edit Collection</Link></Breadcrumb.Item>
          <Breadcrumb.Item>Add place</Breadcrumb.Item>
        </Breadcrumb>

        <div className="container">
          <h3>Add place to Collection</h3>

          <AddPlaceToCollectionForm
            places={fetchPlaces.allPlaces}
            onSubmit={this.handleSubmit}
          />

          <Divider />
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

const UPDATE_COLLECTION_PLACES = gql`
  mutation updateCollectionPlaces(
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

const FETCH_PLACES = gql`
  query FetchPlaces {
    allPlaces {
      id
      placeName
    }
  }
`

const EditCollectionAddPlaceScreen = compose(
  graphql(FETCH_COLLECTION, {
    name: 'fetchCollection',
    options: ({ match }) => ({
      variables: {
        id: match.params.id,
      },
    }),
  }),
  graphql(FETCH_PLACES, {
    name: 'fetchPlaces',
  }),
  graphql(UPDATE_COLLECTION_PLACES, {
    name: 'updateCollectionPlaces',
  }),
)(EditCollectionAddPlace);

export default connect(null, { push })(EditCollectionAddPlaceScreen);
