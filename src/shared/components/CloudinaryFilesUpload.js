import React from 'react';
import { Icon } from 'antd';
import { Image } from 'cloudinary-react';

const CloudinaryFilesUpload = ({ files, onUpload, onDelete }) => (
  <div className="couldinary">
    { files && files.map(file =>
      <div key={file} className="ant-upload-list ant-upload-list-picture-card">
        <div className="ant-upload-list-item ant-upload-list-item-done">
          <div className="ant-upload-list-item-info">
            {/* <img className="couldinary-img" src={file} alt="profile" /> */}
            <Image cloudName="onemap-co" uploadPreset="bztfvbid" upload_preset="bztfvbid" className="couldinary-img" publicId={file} type="fetch"/>
          </div>
          <div className="ant-upload-list-item-actions">
            <Icon type="delete" onClick={() => onDelete(file)} />
          </div>
        </div>
      </div>
    )}
    <div className="ant-upload ant-upload-select-picture-card" onClick={onUpload}>
      <span className="ant-upload">
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </span>
    </div>
  </div>
)

export default CloudinaryFilesUpload;
