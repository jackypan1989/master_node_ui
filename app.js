var express = require('express');
var path = require('path');
var url  = require('url');
var lessMiddleware = require('less-middleware');
var pubDir = path.join(__dirname, 'public');

var app = express();

app.set('view engine', 'ejs');

app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(lessMiddleware({
        // should be the URI to your css directory from the location bar in your browser
        src: pubDir, // or '../less' if the less directory is outside of /public
        compress: true,
        debug: true
    }));

    app.use(express.static(pubDir));
});

var patent = require("./controller/patent.js");

// app.get('/', function(req, res){
//     var java = require("java");
//     java.classpath.push("master.jar");
//     var object = java.newInstanceSync("core.learning.Classification");
// });
app.get('/', patent.index);
// app.get('/', patent.info);
// app.get('/', patent.info);

app.listen(3000);
console.log('Listening on port 3000');
