import UI from './UI.js';
import Course from './course.js';
import Generate from './generate.js';
import Storage from './storage.js';
import $_GET from './get.js';
import Pull from './requests.js';


var course,
	serveurURL,
	storageUPD;

class App{
	constructor(){
		course = new Course();

		this.groupes;
		this.usedGroupe; // Rank in array of groups
		this.liPrices = ['0.1','0.5','0.9','1','2','3','4','5','6','7','8','9','10','12','15','17','20'];
		this.state = 0;
		this.setParameters();
		this.open(Number($_GET('course')) || 0);
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
		Pull.groupes(this).then(state => {
			if (state){
				Pull.course(this, this.getUsedGroup().coursesList[rank].id).then(() => {
					$('.loader').removeClass('opened');
				});
			} else {
				$('.loader').removeClass('opened');
			}
		});
		
	}
	refresh(rank = 0){
		Pull.groupes(this).then(state => {
			if (state){
				Pull.course(this, this.getUsedGroup().coursesList[rank].id);
			}
		});
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
				UI.acc(this);
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
					var stored = (Storage.getItem('courses') || new Array).filter(el => el.idCourse < data.idCourse);
				}else{
					var stored = (Storage.getItem('courses') || new Array).filter(el => el.idCourse != data.idCourse);
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
			url: "serveur/push.php",
			data: { update: 'true', buyPreview: 'true', id: id, prix: prix, groupe: this.getUsedGroup().id}
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
					this.totalPP(data.prix);
					$('.prices #titreA, .prices #prix').val('');
		
					setTimeout(() => {
						$('.article').removeClass('animateSlideIn');
					},300);
				}, 150);
			}, timer);
	
			var storage = Storage.getItem('courses');				
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
	updateGroups(data){
		if (data.status === 200){
			$('.add, .calcul').removeClass('hidden').css({'display':'', 'visibility':''});
			$('.main ul').children('.activate, .noCourse').remove();

			this.groupes = data.groupes;
			Storage.setItem('groupes', this.groupes);
			$('.groupe').remove();
			this.groupes.forEach(grp => {
				$('#groupes').append(Generate.groupe(this, grp.id, grp.nom, grp.code, grp.membres));
			});

			return this.switchGroup(Storage.getItem('usedGroupe') || 0);
		}
	}
	switchGroup(rank){ // Rank in array
		this.usedGroupe = rank;

		// UPD UI parametres
		$('.groupe').removeClass('opened'); // Change Group
		$('.groupe').eq(rank).addClass('opened');
		
		// UPD CourseList
		$('.menu .course').remove();

		if(this.getUsedGroup().coursesList.length != 0){
			this.getUsedGroup().coursesList.forEach((el, id) => {
				$('.menu article').append(Generate.course(this, id, el.nom));
			});
			return true;
		} else {
			$('.add, .calcul').css({'visibility':'hidden'});
			$('.main ul').prepend(Generate.noCourse());
		}
	}
	getUsedGroup(){
		return this.groupes[this.usedGroupe];
	}
	updateItems(data, network = false, refresh = false){
		if (data.status === 200){
			let rank = this.getUsedGroup().coursesList.indexOf(this.getUsedGroup().coursesList.filter(el => el.id == data.course.id)[0]);
			course.update(this, data.course);

			$('.activate').remove();
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