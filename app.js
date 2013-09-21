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
var prediction = require("./controller/prediction.js");

// app.get('/', function(req, res){
//     var java = require("java");
//     java.classpath.push("master.jar");
//     var object = java.newInstanceSync("core.learning.Classification");
// });

app.get('/', patent.index);
app.get('/patent/:pid', patent.info);

app.post('/searchById', function(req,res) {
    var pid = req.body.pid;
    res.redirect('/patent/'+pid);
});

app.get('/datasets', patent.getAllDataSets);
app.get('/datasets/:dataset_id', patent.getDataSet);

app.get('/prediction', function(req, res) {
    res.render('prediction', {test:null, names:[]});
});

app.post('/prediction/getRelatePatents', prediction.getRelatePatents);

app.get('/java', function(req,res){
    // var java = require("java");
    // java.classpath.push("commons-lang3-3.1.jar");
    // java.classpath.push("commons-io.jar");

    // var list = java.newInstanceSync("java.util.ArrayList");

    // java.newInstance("java.util.ArrayList", function(err, list) {
    //   list.addSync("item1");
    //   list.addSync("item2");
    // });

    // var ArrayList = java.import('java.util.ArrayList');
    // var list = new ArrayList();
    // list.addSync('item1');

    var java = require("java");
    java.classpath.push("master.jar");
    var classification = java.newInstanceSync("core.learning.Classification");
});

// app.get('/', patent.info);

app.listen(3000);
console.log('Listening on port 3000');