Simple Ajax Uploader
============================

A Javascript plugin for cross-browser Ajax file uploading. Supports multiple file uploading with progress bars.

<a href="http://www.lpology.com/code/ajaxuploader/">Live Demo</a><br />
<a href="http://www.lpology.com/code/ajaxuploader/docs.php">Full API Reference</a>

### Overview ###
Simple Ajax Uploader allows developers to easily add Ajax file upload functionality to web applications. It abstracts away standard tasks and browser compatibility issues while preserving wide latitude for custom use.

The project began as a rewrite of Andrew Valum's original Ajax Upload plugin. The goal of the project is make file uploading easy for developers and pleasant for users. Basic usage: 

```javascript
var uploader = new ss.SimpleUpload({
      button: 'upload-btn', // HTML element used as upload button
      url: '/PathTo/UploadHandler', // URL of server-side upload handler
      name: 'uploadfile' // Parameter name of the uploaded file
});
```

### Features ###
* Cross-browser -- works in IE7+, Firefox, Chrome, Safari, Opera
* Supports multiple, concurrent file uploads (even in non-HTML5 browsers)
* No flash or external CSS -- under 5Kb Javascript file (minified and gzipped)
* Use any HTML element as the upload button
* Optional, built-in support for truly cross-browser progress bars
* No dependencies - use it with or without jQuery
* Provides individual callback functions for XHR-supported browsers and for browsers that do not support XHR uploads

### How to Use ###
There are two main ways to use the plugin:

<strong>1. Single file uploading</strong> - Only one upload allowed at a time. Progress bar is an element that is re-used for each upload.<br />
<strong>2. Multiple file uploading</strong> - Allow multiple, concurrent file uploads. Progress bars are created on the fly before each upload.

#### Method 1: Single file uploading (one file at a time)  ####

Before each upload, in the `onSubmit()` callback function, the on-page <code>sizeBox</code> and <code>progress</code> elements are assigned specific roles using these two functions:

`setProgressBar(elem)` - Designates an element as the progress bar for an upload.<br />
`setFileSizeBox(elem)` - Designates an element as the container in which the file size of an uploading file will be inserted.

As a result, when an upload begins, the file size of the upload is inserted into the <code>sizeBox</code> element and the CSS width of the <code>progress</code> element is set to 0%. As the upload progresses, the CSS width percentage of the <code>progress</code> element will be updated accordingly.

This approach of assigning roles to elements provides developers with a great deal of flexibility -- progress indicators can be styled in any way and placed anywhere on the page.

```javascript
var sizeBox = document.getElementById('sizeBox'), // container for file size info
    progress = document.getElementById('progress'); // the element we're using for a progress bar

var uploader = new ss.SimpleUpload({
      button: 'uploadButton', // file upload button
      url: 'uploadHandler.php', // server side handler
      name: 'uploadfile', // upload parameter name        
      progressUrl: 'uploadProgress.php', // enables cross-browser progress support (more info below)
      responseType: 'json',
      allowedExtensions: ['jpg', 'jpeg', 'png', 'gif'],
      maxSize: 1024, // kilobytes
      hoverClass: 'ui-state-hover',
      focusClass: 'ui-state-focus',
      disabledClass: 'ui-state-disabled',
      onSubmit: function(filename, extension) {
          this.setFileSizeBox(sizeBox); // designate this element as file size container
          this.setProgressBar(progress); // designate as progress bar
        },         
      onComplete: function(filename, response) {
          if (!response) {
              alert(filename + 'upload failed');
              return false;            
          }
          // do something with response...
        }
});        
```        

#### Method 2: Multiple file uploads ####

Below is an example of how to implement multiple file uploading with progress bars. A new progress bar is created for each file upload within the `onSubmit()` callback function.

Like in Method 1, the newly created elements are assigned roles using  the `setProgressBar()` and `setFileSizeBox()` functions.  Unlike the previous example, however, the progress elements are automatically removed when the upload is completed. 
 
```javascript  
var uploader = new ss.SimpleUpload({
      button: 'uploadButton',
      url: 'uploadHandler.php', // server side handler
      progressUrl: 'uploadProgress.php', // enables cross-browser progress support (more info below)
      responseType: 'json',
      name: 'uploadfile',
      multiple: true,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'gif'], // for example, if we were uploading pics
      hoverClass: 'ui-state-hover',
      focusClass: 'ui-state-focus',
      disabledClass: 'ui-state-disabled',   
      onSubmit: function(filename, extension) {
          // Create the elements of our progress bar
          var progress = document.createElement('div'), // container for progress bar
              bar = document.createElement('div'), // actual progress bar
              fileSize = document.createElement('div'), // container for upload file size
              wrapper = document.createElement('div'), // container for this progress bar
              progressBox = document.getElementById('progressBox'); // on page container for progress bars
          
          // Assign each element its corresponding class
          progress.className = 'progress';
          bar.className = 'bar';            
          fileSize.className = 'size';
          wrapper.className = 'wrapper';
          
          // Assemble the progress bar and add it to the page
          progress.appendChild(bar); 
          wrapper.innerHTML = '<div class="name">'+filename+'</div>'; // filename is passed to onSubmit()
          wrapper.appendChild(fileSize);
          wrapper.appendChild(progress);                                       
          progressBox.appendChild(wrapper); // just an element on the page to hold the progress bars    
          
          // Assign roles to the elements of the progress bar
          this.setProgressBar(bar); // will serve as the actual progress bar
          this.setFileSizeBox(fileSize); // display file size beside progress bar
          this.setProgressContainer(wrapper); // designate the containing div to be removed after upload
        },
        
       // Do something after finishing the upload
       // Note that the progress bar will be automatically removed upon completion because everything 
       // is encased in the "wrapper", which was designated to be removed with setProgressContainer() 
      onComplete:	function(filename, response) {
          if (!response) {
            alert(filename + 'upload failed');
            return false;
          }
          // Stuff to do after finishing an upload...
        }
});
```

