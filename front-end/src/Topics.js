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

  render() {
	let event_key = "topic-" + this.props.topic_num;
	const reldocs = [];
	for (let docno of this.props.qrels.keys()) {
	  reldocs.push(<li>{docno}</li>);
	}
	
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
                A brief title for your topic, two to four key words.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="task">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="A sentence-length description of the analytic task."
                name="desc"
				value={this.props.writeup.desc}
                onChange={this.change_fields}
              />
              <Form.Text className="text-muted">
                A single sentence describing the information need.
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
                areas/areas of interpretation and scoping rules, and how you
                interpreted them as the user.
              </Form.Text>
            </Form.Group>

			<Row className="mt-3">
			  <Col md={10}>
				Relevant documents:
				<ul>{reldocs}</ul>
			  </Col>
			</Row>

			<Button variant="primary" className="mt-3"
					onClick={this.props.delete_topic.bind(this, this.props.topic_num)}>
			  Delete
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
class Topics extends React.Component {
  render() {
	let topics = this.props.topics;
	let event_key = "topic-" + this.props.cur_topic;
	
	const topiclist = topics.map((hit, index) => (
	  <TopicEditor topic_num={index}
				   writeup={hit.writeup}
				   qrels={hit.qrels}
				   current={index === this.props.cur_topic}
				   set_current_topic={this.props.set_current_topic}
				   change_writeup={this.props.change_writeup}
				   delete_topic={this.props.delete_topic}/>
	));

	return (
	  <Container>
		<Row className="justify-content-md-center mt-5">
		  <Col md={10}>
			<Button variant="primary" onClick={this.props.new_topic}>Create new topic</Button>
			<Accordion defaultActiveKey={event_key}>
			  {topiclist}
			</Accordion>
		  </Col>
		</Row>
	  </Container>
	);
  }
}

export { Topics as default };

