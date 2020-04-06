import React from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

class TopicList extends React.Component {
  topic_title(t) {
	let writeup = JSON.parse(t.writeup);
	return writeup.title;
  }
  
  render_topics() {
	if (this.props.topics.length === 0) {
	  return (
		<h3> No saved topics.</h3>
	  );
	} else {
	  const current = this.props.current_topic;
	  let topics = this.props.topics.map((t, index) => {
		let load_button;
		if (index === current) {
		  load_button = (<Button variant="primary" className="p-2 ml-3" disabled>Loaded</Button>);
		} else {
		  load_button = (<Button
						 variant="primary"
						 className="p-2 ml-3"
						 onClick={this.props.load_topic.bind(this, index)}>Load</Button>);
		}
		return (
		  <div className="d-flex">
			<div className="mr-auto">
			  {this.topic_title(t)}
			</div>
			{load_button}
			<Button variant="primary"
					className="p-2 ml-3"
					onClick={this.props.delete_topic.bind(this, index)}>Delete</Button>
		  </div>
		);
	  });
	  
	  return topics;
	}
  }
  
  render() {
    return (
	  <Container>
		<Row className="justify-content-md-center mt-5">
		  <Col md={10}>
			<div> {this.render_topics()} </div>
		  </Col>
		</Row>
	  </Container>
    );
  }
}

export { TopicList as default };
