from flask import Flask, render_template, request, make_response
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search
from elasticsearch_dsl.query import Q

import argparse
import json

if (__name__ == '__main__'):
    argparser = argparse.ArgumentParser(description='An Elastic interface server', formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    argparser.add_argument('--host', help='ElasticSearch host', default='localhost')
    argparser.add_argument('--port', help='ElasticSearch port', default=9200)
    argparser.add_argument('--index', help='Index to search against', default='better')
    args = argparser.parse_args()
else:
    args = argparse.Namespace(**{'host': 'localhost',
                                 'port': 9200,
                                 'index': 'better'})


app = Flask(__name__, static_folder='../front-end/build/static', template_folder='../front-end/build')
es = Elasticsearch([{'host': args.host, 'port': args.port}])

agg2field = {
    'persons': 'PERSON.keyword',
    'orgs': 'ORG.keyword',
    'gpes': 'GPE.keyword',
    'events': 'EVENT.keyword',
}


@app.route('/')
def hello():
    return render_template('index.html')


# This is not currently being used, but I'm keeping it so I remember how to
# ship a file back to the browser, not that it worked.
@app.route('/save', methods=['POST'])
def save():
    data = {}
    resp = None

    if request.method == 'POST':
        data = request.get_json()
        app.logger.debug('Got save: ' + json.dumps(data))
        resp = make_response(json.dumps(data))
        resp.headers['Content-Disposition'] = 'attachment'
        return resp
    else:
        app.logger.debug('Save error')
        return render_template('/', error = 'Error in data')


@app.route('/search')
def search():
    query = request.args['q']

    # Build the query
    # This is the query from the search box
    search = Search(using=es, index=args.index)
    search = search.query(Q('match', text=query))

    # Add in any checked facets.  These do not filter the results but
    # influence the ranking.
    if 'facets' in request.args:
        qlist = []
        facets = request.args['facets'].split(",")
        for f in facets:
            (cat, key) = f.split('-', 1)
            qlist.append(Q('match', **{agg2field[cat]: key}))
        search.query = Q('bool',
                         must=search.query,
                         should=qlist,
                         minimum_should_match=1)

    # Add search term highlighting.  The <mark> tag is a Bootstrap-ism.
    search = search.highlight('text')
    search = search.highlight_options(pre_tags='<mark>',
                                      post_tags='</mark>',
                                      number_of_fragments=0)

    # Add in aggregations for the facet fields
    for (agg, field) in agg2field.items():
        search.aggs.bucket(agg, 'terms', field=field)

    # Add in what page we are fetching.  If not specified, the first 10 results.
    if 'page' in request.args:
        s_from = 10 * (int(request.args['page']) - 1)
        if s_from < 0 or s_from > 9999:
            s_from = 0
        search = search[s_from:s_from + 10]

    # I like reading the query in the logs, but that might just be me.
    app.logger.debug(json.dumps(search.to_dict()))

    response = search.execute()

    app.logger.debug(response)
    return response.to_dict()

if __name__ == '__main__':
    print('Starting Flask...')
    app.debug = True
    app.run(host = '0.0.0.0')
