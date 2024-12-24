import requests
import time
import random
from bs4 import BeautifulSoup

from custom_exception import MyCustomError, ErrorCode
from my_env_secrets import SCRAPE_LIMIT


# base_url = "https://www.jofogas.hu/magyarorszag"


def scrape_first_page(url, query_term):
    try:
        params = {
            "q": query_term,
            "o": 1,
        }

        response = requests.get(url, params=params)
        response.raise_for_status()

        # ads
        soup = BeautifulSoup(response.text, 'html.parser')
        content_areas = soup.find_all('div', class_='contentArea')

        # check for more pages
        last_page = None
        paginator = soup.find('a', class_='ad-list-pager-item-last')
        if paginator:
            last_page_url = paginator['href']
            last_page = int(last_page_url.split("&")[-1].split("=")[-1])

        return content_areas, last_page

    except requests.RequestException as e:
        print(f"Error fetching the URL: {e}")
        return []


def scrape_per_page(url, query_term, page=1):
    try:
        params = {
            "q": query_term,
            "o": page,
        }

        response = requests.get(url, params=params)
        response.raise_for_status()

        # ads
        soup = BeautifulSoup(response.text, 'html.parser')
        return soup.find_all('div', class_='contentArea')

    except requests.RequestException as e:
        print(f"Error fetching the URL: {e}")
        return []


def scrape_all_page(url, query_term, min_ms=20, max_ms=500):
    all_content_areas, last_page = scrape_first_page(url, query_term)

    if not last_page:
        return all_content_areas

    if last_page > SCRAPE_LIMIT:
        raise MyCustomError("Too many pages to scrape!", ErrorCode.SCRAPE_LIMIT_EXCEEDED)

    for current_page in range(2, last_page + 1):
        all_content_areas.extend(scrape_per_page(url, query_term, current_page))

        wait_time = random.uniform(min_ms, max_ms) / 1000  # Convert ms to seconds
        time.sleep(wait_time)
        print(f"page {current_page} done, wait {wait_time:.5f} ms...")

    return all_content_areas


def process_pages(result_htmls):
    if not result_htmls:
        return []

    result_dicts = []
    for result_html in result_htmls:
        ad_dict = {
            'name': result_html.find('meta', attrs={"itemprop": "name"})['content'],
            'url': result_html.find('a', class_="subject")['href'],
            'image': result_html.find('meta', attrs={"itemprop": "image"})['content'],
            'price': int(result_html.find('span', class_="price-value")['content']),
            'curr': result_html.find('span', class_="currency").get_text().strip(),
            'time': result_html.find('div', class_="time").get_text().strip(),
            'location': result_html.find('section', class_="cityname").get_text().strip()
        }

        result_dicts.append(ad_dict)

    return result_dicts
