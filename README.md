This is a simple search interface meant to support basic and faceted search on top of ElasticSearch.

The backend is in Python 3 using Flask.  The backend is very simple, it's main job is to take queries from the front end and send them to ElasticSearch, and pass the results back.  To set it up, you should make a virtual environment and install the requirements:

```sh
python3 -m venv venv
. venv/bin/activate
pip install -r requirements.txt
```

You may need to update the `server.py` to match your Elastic setup.  It takes command-line options for the Elastic connection and index name, but information about faceted fields and default fields to search are hard-coded at the moment to match an index I'm working with right now.

To start the backend, make sure you have the environment activated (`. venv/bin/activate`) and then do `python3 server.py`.  It will start a little webserver on localhost:5000.

The frontend is in React and React-Boostrap.  The Python backend serves all files.  To get it compiled, you will need NodeJS v13+ and npm 6+ installed.  Then, `npm build` will compile the JavaScript resources into minified form for serving.

If you want to modify the front-end (and who wouldn't) you will need to run `npm build` to compile things into the `front-end/build` directory that the backend is serving out of.  There is a `npm run watch` script in the `package.json` file which will watch files for changes and recompile, this might be handy if you're doing significant development.
