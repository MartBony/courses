import UI from './UI.js';
import Course from './course.js';
import Storage from './storage.js';
import {$_GET, jsonEqual} from './tools.js';
import Pull from './requests.js';
import Generate from './generate.js';
import mod from './math.js';


let course;

class App{
	constructor(){
		course = new Course();

		this.groupes;
		this.usedGroupe;
		this.usedCourse;
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
	open(groupe, rang){// Rank as index of array
		$('.loader').addClass('opened');
		// Load from localStorage
		var hasCached = this.openOffline(groupe, rang);

		
		Pull.invitations(this);
		// Load from network
		Pull.groupes(this, groupe, hasCached.groupes).then(state => {
			if(state){ // Si les groupes ont étés chargés et si il existe des courses
				let rangCourse = mod(rang, this.usedGroupe.coursesList.length-1) || Storage.getItem('usedCourse') || 0,
					idCourse = this.usedGroupe.coursesList[rangCourse].id;
				Pull.course(this, idCourse, rangCourse, hasCached.course).then(() => {
					$('.loader').removeClass('opened');
				});
			} else $('.loader').removeClass('opened');
		});
		
	}
	openOffline(groupe, rangCourse){
		let hasCached = {
			groupes: false,
			course: false
		};
		
		let groupData = {
				status: 200,
				groupes: Storage.getItem('groupes')
			},
			initGroupes = this.updateGroups(groupData, groupe, false);
		if(typeof initGroupes !== 'undefined'){ // Si les groupes ont étés chargés
			$('.loader').removeClass('opened');
			console.log('Storage groupes fetched:', groupData);
			hasCached.groupes = true;

			if(initGroupes){ // Si il existe des courses
				rangCourse = mod(rangCourse, this.usedGroupe.coursesList.length-1) || Storage.getItem('usedCourse') || 0;
				let idCourse = this.usedGroupe.coursesList[rangCourse].id;
				if(Storage.getItem('courses') && Storage.getItem('courses').filter(el => el.id == idCourse).length == 1){
					let courseData = {
							status: 200,
							course: Storage.getItem('courses').filter(el => el.id == idCourse)[0]
						},
						initCourse = this.updateCourse(courseData, rangCourse, false);
					if(initCourse) {
						console.log('Storage items fetched:', courseData);
						hasCached.course = true;
					}
				}
			}
			

		}

		return hasCached;
	}
	refresh(rang){ // No storage invoqued, rank of course
		Pull.groupes(this).then(state => {
			if(state){ // Si les groupes ont étés chargés et si il existe des courses
				let rangCourse = mod(rang, this.usedGroupe.coursesList.length-1) || Storage.getItem('usedCourse') || 0,
					idCourse = this.usedGroupe.coursesList[rangCourse].id;
				Pull.course(this, idCourse, rangCourse).then(() => {
					$('.loader').removeClass('opened');
				});
			} else $('.loader').removeClass('opened');
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
			data: { update: 'true', deleteArticle: 'true', id: index, groupe: this.usedGroupe.id}
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
			data: { update: 'true', deletePreview: 'true', id: index, groupe: this.usedGroupe.id}
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
	leaveGrp(){
		if(this.usedGroupe && this.usedGroupe.id){
			$('.loader').addClass('opened');
			$.ajax({
				method: "POST",
				url: "serveur/push.php",
				data: {leaveGroup: 'true', groupe: this.usedGroupe.id}
			}).then(data => {
				if(data.status == 200){
					$('.loader').removeClass('opened');
					UI.backLeave();
					Storage.clear();
					this.open();
				} else {
					alert("Le serveur a rencontré un problème");
				}
			}).catch(err => {
				$('.loader').removeClass('opened');
				UI.offlineMsg(err);
			});
		}
	}
	buy(id, prix){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur/push.php",
			data: { update: 'true', buyPreview: 'true', id: id, prix: prix, groupe: this.usedGroupe.id}
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
			$('.loader').removeClass('opened');
			UI.offlineMsg(err);
		});
	}
	updateGroups(data, idGroupe, network = true){
		if (data.status === 200){
			if(data.nom){
				$('#compte em').html(data.nom);
			}

			if(data.groupes && data.groupes.length != 0){ // There are groups
				UI.closeNoGroupe();
				if(!jsonEqual(this.groupes, data.groupes)){ // The groups changed

					if(network) Storage.setItem('groupes', data.groupes)
					$('.groupe').remove();
					data.groupes.forEach(grp => {
						$('#groupes').append(Generate.groupe(this, grp.id, grp.nom, grp.membres));
					});
					this.groupes = data.groupes;

				}

				let id = idGroupe || Storage.getItem('usedGroup') || false,
					target;

				if(id && data.groupes.filter(el => el.id == id).length == 1) target = data.groupes.filter(el => el.id == id)[0]
				else target = data.groupes[0]

				if(target && target.coursesList && target.id && target.membres && target.nom){
					$('.activate, .noCourse').remove();
					UI.closeNoGroupe();
					$('.add, .calcul').css({'visibility':''});
					
					return this.switchGroup(target, network);
			

				} else UI.offlineMsg("Targeted group content lacks/incomplete", "Le groupe demandé est indisponible pour l'instant")
			} else {
				$('.groupe').remove();
				Storage.clear();
				$('.loader').removeClass('opened');
				$('.activate, .noCourse').remove();
				$('.add, .calcul').css({'visibility':'hidden'});
				UI.promptNoGroupe();
			}
			
		}
	}
	switchGroup(groupe, network){
		this.usedGroupe = groupe;
		Storage.setItem('usedCourse', false);
		Storage.setItem('usedGroup', groupe.id);

		// UPD UI parametres
		$('.groupe').removeClass('opened');
		$('.groupe.g'+ groupe.id).addClass('opened');
	
		$('.add, .calcul').removeClass('hidden').css({'display':'', 'visibility':''});
		$('.activate, .noCourse').remove();
		UI.closeNoGroupe();
		
		// UPD CourseList
		$('.menu .course').remove();
		if(this.usedGroupe.coursesList && this.usedGroupe.coursesList.length != 0){ // Il y a une course
			this.usedGroupe.coursesList.forEach((el, id) => {
				$('.menu article').append(Generate.course(this, id, el.nom));
			});
		} else {
			$('.activate, .noCourse').remove();
			UI.closeNoGroupe();
			$('.add, .calcul').css({'visibility':'hidden'});
			$('.main ul').children().remove();
			$('.main ul').prepend(Generate.noCourse());

			return false;
		}


		return true;

	}
	updateCourse(data, rang, network = true, refresh = false){
		if(data.status == 200){
			rang = rang || 0;
			if(data.course && data.course.id && data.course.nom && data.course.items){
				$('.activate, .noCourse').remove();
				UI.closeNoGroupe();
				$('.add, .calcul').css({'visibility':''});

				
				if(!jsonEqual(this.usedCourse, data.course)){

					if(network){

						let storage = (Storage.getItem('courses') || new Array).filter(el => el.id != data.course.id);
						storage.unshift(data.course);
						Storage.setItem('courses', storage);

					}
					
					this.switchCourse(data.course, rang, network);
				}

				return true;

			} else UI.offlineMsg("Targeted course content lacks/incomplete", "La course demandée est indisponible pour l'instant")

		}
	}
	switchCourse(data, rank, network, refresh){
		Storage.setItem('usedCourse', rank);
		course.update(this, data);

		$('.menu .course').removeClass('opened');
		$('.activate, .noCourse').remove();
		UI.closeNoGroupe();
		$('.add, .calcul').removeClass('hidden').css({'display':'', 'visibility':''});
		$('#btTouchSurf').css({'visibility':''});

		$('.menu .course').eq(rank).addClass('opened');

		if (!refresh) UI.acc(this)
		else {
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
		else history.replaceState({key:'openCourse'}, '','index.php')

		if (data.dateStart == 0 && !course.old) {
			$('.main ul').prepend(Generate.activate());
			$('.add').addClass('hidden');

			if (!refresh) this.setSwipe(1)
		}
	}
	updateInvites(data){
		if(data.status == 200){
			$('#invitations div').html('');
			if(data.groupes.length != 0){
				data.groupes.forEach(el => {
					let button = document.createElement('button'),
						span = document.createElement('span'),
						accept = document.createElement('i'),
						deny = document.createElement('i');
					button.innerHTML = el.nom;
					accept.className = "ms-Icon ms-Icon--CheckMark";
					deny.className = "ms-Icon ms-Icon--Cancel";
					accept.setAttribute("aria-hidden","true");
					deny.setAttribute("aria-hidden","true");
					
					span.appendChild(accept);
					span.appendChild(deny);
					button.appendChild(span);
				
					$(accept).on('click',() => {
						this.acceptInvite(el.id);
					});
					$(deny).on('click',() => {
						this.rejectInvite(el.id);
					});
					$('#invitations div').append(button);
				});
			} else $('#invitations div').html('Rien pour l\'instant')
		}
	}
	acceptInvite(id){
		
		$.ajax({
			method: 'POST',
			url: 'serveur/invites.php',
			data: {push: true, id: id}
		}).then(() =>{
			Pull.invitations(this);
			this.refresh();
		}).catch(err => {
			$('#invitations div').append('Un problème est survenu');
		});

	}
	rejectInvite(id){
		
		$.ajax({
			method: 'POST',
			url: 'serveur/invites.php',
			data: {remove: true, id: id}
		}).then(() =>{
			Pull.invitations(this);
			this.refresh();
		}).catch(err => {
			$('#invitations div').append('Un problème est survenu');
		});

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
	generateInviteKey(){
		$('.loader').addClass('opened');
		$.ajax({
			method: "POST",
			url: "serveur/invites.php",
			data: { getInviteKey: 'true'}
		}).then(data => {
			$('.loader').removeClass('opened');
			if(data.status == 200){
				$('#idInvit h4').html(data.id);
			}
		}).catch(err => {
			$('.loader').removeClass('opened');
			UI.offlineMsg(err);
		});
	}
}

export default App;
export { course };