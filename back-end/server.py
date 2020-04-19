from flask import Flask, render_template, request, make_response
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search
from elasticsearch_dsl.query import Q

import argparse
import json
import sys
import re
from pathlib import Path

if (__name__ == '__main__'):
    argparser = argparse.ArgumentParser(description='An Elastic interface server', formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    argparser.add_argument('--host', help='ElasticSearch host', default='localhost')
    argparser.add_argument('--port', help='ElasticSearch port', default=9200)
    argparser.add_argument('--save', help='Location for saved data', default='save_dir')
    argparser.add_argument('--index', help='Index to search against', default='wapo')
    args = argparser.parse_args()
else:
    args = argparse.Namespace(**{'host': 'elastic',
                                 'port': 9200,
                                 'save': 'save_dir',
                                 'index': 'wapo'})


app = Flask(__name__, static_folder='../front-end/build/static', template_folder='../front-end/build')
es = Elasticsearch([{'host': args.host, 'port': args.port}])

agg2field = {
    'persons': 'PERSON.keyword',
    'orgs': 'ORG.keyword',
    'gpes': 'GPE.keyword',
    'events': 'EVENT.keyword',
}

Path(args.save).mkdir(exist_ok=True)


@app.route('/')
def hello():
    return render_template('index.html')


@app.route('/save', methods=['POST'])
def save():
    data = {}

    if request.method == 'POST':
        data = request.get_json()
        save_location = data['username']
        if not re.match(r'[a-z]+', save_location):
            app.logger.debug('Bad filename for save: ' + save_location)
            return('', 503)

        try:
            with open(save_location, 'w') as fp:
                print(json.dumps(data), file=fp)
        except Exception:
            app.logger.debug('Save failed: ' + sys.exc_info()[0])
        finally:
            app.logger.debug('Got save: ' + json.dumps(data))
            return ('', 204)
    else:
        app.logger.debug('Save called without POST')
        return('', 405)


@app.route('/load')
def load():
    username = request.args['u']
    if not re.match(r'[a-z]+', username):
        app.logger.debug('Load called with bad username: ' + username)
        return('', 404)
    try:
        with open(username, 'r') as fp:
            data = fp.read()
            _ = json.loads(data)
            return(data, 200)
    except FileNotFoundError:
        app.logger.debug('No such user: ' + username)
        return('', 404)
    except IOError:
        app.logger.debug('I/O error reading for ' + username)
        return('', 503)
    except json.JSONDecodeError:
        app.logger.debug('Invalid JSON in save file: ' + data)
        return('', 503)


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
