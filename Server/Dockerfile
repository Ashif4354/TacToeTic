FROM python:3.13-alpine

WORKDIR /app

RUN pip install --upgrade pip

RUN pip install poetry

COPY pyproject.toml poetry.lock .

RUN poetry config virtualenvs.create false 

RUN poetry install

COPY . .

EXPOSE 10000

CMD ["hypercorn", "main:app", "--bind", "0.0.0.0:10000", "--workers", "1"]

