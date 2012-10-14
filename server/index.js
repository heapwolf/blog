
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

var marked = require('marked');
var mime = require('mime');

var file = String(fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html')));
var content = [];

marked.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: true
});

var files = fs.readdirSync(path.join(__dirname, '..', 'data'));

for (var i = 0, l = files.length; i<l; i++) {
  files[i] = path.basename(files[i], '.md');
}

files
	.sort(function (date1, date2) {
		
		//
	  // This is a comparison function that will result in 
	  // dates being sorted in descending order.
	  //
	  var date1 = new Date(Date.parse(date1));
	  var date2 = new Date(Date.parse(date2));

	  if (date1 > date2) return -1;
	  if (date1 < date2) return 1;
	  return 0;
	})
	.forEach(function (name) {

	  //
	  // get each markdown file and convert it into html.
	  //
	  name = path.join(__dirname, '..', 'data', name + '.md');
	  var data = String(fs.readFileSync(name));
	  content.push(marked(data));
	});

file = file.replace('<content/>', content.join('<br/><hr><br/>'));

http.createServer(function (req, res) {

  if (req.url === '/' || req.url === '/index.html') {
    res.statusCode = 200;
    res.writeHeader('Content-Type', 'test/html');
    res.end(file);
    return;
  }

  //
  // figure out what's in the request.
  //
  var rawurl = url.parse(req.url);
  var pathname = decodeURI(rawurl.pathname);
  var base = path.join(__dirname, '..', 'public');
  var filepath = path.normalize(path.join(base, pathname));

  //
  // set the appropriate mime type if possible.
  //
  var mimetype = mime.lookup(path.extname(filepath).split(".")[1]);
  
  if (!mimetype) {
    return;
  }

  res.writeHeader('Content-Type', mimetype);

  //
  // find out if the file is there and if it is serve it...
  //
  fs.stat(filepath, function (err, stat) {
    
    if (err && err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('not found');
    }
    else {
      if (!stat.isDirectory()) {
        res.statusCode = 200;
        fs.createReadStream(filepath).pipe(res);
      }
    }
  });

}).listen(8080);
