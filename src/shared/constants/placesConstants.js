import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { PlACE_STATUS, PLACE_SOURCE } from './constants';

export const placeColumns = [{
  title: 'Place Name',
  dataIndex: 'placeName',
  sorter: (a, b) => a.placeName.toLowerCase().localeCompare(b.placeName.toLowerCase()),
  render: (value, record) => <Link to={`/places/edit/${record.key}`}>{record.placeName}</Link>,
}, {
  title: 'Status',
  dataIndex: 'status',
  filters: PlACE_STATUS.map(({ label, value }) => ({ text: label, value })),
  filterMultiple: false,
  onFilter: (value, record) => record.status.indexOf(value) === 0,
}, {
  title: 'Created Date',
  dataIndex: 'createdAt',
  sorter: (a, b) => a.createdAt.toLowerCase().localeCompare(b.createdAt.toLowerCase()),
  render: (value) => value && moment(value).format('L HH:mm'),
}, {
  title: 'Created By',
  dataIndex: 'createdBy',
  sorter: (a, b) => a.createdBy.username.toLowerCase().localeCompare(b.createdBy.username.toLowerCase()),
  render: (value, record) => record && record.createdBy.username,
}, {
  title: 'City',
  dataIndex: 'addressCityTown',
  sorter: (a, b) => (a.addressCityTown || '').toLowerCase().localeCompare((b.addressCityTown || '').toLowerCase()),
}, {
  title: 'Country',
  dataIndex: 'addressCountry',
  sorter: (a, b) => (a.addressCountry || '').toLowerCase().localeCompare((b.addressCountry || '').toLowerCase()),
}, {
  title: 'Source',
  dataIndex: 'source',
  filters: PLACE_SOURCE.map(({ label, value }) => ({ text: label, value })),
  onFilter: (value, record) => record.source.indexOf(value) === 0,
}];
