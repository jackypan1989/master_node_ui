(function () {
	$('.stepOneBtn').on('click', function(){
		var id = $('.stepOneInput').val();
		console.log('yes');
		$.ajax({
			type: "POST",
		  	url: "/prediction/getRelatePatents",
		  	data: { pid: id }
		}).done(function(res)  {
			console.log(res);
    		alert("Success.");
		}).fail(function()  {
    		alert("Sorry. Server unavailable. ");
		}); 
	});
}());