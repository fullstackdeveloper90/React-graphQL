import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { STORY_STATUS } from './constants';

export const storiesColumns = [{
  title: 'Story Title',
  dataIndex: 'title',
  sorter: (a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
  render: (value, record) => <Link to={`/stories/edit/${record.key}`}>{record.title}</Link>,
}, {
  title: 'Place Name',
  dataIndex: 'placeName',
  sorter: (a, b) => a.place.placeName.toLowerCase().localeCompare(b.place.placeName.toLowerCase()),
  render: (value, record) =>
    record.place &&
    <Link to={`/places/edit/${record.place.id}`}>{record.place.placeName}</Link>,
}, {
  title: 'Created By',
  dataIndex: 'createdBy',
  sorter: (a, b) => a.createdBy.username.toLowerCase().localeCompare(b.createdBy.username.toLowerCase()),
  render: (value, record) => record.createdBy && record.createdBy.username
}, {
  title: 'Display Name',
  dataIndex: 'displayName',
  sorter: (a, b) => a.createdBy.displayName.toLowerCase().localeCompare(b.createdBy.displayName.toLowerCase()),
  render: (value, record) =>
    record.createdBy &&
    <Link to={`/users/admin/edit/${record.createdBy.id}`}>
      {record.createdBy.displayName}
    </Link>,
}, {
  title: 'Status',
  dataIndex: 'status',
  filters: STORY_STATUS.map(({ value, label }) => ({ text: label, value })),
  filterMultiple: false,
  onFilter: (value, record) => record.status.indexOf(value) === 0,
}, {
  title: 'Modified Date',
  dataIndex: 'updatedAt',
  sorter: (a, b) => a.updatedAt.toLowerCase().localeCompare(b.updatedAt.toLowerCase()),
  render: (value) => value && moment(value).format('L HH:mm'),
}];
