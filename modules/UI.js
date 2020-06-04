export default class UI {
	static addArticle(){
		$('.add').removeClass('closed');
		$('#addarticle').css({'display':'block', 'opacity':'1'});

		$('#addarticle div, #addarticle input, #addarticle label, #addarticle i').each(function(i){	
			$('.ms-Icon--ShoppingCart').addClass('ms-Icon--ShoppingCartSolid').removeClass('ms-Icon--ShoppingCart');
			setTimeout(function(){
				$('#addarticle div, #addarticle input, #addarticle label, #addarticle i').eq(i).addClass('opened');
			},20*i+250);
		});
		setTimeout(function(){
			$('#addarticle input').eq(0).focus();
		},200);
	}
	static closeArticle(){
		$('.add').addClass('closed');

		$('#addarticle').css({'display':'', 'opacity':''});

		$('.ms-Icon--ShoppingCartSolid').addClass('ms-Icon--ShoppingCart').removeClass('ms-Icon--ShoppingCartSolid');
		$('#addarticle label, #addarticle input').removeClass('opened');
	}
	static addPreview(){
		$('.add').removeClass('closed');
		$('#addpreview').css({'display':'block', 'opacity':'1'});

		$('#addpreview div, #addpreview input, #addpreview label, #addpreview i').each(function(i){	
			$('.ms-Icon--ShoppingCart').addClass('ms-Icon--ShoppingCartSolid').removeClass('ms-Icon--ShoppingCart');
			setTimeout(function(){
				$('#addpreview div, #addpreview input, #addpreview label, #addpreview i').eq(i).addClass('opened');
			},20*i+250);
		});
		setTimeout(function(){
			$('#addpreview input').eq(0).focus();
		},200);
	}
	static closePreview(){
		$('.add').addClass('closed');

		$('#addpreview').css({'display':'', 'opacity':''});

		$('.ms-Icon--ShoppingCartSolid').addClass('ms-Icon--ShoppingCart').removeClass('ms-Icon--ShoppingCartSolid');
		$('#addpreview label, #addpreview input').removeClass('opened');
	}
	static addCourse(){
		$('#addCourse').css({'display':'block'});

		setTimeout(() => {
			$('#addCourse').css({'opacity':'1', 'transform':'translateY(0)'});
		},10);
		$('#addCourse div, #addCourse input, #addCourse label, #addCourse i').each(function(i){	
			setTimeout(function(){
				$('#addCourse div, #addCourse input, #addCourse label, #addCourse i').eq(i).addClass('opened');
			},20*i+250);
		});
		setTimeout(function(){
			$('#addCourse input').eq(0).focus();
		},200);
	}
	static closeCourse(){
		$('#addCourse').css({'display':'', 'opacity':'', 'transform':''});
		$('#addCourse label, #addCourse input').removeClass('opened');
	}
	static openMenu(){
		$('.menu').css({'display':'block'});
		setTimeout(function(){
			$('.menu').addClass('opened');
		},10);
	}
	static closeMenu(){
		$('.menu').css({'display':'none'});
		$('.menu').removeClass('opened');
	}
	static openParams(){
		$('#params').css({'display':'flex'});
		setTimeout(function(){
			$('#params').addClass('opened');
		},10);
	}
	static closeParams(){
		$('#params').css({'display':'none'});
		$('#params').removeClass('opened');
	}
	static remove(type, index){
		let selector = "."+ type,
			olds = new Array(),
			news = new Array();

		// get all position data
		$(selector).each(function(e){
			olds.push({
				x: $(selector).eq(e).position().left,
				y: $(selector).eq(e).position().top,
				width: $(selector).eq(e).outerWidth(),
				height: $(selector).eq(e).outerHeight()
			});
		});
		$(selector).eq(index).css({
			'position':'absolute',
			'top': olds[index].y,
			'left': olds[index].x,
			'width': olds[index].width,
			'height': olds[index].height,
			'transition':'all 300ms var(--ease-sortir)',
			'transform':'scale(0.7)',
			'opacity':'0'
		});
		$(selector).each(function(e){
			news.push({
				x: $(selector).eq(e).position().left,
				y: $(selector).eq(e).position().top,
				width: $(selector).eq(e).outerWidth(),
				height: $(selector).eq(e).outerHeight()
			});
		});

		// Apply transformations
		$(selector).each(function(e){
			if(e > index) {
				$(selector).eq(e).css({
					'position':'absolute',
					'top': olds[e].y +"px",
					'left': olds[e].x +"px",
					'width': olds[e].width,
					'height': olds[e].height,
					'transition': '0s'
				}); 
				setTimeout(function(){
					$(selector).eq(e).css({
						'top': news[e].y +"px",
						'left': news[e].x +"px",
						'width': news[e].width,
						'height': news[e].height,
						'transition':'all 300ms var(--ease)'
					});
				}, e*30+200);
			}
		});
		setTimeout(function(){
			$(selector).eq(index).remove();
			$(selector).css({
				'position':'',
				'top': '',
				'left': '',
				'transition':'',
				'transform':'',
				'width':'',
				'height':''
			});
		}, 510+(olds.length)*30);
	}
	static offlineMsg(err, msg = 'Le réseau est déconnecté ou insuffisant, la requette à été annulée'){
		console.log(err);
		$('.error').css({'display':'flex'});
		$('.error p').html(msg);
		setTimeout(function(){
			$('.error').addClass('opened');
		}, 10);
	}
}

function mod(n, m) {
	return ((n % m) + m) % m;
}