import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Button, Row, Col, Alert } from 'antd';
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router-dom';
import { renderSelect } from '../../shared/utils/form_components';
import { required } from '../../shared/utils/form_validations';

const FormItem = Form.Item;

class FeedForm extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(values) {
    return this.props.onSubmit({ ...values, isSuggest: true });
  }

  render() {
    const { handleSubmit, error, submitting, onDelete, users } = this.props;

    const userOptions = users.map(({ id, displayName }) => ({ value: id, label: displayName }));

    return (
      <Form onSubmit={handleSubmit(this.onSubmit)}>
        <Row>
          <div className="is-right">
            <FormItem>
              <Button style={{ marginRight: 5 }}>
                <Link to="/feed">Cancel</Link>
              </Button>
              {onDelete &&
                <Button type="danger" ghost onClick={onDelete} style={{ marginRight: 5 }}>
                  Delete
                </Button>
              }
              <Button loading={submitting} type="primary" htmlType="submit">Save</Button>
            </FormItem>
          </div>
        </Row>

        {error && <Row><FormItem><Alert message={error} type="error" closable /></FormItem></Row>}

        <Row gutter={32}>
          <Col span={8}>
            <Field
              name="id"
              label="User Name"
              component={renderSelect}
              placeholder="Select User Name"
              options={userOptions}
              validate={required}
            />
          </Col>
        </Row>
      </Form>
    )
  }
}

const Feed = reduxForm({ form: 'feedForm' })(FeedForm);

export default connect(null)(Feed);
