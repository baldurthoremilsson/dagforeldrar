# -*- coding: utf-8 -*-

import os
import psycopg2


CONNECT = {
        'host': os.environ['DBHOST'],
        'port': os.environ['DBPORT'],
        'user': os.environ['DBUSER'],
        'password': os.environ['DBPASSWORD'],
        'database': os.environ['DBDATABASE'],
        }


def get_db():
    return psycopg2.connect(**CONNECT)


def get_address(db, address):
    with db.cursor() as curs:
        curs.execute('SELECT lat, lon FROM addresses WHERE address = %s', (address,))
        if curs.rowcount != 1:
            return None, None
        return curs.fetchone()


def save_address(db, address, lat, lon):
    with db.cursor() as curs:
        curs.execute('INSERT INTO addresses(address, lat, lon) VALUES(%s, %s, %s)',
                (address, lat, lon))


def save_dagforeldrar(db, dagforeldrar):
    with db.cursor() as curs:
        curs.execute('SELECT id FROM versions ORDER BY date DESC LIMIT 1')
        if curs.rowcount != 1:
            prev_version = -1
        else:
            prev_version = curs.fetchone()[0]

        curs.execute('INSERT INTO versions DEFAULT VALUES RETURNING id')
        cur_version = curs.fetchone()[0]

        for i, df in enumerate(dagforeldrar):
            values = {
                    'prev_version': prev_version,
                    'cur_version': cur_version
                    }
            values.update(df)

            variables = ['nafn', 'lausplass', 'heimilisfang', 'postnumer', 'simi', 'hverfi',
                    'vinnutimi', 'netfang', 'heimasida', 'vinnutimistart', 'vinnutimiend']
            conditions = []
            for var in variables:
                if values[var] == None:
                    conditions.append('{var} IS NULL'.format(var=var))
                else:
                    conditions.append('{var} = %({var})s'.format(var=var))

            query = 'SELECT id FROM dagforeldrar\nWHERE versionend = %(prev_version)s\nAND ' +\
                    '\nAND '.join(conditions)

            curs.execute(query, values)
            if curs.rowcount == 1:
                _id = curs.fetchone()[0]
                curs.execute('UPDATE dagforeldrar SET versionend = %s WHERE id = %s', (cur_version, _id))
                continue

            curs.execute('''
            INSERT INTO dagforeldrar(
                nafn, lausplass, heimilisfang, postnumer,
                simi, hverfi, vinnutimi, netfang, heimasida,
                vinnutimistart, vinnutimiend, lat, lon,
                versionstart, versionend)
            VALUES(
                %(nafn)s, %(lausplass)s, %(heimilisfang)s, %(postnumer)s,
                %(simi)s, %(hverfi)s, %(vinnutimi)s, %(netfang)s, %(heimasida)s,
                %(vinnutimistart)s, %(vinnutimiend)s, %(lat)s, %(lon)s,
                %(cur_version)s, %(cur_version)s
            )''', values)

