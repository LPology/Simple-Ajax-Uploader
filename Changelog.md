ChangeLog
============================

### Version 1.4.1 ###
* Fixed XHR status check logic that could allow false alarm calls to onError callback
* Removed redundant XHR status check
* Returning false from a callback no longer clears the file field. Not sure why it ever did to begin with.
* A status check now occurs prior to progress update requests to prevent potential loop that could be caused by a server error
* Parsing JSON in older browsers no longer uses eval because it's evil

### Version 1.4  ###
This release includes a major overhaul that adds functionality for implementing cross-browser upload progress support. Through feature detection and abstraction, it is now possible for the 'onProgress' callback function to maintain consistent behavior across browsers. 

Currently, only PHP (with APC extension) is supported. To use, set the newly added 'progressUrl' option to the URL of the included UploadProgress.php script, and 'onProgress' will then return upload progress data in Internet Explorer 9 and below.

Note that this added functionality does not affect the behavior of the plugin for those not using PHP, or just not using the feature.

For those not using PHP, a similar result can still be achieved with the 'startXHR/endXHR' and 'startNonXHR/endNonXHR' callback functions, which are included specifically for defining behavior based on whether XHR uploads are supported.

Also, adding support for other programming languages would certainly be a welcome addition, if anyone is interested in working on that.

Other items:

* Added 'onUpdateFileSize' callback function for getting file size in IE9 and below (When server supported progress is enabled)
* Removed the unneccessary _handleJSON method
* Added new ss.newXHR method
* Added extras folder for non-necessary items (i.e., everything but SimpleAjaxUploader.js)
* Adjusted request headers for XHR uploads 
* Moved support detection for HTML5 File API to constructor so it only executes once
* Timestamps now appended to URLs to prevent browsers from caching requests

### Version 1.3 ###
* Returned to version numbering
* Updated method for parsing JSON
* Added PHP class for handling file uploads
* Cleaned up messy areas

### Earlier versions ###
Prior to version 1.3, I did a pretty horrible job of documenting changes, and, at one point, entirely dispensed with any notion of version control whatsoever. I have since seen the light.