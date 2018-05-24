import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { Layout } from 'antd';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import Sidebar from './Sidebar';
import Header from './Header';
import PlacesScreen from '../../places';
import NewPlaceScreen from '../../places/NewPlace';
import EditPlaceScreen from '../../places/EditPlace';
import UsersScreen from '../../users';
import NewUserScreen from '../../users/NewUser';
import EditUserScreen from '../../users/EditUser';
import StoriesScreen from '../../stories';
import NewStoryScreen from '../../stories/NewStory';
import EditStoryScreen from '../../stories/EditStory';
import CampaignsScreen from '../../campaigns';
import NewCampaignScreen from '../../campaigns/NewCampaign';
import EditCampaignScreen from '../../campaigns/EditCampaign';
import NewEventScreen from '../../campaigns/NewEvent';
import EditEventScreen from '../../campaigns/EditEvent';

import CollectionsScreen from '../../collections';
import NewCollectionScreen from '../../collections/NewCollection';
import EditCollectionScreen from '../../collections/EditCollection';
import EditCollectionAddPlaceScreen from '../../collections/EditCollectionAddPlace';

import FeedScreen from '../../feed';
import NewFeedScreen from '../../feed/NewFeed';

import NewConditionGroupScreen from '../../campaigns/NewConditionGroup';
import EditConditionGroupScreen from '../../campaigns/EditConditionGroup';

import NewConditionScreen from '../../campaigns/NewCondition';
import EditConditionScreen from '../../campaigns/EditCondition';

const { Content } = Layout;

const RouteWithData = ({ component: Component, user, search, ...rest }) => (
  <Route exact {...rest} render={props => (<Component user={user} search={search} {...props} />)} />
)

class MainLayout extends Component {
  constructor(props) {
    super(props);

    this.state = { search: null };
  }

  componentDidMount() {
    this.updateUserSubscription = this.props.fetchUser.subscribeToMore({
      document: gql`
        subscription {
          User(filter: {
            mutation_in: [UPDATED]
          }) {
            mutation
            node {
              id
              displayName
              email
            }
          }
        }
      `,
      updateQuery: (previousState, { subscriptionData }) => {
        const user = subscriptionData.data.User.node;
        if (previousState.User.id == user.id) {
          return { User: user };
        }
        return previousState;
      },
      onError: (err) => console.error(err),
    });
  }

  render() {
    const { loggedInUserQuery, fetchUser } = this.props;

    if (loggedInUserQuery.loading || fetchUser.loading) return null;

    return (
      <Layout className="main-layout">
        <Sidebar user={fetchUser.User} />
        <Layout>
          <Header user={fetchUser.User} onSearch={(value) => this.setState({ search: value })} />
          <Content>
            <Route exact path="/dashboard" component={UsersScreen} />
            <RouteWithData exact path="/users/:type(admin|user|partner|official)" component={UsersScreen} search={this.state.search} />
            <RouteWithData exact path="/users/:type(admin|user|partner|official)/new" component={NewUserScreen} search={this.state.search} />
            <RouteWithData exact path="/users/:type(admin|user|partner|official)/edit/:id" component={EditUserScreen} search={this.state.search} />
            <RouteWithData exact path="/places" component={PlacesScreen} user={fetchUser.User} search={this.state.search} />
            <Route exact path="/places/new" component={NewPlaceScreen} />
            <Route exact path="/places/edit/:id" component={EditPlaceScreen} />
            <RouteWithData path="/stories" component={StoriesScreen} user={fetchUser.User} search={this.state.search} />
            <RouteWithData exact path="/stories/new" component={NewStoryScreen} user={fetchUser.User} />
            <RouteWithData exact path="/stories/edit/:id" component={EditStoryScreen} user={fetchUser.User} />
            <Route exact path="/campaigns" component={CampaignsScreen} />
            <Route exact path="/campaigns/new" component={NewCampaignScreen} />
            <Route exact path="/campaigns/edit/:id" component={EditCampaignScreen} />
            <Route exact path="/campaigns/edit/:id/event/new" component={NewEventScreen} />
            <Route exact path="/campaigns/edit/:id/event/edit/:eventId" component={EditEventScreen} />

            <RouteWithData exact path="/collections" component={CollectionsScreen} user={fetchUser.User} search={this.state.search} />
            <Route exact path="/collections/new" component={NewCollectionScreen} />
            <Route exact path="/collections/edit/:id" component={EditCollectionScreen} />
            <Route exact path="/collections/edit/:id/add" component={EditCollectionAddPlaceScreen} />

            <RouteWithData exact path="/feed/suggest" component={FeedScreen} search={this.state.search} />
            <Route exact path="/feed/suggest/new" component={NewFeedScreen} />

            <Route exact path="/campaigns/edit/:id/conditiongroup/new" component={NewConditionGroupScreen} />
            <Route exact path="/campaigns/edit/:id/conditiongroup/edit/:conditionGroupId" component={EditConditionGroupScreen} />

            <Route exact path="/campaigns/edit/:id/conditiongroup/edit/:conditionGroupId/condition/new" component={NewConditionScreen} />
            <Route exact path="/campaigns/edit/:id/conditiongroup/edit/:conditionGroupId/condition/edit/:conditionId" component={EditConditionScreen} />
          </Content>
        </Layout>
      </Layout>
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

const FETCH_USER = gql`
  query FetchUser($id: ID!) {
    User(id: $id) {
      id
      displayName
      email
      group
    }
  }
`

const MainLayoutComponent = compose(
  graphql(LOGGED_IN_USER_QUERY, {
    name: 'loggedInUserQuery',
    options: {
      fetchPolicy: 'network-only',
    }
  }),
  graphql(FETCH_USER, {
    name: 'fetchUser',
    options: (props) => ({
      variables: {
        id: props.loggedInUserQuery.loggedInUser.id,
      },
    })
  }),
)(MainLayout);

export default MainLayoutComponent;
