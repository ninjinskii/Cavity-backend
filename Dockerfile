# syntax=docker/dockerfile:1

FROM python:3.10.0-slim-buster
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt requirements.txt

RUN adduser --system --group flask && \
  mkdir -p /home/flask/.local/bin

ENV PYTHONPATH "${PYTHONPATH}:/home/flask/.local/bin"
ENV PATH "${PATH}:/home/flask/.local/bin"
RUN chown -R flask /home/flask/.local
USER flask

RUN pip3 install -r requirements.txt

COPY . .
