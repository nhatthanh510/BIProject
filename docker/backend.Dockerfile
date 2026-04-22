FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DJANGO_SETTINGS_MODULE=cube_bi.settings.prod

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt gunicorn

COPY . /app/

RUN python manage.py collectstatic --noinput || true

EXPOSE 8000
CMD ["gunicorn", "cube_bi.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
