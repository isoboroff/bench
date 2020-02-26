import React from "react";

import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import Pager from "./Pager.js";
import { TextAnnotator } from "react-text-annotate";

/** SearchHit: an individual search result.  We render this in a Bootstrap Card. */
class SearchHit extends React.Component {
  constructor(props) {
    super(props);
    this.on_relevant = this.on_relevant.bind(this);
	this.state = { value: [],
				   tag: 'REL',
				 };
	this.TAG_NAMES = [ "REL",
					   "PER",
					   "ORG",
					   "GPE",
					 ];
	this.TAG_COLORS = { REL: "#84d2ff",
					   PER: "#ffe2ec",
					   ORG: "#dcffee",
					   GPE: "#dafffe",
					  };
  }

  on_relevant(event) {
    this.props.onRelevant(this.props.hitkey, event.target.checked);
  }

  /**
   * render function
   * @param {Object} this,props.content a JSON object representing a search hit.
   * @param {String} this.props.hitkey  the docid of the search result.
   * @param {String} this.props.title   the title of the result.
   *
   * Note use of 'hitkey'.  In React-Bootstrap, the 'key' attribute is special.  Don't
   * use it.
   */
  render() {
    const doc = this.props.content;
    const event_key = this.props.hitkey;
    const rel_key = "rel." + this.props.hitkey;

	const people = new Map();
	if (this.props.people) {
	  for (let p of this.props.people) {
		people.set(p, (<span class="badge badge-info ml-1">{p}</span>
					  ));
	  }
	}
	const orgs = new Map();
	if (this.props.orgs) {
	  for (let o of this.props.orgs) {
		orgs.set(o, (<span class="badge badge-success ml-1">{o}</span>
					));
	  }
	}
	const gpes = new Map();
	if (this.props.gpes) {
	  for (let g of this.props.gpes) {
		gpes.set(g, (<span class="badge badge-warning ml-1">{g}</span>
					));
	  }
	}

	const tag_options = this.TAG_NAMES.map((value) => (<option value={value}>{value}</option>));
	
    return (
      <Card>
        <Accordion.Toggle as={Card.Header} variant="link" eventKey={event_key}>
          {this.props.seqno + 1}. {this.props.title}{" "}
          <div class="custom-control custom-switch float-right">
            <input
              class="custom-control-input"
              type="checkbox"
              id={rel_key}
              checked={this.props.rel}
              onClick={this.on_relevant}
              data-toggle="button"
              aria-pressed={this.props.rel}
            />
            <label class="custom-control-label" for={rel_key}>
              Rel
            </label>
          </div>{" "}
          <br />
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={event_key}>
          <Card.Body>
			<select
			  onChange={e => this.setState({tag: e.target.value})}
			  value={this.state.tag}>
			  { tag_options }
			</select>
            {doc.first_date} {this.props.hitkey} <p />
			{people.values()} {orgs.values()} {gpes.values()} <p />
            <TextAnnotator
              style={{ whiteSpace: "pre-wrap" }}
              content={ String(doc.text) }
			  value={ this.state.value }
			  onChange={ value => this.setState({ value }) }
			  getSpan={ span => ({
				...span,
				tag: this.state.tag,
				color: this.TAG_COLORS[this.state.tag]
			  })}
            />
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  }
}

/** SearchResults this is the list of search hits.  Using a Bootstrap Accordion. */
class SearchResults extends React.Component {
  /**
   * @param {Object} this.props.results the result object from ElasticSearch, see https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-search.html
   */
  render() {
    const hits = this.props.results.hits ? this.props.results.hits.hits : [];
    const qrels = this.props.qrels;

    if (hits.length > 0) {
      // This is a common React pattern: if you have an array of things to render,
      // use map() to convert it to a list of JSX things, then use that directly
      // in the JSX rendering.  (Otherwise JSX would need loop primitives, yuck)
      // An equivalent approach is to declare an empty list and push() things onto it.
      const hitlist = hits.map((hit, index) => (
        <SearchHit
          seqno={index + (this.props.page - 1) * 10}
          hitkey={hit._source.uuid}
          title={hit._source.text.split("\n")[0]}
          content={hit.highlight}
          rel={!!qrels.has(hit._source.uuid)}
          onRelevant={this.props.onRelevant}
		  people={hit._source.PERSON}
		  orgs={hit._source.ORG}
		  gpes={hit._source.GPE}
        />
      ));
      var count = this.props.results.hits.total.value + " results found.";
      if (this.props.results.hits.total.relation === "gte") {
        count = "At least " + count;
      }
      var num_pages = Math.floor(this.props.results.hits.total.value / 10);
      return (
        <div>
          <div className="d-flex align-items-center justify-content-between">
            {count}
            <Pager
              page={this.props.page}
              num_pages={num_pages}
              turnPage={this.props.turnPage}
            />
          </div>
          <Accordion defaultActiveKey={hits[0]._source.uuid}>
            {hitlist}
          </Accordion>
        </div>
      );
    } else {
      return <i>nothing found</i>;
    }
  }
}

export { SearchResults as default };
