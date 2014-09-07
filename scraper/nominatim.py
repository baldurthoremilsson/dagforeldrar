# -*- coding: utf-8 -*-

import requests

from db import get_address, save_address


NOMINATIM_URL = 'http://nominatim.openstreetmap.org/search?format=json&street={street}&countrycodes={countrycode}'


def get_address_location(db, address):
    lat, lon = get_address(db, address)
    if lat and lon:
        return lat, lon

    response = requests.get(NOMINATIM_URL.format(street=address, countrycode='is'))
    data = response.json()
    if len(data) != 1:
        return None, None
    lat, lon = data[0]['lat'], data[0]['lon']
    save_address(db, address, lat, lon)
    return lat, lon
