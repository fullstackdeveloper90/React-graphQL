import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Modal, Row, Col, Form } from 'antd';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import StoryForm from './components/StoryForm';
import { parseFormErrors } from '../shared/utils/form_errors';
import { parseError } from '../shared/utils/parse_errors';

class EditStory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      story: {},
      keywords: [],
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleCreatePlace = this.handleCreatePlace.bind(this);
    this.handleCheckPlace = this.handleCheckPlace.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fetchStory.Story && nextProps.fetchStory.Story !== this.props.fetchStory.Story) {
      const story = nextProps.fetchStory.Story;
      this.setState({ story, keywords: story.place.keywords });
    }
  }

  handleSubmit(values) {
    const { match: { params }, updateStory, push } = this.props;
    return updateStory({ variables: { ...values, id: params.id } })
      .then(() => push('/stories'))
      .catch(parseFormErrors);
  }

  handleDelete() {
    const { match: { params }, deleteStory, push } = this.props;
    Modal.confirm({
      title: 'Are you sure delete?',
      content: 'Delete story can not be undone',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteStory({ variables: { id: params.id } })
          .then(() => push('/stories'))
          .catch(() => parseError('Failed to delete story'));
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  handleCreatePlace(values) {
    const { createPlace, loggedInUserQuery: { loggedInUser } } = this.props;

    return createPlace({
      variables: {
        ...values,
        locationLat: parseFloat(values.locationLat),
        locationLong: parseFloat(values.locationLong),
        createdById: loggedInUser && loggedInUser.id,
      }
    });
  }

  handleCheckPlace(place) {
    return this.props.checkPlace.refetch({ sourceId: place });
  }

  handleTagsChange = tags => {
    const { story, keywords } = this.state;
    if (tags.length > keywords.length) {//added
      const newKeyword = tags[tags.length - 1];
      if (!keywords.map(item => item.name).includes(newKeyword)) {
        this.props.createKeyword({
          variables: {
            name: newKeyword,
            places: [story.place.id],
            userId: this.props.loggedInUserQuery.loggedInUser.id
          }
        }).then(({ data }) => {
          this.setState({
            keywords: [
              ...keywords, {
                id: data.createKeyword.id,
                name: newKeyword
              }]
          });
        });
      }
    } else {//removed
      const oldKeyword = keywords.filter(item => !tags.includes(item.name))[0];
      if (oldKeyword) {
        this.props.deleteKeyword({
          variables: {
            id: oldKeyword.id
          }
        }).then(({ data }) => {
          this.setState({ keywords: keywords.filter(item => item !== oldKeyword) });
        })
      }
    }
  };

  render() {
    const { fetchUsers, fetchStory } = this.props;
    const { story, keywords } = this.state;

    if (fetchUsers.loading || fetchStory.loading) {
      return <div className="loader-indicator" />;
    }

    const initialValues = {
      ...story,
      createdById: story.createdBy.id,
      placeId: story.place ? story.place.id : null,
      placeName: story.place ? story.place.placeName : null,
      placeAddress: story.place ? story.place.address : null,
      placeLat: story.place ? story.place.locationLat : null,
      placeLong: story.place ? story.place.locationLong : null,
    };

    return (
      <div id="edit-story">
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/stories">Stories</Link></Breadcrumb.Item>
          <Breadcrumb.Item>Edit Story</Breadcrumb.Item>
        </Breadcrumb>

        <div className="container">
          <h3>Edit Story</h3>

          <StoryForm
            initialValues={initialValues}
            users={fetchUsers.allUsers}
            pictureURL={story.pictureURL}
            onCreatePlace={this.handleCreatePlace}
            onCheckPlace={this.handleCheckPlace}
            onSubmit={this.handleSubmit}
            onDelete={this.handleDelete}
          />
          <Row>
            <Col span={20}>
              <Col span={3} className="ant-form-item-label">
                <label>Keywords</label>
              </Col>
              <Col span={16}>
                <TagsInput
                  value={keywords.map(item => item.name)}
                  onChange={this.handleTagsChange}
                />
              </Col>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

const FETCH_USERS = gql`
  query FetchUsers ($userId: ID){
    allUsers (filter:{ id: $userId }){
      id
      displayName
    }
  }
`

const DELETE_STORY = gql`
  mutation DeleteStory($id: ID!) {
    deleteStory(id: $id) {
      id
    }
  }
`

const FETCH_STORY = gql`
  query FetchStory($id: ID!) {
    Story(id: $id) {
      id
      createdAt
      updatedAt
      title
      story
      pictureURL
      status
      createdBy {
        id
        displayName
      }
      place {
        id
        placeName
        address
        locationLat
        locationLong
        keywords {
          id
          name
        }
      }
    }
  }
`

const UPDATE_STORY = gql`
  mutation UpdateStory(
    $id: ID!,
    $title: String!,
    $story: String!,
    $pictureURL: [String!],
    $status: StoryStatus!,
    $placeId: ID,
    $createdById: ID,
  ) {
    updateStory (
      id: $id
      title: $title
      story: $story
      pictureURL: $pictureURL
      hashtag: []
      status: $status
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
      address
      sourceId
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

const LOGGED_IN_USER_QUERY = gql`
  query LoggedInUserQuery {
    loggedInUser {
      id
    }
  }
`

const CREATE_KEYWORD = gql`
  mutation (
    $name: String!,
    $places: [ID!],
    $userId: ID!,
  ) {
    createKeyword (
      createdById: $userId
      name: $name
      placesIds: $places
    ) {
      id
    }
  }
`

const DELETE_KEYWORD = gql`
  mutation (
    $id: ID!
  ) {
    deleteKeyword (
      id: $id
    ) {
      id
    }
  }
`

const EditStoryScreen = compose(
  graphql(LOGGED_IN_USER_QUERY, {
    name: 'loggedInUserQuery',
    options: {
      fetchPolicy: 'network-only',
    }
  }),
  graphql(CREATE_PLACE, {
    name: 'createPlace',
  }),
  graphql(CHECK_PLACE, {
    name: 'checkPlace',
    options: (options) => ({
      variables: {
        sourceId: options.sourceId || '',
      }
    })
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
  graphql(FETCH_STORY, {
    name: 'fetchStory',
    options: ({ match }) => ({
      fetchPolicy: 'network-only',
      variables: {
        id: match.params.id,
      },
    }),
  }),
  graphql(UPDATE_STORY, {
    name: 'updateStory',
  }),
  graphql(DELETE_STORY, {
    name: 'deleteStory',
  }),
  graphql(CREATE_KEYWORD, {
    name: 'createKeyword',
  }),
  graphql(DELETE_KEYWORD, {
    name: 'deleteKeyword',
  }),
)(EditStory);

export default connect(null, { push })(EditStoryScreen);
