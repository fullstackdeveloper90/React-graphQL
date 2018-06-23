import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Divider, Table, Button, Icon, Modal } from 'antd';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import CampaignForm from './components/CampaignForm';
import { parseFormErrors } from '../shared/utils/form_errors';
import { parseError } from '../shared/utils/parse_errors';

import { conditionGroupsColumns, eventColumns } from '../shared/constants/campaignConstants';

class EditCampaign extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleSubmit(values) {
    const { match: { params }, updateCampaign, push } = this.props;
    return updateCampaign({ variables: { ...values, id: params.id } })
      .then(() => push('/campaigns'))
      .catch(parseFormErrors);
  }

  handleDelete() {
    const { match: { params }, deleteCampaign, push } = this.props;
    Modal.confirm({
      title: 'Are you sure delete?',
      content: 'Delete campaign can not be undone',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteCampaign({ variables: { id: params.id } })
          .then(() => push('/campaigns'))
          .catch(() => parseError('Failed to delete campaign'));
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  render() {
    const { fetchCampaign, fetchPlaces, fetchUsers, fetchEventTables, fetchConditionGroups, match: { params } } = this.props;

    if (fetchPlaces.loading || fetchCampaign.loading || fetchUsers.loading
      || fetchEventTables.loading || fetchConditionGroups.loading) {
      return <div className="loader-indicator" />;
    }

    const initialValues = {
      ...fetchCampaign.Campaign,
      partnerId: fetchCampaign.Campaign.partner && fetchCampaign.Campaign.partner.id,
      placeId: fetchCampaign.Campaign.defaultPlace && fetchCampaign.Campaign.defaultPlace.id,
    };

    const dataSourceEvent = fetchEventTables.allEventTables.map(eventTable =>
      ({ key: eventTable.id, ...eventTable }));

    const dataSourceConditionGroups = fetchConditionGroups.allConditionGroups.map(conditionGroup =>
      ({
        key: conditionGroup.id,
        title: conditionGroup.title,
        count: conditionGroup.conditions.length,
        children: conditionGroup.conditions.map((condition) => ({ key: condition.id, ...condition }))
      })
    )

    return (
      <div id="edit-campaign">
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/campaigns">Campaigns</Link></Breadcrumb.Item>
          <Breadcrumb.Item>Edit Campaign</Breadcrumb.Item>
        </Breadcrumb>

        <div className="container">
          <h3>Edit Campaign</h3>

          <CampaignForm
            initialValues={initialValues}
            places={fetchPlaces.allPlaces}
            users={fetchUsers.allUsers}
            feedNotificationImg={fetchCampaign.Campaign.feedNotificationImg}
            photoUrl={fetchCampaign.Campaign.photoUrl}
            onSubmit={this.handleSubmit}
            onDelete={this.handleDelete}
          />

          <Divider />

          <h4>
            Events Calendar
            <div className="is-right">
              <Button.Group size="small">
                <Button>
                  <Link to={`/campaigns/edit/${params.id}/event/new`}>
                    <Icon type="plus" />New Event
                  </Link>
                </Button>
                <Button>
                  Report<Icon type="down" />
                </Button>
              </Button.Group>
            </div>
          </h4>

          <Table
            columns={eventColumns(params.id)}
            dataSource={dataSourceEvent}
          />

          <Divider />

          <h4>
            Conditions
            <div className="is-right">
              <Button.Group size="small">
                <Button>
                  <Link to={`/campaigns/edit/${params.id}/conditiongroup/new`}>
                    <Icon type="plus" />New Condition Group
                  </Link>
                </Button>
                <Button>
                  Report<Icon type="down" />
                </Button>
              </Button.Group>
            </div>
          </h4>

          <Table
            columns={conditionGroupsColumns(params.id)}
            dataSource={dataSourceConditionGroups}
          />
        </div>
      </div>
    );
  }
}

const DELETE_CAMPAIGN = gql`
  mutation DeleteCampaign($id: ID!) {
    deleteCampaign(id: $id) {
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
const FETCH_CAMPAIGN = gql`
  query FetchCampaign($id: ID!) {
    Campaign(id: $id) {
      id
      createdAt
      name
      description
      active
      photoUrl
      partner {
        id
        displayName
      }
      defaultPlace {
        id
        placeName
      }
      pushNotificationActive
      pushNotificationMsg
      feedNotificationActive
      feedNotificationImg
      feedNotificationMsg
    }
  }
`

const FETCH_EVENT_TABLES = gql`
  query FetchEventTables($campaignId: ID) {
    allEventTables(filter: {
      campaign: {
        id: $campaignId
      }
    }) {
      id
      name
      fromDateTime
      toDateTime
      active
    }
  }
`

const FETCH_CONDITION_GROUPS = gql`
  query FetchConditionGroups($campaignId: ID) {
    allConditionGroups(filter: {
      campaign: {
        id: $campaignId
      }
    }) {
      id
      title
      conditions {
        id
        name
        notificationType
        pointReward
        active
        conditionGroup {
          id
        }
      }
    }
  }
`

const UPDATE_CAMPAIGN = gql`
  mutation UpdateCampaign(
    $id: ID!,
    $name: String!,
    $availableCities: [String!],
    $description: String,
    $defaultPlaceId: ID,
    $active: Boolean,
    $partnerId: ID,
    $pushNotificationActive: Boolean,
    $pushNotificationMsg: String,
    $feedNotificationActive: Boolean,
    $feedNotificationImg: String,
    $feedNotificationMsg: String,
    $photoUrl: String!,
  ) {
    updateCampaign (
      id: $id
      name: $name
      availableCities: $availableCities
      description: $description
      defaultPlaceId: $defaultPlaceId
      active: $active
      partnerId: $partnerId
      pushNotificationActive: $pushNotificationActive
      pushNotificationMsg: $pushNotificationMsg,
      feedNotificationActive: $feedNotificationActive,
      feedNotificationImg: $feedNotificationImg,
      feedNotificationMsg: $feedNotificationMsg,
      photoUrl: $photoUrl,
    ) {
      id
    }
  }
`

const EditCampaignScreen = compose(
  graphql(FETCH_PLACES, {
    name: 'fetchPlaces',
  }),
  graphql(FETCH_USERS, {
    name: 'fetchUsers',
  }),
  graphql(FETCH_CAMPAIGN, {
    name: 'fetchCampaign',
    options: ({ match }) => ({
      variables: {
        id: match.params.id,
      },
    }),
  }),
  graphql(FETCH_EVENT_TABLES, {
    name: 'fetchEventTables',
    options: ({ match }) => ({
      variables: {
        campaignId: match.params.id,
      },
    }),
  }),
  graphql(FETCH_CONDITION_GROUPS, {
    name: 'fetchConditionGroups',
    options: ({ match }) => ({
      variables: {
        campaignId: match.params.id,
      },
    }),
  }),
  graphql(UPDATE_CAMPAIGN, {
    name: 'updateCampaign',
  }),
  graphql(DELETE_CAMPAIGN, {
    name: 'deleteCampaign',
  })
)(EditCampaign);

export default connect(null, { push })(EditCampaignScreen);
