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
class NewsTopicEditor extends React.Component {
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

  update_subtopic(index, event) {
    this.props.change_subtext(this.props.topic_num, index, event.target.value);
  }

  delete_subtopic(index, event) {
    this.props.delete_subtopic(this.props.topic_num, index);
  }

  add_subtopic(event) {
    this.props.new_subtopic();
  }
  
  render() {
    let event_key = "topic-" + this.props.topic_num;
    const reldocs = [];
    for (let [docid, extent] of this.props.qrels.entries()) {
      reldocs.push(<li>{docid}: {extent.text}</li>);
    }

    let subtopics = this.props.subtopics.map((sub, index) => {
      const sub_reldocs  = [];
      for (let [docid, extent] of sub.qrels.entries()) {
        sub_reldocs.push(<li>{docid}: {extent.text}</li>);
      }
      
      return (
        <Form.Group controlId="subtopic-{index}">
        <Form.Label>
          { (index === this.props.cur_sub)
            ? <strong>CURRENT: </strong>
            : ''
          }
        Subtopic {index + 1}</Form.Label>
        <div class="d-flex">
          <Form.Control
            className="mr-1"
            type="text"
            value={sub.sub_text}
            placeholder="A subtopic."
            onFocus={this.props.set_current_subtopic.bind(this, this.props.topic_num, index)}
            onChange={this.update_subtopic.bind(this, index)}
          />
          <Button
            variant="primary"
            onClick={this.delete_subtopic.bind(this, index)}
          >
            delete
          </Button>
        </div>
        <Form.Text className="text-muted">
          Enter a sentence-length description of the subtopic.
        </Form.Text>
        <div>
          Subtopic-level relevant documents:
          <ul>{sub_reldocs}</ul>
        </div>
        </Form.Group>
      );
    });

    subtopics.push(
      <Button variant="primary" onClick={this.add_subtopic.bind(this)}>
        Add a subtopic
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
              <Form.Label>Topic title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Topic title"
                name="title"
		value={this.props.writeup.title}
                onChange={this.change_fields}
              />
              <Form.Text className="text-muted">
                A brief title for the topic, two to four words.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="desc">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="A sentence-length description of the information need."
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
                areas/areas of interpretation and how you interpreted them as the
                user.
              </Form.Text>
            </Form.Group>

            <Row className="mt-3">
	      <Col md={10}>
		Topic-level Relevant documents:
		<ul>{reldocs}</ul>
	      </Col>
	    </Row>

            <Row className="mt-3">
              <Col md={10}>
                {subtopics}
              </Col>
            </Row>
            
	    <Button variant="primary" className="mt-3"
		    onClick={this.props.delete_topic.bind(this, this.props.topic_num)}>
	      Delete topic
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
class NewsTopics extends React.Component {
  render() {
    let topics = this.props.topics;
    
    const topiclist = topics.map((hit, index) => (
      <NewsTopicEditor topic_num={index}
		       writeup={hit.writeup}
		       qrels={hit.qrels}
                       subtopics={hit.subtopics}
		       current={index === this.props.cur_topic}
                       cur_sub={(index === this.props.cur_topic) ? this.props.cur_sub : -1}
		       set_current_topic={this.props.set_current_topic}
		       change_writeup={this.props.change_writeup}
		       delete_topic={this.props.delete_topic}
      		       change_subtext={this.props.change_subtext}
		       set_current_subtopic={this.props.set_current_subtopic}
		       delete_subtopic={this.props.delete_subtopic}
		       new_subtopic={this.props.new_subtopic}/>
    ));

    return (
      <Container>
	<Row className="justify-content-md-center mt-5">
	  <Col md={10}>
	    <Button variant="primary" onClick={this.props.new_topic}>Create new topic</Button>
	    <Accordion defaultActiveKey={"topic-" + this.props.cur_topic}>
	      {topiclist}
	    </Accordion>
	  </Col>
	</Row>
      </Container>
    );
  }
}

export { NewsTopics as default };

