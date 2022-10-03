import React from 'react';
import Markup from 'interweave';

function BetterP3DevDoc(props) {
  const display_doc = (obj) => {
    let doctext = obj['text']

    if (props.rel) {
      const start = props.rel.start;
      const end = start + props.rel.length;
      const prefix = doctext.slice(0, start);
      const span = doctext.slice(start, end);
      const suffix = doctext.slice(end);
      doctext = <> {prefix} <mark> {span} </mark> {suffix} </>;
    }

    return (
      <div>
        <h1> {props.title}... </h1>
        <p> (best guess on publication date is '{props.date}')</p>
        <p><strong> {obj['host']} </strong></p>
        <p className="article-text"> {doctext} </p>
        <p><strong> ({obj['url']})</strong></p>
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

export { BetterP3DevDoc as default };
