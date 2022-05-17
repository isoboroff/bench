import React from 'react';

function NeuCLIRDocument(props) {
  const display_doc = (content_obj) => {
    let title_class = '';
    let article_class = 'article-text';
    if (props.direction && props.direction === 'rtl') {
      title_class = 'text-right';
      article_class = article_class + ' text-right';
    }

    let doctext = content_obj.text;
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
        <h1 dir={props.direction} className={title_class}> {props.title} </h1>
        <p> {props.date}</p>
        <p dir={props.direction} className={article_class}> {doctext} </p>
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

export { NeuCLIRDocument as default };
