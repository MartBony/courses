var course,
	app,
	serveurURL;

class App{
	constructor(){
		this.liPrices = ['0.1','0.5','0.9','1','2','3','4','5','6','7','8','9','10','12','15','17','20'];
		this.state = 0;
		course = new Course();
		this.setParameters();
		this.open($_GET('course') || -1, true);
	}
	setParameters(){
		this.params = {
			currency: "€"
		};
		let toChange = document.querySelectorAll('.prixFlex, .setPrixFlex, .article h3, .preview h3, .calcul p');
		

		if(Storage.getItem("currency")){
			this.params.currency = "$";
			document.querySelector("#params input").checked = true;
		}


		document.querySelector(".prices ul").innerHTML = "";
		this.liPrices.forEach(item => {
			let li = document.createElement("li");
			li.innerHTML = item+this.params.currency;
			document.querySelector(".prices ul").appendChild(li);
		});
		var numLi = $('.prices ul').children().length; // Série des prix
		$('.prices li').each(function(i){
			$(this).css({'filter':'grayscale('+ (i+1)/numLi*50 +'%)'});
		});
		$('.prices li').click(function(){
			var index = $(this).index();
			course.buy(course.priceCursor.index, app.liPrices[index]);
		});


		toChange.forEach(item => {
			item.innerHTML = item.innerHTML.replace(/[\$€]/g, this.params.currency);
		});
	}
	open(idCourse = -1, alternateMSG){
		var hasCachedData = false;
		this.closeCourse();
		this.closePrice();
		this.closeMenu();
		this.closeArticle();
		this.closePreview();


		if (idCourse > -1) { // £_GET js function defined in refresh.js (get the right articles from the cache when offline)
			serveurURL = 'articles.php?course='+ idCourse;
		}
		else{
			serveurURL = 'articles.php';
		}

		storageUPD = requestStorage(idCourse);
		if(storageUPD) {
			this.updatePage(storageUPD);
			hasCachedData = true;
		}
		if (alternateMSG) {
			requestData(serveurURL, false, hasCachedData, `Vous ne pouvez pas accèder à cette page pour l'instant`);
		}
		else{
			requestData(serveurURL, false, hasCachedData);
		}
	}
	refresh(id = -1){
		if (id > -1){
			serveurURL = `articles.php?course=${id}`;
		}
		else if ($_GET('course') && $_GET('course') != '') { // £_GET js function defined in refresh.js (get the right articles from the cache when offline)
			serveurURL = `articles.php?course=${$_GET('course')}`;
		}
		else{
			serveurURL = 'articles.php';
		}
		requestData(serveurURL, true);
	}
	updatePage(data, hasCached = true, refresh = false, network = false){
		if (data[0] == 'error') {
			console.log('error:', data[1]);
			if (error[1] == 'login') {
				alert('Vous avez été déconnectés du service, pour vous reconnecter, demandez un code barre. Une fois scanné le téléphone sera enregistré dans le service.');
			}
		}
		else if(data[0] == 'exception' || data[1] == 'noCourses'){
			setTimeout(() => {
				this.openMenu();
				setTimeout(() => {
					this.addCourse();
					$('.add').css({'display':'none'});
				}, 500);
			}, 1000);
			Storage.clear();
		}
		else if(data[0] == 'done'){

			course.setData(data, this);


			$('.activate').remove();
			$('.add, .calcul').removeClass('hidden').css({'display':''});
			$('#btTouchSurf').css({'visibility':''});

			$('.menu .course').remove();
			data.coursesList.forEach(function(el){
				if(el.id == data.idCourse) {
					$('.menu article').append(Generate.course(el.id, el.nom, 'opened'));
				} else {
					$('.menu article').append(Generate.course(el.id, el.nom));
				}
			});

			if (!refresh) {
				this.closeCourse();
				this.closePrice();
				this.closeMenu();
				this.closeArticle();
				this.closePreview();
			}
			else{
				$('.refresh i').removeClass('ms-Icon--Refresh').addClass('ms-Icon--Accept');
				setTimeout(function(){
					$('.refresh i').addClass('ms-Icon--Refresh').removeClass('ms-Icon--Accept');
				},2000);
			}

			if (data.oldCourse) {
				$('.add, .calcul').addClass('hidden');
				$('#btTouchSurf').css({'visibility':'hidden'});
				$('.add').css({'display':'none'});
				history.replaceState({key:'openCourse'}, '',`index.php?course=${data.idCourse}`);
			}
			else{
				history.replaceState({key:'openCourse'}, '','index.php');
			}

			if (!data.startedState && !data.oldCourse) {
				$('.main ul').prepend(Generate.activate());
				$('.add').addClass('hidden');

				if (!refresh) {
					this.setSwipe(1);
				}
			}

			if (network) { // Update storage
				if(!data.oldCourse){
					var stored = (Storage.getItem('items') || new Array).filter(el => el.idCourse < data.idCourse);
				}else{
					var stored = (Storage.getItem('items') || new Array).filter(el => el.idCourse != data.idCourse);
				}
				//console.log(stored);
				stored.unshift(data);
				Storage.setItem('items', stored);
			}


		}
		else if(data[0] == 'offline'){
			if (refresh == false) {
				if (!hasCached) {
					$('.add').css({'display':'none'});
					$('.list, .prevList').html(
						`<button class="offline" onclick="window.location = 'index.php';">
							<i class="ms-Icon ms-Icon--NetworkTower" aria-hidden="true"></i>
							Vous n'etes pas connectés<br>
							<p>Je reviens à la dernière course</p>
						</button>`
					);
				}
			}
		}
		else{
			console.log('unknown:', data);
		}
	}
	showInstall(delay){
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
	hideInstall(){
		$('.install img, .install').removeClass('opened');
		setTimeout(function(){
			$('.install').css({'display':'none'});
		}, 200);
	}
	notificationHandler(callback){
		if (!("Notification" in window)) {
			alert("This browser does not support desktop notification");
		}

		else if (Notification.permission === "granted") {
			callback();
		}

		else if (Notification.permission !== "denied") {
			Notification.requestPermission().then(function (permission) {
				if (permission === "granted") {
					callback();
				}
			});
		}
	}
	addArticle(){
		$('.add').removeClass('closed');
		$('.addarticle').css({'display':'block', 'opacity':'1'});

		$('.addarticle div, .addarticle input, .addarticle label, .addarticle i').each(function(i){	
			$('.ms-Icon--ShoppingCart').addClass('ms-Icon--ShoppingCartSolid').removeClass('ms-Icon--ShoppingCart');
			setTimeout(function(){
				$('.addarticle div, .addarticle input, .addarticle label, .addarticle i').eq(i).addClass('opened');
			},20*i+250);
		});
		setTimeout(function(){
			$('.addarticle input').eq(0).focus();
		},200);
	}
	closeArticle(){
		$('.add').addClass('closed');

		$('.addarticle').css({'display':'', 'opacity':''});

		$('.ms-Icon--ShoppingCartSolid').addClass('ms-Icon--ShoppingCart').removeClass('ms-Icon--ShoppingCartSolid');
		$('.addarticle label, .addarticle input').removeClass('opened');
	}
	addPreview(){
		$('.add').removeClass('closed');
		$('.addpreview').css({'display':'block', 'opacity':'1'});

		$('.addpreview div, .addpreview input, .addpreview label, .addpreview i').each(function(i){	
			$('.ms-Icon--ShoppingCart').addClass('ms-Icon--ShoppingCartSolid').removeClass('ms-Icon--ShoppingCart');
			setTimeout(function(){
				$('.addpreview div, .addpreview input, .addpreview label, .addpreview i').eq(i).addClass('opened');
			},20*i+250);
		});
		setTimeout(function(){
			$('.addpreview input').eq(0).focus();
		},200);
	}
	closePreview(){
		$('.add').addClass('closed');

		$('.addpreview').css({'display':'', 'opacity':''});

		$('.ms-Icon--ShoppingCartSolid').addClass('ms-Icon--ShoppingCart').removeClass('ms-Icon--ShoppingCartSolid');
		$('.addpreview label, .addpreview input').removeClass('opened');
	}
	addPrice(SQLindex, element){
		course.priceCursor = {index: SQLindex, el: element};
		var titre = $(element).parent().children($('h2')).html();
		$('.prices').css({'display':'block', 'opacity':'1'});
		$('.prices').scrollTop(0);

		$('.prices input, .prices label, .prices div, .prices i, .prices ul').each(function(i){
			$('.ms-Icon--ShoppingCart').addClass('ms-Icon--ShoppingCartSolid').removeClass('ms-Icon--ShoppingCart');
			setTimeout(function(){
				$('.prices input, .prices label, .prices div, .prices i, .prices ul').eq(i).addClass('opened');
			},14*i+150);
		});


		$('.titrePrice').html('<i class="ms-Icon ms-Icon--Money" aria-hidden="true"></i>'+ titre);

		setTimeout(function(){
			$('.prices input').eq(0).focus();
		},200);
	}
	closePrice(){
		course.priceCursor = {};

		$('.prices').css({'display':'', 'opacity':''});
		$('.prices .opened').removeClass('opened');
	}
	addCourse(){
		$('.addCourse').css({'display':'block'});

		setTimeout(() => {
			this.closeMenu();
			$('.addCourse').css({'opacity':'1', 'transform':'translateY(0)'});
		},10);
		$('.addCourse div, .addCourse input, .addCourse label, .addCourse i').each(function(i){	
			setTimeout(function(){
				$('.addCourse div, .addCourse input, .addCourse label, .addCourse i').eq(i).addClass('opened');
			},20*i+250);
		});
		setTimeout(function(){
			$('.addCourse input').eq(0).focus();
		},200);
	}
	closeCourse(){
		$('.addCourse').css({'display':'', 'opacity':'', 'transform':''});
		$('.addCourse label, .addCourse input').removeClass('opened');
	}
	openMenu(){
		$('.menu').css({'display':'block'});
		setTimeout(function(){
			$('.menu').addClass('opened');
		},10);
	}
	closeMenu(){
		$('.menu').css({'display':'none'});
		$('.menu').removeClass('opened');
	}
	openParams(){
		$('#params').css({'display':'flex'});
		setTimeout(function(){
			$('#params').addClass('opened');
		},10);
	}
	closeParams(){
		$('#params').css({'display':'none'});
		$('#params').removeClass('opened');
	}
	removeItem(index){
		var numItems = 0;
		$('.article').each(function(i){
			if (i == index) {
				$('.article').eq(i).css({'transition':'all 300ms cubic-bezier(0.1, 0.9, 0, 1)', 'transform':'scale(0.95)','opacity':'0', 'z-index':'-1'});

			}
			else if (i > index) {
				setTimeout(function(){
					if (window.innerWidth < 600) {
						$('.article').eq(i).css({'transition':'all 300ms cubic-bezier(0.8, 0.1, 0, 1)', 'transform':'translateY(-71px)'});
					}
					else
					{
						if (parseInt(i/2, 10) == i/2) {// si i est pair
							$('.article').eq(i).css({'transition':'all 300ms cubic-bezier(0.8, 0.1, 0, 1)', 'transform':'translateY(-71px) translateX(49.6vw)'});
						}
						else{ // Si i est impair
							$('.article').eq(i).css({'transition':'all 300ms cubic-bezier(0.8, 0.1, 0, 1)', 'transform':'translateX(-49.6vw)'});
						}
					}
				}, (i-index)*30);
			}

			numItems++;
		});
		setTimeout(function(){
			$('.article').css({'transition':'none', 'transform':'none'});
			$('.article').eq(index).remove();
			setTimeout(function(){
				$('.article').css({'transition':'', 'transform':''});
			},50);
		}, 310+(numItems-index)*30);
	}
	removePreview(index){
		var numItems = 0;
		$('.preview').each(function(i){
			if (i == index) {
				$('.preview').eq(i).css({'transition':'all 300ms cubic-bezier(0.1, 0.9, 0, 1)', 'transform':'scale(0.95)','opacity':'0', 'z-index':'-1'});

			}
			else if (i > index) {
				setTimeout(function(){
					if (window.innerWidth < 600) {
						$('.preview').eq(i).css({'transition':'all 300ms cubic-bezier(0.8, 0.1, 0, 1)', 'transform':'translateY(-71px)'});
					}
					else
					{
						if (parseInt(i/2, 10) == i/2) {// si i est pair
							$('.preview').eq(i).css({'transition':'all 300ms cubic-bezier(0.8, 0.1, 0, 1)', 'transform':'translateY(-71px) translateX(49.6vw)'});
						}
						else{ // Si i est impair
							$('.preview').eq(i).css({'transition':'all 300ms cubic-bezier(0.8, 0.1, 0, 1)', 'transform':'translateX(-49.6vw)'});
						}
					}
				}, (i-index)*30);
			}

			numItems++;
		});
		setTimeout(function(){
			$('.preview').css({'transition':'none', 'transform':'none'});
			$('.preview').eq(index).remove();
			setTimeout(function(){
				$('.preview').css({'transition':'', 'transform':''});
			},50);
		}, 310+(numItems-index)*30);
	}
	swipe(direction){
		switch(direction){
			case 'left':
				$('.main').eq(1).css({'display':'block'});
				$('header h1').html('Liste de course');
				setTimeout(function(){
					$('.list, .prevList').css({'transition':'', 'transform':''});
					$('body').addClass('bodyPreview');
					setTimeout(function(){
						$('.main').eq(0).css({'display':'none'});
					},310);
				},10);
				this.state = 1;
				break;
			case 'right':
				$('.main').eq(0).css({'display':'block'});
				$('header h1').html('Panier');
				setTimeout(function(){
					$('.list, .prevList').css({'transition':'', 'transform':''});
					$('body').removeClass('bodyPreview');
					setTimeout(function(){
						$('.main').eq(1).css({'display':'none'});
					},310);
				},10);
				this.state = 0;
				break;
		}
	}
	setSwipe(side){
		var binaryToLF = ['right', 'left'];
		if (this.state == !side) {
			this.swipe(binaryToLF[side]);
		}
	}
}

class Generate{
	static article(id, titre, prix, animation = 'animateSlideIn', addClass = '', appl = app){
		return `<li class="article ${animation} ${addClass}">
			<h2>${titre}</h2><h3>${prix + appl.params.currency}</h3>
			<i class="ms-Icon ms-Icon--Delete" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Cancel noDelete" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Delete Security" aria-hidden="true" onclick="course.initDelete(${id},this,${prix})"></i>
			<div class="bgCards"></div>
		</li>`;
	}
	static preview(id, titre, couleur, animation = 'animateSlideIn', addClass = ''){
		return `<li class="preview ${animation} ${addClass}" style="background:${couleur};">
			<h2>${titre}</h2>
			<i class="ms-Icon ms-Icon--Shop buy" onclick="app.addPrice(${id},this);"></i>
			<i class="ms-Icon ms-Icon--Delete" style="background:${couleur}; aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Cancel noDelete" aria-hidden="true"></i>
			<i class="ms-Icon ms-Icon--Delete Security" aria-hidden="true" onclick="course.initDeletePrev(${id},this)"></i>
			<div class="bgCards"></div>
		</li>`;
	}
	static activate(){
		return `<button class="activate">
			<i class="ms-Icon ms-Icon--Play" aria-hidden="true"></i>
			Je suis dans le magasin<br><p>
			Je lance mes courses</p>
		</button>`;
	}
	static course(id, nom, classe = ''){
		return `<button class="course ${id} ${classe}" onclick="app.open(${id},true);">${nom}</button>`;
	}
}

class Course{
	constructor(){
		this.id;
		this.total;
		this.maxPrice;
		this.coef;
		this.displayed = {
			articles: new Array(),
			previews: new Array()
		};
		this.monthlyPaid;
		this.started;
		this.old;

		this.priceCursor = {
			index: null,
			el: null
		};
	}
	buy(id, prix, appl){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur.php",
			data: { update: 'true', buyPreview: 'true', id: id, prix: prix}
			})
		.then(function(data) {
			var timer = 600;
			var displayedIndex = $(course.priceCursor.el).parent().prevAll('li').length;
	
			$('.loader').removeClass('opened');
			if (course.started == false) {
				$('.activate').click();
				timer = 1000;
			}
	
			app.closePrice();
			app.removePreview(displayedIndex);
			setTimeout(function(){
				app.setSwipe(0);
				setTimeout(function(){
					app.closeCourse();
					app.closeMenu();
					app.closeArticle();
					app.closePreview();
					$('.list').prepend(Generate.article(data.idArticle, data.titre, data.prix));
					course.totalPP(data.prix);
					$('.prices #titreA, .prices #prix').val('');
		
					setTimeout(function(){
						$('.article').removeClass('animateSlideIn');
					},300);
				}, 150);
			}, timer);
	
			var storage = Storage.getItem('items');				
			storage.forEach((el, i) => {
				if(el.idCourse == course.id){
					storage[i].previews = storage[i].previews.filter((obj) => (obj.id != data.idArticle));
					storage[i].articles.unshift({id: data.idArticle, titre: data.titre, prix: data.prix});
				}
			});
			Storage.setItem('items', storage);
	
			course.displayed.previews = course.displayed.previews.filter((obj) => (obj.id != data.idArticle));
			course.displayed.articles.unshift({id: data.idArticle, titre: data.titre, prix: data.prix});
	
		}).catch(function(err){
			$('.loader').removeClass('opened');
			course.offlineMsg(err);
		});
	}
	totalPP(constante, loadPage = false, appl = app){
		if(loadPage == true){
			$('#totalDep').html((this.total).toFixed(2) + appl.params.currency);
			$('#moiDep').html((this.monthlyPaid).toFixed(2) + appl.params.currency);
			$('#moiPrev').html((this.total * this.coef).toFixed(2) + appl.params.currency);
			$('#anPrev').html((this.total * this.coef * 12).toFixed(2) + appl.params.currency);
			if(this.maxPrice < this.total){
				$('html').css({'--colorHeader': 'linear-gradient(-45deg, #CA5010, #E81123)','--colorAdd': 'linear-gradient(45deg, #CA5010, #E81123)','--colorMax': '#CA5010'});
			}
			else{
				$('html').css({'--colorHeader': '','--colorAdd': '','--colorMax': ''});
			}
		}
		else{
			constante = parseFloat(constante);
			this.total += constante;
			this.monthlyPaid += constante;
			$('#totalDep').html((this.total).toFixed(2) + appl.params.currency);
			$('#moiDep').html((this.monthlyPaid).toFixed(2) + appl.params.currency);
			$('#moiPrev').html((this.total * this.coef).toFixed(2) + appl.params.currency);
			$('#anPrev').html((this.total * this.coef * 12).toFixed(2) + appl.params.currency);
			if(this.maxPrice < this.total){
				$('html').css({'--colorHeader': 'linear-gradient(-45deg, #CA5010, #E81123)','--colorAdd': 'linear-gradient(45deg, #CA5010, #E81123)','--colorMax': '#CA5010'});
			}
			else{
				$('html').css({'--colorHeader': '','--colorAdd': '','--colorMax': ''});
			}
		}
	}
	offlineMsg(err, msg = 'Le réseau est déconnecté ou insuffisant, la requette à été annulée'){
		$('.error').css({'display':'flex'});
		$('.error p').html(msg);
		setTimeout(function(){
			$('.error').addClass('opened');
		}, 10);
	}
	setData(data, appl){

		this.id = data.idCourse;
		this.total = data.total;
		this.maxPrice = data.max;
		$('#maxprice').html(data.max + appl.params.currency);
		this.monthlyPaid = data.monthly;
		this.coef = data.coef;
		this.old = data.oldCourse;

		this.totalPP(0, true, appl);

		var attribute = "";
		if (this.old) {
			attribute = "disabled";
		}

		var iter = 0;
		data.articles.forEach((article, index) => {
			iter++;
			if (this.displayed.articles[index]) {
				if (article.id != this.displayed.articles[index].id){
					$('.list .article').eq(index).after(Generate.article(article.id, article.titre, article.prix, 'animateSlideTop', attribute, appl));
					$('.list .article').eq(index).remove();
				}
			}
			else{
				$('.list').append(Generate.article(article.id, article.titre, article.prix, 'animateSlideTop', attribute, appl));
			}
		});


		if (iter < this.displayed.articles.length) {
			$('.list .article').slice(iter).remove();
		}

		iter = 0;
		data.previews.forEach((preview, index) => {
			iter++;
			if (this.displayed.previews[index]) {
				if (preview.id != this.displayed.previews[index].id){
					$('.prevList .preview').eq(index).after(Generate.preview(preview.id, preview.titre, preview.color, 'animateSlideTop', attribute));
					$('.prevList .preview').eq(index).remove();
				}
			}
			else{
				$('.prevList').append(Generate.preview(preview.id, preview.titre, preview.color, 'animateSlideTop', attribute));
			}
		});

		if (iter < this.displayed.previews.length) {
			$('.prevList .preview').slice(iter).remove();
		}

		setTimeout(function(){
			$('.article, .preview').removeClass('animateSlideTop');
		},600);

		this.displayed = {
			articles: data.articles,
			previews: data.previews
		}

		this.started = data.startedState;

	}
	initPostRequest(e, parent, eq) {
		if (e.which == 13 || e.keyCode == 13 || e.key == 13) {
			$(parent +' input').eq(eq).click();
			return false;
		}
	}
	switchEnter(e, parent, eq) {
		if (e.which == 13 || e.keyCode == 13 || e.key == 13) {
			$(parent +' input').eq(eq).focus();
			return false;
		}
	}
	initDelete(index, object, prix){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur.php",
			data: { update: 'true', deleteArticle: 'true', id: index}
			})
		.then(data => {

			var displayedIndex = $(object).parent().prevAll('li').length;
			if (data[0] == 'done') {
				$('.loader').removeClass('opened');
				course.totalPP(-data[1]);
				app.removeItem(displayedIndex);

				var storage = Storage.getItem('items');				
				storage.forEach((el, i) => {
					if(el.idCourse == this.id){
						storage[i].articles = storage[i].articles.filter(el => el.id != index);
					}
				});

				this.displayed.articles = this.displayed.articles.filter(el => el.id != index);

				Storage.setItem('items', storage);
			}

		})
		.catch(err => {
			$('.loader').removeClass('opened');
			course.offlineMsg(err);
		});
		
	}
	initDeletePrev(index, object){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur.php",
			data: { update: 'true', deletePreview: 'true', id: index}
			})
		.then(data => {
			var displayedIndex = $(object).parent().prevAll('li').length;
			if (data[0] == 'done') {
				$('.loader').removeClass('opened');
				$('.article, .preview').removeClass('ready');
				app.removePreview(displayedIndex);


				var storage = Storage.getItem('items');				
				storage.forEach((el, i) => {
					if(el.idCourse == this.id){
						storage[i].previews = storage[i].previews.filter(el => el.id != index);
					}
				});
				this.displayed.previews = this.displayed.previews.filter(el => el.id != index);

				Storage.setItem('items', storage);
			}
		})
		.catch(err => {
			$('.loader').removeClass('opened');
			course.offlineMsg(err);
		});
	}
}