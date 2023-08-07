FROM python:3.8-alpine

WORKDIR /app

COPY ./http/flask/requirements.txt .

RUN pip install -r requirements.txt

COPY ./calculator.tm.json .
COPY ./http/flask .

ENV TM_PATH=./calculator.tm.json 

ENTRYPOINT [ "python" ]

CMD ["main.py" ]

EXPOSE 5000