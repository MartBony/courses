import mod from './math.js';

export default class UI {
	static message(titre, texte, buttons){
		document.querySelector('#message').classList.add('opened');

		if(titre) document.querySelector('#message h2').innerHTML = titre
		else document.querySelector('#message h2').style.display = "none"

		if(texte) document.querySelector('#message p').innerHTML = texte
		else document.querySelector('#message p').style.display = "none"

		document.querySelectorAll('#message button').forEach(el => el.remove());
		if(!buttons || buttons.length == 0){
			setTimeout(() => {UI.closeMessage()}, 7000);
		} else {

			buttons.forEach(button => {
				if(button.texte && button.action) {
					let buttonElement  = document.createElement('button');
					buttonElement.innerHTML = button.texte;
					buttonElement.addEventListener('click', () => button.action());
					document.querySelector('#message div').appendChild(buttonElement);

					if(button.class) buttonElement.classList.add(button.class)
				}
			});
		}
	}
	static erreur(titre, texte, buttons){
		document.querySelector('#erreur').classList.add('opened');

		if(titre) document.querySelector('#erreur h2').innerHTML = titre
		else document.querySelector('#erreur h2').style.display = "none"

		if(texte) document.querySelector('#erreur p').innerHTML = texte
		else document.querySelector('#erreur p').style.display = "none"

		document.querySelectorAll('#erreur button').forEach(el => el.remove());
		if(!buttons || buttons.length == 0){
			setTimeout(() => {UI.closeMessage()}, 7000);
		} else {
			buttons.forEach(button => {
				if(button.texte && button.action) {
					let buttonElement  = document.createElement('button');
					buttonElement.innerHTML = button.texte;
					buttonElement.addEventListener('click', () => button.action());
					document.querySelector('#erreur div').appendChild(buttonElement);

					if(button.class) buttonElement.classList.add(button.class)
				}
			});
		}
	}
	static closeMessage(){
		document.querySelectorAll('.notification').forEach(el => el.classList.remove('opened'));
	}
	static showInstall(delay){
		setTimeout(function(){
			$('.install').css({'display':'flex'});
			setTimeout(function(){
				$('.install').addClass('opened');
				$('.install img').each(function(i){
					setTimeout(function(){
						$('.install img').eq(i).addClass('opened');
					}, i*50);
				});
			}, 10);
		}, delay);
	}
	static hideInstall(){
		$('.install img, .install').removeClass('opened');
		setTimeout(function(){
			$('.install').css({'display':'none'});
		}, 200);
	}
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
		$('#params').css({'display':'block'});
		setTimeout(function(){
			$('#params').addClass('opened');
		},10);
	}
	static closeParams(){
		$('#params').css({'display':'none'});
		$('#params').removeClass('opened');
	}
	static openAddGroup(){
		$('#addGroupe').css({'display':'block'});

		setTimeout(() => {
			$('#addGroupe').css({'opacity':'1', 'transform':'translateY(0)'});
		},10);
		$('#addGroupe div, #addGroupe input, #addGroupe label, #addGroupe i').each(function(i){	
			setTimeout(function(){
				$('#addGroupe div, #addGroupe input, #addGroupe label, #addGroupe i').eq(i).addClass('opened');
			},20*i+250);
		});
		setTimeout(function(){
			$('#addGroupe input').eq(0).focus();
		},200);
	}
	static closeAddGroup(){
		$('#addGroupe').css({'display':'', 'opacity':'', 'transform':''});
		$('#addGroupe label, #addGroupe input').removeClass('opened');
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
			'transition':'all 100ms var(--ease-sortir)',
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
			if(e != index) {
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
						'transition':'all 180ms var(--ease)'
					});
				}, e*30+100);
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
		}, 310+(olds.length)*30);
	}
	static promptAddFriend(app){	
		$('#invitation').css({'display':'block'});
		$('#invitation span').html(app.usedGroupe.nom);

		setTimeout(() => {
			$('#invitation').css({'opacity':'1', 'transform':'translateY(0)'});
		},10);
		$('#invitation div, #invitation input, #invitation label, #invitation i').each(function(i){	
			setTimeout(function(){
				$('#invitation div, #invitation input, #invitation label, #invitation i').eq(i).addClass('opened');
			},20*i+250);
		});
		setTimeout(function(){
			$('#invitation input').eq(0).focus();
		},200);
	}
	static closeInvite(){
		$('#invitation').css({'display':'', 'opacity':'', 'transform':''});
		$('#invitation label, #invitation input').removeClass('opened');
	}
	static modal(app, id){
		document.querySelector('#modal').classList.add('opened', id || '');
		if(id == "leaveGroupe"){
			let h4 = document.createElement('h4'),
				ul = document.createElement('ul'),
				childrens = [h4, ul];

			$('#leaveGroupe div').children().remove();

			h4.innerHTML = app.usedGroupe.nom;
			app.usedGroupe.membres.forEach(membre => {
				let li = document.createElement('li');
				li.innerHTML = membre;
				ul.appendChild(li);
			});

			childrens.forEach(child => {
				$('#leaveGroupe div')[0].appendChild(child);
			});
		}
	}
	static closeModal(){
		document.querySelector('#modal').className = '';
	}
	static offlineMsg(app, err, msg){
		msg = msg || "Le réseau est déconnecté ou insuffisant, la requète à été annulée. Cliquez sur \"me notifier\" pour être averti une fois le réseau de retour";

		UI.erreur("Pas de réseau", msg, [
			{ texte: "Me notifier", class:'errorGradient',
				action: () => {
					app.notificationHandler(function(){
						navigator.serviceWorker.ready.then(function(swRegistration) {
							return swRegistration.sync.register('pushOnline');
						});	
					});
					UI.closeMessage();
				} 
			},
			{ texte:"Fermer", action : () => UI.closeMessage(), class: 'greyish'}
		]);
	}
	static acc(app){
		UI.closeCourse();
		app.closePrice();
		UI.closeMenu();
		UI.closeArticle();
		UI.closePreview();
	}
}