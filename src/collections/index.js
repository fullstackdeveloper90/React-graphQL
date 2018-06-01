import React, { Component } from 'react';
import { Breadcrumb, Table, Button, Icon } from 'antd';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { collectionColumns } from '../shared/constants/collectionConstants';

class Collections extends Component {
  render() {
    const { fetchCollections: { loading, allCollections } } = this.props;
    if (loading) {
      return <div className="loader-indicator" />;
    }

    const dataSource = allCollections.map(collection => ({ ...collection, key: collection.id }));

    return (
      <div id="campaign">
        <Breadcrumb>
          <Breadcrumb.Item>Collections</Breadcrumb.Item>
        </Breadcrumb>

        <div className="container">
          <h4>
            Manage Collections
            <div className="is-right">
              <Button.Group size="small">
                <Button>
                  <Link to="/collections/new"><Icon type="plus" />New Collection</Link>
                </Button>
                <Button>
                  Report<Icon type="down" />
                </Button>
              </Button.Group>
            </div>
          </h4>

          <Table
            columns={collectionColumns}
            dataSource={dataSource}
            expandedRowRender={record => <p className="no-margin">{record.places.length} Places</p>}
          />
        </div>
      </div>
    )
  }
}

const FETCH_COLLECTIONS = gql`
  query FetchCollections ($userId: ID, $search: String) {
    allCollections (filter: {
      AND: [
        { user: { id: $userId } },
        { name: $search },
      ]
    }) {
      id
      name
      updatedAt
      privacy
      user {
        id
        displayName
        createdBy {
          id
          username
        }
      }
      places {
        id
      }
    }
  }
`

const CollectionsScreen = graphql(FETCH_COLLECTIONS, {
  name: 'fetchCollections',
  options: ({ user, search }) => {
    let variables = {};
    if (!user.group.includes('ADMIN')) {
      variables = { userId: user.id };
    }
    if (search) {
      variables = { ...variables, search };
    }
    return { variables };
  }
})(Collections);

export default CollectionsScreen;
