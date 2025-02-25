import random
import time

import requests
import json
from bs4 import BeautifulSoup

ajax_url = "https://www.bricklink.com/ajax/clone/catalogifs.ajax"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 "
                  "Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.bricklink.com/",
}


def scrape_item_id(lego_code):
    base_url = "https://www.bricklink.com/v2/catalog/catalogitem.page"

    base_params = {
        "S": lego_code,
        "O": json.dumps({"rpp": "25", "iconly": 0})
    }

    response = requests.get(base_url, params=base_params, headers=headers)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        link_with_id = soup.find("a", id="_idAddToWantedLink")
        bricklink_id = link_with_id['data-itemid']

        print(f"found bricklink id: {bricklink_id}")
        return bricklink_id
    else:
        print(f"Error with request: {response.status_code}")
        exit(-1)


def scrape_items(ajax_item_id, ajax_rpp=500, ajax_page=1):
    ajax_params = {
        "itemid": ajax_item_id,
        "rpp": ajax_rpp,
        "iconly": 0,
        "pi": ajax_page
    }

    ajax_response = requests.get(ajax_url, params=ajax_params, headers=headers)
    if not ajax_response.ok:
        print(f"an error ({ajax_response.status_code}) occurred when requesting: "
              f"\ntext: {ajax_response.text}"
              f"\ncontent: {ajax_response.content}")
        exit(-ajax_response.status_code)

    ajax_json = json.loads(ajax_response.text)

    total_count = ajax_json['total_count']
    print(f"{total_count} total items found...")

    items = ajax_json['list']
    print(f"now scraped {len(items)} items...")

    # check if more pages are present
    if total_count > ajax_rpp * ajax_page:
        print(f"calling page {ajax_page + 1}...")
        items.extend(scrape_items(ajax_item_id, ajax_rpp, ajax_page + 1))

    return items


def process_items(raw_items):
    process_result = []

    print("starting item processing...")
    for raw_item in raw_items:
        process_item = {
            "desc": raw_item.get("strDesc"),
            "cond": raw_item.get("codeNew"),  # N - new, U - used
            "comp": raw_item.get("codeComplete"),  # C - complete, B - incomplete, S - sealed
            "qty": raw_item.get("n4Qty"),
            "local_pr": raw_item.get("mDisplaySalePrice"),
            "orig_pr": raw_item.get("mInvSalePrice"),
            "store": {
                "name": raw_item.get("strStorename"),
                "min": raw_item.get("mMinBuy"),
                "country": raw_item.get("strSellerCountryName")
            }
        }
        process_result.append(process_item)

    print("item processing is done, now returning...")
    return process_result


def scrape_bricklink_one_set(lego_code):
    print(f"\n\nscraping for set {lego_code}")
    item_id = scrape_item_id(lego_code)
    scraped_items = scrape_items(item_id)
    processed_items = process_items(scraped_items)

    return processed_items


# With a longer code list we can easily get blocked by the API, resulting in 403 response codes
# TODO: check for longer wait integrals or redo with selinium:)
def scrape_bricklink_multiple_set(lego_code_list: list, min_ms: int = 20, max_ms: int = 500) -> dict:
    result_dict = {}
    for lego_code in lego_code_list:
        result_dict[lego_code] = scrape_bricklink_one_set(lego_code)

        wait_time = random.uniform(min_ms, max_ms) / 1000
        print(f"scraping for set {lego_code} done, wait {wait_time:.5f} ms...")
        time.sleep(wait_time)
    return result_dict


# example
# result = scrape_bricklink_one_set("1795-1")
# print(json.dumps(result, indent=2))

# codes for every Pirates I set
pirates_codes = ['10040-1', '1464-1', '1481-1', '1492-1', '1696-1', '1713-1', '1729-1', '1733-1', '1747-1', '1788-1',
                 '1795-1', '1802-1', '1871-1', '1872-1', '1873-1', '1889-1', '1970-1', '6200-1', '6204-1', '6232-1',
                 '6234-1', '6235-1', '6236-1', '6237-1', '6244-1', '6245-1', '6246-1', '6247-1', '6248-1', '6249-1',
                 '6250-1', '6251-1', '6252-1', '6254-1', '6255-1', '6256-1', '6257-1', '6258-1', '6259-1', '6260-1',
                 '6261-1', '6262-1', '6263-1', '6264-1', '6265-1', '6266-1', '6267-1', '6268-1', '6270-1', '6271-1',
                 '6271-2', '6273-1', '6274-1', '6276-1', '6277-1', '6278-1', '6279-1', '6280-1', '6281-1', '6285-1',
                 '6286-1', '6289-1', '6290-1', '6291-1', '6292-1', '6296-1', 'K6290-1']
# multiple_result = scrape_bricklink_multiple_set(['6286-1', '6289-1'])