For multiple file uploads, we use an additional function: `setProgressContainer(elem)`. This function designates an element to be removed from the DOM after the upload is completed.

In the example, the element set to be removed with `setProgressContainer()` is the outer container for the progress elements. As a result, progress bars will be removed from the DOM after each upload is completed.

### Cross-Browser Progress Support - How it Works ###

Because the `progress` event is not supported by Internet Explorer 9 (and older), progress updates must be retrieved from the server in order to provide progress bars in those browsers. The plugin includes optional, built-in support for handling this.

When the plugin detects support for the File API, the `progress` event is used. For older browsers (i.e., IE9 and below), the plugin will instead retrieve progress updates from the server, which are provided by uploadProgress.php (PHP w/ APC extension required - instructions below).

In both cases, everything is handled internally - feature detection, calculation, key handling, etc. To enable this behavior, just provide the URL for uploadProgress.php in the `progressUrl` option.

#### Installing the APC extension ####

The optional support for server-provided progress updates requires PHP with the APC extension installed and the `apc.rfc1867` option enabled. To install APC:

```
sudo pecl install apc
```

Accept the default settings, and then create a configuration file:

```
sudo vi /etc/php.d/apc.ini
```

Add these two lines, and then save:

```
extension=apc.so
apc.rfc1867 = 1
```

Restart your web server for the changes to take effect.

<strong>Note:</strong> If APC is already installed, you may still need to add `apc.rfc1867 = 1` to apc.ini, as it is not enabled by default.

### Cross-Browser Helper Functions ###

To ease the pain of supporting older browsers, the plugin includes a set of callback functions which allow specific behavior to be defined based on whether the user's browser supports XHR uploads/HTML5 File API:

<code>startXHR(filename, fileSize)</code> - Called prior to upload -- only in browsers that support XHR uploads<br />
<code>endXHR(filename)</code> - Called after upload is completed -- only in browsers that support XHR uploads<br />
<code>startNonXHR(filename)</code> - Called prior to upload -- only in browsers that <strong>do not</strong> support XHR uploads<br />
<code>endNonXHR(filename)</code> - Called after upload is completed -- only in browsers that <strong>do not</strong> support XHR uploads<br />

A common use case is to show an upload progress bar in browsers that support the <code>progress</code> event while displaying an animated GIF in older browsers:

```javascript  

var progress = document.getElementById('progress'), // progress bar
    loaderImg = document.getElementById('loaderImg');  // "loading" animated GIF
                
var uploader = new ss.SimpleUpload({
      button: 'uploadButton',
      url: 'uploadHandler.php', // server side handler
      responseType: 'json',
      name: 'uploadfile',
      hoverClass: 'ui-state-hover',
      focusClass: 'ui-state-focus',
      disabledClass: 'ui-state-disabled',
      startXHR: function(filename, size) {                   
          progress.style.display = 'inline-block'; // show progress bar            
          this.setProgressBar(progress); // designate as progress bar
      },
      endXHR: function(filename) {
          progress.style.display = 'none'; // hide progress bar
      },
      startNonXHR: function(filename) {
          loaderImg.style.display = 'inline-block'; // show animated GIF
      },
      endNonXHR: function(filename) {
          loaderImg.style.display = 'none'; // hide animated GIF
      }
});
```

Returning <code>false</code> from <code>startXHR()</code> and <code>startNonXHR()</code> will prevent the upload from starting, just as it does with <code>onSubmit()</code> and <code>onChange()</code>.

### Using Uploader.php ###

<strong>Note:</strong> This PHP class is included only for convenience. <strong>It is not required to use PHP with Simple Ajax Uploader.</strong> The plugin is agnostic to server configuration, so use any language you prefer.

```php
<?php
require('Uploader.php');

$upload_dir = '/img_uploads/';
$valid_extensions = array('gif', 'png', 'jpeg', 'jpg');

$Upload = new FileUpload('uploadfile');
$result = $Upload->handleUpload($upload_dir, $valid_extensions);

if (!$result) {
	echo json_encode(array('success' => false, 'msg' => $Upload->getErrorMsg()));	
} else {
	echo json_encode(array('success' => true, 'file' => $Upload->getFileName()));
}
```

You can also save the uploaded file with a different name by setting the `newFileName` property:

```php
$Upload = new FileUpload('uploadfile');
$ext = $Upload->getExtension(); // Get the extension of the uploaded file
$Upload->newFileName = 'customFileName.'.$ext;
$result = $Upload->handleUpload($upload_dir, $valid_extensions);
```

To access the newly uploaded file, use the `getSavedFile()` method to get the file's path after the upload is completed:
```php
$Upload = new FileUpload('uploadfile');
$result = $Upload->handleUpload($upload_dir, $valid_extensions);

if ($result) {
  $path = $Upload->getSavedFile();
  $imgsize = getimagesize($path);
  // image resizing stuff...
}
```

### License ###
Released under the MIT license.

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/12959a020aff072486c207b468ab8ade "githalytics.com")](http://githalytics.com/LPology/Simple-Ajax-Uploader)