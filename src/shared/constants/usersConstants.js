import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { USER_GROUP, ONLINE_STATUS } from './constants';

export const usersColumns = (userType) => [{
  title: 'Display Name',
  dataIndex: 'displayName',
  sorter: (a, b) => a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()),
  render: (value, record) =>
    <Link to={`/users/${userType}/edit/${record.id}`}>
      {record.displayName || record.email}
    </Link>,
}, {
  title: 'Status',
  dataIndex: 'onlineStatus',
  filters: ONLINE_STATUS.map(({ label, value }) => ({ text: label, value })),
  filterMultiple: false,
  onFilter: (value, record) => record.onlineStatus.indexOf(value) === 0,
}, {
  title: 'Last Login',
  dataIndex: 'lastSeen',
  render: (value) => value ? moment(value).format('L') : 'No logined',
}, {
  title: 'User Name',
  dataIndex: 'username',
  sorter: (a, b) => a.username.toLowerCase().localeCompare(b.username.toLowerCase()),
  render: (value) => value ? value : 'No User Name',
}, {
  title: 'City',
  dataIndex: 'city',
  sorter: (a, b) => (a.city || '').toLowerCase().localeCompare((b.city || '').toLowerCase()),
}, {
  title: 'Country',
  dataIndex: 'country',
  sorter: (a, b) => (a.country || '').toLowerCase().localeCompare((b.country || '').toLowerCase()),
}, {
  title: 'Role',
  dataIndex: 'group',
  filters: USER_GROUP.map(({ label, value }) => ({ text: label, value })),
  onFilter: (value, record) => record.group.indexOf(value) === 0,
  render: (value) => {
    const user = USER_GROUP.find(group => group.value == value);
    return user ? user.label : 'No User Group';
  },
}];
