import React from 'react';
import { Form, Button, Row, Col, Alert } from 'antd';
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router-dom';
import { renderSelect } from '../../shared/utils/form_components';

const FormItem = Form.Item;

const AddPlaceToCollectionForm = ({ handleSubmit, error, places, submitting }) => {

  const placeOptions = places ? places.map(({ id, placeName }) => ({ value: id, label: placeName })) : [];

  return (
    <Form layout="vertical" onSubmit={handleSubmit(this.onSubmit)}>
      <Row>
        <div className="is-right">
          <FormItem>
            <Button style={{ marginRight: 5 }}>
              <Link to="/collections">Cancel</Link>
            </Button>
            <Button loading={submitting} type="primary" htmlType="submit">Save</Button>
          </FormItem>
        </div>
      </Row>

      {error && <Row><FormItem><Alert message={error} type="error" closable /></FormItem></Row>}

      <Row gutter={32}>
        <Col span={12}>

          <FormItem>
            <Col span={8} className="ant-form-item-label">
              <label>Add place</label>
            </Col>
            <Col span={16}>
              <Field
                name="placeId"
                component={renderSelect}
                placeholder="Select Place"
                options={placeOptions}
              />
            </Col>
          </FormItem>
        </Col>
      </Row>
    </Form>
  )
}

export default reduxForm({ form: 'addPlaceToCollectionForm' })(AddPlaceToCollectionForm);
