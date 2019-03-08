import React, { Component } from 'react';
import './App.css';
import Chart from "react-apexcharts";
import axios from 'axios';
import _ from 'lodash';
// import moment from 'moment';

const SIZE_LABELS = [
  '1', '2', '3', '5', '8', '13', '21',
  'Point: 1', 'Point: 2', 'Point: 3', 'Point: 5', 'Point: 8', 'Point: 13', 'Point: 21'
]
function sizeIssue (issue) {
  let sizeLabel = issue.labels.find((label) => SIZE_LABELS.includes(label.name))
  if (!sizeLabel) {
    return 0
  }
  return Number.parseInt(sizeLabel.name.split('Point: ')[1])
}

class App extends Component {
  constructor(props) {
    super(props);

    this.tokenInput = React.createRef();

    this.state = {
      options: {
        chart: {
              zoom: {
                  enabled: false
              }
          },
          dataLabels: {
              enabled: true
          },
          stroke: {
              curve: 'straight'
          },
          title: {
              text: 'Point Burndown',
              align: 'left'
          },
          grid: {
              row: {
                  colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                  opacity: 0.5
              },
          },
          xaxis: {
              categories: [ 'Feb 27', 'Feb 28', 'Mar 1', 'Mar 4', 'Mar 5', 'Mar 6', 'Mar 7', 'Mar 8' ],
          },
          yaxis: {
            min: 0,
            max: 80
          }
      },
      series: [{
          name: "Points",
          data: [ 52, 52, 51, 47, 36, 28, 28, 26 ]
      }],
    }
  }

  blah = () => {
    const bearerToken = this.tokenInput.current.value
    if (!bearerToken) {
      alert('No token')
      return
    }
    const columns = [
      // in progress
      'https://github.com/orgs/<org>/projects/<project>#column-<id>',
      // beat plan
      'https://github.com/orgs/<org>/projects/<project>#column-<id>',
      // pr land
      'https://github.com/orgs/<org>/projects/<project>#column-<id>'
    ]
    const config = { 
      headers: {
        accept: 'application/vnd.github.inertia-preview+json',
        authorization: `Bearer ${bearerToken}`
      }
    }

    // retrieve all cards
    Promise.all(columns.map((url) => {
      const columnId = url.split('#column-')[1]
      const cardsUrl = `https://api.github.com/projects/columns/${columnId}/cards`
      return axios.get(cardsUrl, config)
    }))
    // retrieve all issues corresponding to the cards
    .then((cardsResults) => {
      return Promise.all(_.flatMap(cardsResults, (cardsResult) => cardsResult.data)
      .filter((card) => !card.note)
      .map((card) => axios.get(card.content_url, config)))
    })
    // size all issues and add up
    .then((results) => results.reduce((total, result) => {
      return total + sizeIssue(result.data)
    }, 0))
    .then(size => console.log(size))
    .catch((err) => {
      console.log(err)
    })
  }
  
  render() {
    return (
      <div className="App">
        <input id="token" type="password" ref={this.tokenInput} ></input>
        <button onClick={this.blah}>Pull Point Burndown</button>
        <header className="App-header">
          <div id="chart">
            <Chart options={this.state.options} series={this.state.series} type="line" height="350" />
          </div>
        </header>
      </div>
    );
  }
}

export default App;
