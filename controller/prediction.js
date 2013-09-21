(function () {
	var mysql = require('mysql');
    var _ = require('underscore');
    var async = require('async');

	var pool = mysql.createPool({
	  	host     : '140.112.107.1',
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
        }
	};

}());