import requests
import json
from bs4 import BeautifulSoup

ajax_url = "https://www.bricklink.com/ajax/clone/catalogifs.ajax?"

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


def scrape_bricklink(lego_code):
    item_id = scrape_item_id(lego_code)
    scraped_items = scrape_items(item_id)
    processed_items = process_items(scraped_items)

    return processed_items


# example
#result = scrape_bricklink("6243")
#print(json.dumps(result, indent=2))
