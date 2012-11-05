
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

var marked = require('marked');
var hljs = require('highlight.js');
var mime = require('mime');
var cheerio = require('cheerio');
var RSS = require('rss');

var indexpath = path.join(__dirname, '..', 'public', 'index.html');
var index = fs.readFileSync(indexpath, 'utf8');
var content = [], toc = [], feeditems = [], xml = '';
var feedgenerated = false;
var $ = cheerio.load(index);

marked.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: true,
  highlight: function(code, lang) {
  	var value;
  	if (code && lang) {
			return hljs.highlight(lang, code).value;
  	}
  	else {
  		return code;
  	}
  }
});

var feed = new RSS({
  title: $('title').text(),
  description: $('meta[name="description"]').attr("content"),
  author: $('meta[name="author"]').attr("content") || 'Admin'
});

var generatefeed = function(host) {
  if(feedgenerated) return; // feed already generated
  
  feed.site_url = 'http://' + host + '/'; // assuming http
  feed.feed_url = url.resolve(feed.site_url, 'rss');
  
  for(var i = 0; i < feeditems.length; ++i) {
    var $markup = cheerio.load(feeditems[i].description);
    $markup('h1').remove(); // not needed. feed already has title
    
    // fixing all relative url
    // note: all url like xpto.com/etc (without protocol) will be interpreted as relative. any ideas how to fix it?
    $markup('a').each(function(idx, elem) {
      var href = $markup(this).attr('href');
      if(href && !url.parse(href).host) {
        $markup(this).attr('href', url.resolve(feed.site_url, href));
      }
    });
    
    feed.item({
      title:  feeditems[i].title,
      description: $markup.html(),
      url: url.resolve(feed.site_url, "#" + feeditems[i].id),
      date: feeditems[i].date
    });
  }
  
  xml = feed.xml(); // rendering the xml
  feedgenerated = true;
}

var datapath = path.join(__dirname, '..', 'data');
var filenames = fs.readdirSync(datapath);

for (var i = 0, l = filenames.length; i<l; i++) {
  filenames[i] = path.basename(filenames[i], '.md');
}

filenames
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

	  // the file name should be a parsable date.
	  var date = name;
    var id = '', title = '';

	  //
	  // add the file extension back since we now want to
	  // read it from the disk.
	  //
	  name = path.join(__dirname, '..', 'data', name + '.md');
	  var data = fs.readFileSync(name, 'utf8');

	  //
	  // change the headers to links to provide deep linking.
	  //
	  var markup = marked(data).replace(/<h1>(.*?)<\/h1>/, function(a, h1) {
      title = h1;
  	  	
  		// turn the title into something that we can use as a link.
      id = h1.replace(/ /g, '-');
  	  	
  	  // add a link to the article to the table of contents.
  	  toc.push('<div><a href="#' + id + '">' + h1 + '</a> <span class="date">' + date + '</span></div>');
  
  	  // return the new version of the header.
  	  return '<a id="' + id + '"><h1><a href="#' + id + '">' + h1 + '</a></h1>';
    });

	  content.push(markup);
    
    feeditems.push({
      title:  title,
      description: markup,
      id: id,
      date: date
    });
	});

index = index.replace('<!-- toc -->', toc.join('<br/>'));
index = index.replace('<!-- content -->', content.join('<br/><hr><br/>'));

http.createServer(function (req, res) {

	//
	// a request without any specific files
	//
  if (req.url === '/' || req.url === '/index.html') {
    //res.statusCode = 200;
    //res.writeHeader('Content-Type', 'text/html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(index);
    return;
  }
  
  //
  // getting the rss feed
  //
  if (req.url === '/rss') {
    
    if (feedgenerated === false) {
      // generating the feed here because we need the request host name
      // it's generated only once
      generatefeed(req.headers.host);
    }
    res.writeHead(200, { 'Content-Type': 'application/rss+xml' });
    res.end(xml);
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
        res.writeHead(404, { 'Content-Type': 'plain/text' });
        res.end('not found');
    }
    else {
      if (!stat.isDirectory()) {
        res.writeHead(200, { 'Content-Type': mimetype });
        fs.createReadStream(filepath).pipe(res);
      }
    }
  });

}).listen(process.env.PORT || 80);
