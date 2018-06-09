import React, { Component } from 'react';
import { Breadcrumb, Table, Button, Icon } from 'antd';
import { Link } from 'react-router-dom';

import { campaignColumns } from '../shared/constants/campaignConstants';

class Campaigns extends Component {
  componentDidMount() {
    this.updateUserSubscription = this.props.fetchCampaigns.subscribeToMore({
      document: gql`
        subscription {
          Campaign(filter: {
            mutation_in: [CREATED, UPDATED, DELETED]
          }) {
            mutation
            node {
              id
              createdAt
              name
              description
              active
              defaultPlace {
                id
                placeName
              }
              pushNotificationActive
            }
            previousValues {
              id
            }
          }
        }
      `,
      updateQuery: (previousState, { subscriptionData }) => {
        const { node, mutation, previousValues } = subscriptionData.data.Campaign;
        switch (mutation) {
          case 'CREATED': {
            return { allCampaigns: previousState.allCampaigns.concat(node) };
          }
          case 'UPDATED': {
            return {
              allCampaigns: previousState.allCampaigns
                .map(campaign => campaign.id == node.id ? node : campaign)
            };
          }
          default:
            return previousState;
        }
      },
      onError: (err) => console.error(err),
    });
  }

  render() {
    const { fetchCampaigns: { loading, allCampaigns } } = this.props;
    if (loading) {
      return <div className="loader-indicator" />;
    }

    const dataSource = allCampaigns.map(campaign => ({ ...campaign, key: campaign.id }));
    
    return (
      <div id="campaign">
        <Breadcrumb>
          <Breadcrumb.Item>Campaigns</Breadcrumb.Item>
        </Breadcrumb>

        <div className="container">
          <h4>
            Manage Campaigns
            <div className="is-right">
              <Button.Group size="small">
                <Button>
                  <Link to="/campaigns/new"><Icon type="plus" />New Campaign</Link>
                </Button>
                <Button>
                  Report<Icon type="down" />
                </Button>
              </Button.Group>
            </div>
          </h4>

          <Table
            columns={campaignColumns}
            dataSource={dataSource}
            expandedRowRender={record => <p className="no-margin">{record.description}</p>}
          />
        </div>
      </div>
    )
  }
}

const CampaignsScreen = graphql(FETCH_CAMPAIGNS, {
  name: 'fetchCampaigns',
  options: {
    fetchPolicy: 'network-only',
  },
})(Campaigns);

export default CampaignsScreen;
