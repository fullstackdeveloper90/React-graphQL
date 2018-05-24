import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

export const collectionColumns = [{
  title: 'Collection Name',
  key: 'collectionName',
  sorter: (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  render: (record) => <Link to={`/collections/edit/${record.id}`}>{record.name}</Link>
}, {
  title: 'User',
  key: 'user',
  sorter: (a, b) => (a.user.displayName || '').toLowerCase().localeCompare((b.user.displayName || '').toLowerCase()),
  render: (record) => record.user &&
    <Link to={`/users/user/edit/${record.user.id}`} key={record.user.id}>
      {record.user.displayName}
    </Link>
}, {
  title: 'Privacy',
  dataIndex: 'privacy',
  render: (privacy) => privacy ?
    <p><span style={{
      fontSize: 22,
      color: 'GreenYellow',
      paddingRight: 5
    }}>•</span>Public</p>
    :
    <p><span style={{
      fontSize: 22,
      color: 'orange',
      paddingRight: 5
    }}>•</span>Private</p>
}, {
  title: 'Modified Date',
  dataIndex: 'updatedAt',
  sorter: (a, b) => a.updatedAt.toLowerCase().localeCompare(b.updatedAt.toLowerCase()),
  render: (value) => value && moment(value).format('L HH:mm'),
}, {
  title: 'Created By',
  key: 'createdBy',
  sorter: (a, b) => (a.user && a.user.createdBy && a.user.createdBy.username || '').toLowerCase()
    .localeCompare((b.user && b.user.createdBy && b.user.createdBy.username || '').toLowerCase()),
  render: (record) => record.user ? record.user.createdBy &&
    <Link to={`/users/admin/${record.user.createdBy.id}`} key={record.user.createdBy.id}>
      {record.user.createdBy.username}
    </Link> : ''
}];

export const collectionPlacesColumns = [{
  title: 'Place name',
  key: 'placeName',
  sorter: (a, b) => a.placeName.toLowerCase().localeCompare(b.placeName.toLowerCase()),
  render: (record) => <Link to={`/places/edit/${record.id}`}>{record.placeName}</Link>
}, {
  title: 'Action',
  key: 'action',
  render: (record) => <a onClick={()=>{ record.onDelete(record.id) }}>Remove</a>
}];
