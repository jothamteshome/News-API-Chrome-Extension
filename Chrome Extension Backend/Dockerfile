FROM ubuntu:20.04

# Update Ubuntu Software repository
RUN apt update
RUN apt-get update
RUN apt -y install python3-pip
RUN apt -y install vim

# Add the Flask application and install requirements
RUN mkdir /app
COPY . /app
WORKDIR /app
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Open ports, set environment variables, start the application.
EXPOSE 8080 
ENV PORT 8080
ENV FLASK_ENV=development
CMD exec python3 app.py
# ----------------------------------------------------- 