(function () {
	var mysql = require('mysql');
    var _ = require('underscore');

	var pool = mysql.createPool({
	  	host     : '140.112.107.1',
        database : 'master',
	  	user     : 'root',
	  	password : ''
	});
	
	module.exports = {
        index: function(req, res) {
            res.render('index', {content:null});
        },

		info: function(req, res) {
            var id = req.params.pid;
            console.log(id);
			pool.getConnection(function(err, connection) {
  				// connected! (unless `err` is set)
                var query = 'SELECT * FROM uspto WHERE patent_id = "' + id + '"';
			  	connection.query( query, function(err, rows) {
			    // And done with the connection.
		                connection.release();
                        // console.log(rows[0].patent_id);
                        if (rows.length === 0) {
                            res.render('info', {err:'no patent info!',content:null});
                        } else {
                            res.render('info', {err:null, content:rows[0]});
                            // res.render('info', {content:JSON.stringify(rows)});
                        }
			    // Don't use the connection here, it has been returned to the pool.
			  	});

			});
		},

        getAllDataSets: function(req, res) {
            pool.getConnection(function(err, connection) {
                // connected! (unless `err` is set)
                var query = 'SELECT DISTINCT dataset FROM  `feature` ';
                connection.query( query, function(err, rows) {
                // And done with the connection.
                    connection.release();
                    //console.log(rows);
                    rows = _.sortBy(rows, function(row){ return row.dataset; });
                    res.render('datasets', {datasets:rows});
                // Don't use the connection here, it has been returned to the pool.
                });

            });
        },

        getDataSet: function(req, res) {
            var dataset_id = req.params.dataset_id;
            pool.getConnection(function(err, connection) {
                // connected! (unless `err` is set)
                var query = 'SELECT * FROM  `feature` WHERE dataset = "' + dataset_id + '"';
                connection.query( query, function(err, rows) {
                // And done with the connection.
                    connection.release();
                    //console.log(rows);
                    // rows = _.sortBy(rows, function(row){ return row.dataset; });
                    res.render('dataset', {patents:rows});
                // Don't use the connection here, it has been returned to the pool.
                });
            });
        },

        feature: function(req, res) {
            pool.getConnection(function(err, connection) {
                // connected! (unless `err` is set)
                var query = 'SELECT * FROM feature';
                connection.query( query, function(err, rows) {
                // And done with the connection.
                      connection.release();
                      res.send(rows);
                // Don't use the connection here, it has been returned to the pool.
                });

            });
        }
	};

}());