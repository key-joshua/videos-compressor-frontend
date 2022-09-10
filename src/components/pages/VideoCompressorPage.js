/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable consistent-return */

import axios from 'axios';
import * as io from 'socket.io-client';
import React, { Component } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import 'react-circular-progressbar/dist/styles.css';
import { ToastContainer, toast } from 'react-toastify';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

const serverAdress = 'http://ec2-13-59-149-47.us-east-2.compute.amazonaws.com:3000';
class VideoCompressorPage extends Component {
  constructor() {
    super();
    this.state = {
      video: null,
      percentage: '',
      isLoading: false,
      percentageValue: 0,
      disableVideo: true,
      disableInput: false,
      disableSelect: false,
    };

    this.socket = io(serverAdress);
  }

  componentDidMount() {
    if (!sessionStorage.getItem('userId')) {
      sessionStorage.setItem('userId', Math.random().toString(36).substr(2, 9));
    }

    this.socket.emit('userId', sessionStorage.getItem('userId'));
  }

  handleChange(key) {
    this.setState({ [key.target.id]: key.target.value });

    if (key.target.files) {
      const formatFilename = key.target.files[0].name.split('.')[0];

      const formatSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,<>/?]+/;
      if (formatSpecial.test(formatFilename)) {
        toast.error('Video file name should not contain special characters');
        setTimeout(() => { window.location.reload(1); }, 4500);
      }

      const formatLetter = /[A-Z]+/;
      if (formatLetter.test(formatFilename)) {
        toast.error('Video file name should not contain upper case letter');
        setTimeout(() => { window.location.reload(1); }, 4500);
      }

      const formatNumber = /[0123456789]+/;
      if (formatNumber.test(formatFilename)) {
        toast.error('Video file name should not contain number');
        setTimeout(() => { window.location.reload(1); }, 4500);
      }

      const formatSpace = /\s/;
      if (formatSpace.test(formatFilename)) {
        toast.error('Video file name should not contain space');
        setTimeout(() => { window.location.reload(1); }, 4500);
      }

      this.setState({ [key.target.id]: key.target.files[0] });
    }
  }

  handleVideoContainer(key) {
    key.preventDefault();
    this.setState({ disableVideo: true });
  }

  handleCompressVideo(key) {
    key.preventDefault();
    const { fileData, percentage } = this.state;

    if (!fileData) { return toast.error('Video file to compress is required'); }
    if (percentage === '') { return toast.error('Choose compression'); }

    const data = new FormData();
    data.append('video', fileData);
    this.setState({ isLoading: true, disableInput: true, disableSelect: true, percentageValue: 2 });

    axios.post(`${serverAdress}/api/video/compress-video/${percentage}`, data)
      .then((response) => {
        this.setState({ video: { url: `${serverAdress}/api/video/get-compressed-video/${response.data.data.fileName}/${response.data.data.fileType}`, fileData: { fileName: response.data.data.fileName, fileType: response.data.data.fileType } }, disableVideo: false, percentageValue: 100, isLoading: null });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    const { isLoading, percentage, percentageValue, disableVideo, video, disableInput, disableSelect } = this.state;
    this.socket.on('progressPercentages', (progressPercentages) => this.setState({ percentageValue: Math.round(progressPercentages) }));

    return (
      <div>
        <ToastContainer />

        <div className="videoCompressor-page">

          {
            disableVideo === false
              ? (
                <div className="player-container">
                  <span onClick={(key) => { this.handleVideoContainer(key); }}>X</span>
                  <video controls muted> <source src={video.url} type={video.fileData.fileType} /> </video>
                </div>
              )
              : null
          }

          <div className="content-container">

            <h1><span>Video</span> Compressor</h1>

            <div className="file-input">
              <input disabled={disableInput} id="fileData" type="file" name="fileData" onChange={(id) => this.handleChange(id)} />
            </div>

            <div>
              <select disabled={disableSelect} id="percentage" name="percentage" value={percentage} onChange={(id) => this.handleChange(id)}>
                <option value="">Choose Compression</option>
                <option value="30">30%</option>
                <option value="20">20%</option>
              </select>
            </div>

            <div className="button-container">
              {
                isLoading === false
                  ? <button type="button" onClick={(key) => { this.handleCompressVideo(key); }}> Compress </button>
                  : isLoading === true
                    ? <div style={{ width: 70, height: 70 }}> <CircularProgressbar value={percentageValue} text={`${percentageValue}%`} styles={buildStyles({ textSize: '25px' })} /> </div>
                    : <a href={video.url} download={video.fileData.fileName}> <FontAwesomeIcon icon={faDownload} size="4x" style={{ color: '#002D62' }} /> </a>

              }
            </div>

          </div>

        </div>

      </div>

    );
  }
}

export default VideoCompressorPage;
