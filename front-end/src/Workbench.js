import React from "react";

import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

import SearchTab from "./SearchTab";
import Writeup from "./Writeup";
import TopicList from "./TopicList";

let initial_bench_state = {
  queries: [],
  qrels: new Map(),
  writeup: {
	title: "",
	desc: "",
	narr: "",
  }
}

class Workbench extends React.Component {
  constructor(props) {
	super(props);
	this.state = {
	  queries: [],
	  qrels: new Map(),
	  writeup: {
		title: "",
		desc: "",
		narr: "",
	  }
	};

	this.add_query = this.add_query.bind(this);
	this.add_relevant = this.add_relevant.bind(this);
	this.remove_relevant = this.remove_relevant.bind(this);
	this.change_writeup = this.change_writeup.bind(this);
  }

  clear_state() {
	this.setState({
	  queries: [],
	  qrels: new Map(),
	  writeup: {
		title: "",
		desc: "",
		narr: "",
	  }
	});
  }
  
  restore_state() {
	let bench_state = localStorage.getItem('bench_state');
	if (bench_state) {
	  let new_state = JSON.parse(bench_state);
	  new_state.state_is_live = true;
	  this.setState(new_state);
	}
  }

  save_state() {
	let bench_state = JSON.stringify(this.state);
	localStorage.setItem('bench_state', bench_state);
  }

  add_query(query, facets) {
	let queries = this.state.queries;
	queries.push({ query: query, facets: facets });
	this.setState({ queries: queries });
  }

  add_relevant(docno) {
	let qrels = this.state.qrels;
	qrels.set(docno, true);
	this.setState({ qrels: qrels });
  }

  remove_relevant(docno) {
	let qrels = this.state.qrels;
	qrels.delete(docno);
	this.setState({ qrels: qrels });
  }

  change_writeup(field, content) {
	let writeup = this.state.writeup;
	writeup = { ...writeup,
				[field]: content };
	this.setState({ writeup: writeup });
  }

  render() {
    return (
      <Tabs defaultActiveKey="search" id="workbench">
        <Tab eventKey="search" title="Search">
		  <SearchTab qrels={this.state.qrels}
					 add_query={this.add_query}
					 add_relevant={this.add_relevant}
					 remove_relevant={this.remove_relevant}/>
        </Tab>
        <Tab eventKey="writeup" title="Write-Up">
          <Writeup qrels={this.state.qrels}
				   writeup={this.state.writeup}
				   change_writeup={this.change_writeup}/>
        </Tab>
		<Tab eventKey="topics" title="My Topics">
		  <TopicList bench_state={this.state} />
		</Tab>
      </Tabs>
    );
  }
}

export { Workbench as default };
