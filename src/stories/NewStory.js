import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import StoryForm from './components/StoryForm';

import { parseFormErrors } from '../shared/utils/form_errors';

class NewStory extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCreatePlace = this.handleCreatePlace.bind(this);
    this.handleCheckPlace = this.handleCheckPlace.bind(this);
  }

  handleSubmit(values) {
    const { createStory, push } = this.props;
    return createStory({ variables: { ...values } })
      .then(() => push('/stories'))
      .catch(parseFormErrors);
  }

  handleCreatePlace(values) {
    const { createPlace, loggedInUserQuery: { loggedInUser } } = this.props

    return createPlace(
      {
        variables: {
          ...values,
          locationLat: parseFloat(values.locationLat),
          locationLong: parseFloat(values.locationLong),
          createdById: loggedInUser && loggedInUser.id,
        }
      })
  }

  handleCheckPlace(place) {
    return this.props.checkPlace.refetch({ sourceId: place });
  }

  render() {
    const { fetchUsers, loggedInUserQuery: { loggedInUser } } = this.props;
    if (fetchUsers.loading) {
      return <div className="loader-indicator" />;
    }

    const initialValues = {
      createdById: loggedInUser && loggedInUser.id,
      status: 'DRAFT'
    };

    return (
      <div id="new-story">
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/stories">Stories</Link></Breadcrumb.Item>
          <Breadcrumb.Item>New Story</Breadcrumb.Item>
        </Breadcrumb>

        <div className="container">
          <h3>New Story</h3>

          <StoryForm
            initialValues={initialValues}
            users={fetchUsers.allUsers}
            onCreatePlace={this.handleCreatePlace}
            onCheckPlace={this.handleCheckPlace}
            onSubmit={this.handleSubmit}
          />
        </div>
      </div>
    );
  }
}

const LOGGED_IN_USER_QUERY = gql`
  query LoggedInUserQuery {
    loggedInUser {
      id
    }
  }
`

const FETCH_USERS = gql`
  query FetchUsers ($userId: ID){
    allUsers (filter:{ id: $userId}){
      id
      displayName
    }
  }
`

const CREATE_STORY = gql`
  mutation CreateStory(
    $title: String!,
    $story: String!,
    $pictureURL: [String!],
    $status: StoryStatus!
    $placeId: ID,
    $createdById: ID,
  ) {
    createStory(
      title: $title
      story: $story
      pictureURL: $pictureURL
      status: $status
      hashtag: []
      placeId: $placeId
      createdById: $createdById
    ) {
      id
    }
  }
`

const CHECK_PLACE = gql`
  query CheckPlace ($sourceId: String) {
    Place (sourceId: $sourceId) {
      id
      placeName
      sourceId
      address
      locationLat
      locationLong
    }
  }
`

const CREATE_PLACE = gql`
  mutation CreatePlace(
    $placeName: String!,
    $description: String,
    $createSide: CreateSide!,
    $address: String,
    $addressStreet: String,
    $addressAreaDistrict: String,
    $addressCityTown: String,
    $addressStateProvince: String,
    $addressCountry: String,
    $addressPostalCode: String,
    $locationLat: Float,
    $locationLong: Float,
    $source: PlaceSource!,
    $sourceId: String,
    $pictureURL: [String!],
    $createdById: ID,
    $status: PlaceStatus!
  ) {
    createPlace(
      placeName: $placeName
      description: $description
      createSide: $createSide
      address: $address
      addressStreet: $addressStreet
      addressAreaDistrict: $addressAreaDistrict
      addressCityTown: $addressCityTown
      addressStateProvince: $addressStateProvince
      addressCountry: $addressCountry
      addressPostalCode: $addressPostalCode
      locationLat: $locationLat
      locationLong: $locationLong
      source: $source
      sourceId: $sourceId
      pictureURL: $pictureURL
      createdById: $createdById
      status: $status
    ) {
      id
    }
  }
`

const NewStoryScreen = compose(
  graphql(LOGGED_IN_USER_QUERY, {
    name: 'loggedInUserQuery',
    options: {
      fetchPolicy: 'network-only',
    }
  }),
  graphql(FETCH_USERS, {
    name: 'fetchUsers',
    options: ({ user }) => {
      let variables = {};
      if (!user.group.includes("ADMIN")) {
        variables = { userId: user.id };
      }
      return { variables };
    }
  }),
  graphql(CREATE_STORY, {
    name: 'createStory',
  }),
  graphql(CREATE_PLACE, {
    name: 'createPlace',
  }),
  graphql(CHECK_PLACE, {
    name: 'checkPlace',
    options: ( options ) => ({
      variables: {
        sourceId: options.sourceId || '',
      }
    })
  }),
)(NewStory);

export default connect(null, { push })(NewStoryScreen);
