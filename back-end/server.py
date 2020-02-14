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

agg2field = {
    'persons': 'PERSON.keyword',
    'orgs': 'ORG.keyword',
    'gpes': 'GPE.keyword',
    'events': 'EVENT.keyword',
}


@app.route('/')
def hello():
    return render_template('index.html')


@app.route('/search')
def search():
    query = request.args['q']

    search = Search(using=es, index=args.index)
    search = search.query(Q('match', text=query))

    if 'facets' in request.args:
        qlist = []
        facets = request.args['facets'].split(",")
        for f in facets:
            (cat, key) = f.split('-', 1)
            # search = search.filter('term', **{agg2field[cat]: key})
            qlist.append(Q('match', **{agg2field[cat]: key}))
        search.query = Q('bool',
                         must=search.query,
                         should=qlist,
                         minimum_should_match=1)

    search = search.highlight('text')
    search = search.highlight_options(pre_tags='<mark>',
                                      post_tags='</mark>',
                                      number_of_fragments=0)
    for (agg, field) in agg2field.items():
        search.aggs.bucket(agg, 'terms', field=field)

    if 'from' in request.args:
        s_from = int(request.args['from'])
        s_size = int(request.args.get('size', 10))
        search = search[s_from:s_size]
        
    app.logger.debug(json.dumps(search.to_dict()))

    response = search.execute()

    app.logger.debug(response)
    return response.to_dict()


print('Starting Flask...')
app.debug = True
app.run(host = '0.0.0.0')
