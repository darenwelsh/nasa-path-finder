import React from 'react';
import Dropzone from 'react-dropzone';
import fetch from 'isomorphic-fetch';

export default class Controls extends React.Component {
  constructor() {
    super();
    this.state = {
      stationFile: null,
      stationError: '',
      stationLoading: false,
      handrailFiles: [],
      handrailError: '',
      handrailLoading: false,
    };
    this.handleStationFileDrop = this.handleStationFileDrop.bind(this);
    this.handleStationFileRejected = this.handleStationFileRejected.bind(this);
    this.handleHandrailFilesDrop = this.handleHandrailFilesDrop.bind(this);
  }

  componentDidMount() {
    const {onStationFileLoad} = this.props;
    const fileName = './models/LAB_S0_geometry.stl';
    // load a default stationFile for demo purposes
    this.setState({
      stationFile: {
        name: fileName,
        size: 35000000
      },
      stationLoading: true
    });
    fetch(fileName)
      .then(response => response.arrayBuffer())
      .then(data => {
        onStationFileLoad(data);
        this.setState({stationLoading: false});
      });
  }

  handleStationFileDrop(acceptedFiles) {
    const {
      onStationFileLoad
    } = this.props;
    acceptedFiles.forEach(stationFile => {
      this.setState({stationError: ''});
      const reader = new FileReader();
      reader.onabort = () => console.log('stationFile reading was aborted');
      reader.onerror = () => console.log('stationFile reading has failed');
      reader.onloadstart = () => this.setState({stationLoading: true});
      reader.onloadend = () => {
        onStationFileLoad(reader.result);
        this.setState({
          stationFile,
          stationLoading: false
        });
      };

      reader.readAsBinaryString(stationFile);
    });
  }

  handleStationFileRejected() {
    this.setState({stationError: 'Can only accept stl files'});
  }

  handleHandrailFilesDrop(files) {
    const {onHandrailFilesLoad} = this.props;
    const handrailFiles = [];
    const handrailResults = [];
    files.forEach((handrailFile, i) => {
      this.setState({handrailError: ''});
      const reader = new FileReader();
      reader.onabort = () => console.log('handrailFile reading was aborted');
      reader.onerror = () => console.log('handrailFile reading has failed');
      reader.onloadstart = () => {
        if (i === 0) {
          this.setState({handrailLoading: true});
        }
      };
      reader.onloadend = () => {
        handrailFiles.push(handrailFile);
        handrailResults.push(reader.result);
        if (i === files.length - 1) {
          this.setState({
            handrailFiles,
            handrailLoading: false
          });
          onHandrailFilesLoad(handrailResults);
        }
      };

      reader.readAsBinaryString(handrailFile);
    });
  }

  render() {
    const {
      stationFile,
      stationError,
      stationLoading,
      handrailFiles,
      handrailError,
      handrailLoading,
    } = this.state;
    return (
      <div className='Controls' style={{padding: '1em'}}>
        <div>Controls</div>
        <div style={{display: 'flex', justifyContent: 'space-around'}}>
          <div className='station-controls'>
            <div>Drag & drop the station stl file to render...</div>
            {stationLoading && <div style={{color: 'blue'}}>stationLoading..</div>}
            <Dropzone
              onDrop={this.handleStationFileDrop}
              multiple={false}
              onDropRejected={this.handleStationFileRejected}
              style={{
                width: '100px',
                height: '100px',
                border: '1px dotted black'
              }}
              accept='.stl'
            >
              <div style={{color: 'red'}}>{stationError}</div>
              {stationFile &&
                <div>{stationFile.name} - {stationFile.size} bytes</div>
              }
            </Dropzone>
          </div>
          <div className='handrails-controls'>
            <div>Drag & drop the handrail stl files to render...</div>
            {handrailLoading && <div style={{color: 'blue'}}>handrail loading..</div>}
            <Dropzone
              onDrop={this.handleHandrailFilesDrop}
              onDropRejected={this.handleHandrailFilesRejected}
              style={{
                width: '100px',
                height: '100px',
                border: '1px dotted black'
              }}
              accept='.stl'
            >
              <div style={{color: 'red'}}>{handrailError}</div>
              {handrailFiles.length > 0 &&
                <div>{handrailFiles.length} handrails loaded</div>
              }
            </Dropzone>
          </div>
        </div>
      </div>
    );
  }
}
