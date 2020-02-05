from flask import Flask, render_template, request
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search
from elasticsearch_dsl.query import Q

import argparse
import json

argparser = argparse.ArgumentParser(description='An Elastic interface server', formatter_class=argparse.ArgumentDefaultsHelpFormatter)
argparser.add_argument('--host', help='ElasticSearch host', default='localhost')
argparser.add_argument('--port', help='ElasticSearch port', default=9200)
argparser.add_argument('--index', help='Index to search against', default='better')
args = argparser.parse_args()


app = Flask(__name__, static_folder='../front-end/build/static', template_folder='../front-end/build')
es = Elasticsearch([
    {'host': args.host, 'port': args.port}
])


@app.route('/')
def hello():
    return render_template('index.html')


@app.route('/search')
def search():
    query = request.args['q']

    search = Search(using=es, index=args.index)
    search = search.query(Q('match', text=query))
    search = search.highlight('text')
    search = search.highlight_options(pre_tags='<mark>',
                                      post_tags='</mark>',
                                      number_of_fragments=0)
    search.aggs.bucket('persons', 'terms', field='PERSON.keyword')
    search.aggs.bucket('orgs', 'terms', field='ORG.keyword')
    search.aggs.bucket('gpes', 'terms', field='GPE.keyword')
    search.aggs.bucket('events', 'terms', field='EVENT.keyword')

    app.logger.debug(json.dumps(search.to_dict()))
    
    response = search.execute()

    app.logger.debug(response)
    return response.to_dict()


print('Starting Flask...')
app.debug = True
app.run(host = '0.0.0.0')
