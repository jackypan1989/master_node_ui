(function () {
	$('.stepOneBtn').on('click', function(){
		$('html, body').animate({ scrollTop: $('.step2div').offset().top }, 'slow');
		var id = $('.stepOneInput').val();
		console.log('yes');
		$.ajax({
			type: "POST",
		  	url: "/prediction/getRelatePatents",
		  	data: { pid: id }
		}).done(function(res)  {
			var bc_patent = res.bc_patent;
			var bc2_patent = res.bc2_patent;

			var html = '';
			for (var i = 0 ; i < bc_patent.length; i++) {
				html += '<label class="checkbox-inline"><input type="checkbox" name="patent" value="'+bc_patent[i]+'">'+bc_patent[i]+'</label>'
			}

			$('#bc_list').html(html);
    		// alert("Success.");
		}).fail(function()  {
    		// alert("Sorry. Server unavailable. ");
		}); 
	});

	$('.stepTwoBtn').on('click', function(){
		var id = $('.stepOneInput').val();
		var list = [id];
		$('input[name="patent"]:checked').each(function(){
			// console.log(this.value);
			list.push(this.value);
		});
		console.log(list);

		$.ajax({
			type: "POST",
		  	url: "/prediction/getFeatures",
		  	data: { pid: id , list: list }
		}).done(function(res)  {
			$('#result').html('<h4>sim between ' + id + ' & ' + list[1] + ' : ' + res.sim + '</h4>');
		}).fail(function()  {
    		// alert("Sorry. Server unavailable. ");
		}); 
	});


}());