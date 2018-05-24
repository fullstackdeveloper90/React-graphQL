import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

export const eventColumns = (campaignId) => [{
  title: 'From DateTime',
  dataIndex: 'dateTime',
  sorter: (a, b) => a.dateTime.toLowerCase().localeCompare(b.dateTime.toLowerCase()),
  render: (value, record) => `${moment(record.fromDateTime).format('L HH:mm')} - ${moment(record.toDateTime).format('L HH:mm')}`
}, {
  title: 'Event Name',
  dataIndex: 'name',
  sorter: (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  render: (value, record) => <Link to={`/campaigns/edit/${campaignId}/event/edit/${record.key}`}>{record.name}</Link>,
}, {
  title: 'City',
  dataIndex: 'city',
  sorter: (a, b) => (a.city || '').toLowerCase().localeCompare((b.city || '').toLowerCase()),
}, {
  title: 'Active',
  dataIndex: 'active',
  render: (value, record) => <span>{record.active ? 'Yes' : 'No'}</span>
}];

export const conditionGroupsColumns = (campaignId) => [{
    title: 'Condition/Group',
    dataIndex: 'name',
    sorter: (a, b) => (a.name || a.title).toLowerCase().localeCompare((b.name || b.title).toLowerCase()),
    render: (text, record) => {
      return record.title ?
        <Link to={`/campaigns/edit/${campaignId}/conditiongroup/edit/${record.key}`}>{record.title}</Link>
        :
        <Link to={`/campaigns/edit/${campaignId}/conditiongroup/edit/${record.conditionGroup.id}/condition/edit/${record.key}`}>{record.name}</Link>
    }
  }, {
    title: 'Notification',
    dataIndex: 'notificationType',
  }, {
    title: 'Point',
    dataIndex: 'pointReward',
  }, {
    title: 'Active',
    dataIndex: 'active',
    render: (text, record) => <span>{record.active ? 'Yes' : 'No'}</span>,
    filters: [{ text: 'Yes', value: true }, { text: 'No', value: false }],
    filterMultiple: false,
    onFilter: (value, record) => (record.active ? 'yes' : 'no') == value,
  }, {
    title: 'Actions',
    dataIndex: 'actions',
    render: (text, record) => {
      return record.title && <Link to={`/campaigns/edit/${campaignId}/conditiongroup/edit/${record.key}/condition/new`}>New Condition</Link>
    }
  }
];

// export const conditionColumns = (campaignId) => [{
//   title: 'Condition Name',
//   dataIndex: 'name',
//   render: (text, record) =>
//     <Link to={`/campaigns/edit/${campaignId}/condition/edit/${record.key}`}>{record.name}</Link>,
// }, {
//   title: 'Notification',
//   dataIndex: 'notificationType',
//   sorter: (a, b) => a.notificationType.length - b.notificationType.length,
// }, {
//   title: 'Point',
//   dataIndex: 'pointReward',
// }, {
//   title: 'Active',
//   dataIndex: 'active',
//   render: (text, record) => <span>{record.active ? 'Yes' : 'No'}</span>
// }];

export const campaignColumns = [{
  title: 'Campaign Name',
  dataIndex: 'name',
  sorter: (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  render: (campaign, record) => <Link to={`/campaigns/edit/${record.key}`}>{record.name}</Link>,
}, {
  title: 'Created At',
  dataIndex: 'createdAt',
  sorter: (a, b) => a.createdAt.toLowerCase().localeCompare(b.createdAt.toLowerCase()),
  render: (value) => value && moment(value).format('L HH:mm'),
}, {
  title: 'Place',
  dataIndex: 'placeName',
  sorter: (a, b) => (a.place || '').toLowerCase().localeCompare((b.place || '').toLowerCase()),
  render: (place) => place ? place.defaultPlace.placeName : 'Not place',
}, {
  title: 'Active',
  dataIndex: 'active',
  render: (active) => active ? 'Yes' : 'No',
  filters: [{ text: 'Yes', value: true }, { text: 'No', value: false }],
  filterMultiple: false,
  onFilter: (value, record) => (record.active ? 'yes' : 'no') == value,
}, {
  title: 'Push Notification',
  dataIndex: 'pushNotificationActive',
  render: (pushNotificationActive) => pushNotificationActive ? 'Yes' : 'No',
  filters: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }],
  filterMultiple: false,
  onFilter: (value, record) => (record.pushNotificationActive  ? 'yes' : 'no') == value,
}];
