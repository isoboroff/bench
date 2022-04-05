import React from "react";
import ReactDOMServer from "react-dom/server";

import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";

import SearchHit from "./SearchHit.js";
import Pager from "./Pager.js";

/** SearchResults this is the list of search hits.  Using a Bootstrap Accordion. */
class SearchResults extends React.Component {
  /**
   * @param {Object} this.props.results the result object from ElasticSearch, see https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-search.html
   */
  render() {
    const hits = this.props.results.hits ? this.props.results.hits.results : [];
    const docs = this.props.results.docs ? this.props.results.docs : [];
    let qrels = this.props.qrels;
    if (qrels === null) {
      qrels = new Map();
    }


    if (hits.length > 0) {
      // This is a common React pattern: if you have an array of things to render,
      // use map() to convert it to a list of JSX things, then use that directly
      // in the JSX rendering.  (Otherwise JSX would need loop primitives, yuck)
      // An equivalent approach is to declare an empty list and push() things onto it.
      const hitlist = hits.map((hit, index) => {
        const doc = docs[hit.doc_id];
        return (<SearchHit
                  display_doc={this.props.display_doc}
                  seqno={index + (this.props.page - 1) * 10}
                  hitkey={hit.doc_id}
                  title={doc.title}
                  content={doc}
                  date={doc.date}
                  rel={qrels.has(hit.doc_id) ? qrels.get(hit.doc_id) : null}
                  on_relevant={this.props.on_relevant}
                />);
      });
      let count = hits.length + " results found.";
      if (!isNaN(this.props.cur_topic) && this.props.cur_topic !== -1) {
        count += "  Highlight passages to mark a document relevant for topic "
          + (this.props.cur_topic + 1);
        if (this.props.cur_req !== -1) {
          count += ", request " + (this.props.cur_req + 1);
        }
      }
      let num_pages = Math.floor(this.props.results.hits.length / 10);
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
          <Accordion defaultActiveKey={hits[0].doc_id}>
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
