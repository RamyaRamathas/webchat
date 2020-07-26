import React, {Component} from "react";
import axios from "axios";
import "./FileUpload.css";
import LoginString from '../../backend/LoginStrings';

const FILE_UPLOAD_URL = "https://us-central1-serverlessproject-284221.cloudfunctions.net/uploadFiles";
const SENTENCE_ENCODE_URL = "https://sentenceencoder-ednqegx5tq-uc.a.run.app/encode"
const FILE_INFO_URL = "https://us-central1-serverlessproject-284221.cloudfunctions.net/files";
const WORDCLOUD_URL = "https://wordcloud-ednqegx5tq-uc.a.run.app/home";

export default class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadedFiles: [],
      selectedFile: null
    };
  }

  componentDidMount() {
    axios.get(FILE_INFO_URL).then(res => {
      this.setState({
        uploadedFiles: res.data
      });
      console.log(this.state.uploadedFiles);
    });
  }

  onFileChange = event => {
    this.setState({selectedFile: event.target.files[0]});
  };

  onFileUpload = async () => {
    if (this.state.selectedFile != null) {
      try {
        this.isLoading = true
        const formData = new FormData();
        const KEY = "myFile";

        formData.append(
          KEY,
          this.state.selectedFile,
          this.state.selectedFile.name
        );

        const organization = localStorage.getItem(LoginString.Organization);
        axios.post(FILE_UPLOAD_URL + `?organizationId=${organization}`, formData).then(async (res) => {
          const hash = await this.encodeText(res.data.files.myFile.name);
          let fileInfo = {
            organization,
            hash,
            email: localStorage.getItem(LoginString.Email),
            filename: res.data.files.myFile.name,
            path: res.data.files.myFile.path
          };

          await axios.post(FILE_INFO_URL, fileInfo);
          this.updateFilesList(res.data.files.myFile);
        });
      } catch(error) {
        alert(error);
      } finally {
        this.isLoading = false
      }
    } else {
      alert("Please upload a file");
    }
  };

  updateFilesList = (file) => {
    let files = this.state.uploadedFiles;
    files.push({
      filename: file.name,
      createdTime: file.mtime
    });

    this.setState({
      uploadedFiles: files
    });
  };

  encodeText = async (text) => {
    try {
      const hash = await axios.get(SENTENCE_ENCODE_URL + `?fileName=${text}`);
      return hash
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    return (
      <div className="container pt-4">
        <h3 className="text-center mt-4">Cloud Storage</h3>
        <h4 className="text-center text-danger">By NuNu... 🚗🔥</h4>
        <div className="row mt-4">
          <div className="input-group col-sm-4 offset-sm-8">
            <div className="custom-file">
              <input
                type="file"
                className="custom-file-input"
                onChange={this.onFileChange}
              />
              <label className="custom-file-label">Choose file</label>
            </div>
            <div className="input-group-append">
              <button
                className="btn btn-primary"
                type="button"
                onClick={this.onFileUpload}
              >
                Upload
              </button>
            </div>
          </div>
        </div>

        <table className="table">
          <thead className="thead-dark">
            <tr>
              <th>#</th>
              <th>File Name</th>
              <th>Uploaded Time</th>
            </tr>
          </thead>
          <tbody>
            {this.state.uploadedFiles.map((item, index) => (
              <tr>
                <td>{index}</td>
                <td>{item.filename}</td>
                <td>{item.createdTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
