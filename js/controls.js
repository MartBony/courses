$(document).on('click', '.add.closed',function(){ // On ajoute .closed pour être sur que l'utilisateur ne peut pas l'aciver en remplissant le form
	if ($('body').hasClass('bodyPreview')) {
		app.addPreview();
	}
	else{
		app.addArticle();
	}
})

$('#params input').change(()=>{
	if(Storage.getItem('currency')){
		Storage.setItem('currency',"");
	} else {
		Storage.setItem('currency',"$");
	}
	app.setParameters();
});

$('.newCourse').click(function(){
	app.addCourse();
});

$('.addarticle i').click(function(){
	app.closeArticle();
});

$('.menu i.ms-Icon--Back').click(function(){
	app.closeMenu();
});

$('.menu i.ms-Icon--Settings').click(function(){
	app.openParams();
});

$('#params i').click(function(){
	app.closeParams();
});

$('.addCourse i').click(function(){
	app.closeCourse();
});

$('.addpreview i').click(function(){
	app.closePreview();
});

$('.prices i').click(function(){
	app.closePrice();
});

$(document).on('click', '.ms-Icon--Delete',function(){
	$('.article, .preview').removeClass('ready initSwitch');
	$(this).parent().addClass('ready');
});

$(document).on('click', '.noDelete',function(){
	$('.article, .preview').removeClass('ready');
});

$(document).on('click', '.error > i',function(){
	$('.error').removeClass('opened');
	setTimeout(function(){
		$('.error').css({'display':''});
	},110);
});

$(document).on('click', '.ready',function(){
	$(this).removeClass('ready');
});

$('header i').click(function(){
	app.openMenu();
});

document.addEventListener("visibilitychange", ()=>{
	if (document.visibilityState == "visible") {
		app.refresh();
	}
}, false);

window.addEventListener('online', () => {
	app.refresh();
});

$('.error button').click(function(){
	app.notificationHandler(function(){
		navigator.serviceWorker.ready.then(function(swRegistration) {
			return swRegistration.sync.register('pushOnline');
		});	
	});
	$('.error').removeClass('opened');
	setTimeout(function(){
		$('.error').css({'display':''});
	},110);
});

$(document).on('click', '.activate',function(){
	$('.activate').css({'opacity':'0.8'});
	$.ajax({
		method: "POST",
		url: "serveur.php",
		data: { update: 'true', activate: 'true', id: course.id}
		})
	.then(function( data ) {
		setTimeout(function(){
			$('.add').removeClass('hidden');
			$('.activate').css({'transition':'all 200ms ease-out 200ms', 'opacity':'0','transform':'scale(0.98)'});
			setTimeout(function(){
				$('.activate').css({'display':'none'});
			}, 420);	
		},400);
		if(course.swipe == 1){
			setTimeout(function(){
				app.setSwipe(0);
			},200);
		}

		var storage = Storage.getItem('items');				
		storage.forEach((el, i) => {
			if(el.idCourse == course.id){
				storage[i].startedState = true;
			}
		});
		course.started = true;

		Storage.setItem('items', storage);
	})
	.catch(function(err){
		$('.activate').css({'opacity':'1'});
		course.offlineMsg(err);
	});
});

$('#submitArticle').click(function(){
	if ($('.addarticle #titreA').val() && $('.addarticle #titreA').val() != '') {
		if ($('.addarticle #prix').val() && $('.addarticle #prix').val() != '') {
			if (!isNaN(parseFloat($('.addarticle #prix').val().replace(',','.')))) {
				$('.loader').addClass('opened');
				$.ajax({
					method: "POST",
					url: "serveur.php",
					data: { update: 'true', submitArticle: 'true', titre: $('.addarticle #titreA').val(), prix: $('.addarticle #prix').val().replace(',','.')}
					})
				.then(function( data ) {
					$('.loader').removeClass('opened');
					app.closeCourse();
					app.closeMenu();
					app.closeParams();
					app.closeArticle();
					app.closePreview();
					if (!course.started) {
						$('.activate').after(Generate.article(data.idArticle, data.titre, data.prix));
					}else{
						$('html, body').animate({scrollTop: 0}, 30);
						$('.list').prepend(Generate.article(data.idArticle, data.titre, data.prix));
					}
					course.totalPP(data.prix);
					$('.addarticle #titreA, .addarticle #prix').val('');

					setTimeout(function(){
						$('.article').removeClass('animateSlideIn');
					},300);

					var storage = Storage.getItem('items');				
					storage.forEach((el, i) => {
						if(el.idCourse == course.id){
							storage[i].articles.unshift({id: data.idArticle, titre: data.titre, prix: data.prix});
						}
					});
					course.displayed.articles.unshift({id: data.idArticle, titre: data.titre, prix: data.prix});

					Storage.setItem('items', storage);
				})
				.catch(function(err){
					$('.loader').removeClass('opened');
					course.offlineMsg(err);
				});
			}
			else{
				alert('Prix de l\'article non conforme');
			}
		}
		else{
			alert('Prix de l\'article non spécifié');
		}
	}
	else
	{
		alert('Nom de l\'article non spécifié');
	}
});

