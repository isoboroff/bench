import React from "react";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "" };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    const url = window.location.href + "search?q=" + this.state.value;
    const escaped_query = encodeURI(url);
    fetch(escaped_query)
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.props.onSearch(data);
      })
      .catch(err => {
        // do something on an error here.
      });
    event.preventDefault();
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Group as={Col} controlID="searchBox">
          <Form.Control
            placeholder="Enter your query here"
            value={this.state.value}
            onChange={this.handleChange}
          />
        </Form.Group>
      </Form>
    );
  }
}

class SearchHit extends React.Component {
  render() {
    return <li>{this.props.value}</li>;
  }
}

class SearchResults extends React.Component {
  render() {
    const hits = this.props.results.hits ? this.props.results.hits.hits : [];
    if (hits.length > 0) {
      const hitlist = hits.map(hit => (
        <SearchHit
          key={hit._source.uuid}
          value={hit._source.text.split("\n")[0]}
        />
      ));
      return (
        <div>
          {hits.length} Results Found. <p />
          <ol>{hitlist}</ol>
        </div>
      );
    } else {
      return <i>nothing found</i>;
    }
  }
}

class Facet extends React.Component {
  render() {
    var switches = [];
    for (var o in this.props.data) {
      switches = switches.concat(<li>{o.key}</li>);
    }
    return (
      <React.Fragment>
        <dt>{this.props.key}</dt>
        <dd>
          <ul>{switches}</ul>
        </dd>
      </React.Fragment>
    );
  }
}

class FacetView extends React.Component {
  render() {
    const facets = this.props.facets;
    var facetlist = Object.entries(facets).map(([key, data]) => (
      <Facet key={key} data={data.buckets} />
    ));
    return <dl>{facetlist}</dl>;
  }
}

class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = { results: "" };
    this.updateResults = this.updateResults.bind(this);
  }

  updateResults(hits) {
    this.setState({ results: hits });
  }

  render() {
    const results = this.state.results;
    const facets = results ? results.aggregations : "";

    return (
      <Container fluid="true">
        <Row className="justify-content-md-center mt-5">
          <Col sm="8">
            <SearchBox onSearch={this.updateResults} />
          </Col>
        </Row>
        <Row>
          <Col sm="2">
            <FacetView facets={facets} />
          </Col>
          <Col sm="auto">
            <SearchResults results={results} />
          </Col>
        </Row>
      </Container>
    );
  }
}

ReactDOM.render(<Layout />, document.getElementById("root"));
