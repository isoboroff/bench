import React from "react";

import Tab from "react-bootstrap/Tab";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button"; 

import SearchTab from "./SearchTab";
import SimpleSearchTab from "./SimpleSearchTab";
import BetterTasks from "./BetterTasks";
import BetterDocument from "./BetterDocument";
import BetterRTLDocument from "./BetterRTLDocument";

function initial_bench_state() {
  return {
    username: null,
    topics: [],
    cur_topic: -1,
    cur_req: -1,
  };
}

function empty_topic() {
  return {
    writeup: {
      title: "New topic",
      desc: "",
      narr: "",
      inscope: "",
      outscope: "",
    },
    qrels: new Map(),
    requests: [],
  };
}

function empty_request() {
  return {
    req_text: "",
    qrels: new Map()
  };
}

class Workbench extends React.Component {
  constructor(props) {
    super(props);
    this.state = initial_bench_state();

    this.state.needs_save = false;
    /* JavaScript is not OO except by force of will.
       Remember you need to bind methods that will get called
       from browser events and React components.
       Thumb rule: if you refer to the method by name, rather than
       by calling it, you need to bind it.
    */
    this.set_username = this.set_username.bind(this);
    this.do_save = this.do_save.bind(this);
    this.do_logout = this.do_logout.bind(this);
    this.do_login = this.do_login.bind(this);
    this.add_relevant = this.add_relevant.bind(this);
    this.remove_relevant = this.remove_relevant.bind(this);
    this.change_writeup = this.change_writeup.bind(this);
    this.change_reqtext = this.change_reqtext.bind(this);
    this.delete_topic = this.delete_topic.bind(this);
    this.delete_request = this.delete_request.bind(this);
    this.new_topic = this.new_topic.bind(this);
    this.new_request = this.new_request.bind(this);
    this.set_current_topic = this.set_current_topic.bind(this);
    this.set_current_request = this.set_current_request.bind(this);
    this.handle_selection = this.handle_selection.bind(this);
  }

  clear_state() {
    this.setState(initial_bench_state());
  }

  /*
   * JSON.stringify serializes Maps as plain objects, so we need to handle their
   * conversion in stringify and parse so when we restore them, we get maps.
   */
  JSON_stringify_maps(key, value) {
    const original = this[key];
    if (original instanceof Map) {
      /* Serialize the Map as an object with a type and an array for the values */
      return {
	dataType: "Map",
	value: [...original]
      };
    } else {
      return value;
    }
  }

  JSON_revive_maps(key, value) {
    if (typeof value === "object" && value !== null) {
      if (value.dataType === "Map") {
	return new Map(value.value);
      }
    }
    return value;
  }

  /*
   * Restore app state from browser local-storage.
   */
  restore_state() {
    let bench_state = localStorage.getItem('bench_state');
    if (bench_state) {
      let new_state = JSON.parse(bench_state, this.JSON_revive_maps);
      new_state.state_is_live = true;
      if (new_state.username === null)
	new_state.login_required = true;
      this.setState(new_state);
    } else {
      this.setState({login_required: true});
    }
  }

  /*
   * Save the app state to the browser local-storage.
   */
  save_state() {
    let bench_state = JSON.stringify(this.state, this.JSON_stringify_maps);
    localStorage.setItem('bench_state', bench_state);
  }

  save_state_to_server() {
    if (this.state.username === null)
      return;

    const url = window.location.href + 'save';
    const data = JSON.stringify(this.state, this.JSON_stringify_maps);

    fetch(url, { method: 'POST',
		 headers: {
		   'Content-Type': 'application/json',
		 },
		 body: data,
	       })
      .then((response) => {
	if (!response.ok) {
	  throw Error(response.statusText);
	}
      })
      .then(() => {
	this.setState({needs_save: false});
      })
      .catch((error) => {
	alert('Error:', error);
      });
  }

  load_state_from_server() {
    if (this.state.username === null)
      return;

    const url = window.location.href + 'load?u=' + this.state.username;

    fetch(url)
      .then((response) => {
	if (response.ok) {
	  return response.text();
	} else if (response.status === 404) {
	  return null;
	} else {
	  throw Error(response.statusText);
	}
      })
      .then((data) => {
	if (data !== null) {
	  let new_state = JSON.parse(data, this.JSON_revive_maps);
	  this.setState(new_state);
	}
      })
      .catch((error) => {
	alert('Error loading state from server', error);
      });
  }

  do_save(event) {
    this.save_state_to_server();
    event.preventDefault();
  }
  
  do_logout(event) {
    this.save_state_to_server();
    this.clear_state();
    this.setState({login_required: true});
    event.preventDefault();
  }
  
