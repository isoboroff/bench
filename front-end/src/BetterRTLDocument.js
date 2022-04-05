import React from 'react';

function BetterRTLDocument(props) {
  const display_doc = (content_obj) => {
    return (
      <div>
        <h1 dir="rtl" className="text-right"> {props.title} </h1>
        <p> {props.date}</p>
        <p dir="rtl" className="text-right article-text"> {content_obj.text} </p>
      </div>
    );
  };

  if (props.content) {
    return (
      <>{display_doc(props.content)}</>
    );
  } else {
    return (<p>waiting for document...</p>);
  }
}

export { BetterRTLDocument as default };
