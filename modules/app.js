import UI from './UI.js';
import Course from './course.js';
import Generate from './generate.js';
import Storage from './storage.js';
import $_GET from './get.js';
import { requestData, requestGroups, requestStorage } from './requests.js';


var course,
	serveurURL,
	storageUPD;

class App{
	constructor(){
		this.groupes;
		this.liPrices = ['0.1','0.5','0.9','1','2','3','4','5','6','7','8','9','10','12','15','17','20'];
		this.state = 0;
		course = new Course();
		this.setParameters();
		requestGroups(this);
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


		document.querySelector("#prices ul").innerHTML = "";
		this.liPrices.forEach(item => {
			let li = document.createElement("li");
			li.innerHTML = item+this.params.currency;
			document.querySelector("#prices ul").appendChild(li);
		});
		var numLi = $('#prices ul').children().length; // Série des prix
		$('#prices li').each(i => {
			$('#prices li').eq(i).css({'filter':'grayscale('+ (i+1)/numLi*50 +'%)'});
		});

		toChange.forEach(item => {
			item.innerHTML = item.innerHTML.replace(/[\$€]/g, this.params.currency);
		});
	}
	open(idCourse = -1, alternateMSG){
		var hasCachedData = false;
		UI.closeCourse();
		this.closePrice();
		UI.closeMenu();
		UI.closeArticle();
		UI.closePreview();


		serveurURL = 'serveur/pull.php';
		if (idCourse > -1) serveurURL += '?course='+ idCourse;

		storageUPD = requestStorage(idCourse);
		if(storageUPD) {
			this.updatePage(storageUPD);
			hasCachedData = true;
		}
		if (alternateMSG) {
			requestData(this, serveurURL, false, hasCachedData, `Vous ne pouvez pas accèder à cette page pour l'instant`);
		}
		else{
			requestData(this, serveurURL, false, hasCachedData);
		}
	}
	refresh(id = -1){

		serveurURL = 'serveur/pull.php';
		if (id > -1) serveurURL += `?course=${id}`;
		else if ($_GET('course') && $_GET('course') != '') serveurURL += `?course=${$_GET('course')}`;

		requestData(this, serveurURL, true);
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
				UI.openMenu();
				setTimeout(() => {
					UI.addCourse();
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
			data.coursesList.forEach(el => {
				if(el.id == data.idCourse) {
					$('.menu article').append(Generate.course(this, el.id, el.nom, 'opened'));
				} else {
					$('.menu article').append(Generate.course(this, el.id, el.nom));
				}
			});

			if (!refresh) {
				UI.closeCourse();
				this.closePrice();
				UI.closeMenu();
				UI.closeArticle();
				UI.closePreview();
			}
			else{
				$('#refresh i').removeClass('ms-Icon--Refresh').addClass('ms-Icon--Accept');
				setTimeout(function(){
					$('#refresh i').addClass('ms-Icon--Refresh').removeClass('ms-Icon--Accept');
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
	setGroups(data){
		if (data.state === 200){
			this.groupes = data.groupes;
			this.groupes.forEach(grp => {
				$('#groupes').append(Generate.groupe(this, grp.id, grp.nom, grp.code, grp.membres));
			});
		}
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
	addPrice(e, SQLindex){
		course.priceCursor = {index: SQLindex, el: e.target};
		var titre = $(e.target).parent().children($('h2')).html();
		$('#prices').css({'display':'block', 'opacity':'1'});
		$('#prices').scrollTop(0);

		$('#prices input, #prices label, #prices div, #prices i, #prices ul').each(function(i){
			$('.ms-Icon--ShoppingCart').addClass('ms-Icon--ShoppingCartSolid').removeClass('ms-Icon--ShoppingCart');
			setTimeout(function(){
				$('#prices input, #prices label, #prices div, #prices i, #prices ul').eq(i).addClass('opened');
			},14*i+150);
		});


		$('.titrePrice').html('<i class="ms-Icon ms-Icon--Money" aria-hidden="true"></i>'+ titre);

		setTimeout(function(){
			$('#prices input').eq(0).focus();
		},200);
	}
	closePrice(){
		course.priceCursor = {};

		$('#prices').css({'display':'', 'opacity':''});
		$('#prices .opened').removeClass('opened');
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
	deleteArticle(e, index, prix){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "../serveur/push.php",
			data: { update: 'true', deleteArticle: 'true', id: index}
		}).then(data => {

			var displayedIndex = $(e.target).parent().prevAll('li').length;
			if (data[0] == 'done') {
				$('.loader').removeClass('opened');
				course.totalPP(-data[1], false, this);
				UI.remove("article", displayedIndex);

				var storage = Storage.getItem('items');				
				storage.forEach((el, i) => {
					if(el.idCourse == course.id){
						storage[i].articles = storage[i].articles.filter(el => el.id != index);
					}
				});

				course.displayed.articles = course.displayed.articles.filter(el => el.id != index);

				Storage.setItem('items', storage);
			}

		}).catch(err => {
			console.log(err);
			$('.loader').removeClass('opened');
			App.offlineMsg(err);
		});
		
	}
	deletePreview(e, index){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "../serveur/push.php",
			data: { update: 'true', deletePreview: 'true', id: index}
		}).then(data => {
			var displayedIndex = $(e.target).parent().prevAll('li').length;
			if (data[0] == 'done') {
				$('.loader').removeClass('opened');
				$('.article, .preview').removeClass('ready');
				UI.remove("preview", displayedIndex);


				var storage = Storage.getItem('items');				
				storage.forEach((el, i) => {
					if(el.idCourse == course.id){
						storage[i].previews = storage[i].previews.filter(el => el.id != index);
					}
				});
				course.displayed.previews = course.displayed.previews.filter(el => el.id != index);

				Storage.setItem('items', storage);
			}
		}).catch(err => {
			console.log(err);
			$('.loader').removeClass('opened');
			App.offlineMsg(err);
		});
	}
	buy(id, prix){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "../serveur/push.php",
			data: { update: 'true', buyPreview: 'true', id: id, prix: prix}
		}).then(data => {
			var timer = 600;
			var displayedIndex = $(course.priceCursor.el).parent().prevAll('li').length;
	
			$('.loader').removeClass('opened');
			if (course.started == false) {
				$('.activate').click();
				timer = 1000;
			}
	
			this.closePrice();
			UI.remove("preview",displayedIndex);
			setTimeout(() => {
				this.setSwipe(0);
				setTimeout(() => {
					UI.closeCourse();
					UI.closeMenu();
					UI.closeArticle();
					UI.closePreview();
					$('.list').prepend(Generate.article(data.idArticle, data.titre, data.prix, this));
					course.totalPP(data.prix, false, this);
					$('.prices #titreA, .prices #prix').val('');
		
					setTimeout(() => {
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
	
		}).catch((err) => {
			console.log(err);
			$('.loader').removeClass('opened');
			self.offlineMsg(err);
		});
	}
}

export default App;
export { course };