FROM python:3.9.16-slim
MAINTAINER Hystax

WORKDIR /usr/src/app/
ENV PYTHONPATH /usr/src/app/

COPY optscale_client/config_client optscale_client/config_client

COPY docker_images/configurator/requirements.txt docker_images/configurator/
RUN pip install --no-cache-dir -r docker_images/configurator/requirements.txt

COPY docker_images/configurator/configurator.py docker_images/configurator/

CMD ["python", "docker_images/configurator/configurator.py", "/config/config"]
