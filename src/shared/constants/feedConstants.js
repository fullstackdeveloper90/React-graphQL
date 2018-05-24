import React from 'react';
import { Link } from 'react-router-dom';

export const feedColumns = [{
    title: 'Display Name',
    dataIndex: 'displayName',
    sorter: (a, b) => a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()),
    render: (value, record) => <Link to={`/users/user/edit/${record.key}`}>{record.displayName}</Link>
  }, {
    title: 'First Name',
    dataIndex: 'firstName',
    sorter: (a, b) => (a.firstName || '').toLowerCase().localeCompare((b.firstName || '').toLowerCase()),
  }, {
    title: 'Last Name',
    dataIndex: 'lastName',
    sorter: (a, b) => (a.lastName || '').toLowerCase().localeCompare((b.lastName || '').toLowerCase()),
  }, {
    title: 'Action',
    key: 'action',
    render: (value, record) => <a onClick={()=>{ record.onDelete(record.id) }}>Remove</a>
  }
];
