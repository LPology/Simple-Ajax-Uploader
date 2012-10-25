Simple Ajax Uploader
============================

Javascript plugin for AJAX-style file uploading with progress support.

### Features ###
* Uses XMLHttpRequest and HTML5 file API with fall back to iframe method for Internet Explorer.
* Provides individual methods for XHR-supported browsers and Internet Explorer for greater control over user experience.
* Requires no external libraries.
* Fast and lightweight - only about 3.2KB when minified and gzipped.
* Tested in IE7+, Firefox 4+, Safari 4+, and Chrome.

### Getting Started ###
Include `SimpleAjaxUploader.js` into your page:

```html
	<script type="text/javascript" src="SimpleAjaxUploader.js"></script>
```

Initialize the uploader when the DOM is ready. There are three required parameters:


```javascript
var uploader = new ss.SimpleUpload({
	button: 'upload-btn',
	url: '/PathTo/UploadHandler',
	name: 'uploadfile'
});
```

### License ###
Released under the MIT license.

### Properties ###
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>button</td>
            <td>String, Element</td>
            <td>''</td>
            <td>File upload button. <strong>Required.</strong></td>
        </tr>
        <tr>
            <td>url</td>
            <td>String</td>
            <td>''</td>
            <td>Location of the server-side file upload handler. <strong>Required.</strong></td>
        </tr>		
        <tr>
            <td>name</td>
            <td>String</td>
            <td>''</td>
            <td>File upload name. <strong>Required.</strong></td>
        </tr>		
	</tbody>
</table>