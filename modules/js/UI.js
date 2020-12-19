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
	static closeForms(){
		document.querySelector('#forms').className = "";
		Array.from(document.querySelectorAll('#forms div, #forms input, #forms label, #forms i, #forms ul')).forEach(el => {
			el.classList.remove('opened');
		});
	}
	static closeMessage(){
		document.querySelectorAll('.notification').forEach(el => el.classList.remove('opened'));
	}
	static openPanel(type, data = null, app = null){
		document.getElementById('depensesChart').style.opacity = "0";
		document.getElementById('mainPanel').className = "";
		document.getElementById('mainPanel').classList.add(type);
		if(type == 'calcul' && data && app) UI.openChart(app, data);
	}
	static openMenus(type, data = null, app = null){
		Array.from(document.querySelectorAll('#backTouchSurf, #btTouchSurf')).forEach(el => el.style.visibility = "hidden");
		document.getElementById('menus').classList.remove('calcul', 'params');
		document.getElementById('menus').classList.add('opened', type);
		if(type == 'calcul' && data && app) UI.openChart(app, data);
	}
	static closeMenus(){
		document.getElementById('menus').className = "";
		document.getElementById('depensesChart').style.opacity = "0";
	}
	static initChart(app){
		const ctx = document.getElementById('depensesChart').getContext('2d');
		app.chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: new Array(6).fill(""),
				datasets: [{
					label: 'Coût',
					data: new Array(6).fill(0),
					backgroundColor: 'rgba(54, 162, 235, 0.2)',
					borderColor: 'rgba(54, 162, 235, 1)',
					borderWidth: 1
				}]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true
						}
					}]
				}
			}
		});
	}
	static openChart(app, data){
		console.log(data);
		document.getElementById('depensesChart').style.opacity = "1";
		const labels = Array(data.length).fill("");
		labels[labels.length-1] = "Mois Actuel";
		app.chart.data.labels = labels;
		app.chart.data.datasets.forEach(dataset => dataset.data = data);
		app.chart.update();
	}
	static modal(app, id, data){
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

		} else if (id == "deleteCourse" && data) document.getElementById('deleteCourse').setAttribute("idCourse", data);
		
	}
	static closeModal(){
		document.querySelector('#modal').className = '';
	}
	static offlineMsg(app, err, msg){
		console.log(err);
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
		UI.closeForms();
		UI.closeMenus();
		UI.closePrice();
		UI.hideOptions();
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
		$('#add').removeClass('closed');
		document.getElementById("forms").classList.add('opened','formArticle');

		$('#addArticle div, #addArticle input, #addArticle label, #addArticle i').each(function(i){	
			setTimeout(function(){
				$('#addArticle div, #addArticle input, #addArticle label, #addArticle i').eq(i).addClass('opened');
			},20*i+250);
		});
		setTimeout(function(){
			$('#addArticle input').eq(0).focus();
		},200);
	}
	static addPreview(){
		$('#add').removeClass('closed');
		
		document.getElementById("forms").classList.add('opened','formPreview');

		$('#addPreview div, #addPreview input, #addPreview label, #addPreview i').each(function(i){	
			setTimeout(function(){
				$('#addPreview div, #addPreview input, #addPreview label, #addPreview i').eq(i).addClass('opened');
			},20*i+250);
		});
		setTimeout(function(){
			$('#addPreview input').eq(0).focus();
		},200);
	}
	static addPrice(app, id){
		let item = app.course.items.previews.filter(item => item.id == id)[0];

		document.getElementById("prices").setAttribute("key", id);
		$('#prices').css({'display':'block', 'opacity':'1'});
		$('#prices').scrollTop(0);
		$('.ms-Icon--ShoppingCart').addClass('ms-Icon--ShoppingCartSolid').removeClass('ms-Icon--ShoppingCart');
		$('.titrePrice').html('<i class="ms-Icon ms-Icon--Money" aria-hidden="true"></i>'+ item.titre);

		document.getElementById("forms").classList.add('opened','prices');

		$('#prices div, #prices input, #prices label, #prices i, #prices ul').each(function(i){	
			setTimeout(function(){
				$('#prices div, #prices input, #prices label, #prices i, #prices ul').eq(i).addClass('opened');
			},20*i+250);
		});
		setTimeout(function(){
			$('#prices input').eq(0).focus();
		},200);
	}
	static closePrice(){
		UI.closeForms();
	}
	static addCourse(){
		document.getElementById("forms").classList.add('opened','course');

		$('#addCourse div, #addCourse input, #addCourse label, #addCourse i').each(function(i){	
			setTimeout(function(){
				$('#addCourse div, #addCourse input, #addCourse label, #addCourse i').eq(i).addClass('opened');
			},20*i+250);
		});
		setTimeout(function(){
			$('#addCourse input').eq(0).focus();
		},200);
	}
	static openMenu(){
		//$('.menu').css({'display':'block'});
		setTimeout(function(){
			$('.menu').addClass('opened');
		},10);
	}
	static openParams(){
		//$('#params').css({'display':'block'});
		setTimeout(function(){
			$('#params').addClass('opened');
		},10);
	}
	static openAddGroup(){
		document.getElementById("forms").classList.add('opened','groupe');

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
			news = new Array(),
			//containers = new Array(2),
			adder = type == "article" ? "#panier .adder" : "#liste .adder";

			
		Array.from(document.getElementsByClassName('main')).forEach(el => el.style.height = el.clientHeight +'px');

		// Fix .adder in place
		$(adder).css({
			"left": $(adder).position().left,
			"top": $(adder).position().top
		});
		$(adder).css({'position':'absolute'});
		


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

			Array.from(document.getElementsByClassName('main')).forEach(el => el.style.height = 'auto');

			$(adder).css({'transition':'0s', 'transform':'', 'position':'','top':'','left':''});
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


		}, 400+(olds.length)*32);
	}
	static promptAddFriend(app){
		$('#invitation span').html(app.usedGroupe.nom);

		document.getElementById("forms").classList.add('opened','invite');

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
	static showOptions(app, type, el){
		let options,
			childrens,
			id,
			rect,
			padding;
			
		switch(type){
			case "article":
				options = Array.from(document.getElementsByClassName('options'))[0];
				childrens = Array.from(options.children);
				id = el.getAttribute('idItem');
				rect = el.getBoundingClientRect();
				padding = 5;
				
				let articleData = app.course.items.articles.filter(article => article.id == id)[0];

				options.classList.add('opened');
				options.style.top = (el.offsetTop + padding) + "px";
				options.style.left = (el.offsetLeft + padding) + "px";
				options.style.width = (rect.width - 2*padding) +"px";
				options.style.height = (rect.height - 2*padding) +"px";
				options.setAttribute("key", id);
				childrens[0].innerHTML = articleData.prix + app.params.currency +" HT";
				childrens[1].innerHTML = (articleData.prix * (1+app.course.taxes)).toFixed(2) + app.params.currency;
				break;
			case "preview":
				options = Array.from(document.getElementsByClassName('options'))[1];
				childrens = Array.from(options.children);
				id = el.getAttribute('idItem');
				rect = el.getBoundingClientRect();
				padding = 5;

				options.classList.add('opened');
				options.style.top = (el.offsetTop + padding) + "px";
				options.style.left = (el.offsetLeft + padding) + "px";
				options.style.width = (rect.width - 2*padding) +"px";
				options.style.height = (rect.height - 2*padding) +"px";
				options.setAttribute("key", id);
				break;
		}
	}
	static hideOptions(){
		Array.from(document.getElementsByClassName('options')).forEach(option => {
			option.classList.remove('opened');
		});
	}
	static setTheme(themeName) {
		localStorage.setItem('theme', themeName);
		document.documentElement.className = themeName;
	}
	static toggleTheme() {
		if (localStorage.getItem('theme') === 'theme-dark') {
			UI.setTheme('theme-light');
		} else {
			UI.setTheme('theme-dark');
		}
	}
}
