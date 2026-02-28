# Backend Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/main.py ./backend/
COPY backend/README.md ./backend/

# Copy models
COPY saved_models/ ./saved_models/

WORKDIR /app/backend

EXPOSE 8000

CMD ["python", "main.py"]
