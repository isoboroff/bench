import React from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import SearchBox from "./SearchBox";
import FacetView from "./Facet";
import SearchResults from "./SearchResults";

class SearchTab extends React.Component {
  constructor(props) {
	super(props);
	this.state = {
	  query: "",
	  qrels: this.props.qrels,
	  page: 1,
	  facets: new Map(),
	  results: "",
	};

	this.update_query = this.update_query.bind(this);
	this.update_facets = this.update_facets.bind(this);
	this.turn_page = this.turn_page.bind(this);
	this.mark_relevant = this.mark_relevant.bind(this);
  }

  update_search() {
	this.do_search();
  }

  update_query(query_box_contents) {
	this.setState({ query: query_box_contents }, /* then, do */ this.update_search);
  }
  
  /**
   * update_facets
   * When the user checks or unchecks the radio buttons, this callback updates
   * the App state, and triggers a search update.
   */
  update_facets(facetkey, checked) {
    let facetmap = this.state.facets;
    if (checked) {
      facetmap.set(facetkey, checked);
    } else {
      facetmap.delete(facetkey);
    }
    this.setState({ facets: facetmap }, /* then, do */ this.update_search);
  }

  mark_relevant(docid, checked) {
    let qrels = this.state.qrels;
    if (checked) {
	  this.props.add_relevant(docid);
    } else {
      this.props.remove_relevant(docid);
    }
  }

  turn_page(change) {
    const num_pages = this.state.results
      ? Math.floor(this.state.results.hits.total.value / 10)
      : 0;
    let this_page = this.state.page;

    if (change === "+1") {
      this_page += 1;
    } else if (change === "-1") {
      this_page -= 1;
    } else if (change.match(/^[0-9]+$/)) {
      this_page = parseInt(change);
    }

    if (this_page > num_pages) {
      this_page = num_pages;
    }
    if (this_page < 1) {
      this_page = 1;
    }

    this.setState({ page: this_page }, /* then, do */ this.do_search);
  }

  /**
   * build_query
   * Take the textual query and the facet filters and assemble the query to send
   * to the back-end.  Note that this is just a simple URL form... the back-end
   * builds this into the query for ElasticSearch.
   */
  build_query() {
    let query_string = "q=" + this.state.query + "&page=" + this.state.page;
    const facet_string = Array.from(this.state.facets.keys()).join(",");
    if (facet_string.length > 0) {
      query_string += "&facets=" + facet_string;
    }
    // The query needs to be escaped before fetching.
    query_string = encodeURI(query_string);
    return query_string;
  }

  /**
   * do_search: send the search query to the backend, catch the result, and update state.
   */
  do_search() {
    const url = window.location.href + "search?" + this.build_query();

    fetch(url)
      .then(response => {
        return response.json(); // ElasticSearch returns JSON data
      })
      .then(data => {
        this.setState({ results: data }); // Update the search results
      })
      .catch(err => {
        // do something on an error here.
      });
  }

  
  render() {
	return (
      <Container fluid="true">
        <Row className="justify-content-md-center mt-5">
          <Col sm="8">
            <SearchBox on_search={this.update_query} />
          </Col>
        </Row>
        <Row>
          <Col sm="2">
            <FacetView
              aggs={this.state.results ? this.state.results.aggregations : ""}
              checked={this.state.facets}
              onCheck={this.update_facets}
              />
          </Col>
          <Col sm="10">
            <SearchResults
              results={this.state.results}
              qrels={this.props.qrels}
              on_relevant={this.mark_relevant}
              page={this.state.page}
              turn_page={this.turn_page}
              />
          </Col>
        </Row>
      </Container>
	);
  }
}

export { SearchTab as default };
