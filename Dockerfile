FROM python:3.10.0-slim-buster
USER python

WORKDIR /app


COPY ./requirements.txt /app/requirements.txt
COPY . /app

RUN pip install -r requirements.txt

CMD ["python","app.py"]
