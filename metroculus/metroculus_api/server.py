import os
import logging
import argparse

import tornado.ioloop
import tornado.web

from optscale_client.config_client.client import Client as ConfigClient

import metroculus.metroculus_api.handlers.v2 as handlers
from metroculus.metroculus_api.urls import urls_v2


DEFAULT_PORT = 8969
DEFAULT_ETCD_HOST = 'etcd'
DEFAULT_ETCD_PORT = 2379

LOG = logging.getLogger(__name__)

BASEDIR_NAME = os.path.dirname(__file__)
BASEDIR_PATH = os.path.abspath(BASEDIR_NAME)
SWAGGER_PATH = os.path.join(BASEDIR_PATH, 'swagger')


def get_handlers(handler_kwargs):
    # pylint: disable=E1101
    return [
        (urls_v2.activity_breakdown,
         handlers.activity_breakdown.ActivityBreakdownHandler, handler_kwargs),
        (urls_v2.agr_metrics,
         handlers.agr_metrics.AgrMetricsCollectionHandler, handler_kwargs),
        (urls_v2.metrics,
         handlers.metrics.MetricsCollectionHandler, handler_kwargs),
        (urls_v2.k8s_metrics,
         handlers.k8s_metrics.K8sMetricsCollectionHandler, handler_kwargs)
    ]


def get_swagger_urls():
    return [
        (r'%s/swagger/(.*)' % urls_v2.url_prefix,
         handlers.swagger.SwaggerStaticFileHandler, {'path': SWAGGER_PATH}),
        (r"%s/?" % urls_v2.url_prefix, tornado.web.RedirectHandler,
         {"url": "%s/swagger/spec.html" % urls_v2.url_prefix}),
    ]


def make_app(etcd_host, etcd_port, wait=False):
    config_cl = ConfigClient(host=etcd_host, port=etcd_port)
    if wait:
        config_cl.wait_configured()
    config_cl.tell_everybody_that_i_am_ready()
    handler_kwargs = {
        "config": config_cl,
    }

    return tornado.web.Application(
        get_handlers(handler_kwargs) + get_swagger_urls(),
        default_handler_class=handlers.base.DefaultHandler)


def main():
    logging.basicConfig(level=logging.INFO)

    etcd_host = os.environ.get('HX_ETCD_HOST', DEFAULT_ETCD_HOST)
    etcd_port = os.environ.get('HX_ETCD_PORT', DEFAULT_ETCD_PORT)

    parser = argparse.ArgumentParser()
    parser.add_argument('--etcdhost', type=str, default=etcd_host)
    parser.add_argument('--etcdport', type=int, default=etcd_port)
    args = parser.parse_args()

    app = make_app(args.etcdhost, args.etcdport, wait=True)
    LOG.info("start listening on port %d", DEFAULT_PORT)
    app.listen(DEFAULT_PORT, decompress_request=True)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
