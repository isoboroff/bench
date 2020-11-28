import React from 'react';
import Markup from 'interweave';

function BetterDocument(props) {
  const display_doc = (content_string) => {
    let obj = null;
    try {
      obj = JSON.parse(content_string);
    } catch (error) {
      console.error(error);
      return '';
    }

    let meta = obj['derived-metadata'];
    let doctext = meta.text;
    
    if (props.rel) {
      const start = props.rel.start;
      const end = start + props.rel.end;
      const prefix = doctext.slice(0, start);
      const span = doctext.slice(start, end);
      const suffix = doctext.slice(end);
      doctext = <> {prefix} <mark> {span} </mark> {suffix} </>;
    }
    
    return (
      <div>
        <h1> {props.title}... </h1>
        <p> (best guess on publication date is '{props.date}')</p>
        <p><strong> {obj['WARC-Target-URI']} </strong></p>
        <p> {doctext} </p>
        <p><strong> ({meta['warc-file']})</strong></p>
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

export { BetterDocument as default };
