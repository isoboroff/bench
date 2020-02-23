## Intro

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

Note that the frontend knows about the search facet fields because their order on the SERP is specified there.

If you want to modify the front-end (and who wouldn't) you will need to run `npm build` to compile things into the `front-end/build` directory that the backend is serving out of.  There is a `npm run watch` script in the `package.json` file which will watch files for changes and recompile, this might be handy if you're doing significant development.

## Deployment

The parts are here to deploy the system on two Docker containers using docker-compose.  One container is the app, bundled with nginx for serving, and the second container is a stock Elasticsearch 7.6.0 container.  To use Docker, clone the project, build the front-end (`cd front-end; npm run build`), and then do:

```sh
docker-compose up -d
```

will fire it up.  There are two gotchas.  The first is that the back-end/server.py has to know the hostname of the Elastic container.  This hack is near the top of the script... it looks for 'elastic' rather than 'localhost' if it's started from nginx.  The second problem is how to get to the index.  Currently it expects a directory `elastic-data` that contains the index to be in the current directory where you run `docker-compose`.  I'm still working on how to package it up and run it with the image.
