import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Button, Row, Col, Alert } from 'antd';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import moment from 'moment';
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps";
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import Places from 'google-places-browser/places';
import {
  renderInput,
  renderSelect,
  renderLabel,
  renderTextarea,
  renderPlacesAutocomplete,
} from '../../shared/utils/form_components';
import { required } from '../../shared/utils/form_validations';
import { PLACE_SOURCE, ENABLED } from '../../shared/constants/constants';
import CloudinaryFilesUpload from '../../shared/components/CloudinaryFilesUpload';
import { parseError } from '../../shared/utils/parse_errors';

const googlePlaces = Places(window.google);

const ADDRESS_FIELDS = [
  'addressStreet', 'addressCityTown', 'addressAreaDistrict', 
  'addressStateProvince', 'addressCountry', 'addressPostalCode',
];

const FormItem = Form.Item;

const PlaceMap = compose(
  withGoogleMap,
)(({ input: { onChange, value }, isMarkerShown, coordinate }) => (
  <GoogleMap
    defaultZoom={4}
    defaultCenter={{ lat: coordinate.lat || -34.397, lng: coordinate.long || 150.6449 }}
    center={{ lat: coordinate.lat || -34.397, lng: coordinate.long || 150.6449 }}
    zoom={!coordinate.lat ? 4 : 14}
  >
    {isMarkerShown &&
      <Marker position={{ lat: coordinate.lat || -34, lng: coordinate.long || 150 }} />}
  </GoogleMap>
));

class PlaceForm extends Component {
  constructor(props) {
    super(props);

    this.state = { files: props.pictureURL || [] };

    this.handleUploadWidget = this.handleUploadWidget.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.geoCoding = this.geoCoding.bind(this);
    this.handleDeletePicture = this.handleDeletePicture.bind(this);
  }

  handleDeletePicture(pictureFile) {
    const files = this.state.files.filter(file => file != pictureFile);
    this.setState({ files });
  }

  handleUploadWidget() {
    window.cloudinary.openUploadWidget(
      { cloud_name: 'onemap-co', upload_preset: 'bztfvbid', tags: ['xmas'] },
      (err, result) => {
        if (result) {
          const files = result.map(res => res.secure_url).concat(this.state.files);
          this.setState({ files });
        }
      }
    );
  }

  geoCoding() {
    const { change, reset, pick_sourceId } = this.props;

    reset();

    change('placeName', pick_sourceId);

    geocodeByAddress(pick_sourceId)
      .then(results => {
        const result = results[0];

        change('sourceId', result.place_id);
        change('address', result.formatted_address);

        ADDRESS_FIELDS.forEach((field, idx) => {
          if (result.address_components[idx]) {
            change(field, result.address_components[idx].long_name);
          }
        });

        googlePlaces.details({ placeId: result.place_id }, (err, place) => {
          if (!err) {
            const photos = place.photos ? place.photos.map(photo => photo.getUrl({ maxWidth: 1920 })) : null;
            this.setState({ files: photos });
          } else {
            parseError(err);
          }
        });
        return getLatLng(result);
      })
      .then(latLng => {
        change('locationLat', latLng.lat);
        change('locationLong', latLng.lng);
      })
      .catch(parseError);
  }

  onSubmit(values) {
    return this.props.onSubmit({ ...values, pictureURL: this.state.files });
  }

  render() {
    const { handleSubmit, error, submitting, createdAt, lat, long, onDelete } = this.props;

    return (
      <Form onSubmit={handleSubmit(this.onSubmit)}>
        <Row>
          <div className="is-right">
            <FormItem>
              <Button style={{ marginRight: 5 }}>
                <Link to="/places">Cancel</Link>
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
              name="placeName"
              label="Place Name"
              component={renderInput}
              placeholder="Place Name"
            />

            <Field
              name="description"
              label="Description"
              component={renderTextarea}
              placeholder="Description"
              value=""
            />

            <Field
              name="address"
              label="Address"
              component={renderInput}
              placeholder="Address Number"
              validate={required}
            />

            <Field
              name="addressStreet"
              label="Street"
              component={renderInput}
              placeholder="Street / Route"
            />

            <Field
              name="addressAreaDistrict"
              label="Arrea / District"
              component={renderInput}
              placeholder="City Arrea / District"
            />

            <Field
              name="addressCityTown"
              label="City / Town"
              component={renderInput}
              placeholder="City / Town"
            />

            <Field
              name="addressStateProvince"
              label="State / Province"
              component={renderInput}
              placeholder="State / Province"
            />

            <Field
              name="addressCountry"
              label="Country"
              component={renderInput}
              placeholder="Country"
            />

            <Field
              name="addressPostalCode"
              label="Postal Code"
              component={renderInput}
              placeholder="@12x3jk9"
            />
          </Col>

          <Col span={8}>

            <Field
              name="pick_sourceId"
              label="Search Google Place"
              component={renderPlacesAutocomplete}
              placeholder="Google Place"
              onBlur={this.geoCoding}
            />

            <Field
              name="sourceId"
              component={renderInput}
              label="Source ID"
              placeholder="Place ID"
            />

            <Row>
              <Col span={8} className="ant-form-item-label">
                <label>Location</label>
              </Col>
              <Col span={8}>
                <Field
                  name="locationLat"
                  component={renderInput}
                  placeholder="lat"
                  validate={required}
                />
              </Col>
              <Col span={8}>
                <Field
                  name="locationLong"
                  component={renderInput}
                  placeholder="long"
                  validate={required}
                />
              </Col>
            </Row>

            <FormItem>
              <Field
                name="place_loc"
                component={PlaceMap}
                isMarkerShown
                coordinate={{ lat: +lat, long: +long }}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `300px` }} />}
                mapElement={<div style={{ height: `100%` }} />}
              />
            </FormItem>

            <Field
              name="source"
              label="Place Source"
              component={renderSelect}
              placeholder="Select Source"
              options={PLACE_SOURCE}
            />

            <Field
              name="status"
              label="Status"
              component={renderSelect}
              placeholder="Select Status"
              options={ENABLED}
              validate={required}
            />

          </Col>

          <Col span={8}>
            <FormItem>
              <Col span={8} className="ant-form-item-label">
                <label>Profile Picture</label>
              </Col>
              <Col span={16}>
                <CloudinaryFilesUpload
                  files={this.state.files}
                  onUpload={this.handleUploadWidget}
                  onDelete={(file) => this.handleDeletePicture(file)}
                />
              </Col>
            </FormItem>

            {createdAt &&
              <Field
                name="createdAt"
                label="Create Date"
                component={renderLabel}
                format={val => val && moment(val).format('L HH:mm')}
              />
            }
          </Col>
        </Row>
      </Form>
    );
  }
}

const Place = reduxForm({ form: 'placeForm' })(PlaceForm);

const selector = formValueSelector('placeForm');

export default connect(
  state => ({
    pick_sourceId: selector(state, 'pick_sourceId'),
    createdAt: selector(state, 'createdAt'),
    lat: selector(state, 'locationLat'),
    long: selector(state, 'locationLong'),
  }),
)(Place);
