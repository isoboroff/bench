FROM python:3.8

RUN apt-get update
RUN apt-get install -y --no-install-recommends \
	nginx supervisor

COPY back-end /bench
COPY front-end /bench

RUN pip3 install /bench/requirements.txt

RUN useradd --no-create-home nginx

RUN rm /etc/nginx/sites-enabled/default
RUN rm -r /root/.cache

COPY docker-conf/nginx.conf /etc/nginx/
COPY docker-conf/flask-site-nginx.conf /etc/nginx/conf.d/
COPY docker-conf/uwsgi.ini /etc/uwsgi/
COPY docker-conf/supervisord.conf /etc/supervisor/

WORKDIR /bench

CMD ["/usr/bin/supervisord"]
