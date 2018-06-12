import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import ConditionGroupForm from './components/ConditionGroupForm';
import { parseFormErrors } from '../shared/utils/form_errors';

class NewConditionGroup extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(values) {
    const { createConditionGroup, push, match: { params } } = this.props;
    return createConditionGroup({ variables: { ...values, type: "CHECK_IN", campaignId: params.id } })
      .then(() => push(`/campaigns/edit/${params.id}`))
      .catch(parseFormErrors);
  }

  render() {
    const { match: { params }, fetchConditions } = this.props;
    if (fetchConditions.loading) {
      return <div className="loader-indicator" />;
    }

    return (
      <div id="new-condition">
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/campaigns">Campaigns</Link></Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/campaigns/edit/${params.id || 1}`}>Edit Campaign</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>New Condition Group</Breadcrumb.Item>
        </Breadcrumb>

        <div className="container">
          <h3>New Condition Group</h3>

          <ConditionGroupForm
            onSubmit={this.handleSubmit}
          />
        </div>
      </div>
    );
  }
}


const FETCH_CONDITIONS = gql`
  query FetchConditions {
    allConditions {
      id
      name
      notificationType
      pointReward
      active
    }
  }
`

const CREATE_CONDITION_GROUP = gql`
  mutation createConditionGroup(
    $title: String!,
    $conditions: [ConditionGroupconditionsCondition!],
    $locationLat: Float,
    $locationLong: Float,
    $campaignId: ID,
  ) {
    createConditionGroup(
      title: $title
      conditions: $conditions
      locationLat: $locationLat
      locationLong: $locationLong
      campaignId: $campaignId
    ) {
      id
    }
  }
`

const NewConditionGroupScreen = compose(
  graphql(CREATE_CONDITION_GROUP, {
    name: 'createConditionGroup',
  }),
  graphql(FETCH_CONDITIONS, {
    name: 'fetchConditions',
    options: {
      fetchPolicy: 'network-only',
    }
  }),
)(NewConditionGroup);

export default connect(null, { push })(NewConditionGroupScreen);
