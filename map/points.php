<?php

require_once("data.php");

function getCacheKey() {
  return 'dagforeldrar:'.date('Y-m-d');
}

function pointsFromDB() {
  $connection = getDBConnection();

  $points = array();
  $query = "
    SELECT
      nafn,
      lausplass,
      heimilisfang,
      postnumer,
      simi,
      hverfi,
      netfang,
      heimasida,
      lat,
      lon
    FROM dagforeldrar
    WHERE versionend = (
      SELECT id
      FROM versions
      ORDER BY date
      DESC LIMIT 1
    )
    ORDER BY nafn
  ";
  $results = pg_query($connection, $query);

  while($row = pg_fetch_assoc($results)) {
    $points[] = $row;
  }
  return $points;
}

function pointsFromMemcache() {
  $memcache = new Memcache;
  $connected = $memcache->connect('localhost', 11211);
  if(!$connected)
    return false;

  $results = $memcache->get(getCacheKey());
  return $results;
}

function pointsToMemcache($points) {
  $memcache = new Memcache;
  $connected = $memcache->connect('localhost', 11211);
  if(!$connected)
    return;

  $memcache->set(getCacheKey(), $points);
}

function getPoints() {
  $points = pointsFromMemcache();
  if(!$points || isset($_GET['nocache']) && $_GET['nocache'] == 'true') {
    $points = pointsFromDB();
    pointsToMemcache($points);
  }
  return $points;
}

if($DEBUG == true) {
  header('Access-Control-Allow-Origin: *');
}

header('Content-type: application/json');
echo json_encode(getPoints());
