import React from "react";
import ReactDOMServer from "react-dom/server";
import DOMPurify from "dompurify";

import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";

import Pager from "./Pager.js";

/** SearchHit: an individual search result.  We render this in a Bootstrap Card. */
class SearchHit extends React.Component {
  constructor(props) {
    super(props);
    this.on_relevant = this.on_relevant.bind(this);
  }

  on_relevant(event) {
    this.props.on_relevant(this.props.hitkey, event.target.checked);
  }

  /**
   * display_doc: render a WashingtonPost document object to JSX
   * @Param {String} objstring a JSON string of a WaPo doc.
   */
  display_doc(objstring) {
	let obj = JSON.parse(objstring);
	let content = obj.contents.map(block => {
	  switch (block.type) {
	  case 'kicker': return (<h3> {block.content} </h3>);
	  case 'title': return (<h1> {block.content} </h1>);
	  case 'byline': return (<h3> {block.content} </h3>);
	  case 'date': return (<p> { new Date(block.content).toDateString() } </p>);
	  case 'sanitized_html': return (
		<div class="text-wrap article-text"
			 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.content)}} />
	  );
	  case 'image': return (
		<figure class="figure">
		  <img src={block.imageURL} class="figure-img img-fluid w-75"/>
		  <figcaption class="figure-caption">{block.fullcaption}</figcaption>
		</figure>
	  );
	  case 'video': if (/youtube/.test(block.mediaURL)) {
		let id = block.mediaURL.match(/v=([^&]+)&/)[1];
		let url = "https://www.youtube.com/embed/" + id + "?feature=oembed";
		return (
		  <iframe width="480" height="270" src={url} frameborder="0" allowfullscreen></iframe>
		);
	  } else {
		return (
		  <video controls src={block.mediaURL} poster={block.imageURL}>
			A video should appear here
		  </video>
		);
	  }
	  case 'author_info': return (<p><i>{block.bio}</i></p>);
	  default: return (<i> {block.type} not rendered</i>);
	  };
	});
	let doc = ( <div>{content}</div> );
	return doc;
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
    const doc = this.display_doc(this.props.content);
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
            {doc.first_date} {this.props.hitkey} <p />
			{people.values()} {orgs.values()} {gpes.values()} <p />
			{/* don't need dangerouslySet and renderToStatic anymore, just doc, I think */}
            <div
              style={{ whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{ __html: ReactDOMServer.renderToStaticMarkup(doc) }}
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
    let qrels = this.props.qrels;
	if (qrels === null) {
	  qrels = new Map();
	}
	

    if (hits.length > 0) {
      // This is a common React pattern: if you have an array of things to render,
      // use map() to convert it to a list of JSX things, then use that directly
      // in the JSX rendering.  (Otherwise JSX would need loop primitives, yuck)
      // An equivalent approach is to declare an empty list and push() things onto it.
      const hitlist = hits.map((hit, index) => (
        <SearchHit
          seqno={index + (this.props.page - 1) * 10}
          hitkey={hit._id}
          title={hit._source.title}
          content={hit._source.orig}
          rel={!!qrels.has(hit._id)}
          on_relevant={this.props.on_relevant}
		  people={hit._source.PERSON}
		  orgs={hit._source.ORG}
		  gpes={hit._source.GPE}
        />
      ));
      let count = this.props.results.hits.total.value + " results found.";
      if (this.props.results.hits.total.relation === "gte") {
        count = "At least " + count;
      }
      let num_pages = Math.floor(this.props.results.hits.total.value / 10);
      return (
        <div>
          <div className="d-flex align-items-center justify-content-between">
            {count}
            <Pager
              page={this.props.page}
              num_pages={num_pages}
              turn_page={this.props.turn_page}
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