  set_username(event) {
    this.setState({ username: event.target.value });
  }

  do_login(event) {
    this.load_state_from_server();
    if (this.state.username !== null)
      this.setState({ login_required: false });
  }
  
  /* Note a relevant document. */
  add_relevant(docno, extent = true) {
    if (this.state.cur_topic === -1) {
      return;
    }
    let topics = this.state.topics;
    let qrels = topics[this.state.cur_topic].qrels;
    if (this.state.cur_req !== -1) {
      /* Request-level relevant doc */
      qrels = topics[this.state.cur_topic].requests[this.state.cur_req].qrels;
    }
    qrels.set(docno, extent);
    this.setState({ topics: topics, needs_save: true });
  }

  /* Remove a relevant document */
  remove_relevant(docno) {
    if (this.state.cur_topic === -1) {
      return;
    }
    let topics = this.state.topics;
    let qrels = topics[this.state.cur_topic].qrels;
    if (this.state.cur_req !== -1) {
      /* remove request-level relevant doc */
      qrels = topics[this.state.cur_topic].requests[this.state.cur_req].qrels;
    }
    qrels.delete(docno);
    this.setState({ topics: topics, needs_save: true });
  }

  /* Note a change to the topic writeup */
  change_writeup(name, value) {
    if (this.state.cur_topic === -1) {
      return;
    }
    let topics = this.state.topics;
    let writeup = topics[this.state.cur_topic].writeup;
    writeup[name] = value;
    this.setState({ topics: topics, needs_save: true });
  }

  change_reqtext(topic, request, value) {
    let topics = this.state.topics;
    let req = topics[topic].requests[request];
    req.req_text = value;
    this.setState({ topics: topics, needs_save: true });
  }
  
  new_topic() {
    let new_topic = empty_topic();
    let topics = this.state.topics;
    let num_topics = topics.push(new_topic);
    this.setState({ topics: topics,
		    cur_topic: num_topics - 1,
		    needs_save: true });
  }

  new_request() {
    if (this.state.cur_topic === -1) {
      return;
    }
    let new_request = empty_request();
    let topics = this.state.topics;
    let num_reqs = topics[this.state.cur_topic].requests.push(new_request);
    this.setState({ topics: topics,
                    cur_req: num_reqs - 1,
                    needs_save: true });
  }
    
  
  /* Remove a topic from the topics array.  This is a function from the topic browser tab. */
  delete_topic(topic_num) {
    if (topic_num < 0 || topic_num > this.state.topics.length)
      return;
    let topics = this.state.topics;
    topics.splice(topic_num, 1);
    this.setState({ cur_topic: -1,
		    topics: topics,
		    needs_save: true
		  });
  }

  /* Remove a topic from the topics array.  This is a function from the topic browser tab. */
  delete_request(topic_num, req_num) {
    if (topic_num < 0 || topic_num > this.state.topics.length)
      return;
    if (req_num < 0 || req_num > this.state.topics[topic_num].requests.length)
      return;
    let topics = this.state.topics;
    let reqs = topics[topic_num].requests;
    reqs.splice(req_num, 1);
    this.setState({ cur_req: -1,
		    topics: topics,
		    needs_save: true
		  });
  }

  set_current_topic(topic_num) {
    if (topic_num < 0 || topic_num > this.state.topics.length)
      return;
    this.setState({ cur_topic: topic_num });
  }

  set_current_request(topic_num, req_num) {
    if (topic_num < 0 || topic_num > this.state.topics.length)
      return;
    if (req_num < 0 || req_num > this.state.topics[topic_num].requests.length)
      return;
    this.setState({ cur_req: req_num });
  }

  /* Search up the element hierarchy for an element with the given attribute,
     and return the value of that attribute, or null.
  */
  search_parents(node_or_elem, attr) {
    while (node_or_elem != null) {
      if (node_or_elem instanceof Element && node_or_elem.hasAttribute(attr)) {
        return node_or_elem.getAttribute(attr);
      } else {
        node_or_elem = node_or_elem.parentElement;
      }
    }
    return null;
  }
  
  handle_selection(event) {
    const sel = document.getSelection();
    console.log(sel);
    if (sel.anchorNode.nodeType !== Node.TEXT_NODE) {
      console.log("not in a text node");
      sel.collapse(sel.focusNode, 0);
      return;
    }
    if (!sel.anchorNode.isSameNode(sel.focusNode)) {
      console.log("selection crossed nodes");
      sel.collapse(sel.focusNode, 0);
      return;
    }

    if (!this.search_parents(sel.anchorNode, 'markable')) {
      console.log('not in a markable location');
      return;
    }
    
    const docid = this.search_parents(sel.anchorNode, 'docid');
    if (docid !== null && this.state.cur_topic !== -1) {
      if (sel.isCollapsed) {
        this.remove_relevant(docid);
      } else {
        const start = Math.min(sel.anchorOffset, sel.focusOffset);
        const length = Math.abs(sel.focusOffset - sel.anchorOffset);
        const extent = {"start": start, "length": length, "text": sel.toString()};
        this.add_relevant(docid, extent);
      }
    }
  }

