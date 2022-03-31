from flask import Flask, render_template, request, make_response, jsonify
from patapsco import ConfigHelper, DocumentDatabase, Query, QueryProcessor, RetrieverFactory

import argparse
import json
import sys
import re
from pathlib import Path
from datetime import datetime

if (__name__ == '__main__'):
    argparser = argparse.ArgumentParser(description='An Elastic interface server', formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    argparser.add_argument('--conf', help='Config for Patapsco run locations', default='patapsco.json')
    argparser.add_argument('--save', help='Location for saved data', default='save_dir')
    args = argparser.parse_args()
else:
    args = argparse.Namespace(**{'save': 'save_dir',
                                 'conf': 'patapsco.json',
                                 })

app = Flask(__name__, static_folder='../front-end/build/static', template_folder='../front-end/build')



class Pat:
    def __init__(self, runpath):
        # This setup is adapted from patapsco/bin/web.py
        app.logger.debug(f'Initializing {runpath}')
        self.runpath = Path(runpath).absolute()
        self.config_path = self.runpath / 'config.yml'
        self.config = ConfigHelper.load(str(self.config_path))

        self.db = DocumentDatabase(str(self.runpath), self.config.database.output, True)
        self.lang = self.config.topics.input.lang
        self.qproc = QueryProcessor(str(self.runpath), self.config.queries, self.lang)
        self.qproc.begin()
        self.retriever = RetrieverFactory.create(str(self.runpath), self.config.retrieve)
        self.retriever.begin()

    def doc(self, id):
        if id in self.db:
            return self.db[id]
        else:
            return None

    def search(self, query_str):
        query = Query(id='web',
                      lang=self.lang,
                      query=query_str,
                      text=query_str,
                      report=None)
        query = self.qproc.process(query)
        return self.retriever.process(query)

patconf = json.load(open(args.conf, 'r'))
indexes = {}
for lang, runpath in patconf['indexes'].items():
    indexes[lang] = Pat(runpath)

print(indexes)
    
Path(args.save).mkdir(exist_ok=True)

def log(user, event):
    with open(Path(args.save) / f'{user}.log', 'a') as fp:
        print(datetime.now(), event, file=fp)

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
            with open(Path(args.save) / save_location, 'w') as fp:
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
        with open(Path(args.save) / username, 'r') as fp:
            data = fp.read()
            _ = json.loads(data)
            log(username, 'Load')
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
    user = request.args['u']
    query = request.args['q']
    index = request.args['index']

    if index not in indexes:
        return('', 404)

    app.logger.debug(f'{user}: {query}')
    log(user, query)

    response = indexes[index].search(query)

    app.logger.debug(response)
    log(user, response)
    return jsonify(response)

if __name__ == '__main__':
    print('Starting Flask...')
    app.debug = True
    app.run(host = '0.0.0.0')
