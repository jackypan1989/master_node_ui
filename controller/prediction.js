(function () {
	var mysql = require('mysql');
    var _ = require('underscore');
    var async = require('async');

	var pool = mysql.createPool({
	  	host     : 'localhost',
        database : 'master',
	  	user     : 'root',
	  	password : ''
	});

	module.exports = {
        getRelatePatents: function(req, res) {
            var pid = req.body.pid;
            async.waterfall([
                function(callback){
                    pool.getConnection(function(err, connection) {
                    // connected! (unless `err` is set)
                        var query = 'SELECT `references cited` FROM uspto WHERE patent_id = "' + pid + '"';
                        connection.query( query, function(err, rows) {
                    // And done with the connection.
                            connection.release();
                            var patents = rows[0]['references cited'].split(';');
                            patents.pop();
                            
                            //console.log(patents);
                            callback(null, patents);
                    // Don't use the connection here, it has been returned to the pool.
                        });
                    });
                },
                function(bc_patent ,callback){
                    async.mapLimit(
                        bc_patent, 
                        1,
                        function(obj, callback){
                            pool.getConnection(function(err, connection) {
                                console.log(obj);
                            // connected! (unless `err` is set)
                                var query = 'SELECT `references cited` FROM uspto WHERE patent_id = "' + obj + '"';
                                connection.query( query, function(err, rows) {
                            // And done with the connection.
                                    connection.release();
                                    if (rows.length > 0) {
                                        var patents = rows[0]['references cited'].split(';');
                                        patents.pop();
                                        //console.log(patents);
                                        callback(null, patents);
                                    } else {
                                        callback();
                                    }
                            // Don't use the connection here, it has been returned to the pool.
                                });
                            });
                        },
                        function(err, results){
                            async.concat(
                                results, 
                                function(obj, callback){
                                    callback(err,obj);
                                }, 
                                function(err, bc2_patent){
                                    // files is now a list of filenames that exist in the 3 directories
                                    // console.log(bc2_patent);
                                    callback(null, bc_patent, bc2_patent);
                                }
                            );
                        }
                    );
                }
            ], function(err, bc_patent, bc2_patent) {
                // results is now equal to: {one: 1, two: 2}
                console.log("pid:"+pid);
                console.log("bc_patent:"+bc_patent);
                console.log("bc2_patent:"+bc2_patent);
                res.send({
                    bc_patent:bc_patent,
                    bc2_patent:bc2_patent
                });
            });
        },

        getFeatures: function(req, res) {
            var java = require("java");  
            java.classpath.push("commons-lang3-3.1.jar");
            java.classpath.push("commons-io.jar");
            java.classpath.push("./master.jar"); 

            var pid = req.body.pid;
            var list = req.body.list;

            async.mapLimit(
                list,
                1,
                function(id, callback) {
                    pool.getConnection(function(err, connection) {
                    // connected! (unless `err` is set)
                        var query = 'SELECT * FROM uspto WHERE patent_id = "' + id + '"';
                        connection.query(query, function(err, rows) {
                            // And done with the connection.
                            connection.release();
                            var text = rows[0].abstract + ' ' + rows[0].claims + ' ' + rows[0].description ;
                            // var text = rows[0].patent_id ;
                            // console.log(rows[0].abstract + ' ');
                            // console.log(rows[0].claims + ' ');
                            // console.log(rows[0].description + ' ');
                            callback(null, text);
                        // Don't use the connection here, it has been returned to the pool.
                        });
                    });
                },
                function(err, results){
                    // console.log(results);
                    // results is now an array of stats for each file

                    // vsm
                    var patents = java.newInstanceSync("java.util.ArrayList");
                    for (var i = 0 ; i < list.length ; i+=1 ) {
                        var patent = java.newInstanceSync("nodejs.Patent",list[i],results[i]);
                        patents.addSync(patent);
                    }

                    // console.log(patents);

                    var tf = java.callStaticMethodSync("nodejs.Lucene$WeightType", "valueOf", "TF");
                    var lucene = java.newInstanceSync("nodejs.Lucene",patents, tf);
                    var vsm = java.newInstanceSync("nodejs.VSM",lucene);

                    var p1 = patents.getSync(0);
                    var p2 = patents.getSync(1);
                    var sim = vsm.getCosineSimiliartySync(p1,p2);

                    console.log(sim);
                    res.send({sim:sim});
                    console.log(sim);
                }
            );
        

        }
    };

}());