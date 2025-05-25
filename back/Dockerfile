FROM python:3.11-slim

# Set environment
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create app directory
WORKDIR /app

# Install dependencies
COPY req.txt .
RUN pip install --no-cache-dir -r req.txt

# Copy app and certs
COPY . .

# Expose port
EXPOSE 8090

# Run app with SSL
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8090", "--ssl-keyfile=key.key", "--ssl-certfile=cert.crt"]
