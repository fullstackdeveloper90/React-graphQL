import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Button, Row, Col, Alert, message } from 'antd';
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
import { STORY_STATUS } from '../../shared/constants/constants';
import CloudinaryFilesUpload from '../../shared/components/CloudinaryFilesUpload';
import { parseError } from '../../shared/utils/parse_errors';

const googlePlaces = Places(window.google);
const FormItem = Form.Item;
const ADDRESS_FIELDS = [
  'addressStreet', 'addressCityTown', 'addressAreaDistrict', 
  'addressStateProvince', 'addressCountry', 'addressPostalCode',
];

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

class StoryForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: props.pictureURL || [],
    };

    this.geoCoding = this.geoCoding.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleDeletePicture = this.handleDeletePicture.bind(this);
    this.handleUploadWidget = this.handleUploadWidget.bind(this);
  }

  geoCoding() {
    const { pick_sourceId, change, onCheckPlace, onCreatePlace } = this.props;

    const values = {
      createSide: 'BACKEND',
      source: 'GOOGLE_PLACE',
      status: 'ENABLE',
      placeName: pick_sourceId,
    };

    change('placeName', pick_sourceId);
    message.loading('Loading...', 1);
    geocodeByAddress(pick_sourceId)
      .then(results => {
        const result = results[0];
        
        values.sourceId = result.place_id;
        values.address = result.formatted_address;

        ADDRESS_FIELDS.forEach((field, idx) => {
          if (result.address_components[idx]) {
            values[field] = result.address_components[idx].long_name;
          }
        });

        getLatLng(result)
          .then(latLng => {
            values.locationLat = latLng.lat;
            values.locationLong = latLng.lng;
          });

        return onCheckPlace(values.sourceId)
          .catch(() => parseError('Failed to check place'));
      })
      .then(res => {
        if (!res.data.Place) {
          googlePlaces.details({ placeId: values.sourceId }, (err, place) => {
            if (!err) {
              const photos = place.photos ? place.photos.map(photo => photo.getUrl({ maxWidth: 1920 })) : null;
              this.setState({ placeFiles: photos });
              onCreatePlace({ ...values, pictureURL: this.state.placeFiles })
                .then(res => {
                  change('placeId', res.data.createPlace.id);
                  change('placeAddress', res.data.createPlace.address);
                  change('placeLat', res.data.createPlace.locationLat);
                  change('placeLong', res.data.createPlace.locationLong);
                  message.success('Place created.', 1);
                })
                .catch(() => parseError('Failed to create place'));
            } else {
              parseError(err);
            }
          });
        } else {
          change('placeId', res.data.Place.id);
          change('placeAddress', res.data.Place.address);
          change('placeLat', res.data.Place.locationLat);
          change('placeLong', res.data.Place.locationLong);
          message.success('Place loaded from database.', 1);
        }
      })
      .catch(parseError);
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

  onSubmit(values) {
    return this.props.onSubmit({ ...values, pictureURL: this.state.files });
  }

  render() {
    const {
      handleSubmit,
      error,
      submitting,
      users,
      createdAt,
      onDelete,
      placeLat,
      placeLong,
    } = this.props;
    const userOptions = users.map(({ id, displayName }) => ({ value: id, label: displayName }));

    return (
      <Form onSubmit={handleSubmit(this.onSubmit)}>
        <Row>
          <div className="is-right">
            <FormItem>
              <Button style={{ marginRight: 5 }}>
                <Link to="/stories">Cancel</Link>
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
              name="createdById"
              label="User Name"
              component={renderSelect}
              placeholder="Select User Name"
              options={userOptions}
              validate={required}
            />

            <Field
              name="placeName"
              label="Place Name"
              component={renderInput}
              placeholder="Select Place Name"
              validate={required}
            />

            <Field
              name="placeAddress"
              label="Place Address"
              component={renderInput}
              placeholder="Select Place Address"
              validate={required}
            />

            <FormItem>
              <Field
                name="place_loc"
                component={PlaceMap}
                isMarkerShown
                coordinate={{ lat: +placeLat, long: +placeLong }}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `220px` }} />}
                mapElement={<div style={{ height: `100%` }} />}
              />
            </FormItem>

            <Field
              name="placeId"
              label="Place ID"
              component={renderInput}
              placeholder="placeId"
              disabled={true}
            />

            <Field
              name="status"
              label="Story Status"
              component={renderSelect}
              placeholder="Select Status"
              options={STORY_STATUS}
              validate={required}
            />

            <Field
              name="title"
              label="Story Title"
              component={renderInput}
              placeholder="Story Title"
              validate={required}
            />
          </Col>

          <Col span={8}>
            <Field
              name="pick_sourceId"
              label="Search Place"
              component={renderPlacesAutocomplete}
              placeholder="Google Place"
              onBlur={this.geoCoding}
            />
            <div style={{ display: 'none' }}>
              <CloudinaryFilesUpload
                files={this.state.placeFiles}
                onUpload={this.handleUploadWidget}
              />
            </div>

            <FormItem>
              <Col span={8} className="ant-form-item-label">
                <label>Story Picture</label>
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

        <Row gutter={32}>
          <Col span={20}>
            <FormItem>
              <Col span={3} className="ant-form-item-label">
                <label>Story</label>
              </Col>
              <Col>
                <Field
                  name="story"
                  component={renderTextarea}
                  placeholder="User Place Story"
                />
              </Col>
            </FormItem>
          </Col>
        </Row>
      </Form>
    )
  }
}

const Story = reduxForm({ form: 'storyForm' })(StoryForm);

const selector = formValueSelector('storyForm');

export default connect(
  state => ({
    pick_sourceId: selector(state, 'pick_sourceId'),
    placeFiles: selector(state, 'placeFiles'),
    createdAt: selector(state, 'createdAt'),
    placeId: selector(state, 'placeId'),
    placeName: selector(state, 'placeName'),
    placeAddress: selector(state, 'placeAddress'),
    placeLat: selector(state, 'placeLat'),
    placeLong: selector(state, 'placeLong'),
    sourceId: state.sourceId,
  }),
)(Story);