$('#submitPreview').click(function(){
	if ($('.addpreview #titreP').val() && $('.addpreview #titreP').val() != '') {
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur.php",
			data: { update: 'true', submitPreview: 'true', titre: $('.addpreview #titreP').val()}
			})
		.then(function( data ) {
			$('.loader').removeClass('opened');
			app.closeCourse();
			app.closeMenu();
			app.closeArticle();
			app.closePreview();
			app.closeParams();
			
			if (course.started == false) {
				$('.activate').eq(1).after(Generate.preview(data.idPreview, data.titre, data.color));
			}
			else{
				$('html, body').animate({scrollTop: 0}, 30);
				$('.prevList').prepend(Generate.preview(data.idPreview, data.titre, data.color));
			}
			$('.addpreview #titreP').val('');
			setTimeout(function(){
				$('.preview').removeClass('animateSlideIn');
			},300);


			var storage = Storage.getItem('items');				
			storage.forEach((el, i) => {
				if(el.idCourse == course.id){
					storage[i].previews.unshift({id: data.idPreview, titre: data.titre, color: data.color});
				}
			});
			course.displayed.previews.unshift({id: data.idPreview, titre: data.titre, color: data.color});

			Storage.setItem('items', storage);
		})
		.catch(function(){
			$('.loader').removeClass('opened');
			course.offlineMsg();
		});
	}
	else
	{
		alert('Il faut donner un nom à l\'article 😑');
	}
});



$('#setPrice').click(function(){
	if ($('.prices #newPrice').val() && $('.prices #newPrice').val() != '') {
		if (!isNaN(parseFloat( $('.prices #newPrice').val().replace(',','.')))) {
			course.buy(course.priceCursor.index,$('.prices #newPrice').val().replace(',','.'));
		}
		else
		{
			alert('Il faut donner un nom à l\'article 😑');
		}

	}
	else{
		alert('Il faut rentrer un prix');
	}
});

/* $('.prices li').click(function(){
	var index = $(this).index();
	course.buy(course.priceCursor.index, app.liPrices[index]);
}); */

$('#submitCourse').click(function(){
	if ($('.addCourse #titreC').val() && $('.addCourse #titreC').val() != '') {
		if ($('.addCourse #maxPrice').val() && $('.addCourse #maxPrice').val() != '') {
			if (!isNaN(parseFloat( $('.addCourse #maxPrice').val().replace(',','.')))) {
				$('.loader').addClass('opened');
				$.ajax({
					method: "POST",
					url: "serveur.php",
					data: { update: 'true', submitCourse: 'true', titre: $('.addCourse #titreC').val(), maxPrice: $('.addCourse #maxPrice').val().replace(',','.')}
					})
				.then(function(data){
					history.replaceState({key:'createCourse'}, '','index.php');
					$('.addCourse #titreC, .addCourse #maxPrice').val('');
					$('.loader').removeClass('opened');

					app.open();
					
				})
				.catch(function(err){
					$('.loader').removeClass('opened');
					course.offlineMsg(err);
				});

			}
			else
			{
				alert('Prix de l\'article non conforme');
			}
		}
		else{
			alert('Ca ne fonctionne jamais sans limite 😉');
		}
	}
	else
	{
		alert('Il faut donner un nom à la course 😑');
	}
});