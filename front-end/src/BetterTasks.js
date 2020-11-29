import React from "react";

import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

/*
 * <TopicEditor topic_num="1" writeup=(writeup) change_writeup=(fn)/>
 */
class TopicEditor extends React.Component {
  constructor(props) {
    super(props);
    this.change_fields = this.change_fields.bind(this);
  }

  change_fields(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.props.change_writeup(name, value);
  }

  update_request(index, event) {
    this.props.change_reqtext(this.props.topic_num, index, event.target.value);
  }

  delete_request(index, event) {
    this.props.delete_request(this.props.topic_num, index);
  }

  add_request(event) {
    this.props.new_request();
  }
  
  render() {
    let event_key = "topic-" + this.props.topic_num;
    const reldocs = [];
    for (let [docid, extent] of this.props.qrels.entries()) {
      reldocs.push(<li>{docid}: {extent.text}</li>);
    }

    let requests = this.props.requests.map((req, index) => {
      const req_reldocs  = [];
      for (let [docid, extent] of req.qrels.entries()) {
        req_reldocs.push(<li>{docid}: {extent.text}</li>);
      }
      
      return (
        <Form.Group controlId="request-{index}">
        <Form.Label>
          { (index === this.props.cur_req)
            ? <strong>CURRENT: </strong>
            : ''
          }
        Analytic request {index + 1}</Form.Label>
        <div class="d-flex">
          <Form.Control
            className="mr-1"
            type="text"
            value={req.req_text}
            placeholder="An analytic request."
            onFocus={this.props.set_current_request.bind(this, this.props.topic_num, index)}
            onChange={this.update_request.bind(this, index)}
          />
          <Button
            variant="primary"
            onClick={this.delete_request.bind(this, index)}
          >
            delete
          </Button>
        </div>
        <Form.Text className="text-muted">
          Enter a sentence-length information request related to the analytic task.
        </Form.Text>
        <div>
          Request-level relevant documents:
          <ul>{req_reldocs}</ul>
        </div>
        </Form.Group>
      );
    });

    requests.push(
      <Button variant="primary" onClick={this.add_request.bind(this)}>
        Add a request
      </Button>
    );

    
    return (
      <Card>
	<Accordion.Toggle as={Card.Header}
			  variant="link"
			  eventKey={event_key}
			  onClick={this.props.set_current_topic.bind(this, this.props.topic_num)}>
	  
	  { this.props.current
	    ? <strong>CURRENT TOPIC: </strong>
	    : '' }
	  { this.props.writeup.title }
	</Accordion.Toggle>
	<Accordion.Collapse eventKey={event_key}>
	  <Card.Body>
	    <Form.Group controlId="title">
              <Form.Label>Task title</Form.Label>
              <Form.Control
                type="text"
                placeholder="title"
                name="title"
		value={this.props.writeup.title}
                onChange={this.change_fields}
              />
              <Form.Text className="text-muted">
                A brief title for your analytic task.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="desc">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="A sentence-length description of the analytic task."
                name="desc"
		value={this.props.writeup.desc}
                onChange={this.change_fields}
              />
              <Form.Text className="text-muted">
                A single sentence describing the overarching information need.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="narr">
              <Form.Label>Narrative</Form.Label>
              <Form.Control
                as="textarea"
                rows="5"
                placeholder="A narrative paragraph."
                name="narr"
		value={this.props.writeup.narr}
                onChange={this.change_fields}
              />
              <Form.Text className="text-muted">
                An expanded description of the information need, including gray
                areas/areas of interpretation and how you interpreted them as the
                user.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="inscope">
              <Form.Label>In Scope</Form.Label>
              <Form.Control
                as="textarea"
                rows="2"
                placeholder="Information that is in-scope."
                name="inscope"
		value={this.props.writeup.inscope}
                onChange={this.change_fields}
              />
              <Form.Text className="text-muted">
                Aspects of the information that you would consider in-scope.
              </Form.Text>
            </Form.Group>

	    <Form.Group controlId="outscope">
              <Form.Label>Out of Scope</Form.Label>
              <Form.Control
                as="textarea"
                rows="2"
                placeholder="Information that is out of scope."
                name="outscope"
		value={this.props.writeup.outscope}
                onChange={this.change_fields}
              />
              <Form.Text className="text-muted">
                Aspects of the information need that you woule consider to be out of scope.
              </Form.Text>
            </Form.Group>

            <Row className="mt-3">
	      <Col md={10}>
		Task-level Relevant documents:
		<ul>{reldocs}</ul>
	      </Col>
	    </Row>

            <Row className="mt-3">
              <Col md={10}>
                {requests}
              </Col>
            </Row>
            
	    <Button variant="primary" className="mt-3"
		    onClick={this.props.delete_topic.bind(this, this.props.topic_num)}>
	      Delete task
	    </Button>


	  </Card.Body>
	</Accordion.Collapse>
      </Card>
    );
  }
}

/*
 * <Topics topics=(list of topics) current_topic=n 
 *  save_topic=(fn) delete_topic=(fn) new_topic=(fn)/>
 */
class BetterTasks extends React.Component {
  render() {
    let topics = this.props.topics;
    let event_key = "topic-" + this.props.cur_topic;
    
    const topiclist = topics.map((hit, index) => (
      <TopicEditor topic_num={index}
		   writeup={hit.writeup}
		   qrels={hit.qrels}
                   requests={hit.requests}
		   current={index === this.props.cur_topic}
                   cur_req={(index === this.props.cur_topic) ? this.props.cur_req : -1}
		   set_current_topic={this.props.set_current_topic}
		   change_writeup={this.props.change_writeup}
		   delete_topic={this.props.delete_topic}
      		   change_reqtext={this.props.change_reqtext}
		   set_current_request={this.props.set_current_request}
		   delete_request={this.props.delete_request}
		   new_request={this.props.new_request}/>
    ));

    return (
      <Container>
	<Row className="justify-content-md-center mt-5">
	  <Col md={10}>
	    <Button variant="primary" onClick={this.props.new_topic}>Create new task</Button>
	    <Accordion defaultActiveKey={"topic-" + this.props.cur_topic}>
	      {topiclist}
	    </Accordion>
	  </Col>
	</Row>
      </Container>
    );
  }
}

export { BetterTasks as default };

