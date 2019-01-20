import React, { Component } from 'react';
import './App.css';
import Navigation from '../../components/Navigation/Navigation';
import ImageLinkForm from '../../components/ImageLinkForm/ImageLinkForm';
import Logo from '../../components/Logo/Logo';
import Rank from '../../components/Rank/Rank';
import Particles from 'react-particles-js';
//moved to server
//import { appKey } from '../../clarifaiSettings.js';
// moved to server code
//import Clarifai from 'clarifai';
import FaceRecognitionOutput from '../../components/FaceRecognitionOutput/FaceRecognitionOutput';
import Signin from '../../components/Signin/Signin';
import Register from '../../components/Register/Register';

// moved to server
// const app = new Clarifai.App({
//   apiKey: appKey
// });

const particlesOptions = {
  particles: {
    number: {
      value: 120,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
};

const initialState = {
  input: '',
  imageUrl: '',
  boxArray: [{}],
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
};

class App extends Component {
  constructor() {
    super();

    this.state = initialState;
  }

  // componentDidMount() {
  //   fetch('http://localhost:3001/')
  //   .then(res => res.json())
  //   .then(console.log);
  // }

  loadUser = (user) => {
    this.setState({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        entries: user.entries,
        joined: user.joined
      }
    });
  }

  calculateFaceLocation = (data) => {
    //console.log(data);
    const image = document.getElementById('outputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    //console.log({ width, height });

    //const face = data.outputs[0].data.regions[0].region_info.bounding_box;
    if (data.outputs[0].data.regions) {
      const faces = data.outputs[0].data.regions.map(region => region.region_info.bounding_box);

      //     region_info:
      //     bounding_box: {top_row: 0.41088524, left_col: 0.46107283, bottom_row: 0.5047629, right_col: 0.5236724}

      // const boxArray = [{
      //   boxLeft: face.left_col * width,
      //   boxTop: face.top_row * height,
      //   boxRight: width - face.right_col * width,
      //   boxBottom: height - face.bottom_row * height
      // }];

      const boxArray = faces.map(face => {
        return (
          {
            boxLeft: face.left_col * width,
            boxTop: face.top_row * height,
            boxRight: width - face.right_col * width,
            boxBottom: height - face.bottom_row * height
          }
        )
      });

      //console.log('boxArray: ', boxArray);

      return boxArray;
    }
    else return [];
  }

  displayFaceBox = (boxes) => {
    //console.log('boxes: ', boxes);
    this.setState({ boxArray: boxes });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
    //console.log('new input: ', event.target.value);
    //console.log(this.state);
  }

  onPictureSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    //console.log(this.state);

    // http://townsquare.media/site/295/files/2014/12/The-Faces-Band-Photo.jpg

    //we're passing state.input instead of state.imageUrl. this is because setState() is a request rather than an immediate command to update the component. For better perceived performance, React may delay it, and then update several components in a single pass. React does not guarantee that the state changes are applied immediately.
    //app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      fetch('http://localhost:3001/imageurl', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('http://localhost:3001/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          }
          )
            .then(res => res.json())
            .then(user => {
              this.setState(Object.assign(this.state.user, { entries: user.entries }));
            })
            .catch(console.log);
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'signin') {
      this.setState(initialState);
    } else if(route === 'home') {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  }

  render() {
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions} />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn} />
        {this.state.route === 'home'
          ?
          <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onPictureSubmit} />
            <FaceRecognitionOutput imageUrl={this.state.imageUrl} boxArray={this.state.boxArray} />
          </div>
          : (
            this.state.route === 'signin'
              ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )
        }
      </div>
    );
  }
}

export default App;
