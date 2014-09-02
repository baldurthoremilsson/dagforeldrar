#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import re
from bs4 import BeautifulSoup

from nominatim import get_address_location
from db import get_db, save_dagforeldrar


BASE_URL = 'http://reykjavik.is/allirdagforeldrar?page=%d'
HOURS_REGEX = re.compile(r'.*?(\d?\d:\d{2}).*?(\d?\d:\d{2}).*')

def get_working_hours(vinnutimi):
    if vinnutimi:
        match = HOURS_REGEX.match(vinnutimi)
        if match:
            return match.groups()
    return None, None


def node_text(node, class_name):
    subnode = node.find(attrs={'class': class_name})
    if subnode:
        text = subnode.getText().strip()
        return text if text != '' else None
    return None


def parse_node(node):
    return {
            'nafn': node_text(node, 'field-name-title'),
            'lausplass': node_text(node, 'field-name-field-lausplass'),
            'heimilisfang': node_text(node, 'field-name-field-heimilisfang'),
            'postnumer': node_text(node, 'field-name-field-postnumer'),
            'simi': node_text(node, 'field-name-field-simi'),
            'hverfi': node_text(node, 'field-name-field-hverfi'),
            'vinnutimi': node_text(node, 'field-name-body'),
            'netfang': node_text(node, 'field-name-field-netfang'),
            'heimasida': node_text(node, 'field-name-field-heimas-a')
            }


def parse(db, html):
    soup = BeautifulSoup(html)
    nodes = soup.find_all(attrs={'class': 'node-dagforeldrar'})

    for node in nodes:
        data = parse_node(node)
        data['vinnutimistart'], data['vinnutimiend'] = get_working_hours(data['vinnutimi'])
        data['lat'], data['lon'] = get_address_location(db, data['heimilisfang'].encode('utf-8'))
        yield data


def fetch(db, base_url):
    page = 0
    cont = True
    while cont:
        url = base_url % page
        response = requests.get(url)
        if response.status_code != 200:
            raise Exception('Error fetching %s, expecting status 200 but got %d instead' %
                    (url, response.status_code))

        zero = True
        for dagforeldri in parse(db, response.text):
            zero = False
            yield dagforeldri

        cont = not zero
        page += 1

def main():
    db = get_db()
    dagforeldrar = fetch(db, BASE_URL)
    save_dagforeldrar(db, dagforeldrar)
    db.commit()

if __name__ == '__main__':
    main()
