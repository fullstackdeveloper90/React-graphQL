import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import ConditionGroupForm from './components/ConditionGroupForm';
import { parseFormErrors } from '../shared/utils/form_errors';
import { parseError } from '../shared/utils/parse_errors';

class EditConditionGroup extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleSubmit(values) {
    const { match: { params }, updateConditionGroup, push } = this.props;
    return updateConditionGroup({ variables: { ...values, id: params.conditionGroupId } })
      .then(() => push(`/campaigns/edit/${params.id}`))
      .catch(parseFormErrors);
  }

  handleDelete() {
    const { match: { params }, deleteConditionGroup, push } = this.props;
    deleteConditionGroup({ variables: { id: params.conditionGroupId } })
      .then(() => push(`/campaigns/edit/${params.id}`))
      .catch(() => parseError('Failed to delete condition group'));
  }

  render() {
    const { match: { params }, fetchConditionGroup } = this.props;

    if (fetchConditionGroup.loading) {
      return <div className="loader-indicator" />;
    }

    const initialValues = {
      ...fetchConditionGroup.ConditionGroup,
    };
    // places: fetchCondition.Condition.places.map(place => ({ placeId: place.place.id, event: place.event, distance: place.distance })),
    // dates: fetchCondition.Condition.dates.map(({ fromDateTime, toDateTime }) => ({ fromDateTime, toDateTime })),

    return (
      <div id="edit-condition">
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/campaigns">Campaigns</Link></Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/campaigns/edit/${params.id || 1}`}>Edit Campaign</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Edit Condition</Breadcrumb.Item>
        </Breadcrumb>

        <div className="container">
          <h3>Edit Condition</h3>

          <ConditionGroupForm
            initialValues={initialValues}
            onSubmit={this.handleSubmit}
            onDelete={this.handleDelete}
          />
        </div>
      </div>
    );
  }
}


const FETCH_CONDITION_GROUP = gql`
  query FetchConditionGroup($id: ID!) {
    ConditionGroup(id: $id) {
      id
      title
      locationLat
      locationLong
      iconUrl
      conditions {
        id
        name
      }
    }
  }
`

const UPDATE_CONDITION_GROUP = gql`
  mutation UpdateConditionGroup(
    $id: ID!,
    $title: String!,
    $locationLat: Float,
    $locationLong: Float,
    $iconUrl: String
  ) {
    updateConditionGroup (
      id: $id
      title: $title
      locationLat: $locationLat,
      locationLong: $locationLong,
      iconUrl: $iconUrl,
    ) {
      id
    }
  }
`

const DELETE_CONDITION_GROUP = gql`
  mutation DeleteConditionGroup($id: ID!) {
    deleteConditionGroup(id: $id) {
      id
    }
  }
`

const EditConditionGroupScreen = compose(
  graphql(FETCH_CONDITION_GROUP, {
    name: 'fetchConditionGroup',
    options: ({ match }) => ({
      fetchPolicy: 'network-only',
      variables: {
        id: match.params.conditionGroupId,
      },
    }),
  }),
  graphql(UPDATE_CONDITION_GROUP, {
    name: 'updateConditionGroup',
    options: ({ match }) => ({
      variables: {
        id: match.params.conditionGroupId,
      },
    }),
  }),
  graphql(DELETE_CONDITION_GROUP, {
    name: 'deleteConditionGroup',
    options: ({ match }) => ({
      variables: {
        id: match.params.conditionGroupId,
      },
    })
  })
)(EditConditionGroup);

export default connect(null, { push })(EditConditionGroupScreen);
