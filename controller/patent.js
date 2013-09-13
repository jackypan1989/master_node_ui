(function () {
	var mysql = require('mysql');
	var pool = mysql.createPool({
	  	host     : 'localhost',
        database : 'master',
	  	user     : 'root',
	  	password : 'jacky'
	});
	
	module.exports = {
        index: function(req, res) {
            res.render('index', {content:null});
        },

		info: function(req, res) {
			pool.getConnection(function(err, connection) {
  				// connected! (unless `err` is set)
                var query = 'SELECT * FROM uspto WHERE patent_id = "RE29093" ';
			  	connection.query( query, function(err, rows) {
			    // And done with the connection.
		              connection.release();
                      res.send(rows);
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