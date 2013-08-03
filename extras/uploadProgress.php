<?php

/**
 * Simple Ajax Uploader
 * Version 1.6.3
 * https://github.com/LPology/Simple-Ajax-Uploader
 *
 * Copyright 2012-2013 LPology, LLC  
 * Released under the MIT license
 *
 * Returns upload progress updates for browsers that don't support the HTML5 File API.
 * Falling back to this method allows for upload progress support across virtually all browsers.
 *
 */ 

if (isset($_REQUEST['getkey'])) 
  exit(json_encode(array('key' => uniqid())));
elseif (isset($_REQUEST['progresskey'])) 
  $status = apc_fetch('upload_'.$_REQUEST['progresskey']);
else 
  exit(json_encode(array('success' => false)));

$pct = 0; $size = 0;

if (is_array($status)) {
  if (array_key_exists('total', $status) && array_key_exists('current', $status)) {
    if ($status['total'] > 0) {
      $pct = round( ( $status['current'] / $status['total']) * 100 );
      $size = round($status['total'] / 1024);
    }
  }
}

echo json_encode(array('success' => true, 'pct' => $pct, 'size' => $size));