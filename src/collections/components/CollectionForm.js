import React, { Component } from 'react';
import { Form, Button, Row, Col, Alert } from 'antd';
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router-dom';
import {
  renderInput,
  renderSelect,
  renderSwitch,
} from '../../shared/utils/form_components';
import { required } from '../../shared/utils/form_validations';

import CloudinaryFileUpload from '../../shared/components/CloudinaryFileUpload';

const FormItem = Form.Item;

class CollectionForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pictureURL: props.pictureURL || '',
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.handleUploadWidget = this.handleUploadWidget.bind(this);
  }

  handleUploadWidget(fieldName) {
    window.cloudinary.openUploadWidget(
      { cloud_name: 'onemap-co', upload_preset: 'bztfvbid', tags: ['xmas'] },
      (err, result) => {
        if (err) {
          console.error(err.message);
        } else if (result) {
          this.setState({ [fieldName]: result[0].secure_url });
        }
      }
    );
  }

  onSubmit(values) {
    const { pictureURL } = this.state;
    return this.props.onSubmit({ ...values, pictureURL });
  }

  render() {
    const { handleSubmit, error, users, submitting, onDelete } = this.props;

    const userOptions = users ? users.map(({ id, displayName }) => ({ value: id, label: displayName })) : [];

    return (
      <Form layout="vertical" onSubmit={handleSubmit(this.onSubmit)}>
        <Row>
          <div className="is-right">
            <FormItem>
              <Button style={{ marginRight: 5 }}>
                <Link to="/collections">Cancel</Link>
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
          <Col span={12}>
            <FormItem>
              <Col span={8} className="ant-form-item-label">
                <label>Collection Name</label>
              </Col>
              <Col span={10}>
                <Field
                  name="name"
                  component={renderInput}
                  placeholder="Collection Name"
                  validate={required}
                />
              </Col>
            </FormItem>

            <FormItem>
              <Col span={8} className="ant-form-item-label">
                <label>Private/Public</label>
              </Col>

              <Col span={6} className="custom-switch">
                <Field
                  name="privacy"
                  component={renderSwitch}
                />
              </Col>
            </FormItem>

            <FormItem>
              <Col span={8} className="ant-form-item-label">
                <label>User</label>
              </Col>
              <Col span={16}>
                <Field
                  name="userId"
                  component={renderSelect}
                  placeholder="Select User Name"
                  options={userOptions}
                />
              </Col>
            </FormItem>

            <FormItem>
              <Col span={8} className="ant-form-item-label">
                <label>Photo</label>
              </Col>
              <Col span={16}>
                <CloudinaryFileUpload
                  file={this.state.pictureURL}
                  onUpload={() => this.handleUploadWidget('pictureURL')}
                  onDelete={() => this.setState({ pictureURL: '' })}
                />
              </Col>
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

export default reduxForm({ form: 'collectionForm' })(CollectionForm);
