<?php

/**
 * Simple Ajax Uploader
 * Version 1.6.3
 * https://github.com/LPology/Simple-Ajax-Uploader
 *
 * Copyright 2013 LPology, LLC  
 * Released under the MIT license
 *
 * View the documentation for an example of how to use this class. 
 */ 

/**
* Handles XHR uploads
*/
class FileUploadXHR {
  public $uploadName;
  public function Save($savePath) {
    if (file_put_contents($savePath, fopen('php://input', 'r'))) {	
      return true;
    }
    return false;
  }  
  public function getFileName() {
    return $_GET[$this->uploadName];
  }
  public function getFileSize() {
    if (isset($_SERVER['CONTENT_LENGTH'])) {
      return (int)$_SERVER['CONTENT_LENGTH'];            
    }
    else {
      throw new Exception('Content length not supported.');
    }	
  }    
}

/**
* Handles form uploads through hidden iframe
*/
class FileUploadPOSTForm {
  public $uploadName;
  public function Save($savePath) {
    if (move_uploaded_file($_FILES[$this->uploadName]['tmp_name'], $savePath)) {
      return true;
    }
    return false;
  }  
  public function getFileName() {
    return $_FILES[$this->uploadName]['name'];
  }  
  public function getFileSize() {
    return $_FILES[$this->uploadName]['size'];
  }   
}

/**
* Main class for handling file uploads
*/
class FileUpload {  
  public $uploadDir;                    // File upload directory (include trailing slash)
  public $allowedExtensions;            // Array of permitted file extensions
  public $sizeLimit = 10485760;         // Max file upload size in bytes (default 10MB)
  public $newFileName;                  // Optionally save uploaded files with a new name by setting this  
  private $fileName;                    // Filename of the uploaded file
  private $fileSize;                    // Size of uploaded file in bytes
  private $fileExtension;               // File extension of uploaded file
  private $savedFile;                   // Path to newly uploaded file (after upload completed)
  private $errorMsg;                    // Error message if handleUpload() returns false (use getErrorMsg() to retrieve)
  private $handler; 
  
  function __construct($uploadName) {
    if (isset($_FILES[$uploadName])) {
      $this->handler = new FileUploadPOSTForm(); // Form-based upload    
    } elseif (isset($_GET[$uploadName])) {
      $this->handler = new FileUploadXHR(); // XHR upload
    } else {
      $this->handler = false;
    }	   
    
    if ($this->handler) {
      $this->handler->uploadName = $uploadName;
      $this->fileName = $this->handler->getFileName();
      $this->fileSize = $this->handler->getFileSize();       
      $fileInfo = pathinfo($this->fileName);      
      if (array_key_exists('extension', $fileInfo)) {
        $this->fileExtension = strtolower($fileInfo['extension']);
      }     
    }
  }  
        
  public function getFileName() {
    return $this->fileName;
  } 
  
  public function getFileSize() {
    return $this->fileSize;
  }                 

  public function getExtension() {
    return $this->fileExtension;
  }  
  
  public function getErrorMsg() {
    return $this->errorMsg;
  }

  public function getSavedFile() {
    return $this->savedFile;
  }  
  
  private function checkExtension($ext, $allowedExtensions) {
    if (!is_array($allowedExtensions)) {
      return false;
    }    
    if (!in_array(strtolower($ext), array_map('strtolower', $allowedExtensions))) {
      return false;      
    }    
    return true;
  }  
				    
  private function setErrorMsg($msg) {
    $this->errorMsg = $msg;
  }    
  
  private function fixDir($dir) {
    $last = substr($dir, -1);
    if ($last == '/' || $last == '\\') {
      $dir = substr($dir, 0, -1);
    }
    return $dir . DIRECTORY_SEPARATOR;
  }    
					
  public function handleUpload($uploadDir = null, $allowedExtensions = null) {
    if ($this->handler === false) {
      $this->setErrorMsg('Incorrect upload name or no file uploaded');
      return false;    
    }
    
    if ($uploadDir !== null) {
      $this->uploadDir = $uploadDir;
    }    
    if ($allowedExtensions !== null && is_array($allowedExtensions)) {
      $this->allowedExtensions = $allowedExtensions;
    }      
    
    $this->uploadDir = $this->fixDir($this->uploadDir);    
    
    if ($this->newFileName !== null) {
      $this->fileName = $this->newFileName;
      $this->savedFile = $this->uploadDir.$this->newFileName;
    }	else {
      $this->savedFile = $this->uploadDir.$this->fileName;
    }
             
    if ($this->fileSize == 0) {
      $this->setErrorMsg('File is empty');
      return false;
    }	            
    if (!is_writable($this->uploadDir)) {
      $this->setErrorMsg('Upload directory is not writable');
      return false;
    }	       				    
    if ($this->fileSize > $this->sizeLimit) {
      $this->setErrorMsg('File size exceeds limit');
      return false;    
    }
    if ($this->allowedExtensions !== null) {
      if (!$this->checkExtension($this->fileExtension, $this->allowedExtensions)) {
        $this->setErrorMsg('Invalid file type');
        return false;      
      }
    }
    if (!$this->handler->Save($this->savedFile)) {
      $this->setErrorMsg('File could not be saved');
      return false;     
    }		
    
    return true;
  }
	
}