  componentDidUpdate() {
    this.save_state();
  }

  componentDidMount() {
    /* document.addEventListener('selectionchange', this.handle_selection, true); */
    
    if (!this.state.hasOwnProperty('state_is_live')) {
      this.restore_state();
    }
    /* Every five seconds, if we need to save, trigger a save to the server. */
    this.interval = setInterval(() => {
      if (this.state.needs_save) {
	this.save_state_to_server();
      }
    }, 5000);
  }

  componentWillUnmount() {
    /* document.removeEventListener('selectionchange', this.handle_selection, true); */
    clearInterval(this.interval);
  }
  
  render() {
    return (
      <>
	<Modal show={this.state.login_required} onHide={this.do_login}
	       backdrop="static" keyboard={false}>
	  <Modal.Header>
	    <Modal.Title>Please log in</Modal.Title>
	  </Modal.Header>
	  <Modal.Body>
	    <Form.Control type="text"
			  value={this.state.username} onChange={this.set_username}/>
	  </Modal.Body>
	  <Modal.Footer>
	    <Button variant="primary" onClick={this.do_login}>Log in</Button>
	  </Modal.Footer>
	</Modal>
        <Tab.Container defaultActiveKey="search" id="workbench">
	  <Row className="clearfix">
	    <Col sm={12}>
	      <Nav variant="tabs">
		<Nav.Item><Nav.Link eventKey="search">Search English</Nav.Link></Nav.Item>
		<Nav.Item><Nav.Link eventKey="arabic">Search Arabic</Nav.Link></Nav.Item>
		<Nav.Item><Nav.Link eventKey="topics">Topic Editor</Nav.Link></Nav.Item>
		<Nav.Item className="ml-auto">
		  <NavDropdown eventKey="user"
			       title={"Logged in as " + this.state.username}
			       id="utils-dropdown"
			       alignRight>
		    <NavDropdown.Item as="li"
				      disabled={!this.state.needs_save}
				      onClick={this.do_save}>
		      { this.state.needs_save ? 'Save' : 'Saved'}
		    </NavDropdown.Item>
		    <NavDropdown.Item as="li" onClick={this.do_logout}>Log out</NavDropdown.Item>
		  </NavDropdown>
		</Nav.Item>
	      </Nav>
	    </Col>
	    <Col sm={12}>
	      <Tab.Content animation>
		<Tab.Pane eventKey="search">
		  <SearchTab index="better_eng"
                             display_doc={BetterDocument}
                             search_facets={{"persons": { "pos": 0, "field": "PERSON.keyword" },
                                             "gpes": { "pos": 1, "field": "GPE.keyword" },
                                             "orgs": { "pos": 2, "field": "ORG.keyword" },
                                             "events": { "pos": 3, "field": "EVENT.keyword" }
                                            }}
                             topics={this.state.topics}
			     cur_topic={this.state.cur_topic}
                             cur_req={this.state.cur_req}
			     add_relevant={this.add_relevant}
			     remove_relevant={this.remove_relevant}/>
		</Tab.Pane>
		<Tab.Pane eventKey="arabic">
		  <SimpleSearchTab index="better_ar"
                                   display_doc={BetterRTLDocument}
                                   topics={this.state.topics}
			           cur_topic={this.state.cur_topic}
                                   cur_req={this.state.cur_req}
			           add_relevant={this.add_relevant}
			           remove_relevant={this.remove_relevant}/>
		</Tab.Pane>
		<Tab.Pane eventKey="topics">
		  <BetterTasks topics={this.state.topics}
			       cur_topic={this.state.cur_topic}
                               cur_req={this.state.cur_req}
			       change_writeup={this.change_writeup}
			       set_current_topic={this.set_current_topic}
			       delete_topic={this.delete_topic}
			       new_topic={this.new_topic}
			       change_reqtext={this.change_reqtext}
			       set_current_request={this.set_current_request}
			       delete_request={this.delete_request}
			       new_request={this.new_request}/>
		</Tab.Pane>
	      </Tab.Content>
	    </Col>
	  </Row>
        </Tab.Container>
      </>
    );
  }
}

export { Workbench as default };
