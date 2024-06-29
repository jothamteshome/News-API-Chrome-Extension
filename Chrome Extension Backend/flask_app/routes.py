import json
import time
import requests
import os

from flask import current_app as app
from flask import jsonify
from dotenv import load_dotenv

load_dotenv()

ONE_HOUR_NANOSECONDS = 3600000000000

# Cache fresh news content to jsonfile
def cacheNewsContent(category, country, content):
    # Dump fresh content to cache file
    with open(f'flask_app/cached_news_articles/{category}_{country}_cache.json', "w", encoding='utf-8') as contentCache:
        json.dump(content, contentCache)

    # Update "last updated time" value
    with open(f'flask_app/cached_news_articles/last_updated.json', "r", encoding='utf-8') as lastUpdatedFile:
        lastUpdated = json.load(lastUpdatedFile)

        if lastUpdated.get(category, False):
            lastUpdated[category][country] = time.time_ns()
        else:
            lastUpdated[category] = {country: time.time_ns()}

    # Save last updated time    
    with open(f'flask_app/cached_news_articles/last_updated.json', "w", encoding='utf-8') as lastUpdatedFile:
        json.dump(lastUpdated, lastUpdatedFile)


# Load cached news from json file
def loadCachedNews(category, country):
    with open(f'flask_app/cached_news_articles/{category}_{country}_cache.json', "r", encoding='utf-8') as contentCache:
        return json.load(contentCache)
    

# Returns true if update should happen
def checkShouldUpdate(category, country):
    with open(f'flask_app/cached_news_articles/last_updated.json', "r", encoding='utf-8') as lastUpdatedFile:
        lastUpdated = json.load(lastUpdatedFile)

        # Check for the last time category country data was updated
        if lastUpdated.get(category, False):
            timeLastUpdated = lastUpdated[category].get(country, 1)

            # Return false if one hour has not passed since last update
            if (time.time_ns() - ONE_HOUR_NANOSECONDS) < timeLastUpdated:
                return False

        return True


@app.route('/retrieveNewsContent/<category>/<country>', methods=['GET'])
def retrieveNewsContent(category, country):
    url = f"https://newsapi.org/v2/top-headlines?country={country}&category={category}&apiKey={os.getenv('API_KEY')}"

    # Check if latest cached content is stale (1 hour)
    if checkShouldUpdate(category, country):
        # Get API News data
        response = requests.get(url)

        # If status of response is good, cache then return fresh content,
        # otherwise return previously cached content
        if response.status_code == 200:
            cacheNewsContent(category, country, response.json())
            response = response.json()
        else:
            response = loadCachedNews(category, country)

    # If cached content is not stale, return cached content instead
    else:
        response = loadCachedNews(category, country)

    
    response = jsonify(response)

    response.headers.add('Access-Control-Allow-Origin', "*")

    print(response)

    return response

    