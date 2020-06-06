import UI from './UI.js';
import Course from './course.js';
import Storage from './storage.js';
import {$_GET, jsonEqual} from './tools.js';
import Pull from './requests.js';
import Generate from './generate.js';


let course;

class App{
	constructor(){
		course = new Course();

		this.groupes;
		this.usedGroupe; // Rank in array of groups
		this.liPrices = [0.1,0.5,0.9,1,2,3,4,5,6,7,8,9,10,12,15,17,20];
		this.state = 0;
		this.setParameters();
		this.open(Number($_GET('course')) || 0);

		this.errors = {
			readOnly: "Vous êtes hors ligne, vous pouvez utiliser l'application consultation seulement",
			noAccess: "Cette page est innaccessible pour l'instant"
		}
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
	open(rank = 0){// Rank as index of array
		$('.loader').addClass('opened');
		// Load from localStorage
		var hasCached = this.openOffline(rank);
		setTimeout(() => {$('.loader').removeClass('opened')}, 3000);

		
		// Load from network
		Pull.groupes(this, hasCached.groupes).then(state => {
			if (state || hasCached.groupes){
				if(this.getUsedGroup().coursesList.length != 0){
					Pull.course(this, this.getUsedGroup().coursesList[rank].id, hasCached.course).then(() => {
						$('.loader').removeClass('opened');
					});
				} else {
					$('.loader').removeClass('opened');
				}
			}
		});
		
	}
	openOffline(rank = 0){
		let hasCached = {
			groupes: false,
			course: false
		};
		
		if(Storage.getItem('groupes')){
			let groupData = {
				status: 200,
				groupes: Storage.getItem('groupes')
			};
			if(groupData.groupes && groupData.groupes.length != 0){
				let initGroupes = this.updateGroups(groupData);
				hasCached.groupes = true;
				if(initGroupes){
					console.log('Storage groupes fetched:', groupData);

					if(Storage.getItem('courses')){
						let idCourse = this.getUsedGroup().coursesList[rank].id,
							courseData = {
								status: 200,
								course: Storage.getItem('courses').filter(el => el.id == idCourse)[0]
							};
						if(courseData.course) {
							this.updateItems(courseData);
							$('.loader').removeClass('opened');
							hasCached.course = true;
							console.log('Storage items fetched:', courseData);
						}

					}
				} else if (initGroupes == false) {
					return {groupes: true, course: 204};
				}

				setTimeout(() => {$('.loader').removeClass('opened')}, 1000);
			}
		}

		return hasCached;
	}
	refresh(){
		let rank = $_GET('course') || 0;
		Pull.groupes(this).then(state => {
			if (state){
				Pull.course(this, this.getUsedGroup().coursesList[rank].id);
			}
		});
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
			url: "serveur/push.php",
			data: { update: 'true', deleteArticle: 'true', id: index, groupe: this.getUsedGroup().id}
		}).then(data => {

			var displayedIndex = $(e.target).parent().prevAll('li').length;
			if (data[0] == 'done') {
				$('.loader').removeClass('opened');
				this.totalPP(-data[1]);
				UI.remove("article", displayedIndex);

				var storage = Storage.getItem('courses');				
				storage.forEach((el, i) => {
					if(el.id == course.id){
						storage[i].items.articles = storage[i].items.articles.filter(el => el.id != index);
					}
				});
				Storage.setItem('courses', storage);

				course.displayed.articles = course.displayed.articles.filter(el => el.id != index);
			}

		}).catch(err => {
			console.log(err);
			$('.loader').removeClass('opened');
			UI.offlineMsg(err);
		});
		
	}
	deletePreview(e, index){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur/push.php",
			data: { update: 'true', deletePreview: 'true', id: index, groupe: this.getUsedGroup().id}
		}).then(data => {
			var displayedIndex = $(e.target).parent().prevAll('li').length;
			if (data[0] == 'done') {
				$('.loader').removeClass('opened');
				$('.article, .preview').removeClass('ready');
				UI.remove("preview", displayedIndex);

				var storage = Storage.getItem('courses');				
				storage.forEach((el, i) => {
					if(el.idCourse == course.id){
						storage[i].items.previews = storage[i].items.previews.filter(el => el.id != index);
					}
				});
				Storage.setItem('courses', storage);

				course.displayed.previews = course.displayed.previews.filter(el => el.id != index);
			}
		}).catch(err => {
			console.log(err);
			$('.loader').removeClass('opened');
			UI.offlineMsg(err);
		});
	}
	buy(id, prix){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur/push.php",
			data: { update: 'true', buyPreview: 'true', id: id, prix: prix, groupe: this.getUsedGroup().id}
		}).then(data => {
			let timer = 600,
				displayedIndex = $(course.priceCursor.el).parent().prevAll('li').length;
	
			$('.loader').removeClass('opened');
			if (!course.started) {
				$('.activate').click();
				timer = 1000;
			}
	
			this.closePrice();
			UI.remove("preview", displayedIndex);
			setTimeout(() => {
				this.setSwipe(0);
				setTimeout(() => {
					UI.acc(this);
					$('.list').prepend(Generate.article(this, data.id, data.titre, data.prix));

					this.totalPP(data.prix);
					$('.prices #titreA, .prices #prix').val('');
		
					setTimeout(() => {
						$('.article').removeClass('animateSlideIn');
					},300);
				}, 150);
			}, timer);
	
			var storage = Storage.getItem('courses');				
			storage.forEach((el, i) => {
				if(el.id == course.id){
					storage[i].items.previews = storage[i].items.previews.filter((obj) => (obj.id != data.id));
					storage[i].items.articles.unshift({id: data.id, titre: data.titre, prix: data.prix});
				}
			});
			Storage.setItem('courses', storage);
	
			course.displayed.previews = course.displayed.previews.filter((obj) => (obj.id != data.id));
			course.displayed.articles.unshift({id: data.id, titre: data.titre, prix: data.prix});
	
		}).catch((err) => {
			console.log(err);
			$('.loader').removeClass('opened');
			UI.offlineMsg(err);
		});
	}
	updateGroups(data){
		if (data.status === 200){
			let usedGroupRank = Storage.getItem('usedGroup') || 0;
			if(!jsonEqual(this.groupes, data.groupes)){
				Storage.setItem('groupes', data.groupes);
				$('.groupe').remove();
				data.groupes.forEach(grp => {
					$('#groupes').append(Generate.groupe(this, grp.id, grp.nom, grp.code, grp.membres));
				});
				this.groupes = data.groupes;

			}
			if(this.getUsedGroup() != this.getGroup(usedGroupRank)){
				return this.switchGroup(usedGroupRank);
			} else return true;
		}

	}
	switchGroup(rank){ // Rank in array
		this.usedGroupe = rank;

		// UPD UI parametres
		$('.groupe').removeClass('opened'); // Change Group
		$('.groupe').eq(rank).addClass('opened');
	
		$('.add, .calcul').removeClass('hidden').css({'display':'', 'visibility':''});
		$('.activate, .noCourse, noGroupe').remove();
		
		// UPD CourseList
		$('.menu .course').remove();
		if(this.getUsedGroup().coursesList && this.getUsedGroup().coursesList.length != 0){
			this.getUsedGroup().coursesList.forEach((el, id) => {
				$('.menu article').append(Generate.course(this, id, el.nom));
			});
			return true;
		} else {
			$('.add, .calcul').css({'visibility':'hidden'});
			$('.main ul').prepend(Generate.noCourse());
			return false;
		}
		
	}
	getUsedGroup(){
		if(this.groupes) return this.groupes[this.usedGroupe];
	}
	getGroup(rank){
		if(this.groupes) return this.groupes[rank]
	}
	updateItems(data, network = false, refresh = false){
		if (data.status === 200){
			let rank = this.getUsedGroup().coursesList.indexOf(this.getUsedGroup().coursesList.filter(el => el.id == data.course.id)[0]);
			course.update(this, data.course);

			$('.menu .course').removeClass('opened');
			$('.activate, .noCourse').remove();
			$('.add, .calcul').removeClass('hidden').css({'display':'', 'visibility':''});
			$('#btTouchSurf').css({'visibility':''});

			data = data.course;
			$('.menu .course').eq(rank).addClass('opened');

			if (!refresh) {
				UI.acc(this);
			}
			else{
				$('#refresh i').removeClass('ms-Icon--Refresh').addClass('ms-Icon--Accept');
				setTimeout(function(){
					$('#refresh i').addClass('ms-Icon--Refresh').removeClass('ms-Icon--Accept');
				},2000);
			}
			if (course.old) {
				$('.add, .calcul').addClass('hidden');
				$('#btTouchSurf').css({'visibility':'hidden'});
				$('.add').css({'display':'none'});
				history.replaceState({key:'openCourse'}, '',`index.php?course=${rank}`);
			}
			else{
				history.replaceState({key:'openCourse'}, '','index.php');
			}

			if (data.dateStart == 0 && !course.old) {
				$('.main ul').prepend(Generate.activate());
				$('.add').addClass('hidden');

				if (!refresh) {
					this.setSwipe(1);
				}
			}

			if (network) {
				let stored = (Storage.getItem('courses') || new Array).filter(el => el.id != data.id);
			
				stored.unshift(data);
				Storage.setItem('courses', stored);
			}

		}
	}
	totalPP(constante, reset = false){
		if(reset){
			$('#totalDep').html(Number(course.total).toFixed(2) + this.params.currency);
			$('#moiDep').html(Number(course.monthCost).toFixed(2) + this.params.currency);
			$('#moiPrev').html(Number(course.total * course.coef).toFixed(2) + this.params.currency);
			$('#anPrev').html(Number(course.total * course.coef * 12).toFixed(2) + this.params.currency);
			if(course.maxPrice < course.total){
				$('html').css({'--colorHeader': 'linear-gradient(-45deg, #CA5010, #E81123)','--colorAdd': 'linear-gradient(45deg, #CA5010, #E81123)','--colorMax': '#CA5010'});
			}
			else{
				$('html').css({'--colorHeader': '','--colorAdd': '','--colorMax': ''});
			}
		}
		else{
			constante = parseFloat(constante);
			course.total += constante;
			course.monthCost += constante;
			$('#totalDep').html(Number(course.total).toFixed(2) + this.params.currency);
			$('#moiDep').html(Number(course.monthCost).toFixed(2) + this.params.currency);
			$('#moiPrev').html(Number(course.total * course.coef).toFixed(2) + this.params.currency);
			$('#anPrev').html(Number(course.total * course.coef * 12).toFixed(2) + this.params.currency);
			if(course.maxPrice < course.total){
				$('html').css({'--colorHeader': 'linear-gradient(-45deg, #CA5010, #E81123)','--colorAdd': 'linear-gradient(45deg, #CA5010, #E81123)','--colorMax': '#CA5010'});
			}
			else{
				$('html').css({'--colorHeader': '','--colorAdd': '','--colorMax': ''});
			}
		}
	}
}

export default App;
export { course };