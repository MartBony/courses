import Touch from "./touch.js";
import { fetcher } from "./tools.js";
import Animations from "./animations.js";
import Pull from './requests.js';
import { IndexedDbStorage } from './storage.js';

class CardTotal extends HTMLElement {
	constructor(){
		super();
	}
	setValue(avancement){
		this.style.display = "block";
		this.children[0].children[0].innerHTML = `${parseInt(avancement*100)}%`;
		avancement = Math.min(avancement, 1);
		this.style.setProperty("--prc", `${parseInt(avancement*100)}%`);
		if(avancement>0.9){
			this.classList.add("alert");
		} else this.classList.remove("alert");
	}
}

class ItemOptions extends HTMLElement{
	item;
	opened = false;
	msgButtonsState = ["", ""];
	constructor(){
		super();
		this.generateEventListeners();
	}
	open(item, position){
		// Animate panel
		if(!this.opened){
			this.classList.add("opened");
			Animations.createAnimation(this.children[0], [
				{
					transform: window.innerWidth < 900 ? "translateY(300px)" : "scale(0.6)",
					opacity: 0
				},{
					transform: "translateY(0) scale(1)",
					opacity: 1
				}
			], {
				duration: 300,
				fill: 'forwards',
				easing: Animations.ease.in
			})
		}

		if(position.x && position.y){
			this.style.setProperty("--pos-bottom", `max(0px, calc(100vh - ${position.y + 100}px))`);
			this.style.setProperty("--pos-left", `${Math.max(position.x - 200, 0)}px`);
		}

		// Update content
		const titreEl = this.querySelector('h2'),
		prixEl = this.querySelector('h3'),
		buttons = this.querySelectorAll("ul li");

		titreEl.innerHTML = `${item.titre}</div></div>`;
		this.style.setProperty("--color-item", item.couleur);
		if(item.type == 'article'){
			const spansPrice = Array.from(prixEl.querySelectorAll('span'));
			prixEl.style.display = "";
			spansPrice.forEach(span => span.innerHTML = item.prix);
			buttons[1].style.display = "none";
		} else {
			prixEl.style.display = "none";
			buttons[1].style.display = "";
		}

		if(item.id < 0){
			this.querySelector("p").style.display = "block";
			this.querySelector("form").style.display = "none";
		} else {
			this.querySelector("p").style.display = "";
			this.querySelector("form").style.display = "";
		}

		if(item.message){
			this.setMessageButtons(0, "block");
		}

		document.body.style.overflow = "hidden";

		this.querySelector("textarea").value = item.message || null;

		this.item = item;
		this.opened = true;
	}
	close(){

		document.body.style.overflow = "";
		
		this.item = null;
		this.opened = false;

		Animations.createAnimation(this.children[0], [
			{
				transform: "translateY(0) scale(1)",
				opacity: 1
			},{
				transform: window.innerWidth < 900 ? "translateY(300px)" : "scale(0.6)",
				opacity: 0
			}
		], {
			duration: 80,
			fill: 'forwards',
			easing: Animations.ease.out
		}).then(() => {
			this.classList.remove("opened");
			this.style.setProperty("--pos-bottom", "");
			this.style.setProperty("--pos-left", "");
			this.setMessageButtons(0,"").setMessageButtons(1,"");
		});

	}
	generateEventListeners(){
		this.addEventListener('click', event => {
			if(event.target.classList.contains("ms-Icon--Cancel") || event.target == this) this.close();
			else if(event.target.tagName == "I" && event.target.parentElement.parentElement.tagName == "UL"){
				if(event.target.classList.contains('ms-Icon--Delete')){
					if(this.item.type == 'article'){
						document.querySelector("app-window").deleteArticle(this.item.id);
					} else document.querySelector("app-window").deletePreview(this.item.id);
					this.close();
				} else {
					if(this.item.type == 'preview') UI.openModernForm("buy", {item: this.item});
				}
			} else if (event.target.tagName == "I" && event.target.parentElement.id == "msg-action"){
				this.querySelector("textarea").value = "";
				this.setMessageButtons(0, "");
				if(this.item.message){
					this.setMessageButtons(1, "block");
				} else {
					this.setMessageButtons(1, "");
				}
			}
		});

		this.querySelector("textarea").addEventListener("keyup", event => {
			
			if(event.target.value == ""){
				this.setMessageButtons(0, "");
			} else {
				this.setMessageButtons(0, "block");
			}
			
			if(this.item.message == event.target.value){
				this.setMessageButtons(1, "");
			} else {
				this.setMessageButtons(1, "block");
			}
		});

		this.addEventListener("submit", async event => {
			event.preventDefault();
			const form = event.target;
			try{
				let res = await fetcher({
					url: "serveur/push.php",
					method: "POST",
					body: { submitMessage: true, message: form.message.value, idItem: this.item.id }
				});

				if(res.status == 200){
					this.setMessageButtons(1, "");
					this.item.message = res.payload.message;
					form.message.value = res.payload.message;
					// document.querySelector("app-window").refresh();
					IndexedDbStorage.put("items", this.item);
					if(res.payload.message == "") this.setMessageButtons(0, "");
					else this.setMessageButtons(0, "block");
		
				} else if(res.status == "offline") UI.offlineMsg();
				else if(res.payload) UI.erreur(res.payload.message);
				else throw res;
			} catch(err) {
				console.error(err);
				UI.erreur();
			}
		
		});
	}
	setMessageButtons(buttonIndex, value){
		const messageButtons = this.querySelector("#msg-action").children;
		messageButtons[buttonIndex].style.display = value;
		this.msgButtonsState[buttonIndex] = value;
		if(this.msgButtonsState.every(state => !state)){
			this.querySelector("#msg-action").style.display = "";
		} else this.querySelector("#msg-action").style.display = "flex"
		return this;
	}
}

customElements.define('item-options', ItemOptions);

customElements.define('card-total', CardTotal);

export default class UI {
	static message(titre, texte, buttons, timer = 7000){
		document.querySelector('#message').classList.add('opened');

		if(titre) document.querySelector('#message h2').innerHTML = titre
		else document.querySelector('#message h2').style.display = "none"

		if(texte) document.querySelector('#message p').innerHTML = texte
		else document.querySelector('#message p').style.display = "none"

		document.querySelectorAll('#message button').forEach(el => el.remove());
		if(!buttons || buttons.length == 0){
			setTimeout(() => {UI.closeMessage()}, timer);
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
	static closeMessage(){
		document.querySelectorAll('.notification').forEach(el => el.classList.remove('opened'));
	}
	static erreur(titre = "Un problème est survenu.", texte, buttons){
		document.querySelector('#erreur').classList.add('opened');

		document.querySelector('#erreur h2').innerHTML = titre;

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
	static msgIsOffline(){
		UI.message("Vous êtes hors ligne", "Certaines fonctionnalités seront limités, vos modifications seront synchronisées ulterieurement", null, 3000);
	}
	static offlineMsg(app, msg){
		msg = msg || "Cette requête n'a pas pu aboutir, connectez-vous et réessayez.";
		UI.erreur("Le réseau est indisponible.", msg);
	}
	static requireAuth(){
		UI.erreur("Vous n'êtes pas connectés", "Clickez ici pour se connecter", [
			{
				texte:"Se connecter", 
				action : () => {
					document.getElementById('authContainer').classList.add('opened');
					UI.closeMessage();
				}
			}
		]);
	}
	static openPanel(type, app = null){
		document.getElementById('depensesChart').style.opacity = "0";
		document.getElementById('mainPanel').className = type;
		document.getElementById('menubar').className = type;
		document.getElementById('buttons').className = type;
		if((type == 'calcul' || type == "menu") && app) UI.openChart(app);
	}
	static openMenus(type, data = null, app = null){
		document.getElementById('menus').className = `opened ${type}`;
		if(type == 'params') Pull.invitations()
		setTimeout(() => {document.body.style.overflowY = "hidden"}, 500);
	}
	static closeMenus(){
		document.getElementById('menus').className = "";
		document.getElementById('depensesChart').style.opacity = "0";
		setTimeout(() => {document.body.style.overflowY = ""}, 500);
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
	static openChart(app){
		// Update chart
		const graph = app.groupe.graphData;
		document.getElementById('depensesChart').style.opacity = "1";
		const labels = Array(graph.length).fill("");
		labels[labels.length-1] = "Mois Actuel";
		app.chart.data.labels = labels;
		app.chart.data.datasets.forEach(dataset => dataset.data = graph);
		app.chart.update();

		// Update Calculs
		document.getElementById("averagecourses").innerHTML = app.groupe.averageCoursesCost;
	}
	static modal(action, data){
		document.querySelector('#modal').classList.add('opened', action || '');
		if(action == "leaveGroupe" && data)document.querySelector('#leaveGroupe div').innerHTML = data;
		else if (action == "deleteCourse" && data) document.getElementById('deleteCourse').setAttribute("idCourse", data);
		
	}
	static closeModal(){
		document.querySelector('#modal').className = '';
	}
	static acc(app){
		UI.closeModernForms();
		UI.closeMenus();
		document.querySelector("item-options").close();
	}
	static openModernForm(type = "article", data){
		let button;

		document.body.style.overflow = "hidden";
		document.body.classList.add("formed");

		switch(type){
			case "article":
				button = document.getElementById("addArt");
				document.getElementById("modernForms").classList.add("opened", "articleForm");
				setTimeout(() => document.querySelector(`#modernArticleAdder input`).focus(), 300)

				break;
			case "preview":
				button = document.getElementById("addPrev");
				document.getElementById("modernForms").classList.add("opened", "previewForm");
				setTimeout(() => document.querySelector(`#modernPreviewAdder input`).focus(), 300)

				break;
			case "course":
				button = document.getElementById("addCourse");
				document.getElementById("modernForms").classList.add("opened", "courseForm");
				document.querySelector(`#modernCourseAdder input`).focus();


				break;
			case "buy":
				if(data && data.item){
					const item = data.item;

					document.querySelector('#modernBuyer h2').innerHTML = `Acheter ${item.titre}`;
					document.getElementById('modernBuyer').setAttribute("key", item.id);

					document.getElementById("modernForms").classList.add("opened", "buyForm");
					setTimeout(() => document.querySelector(`#modernBuyer input`).focus(), 300);

				}
				break;
			case "groupe":
				document.getElementById("modernForms").classList.add("opened", "groupeForm");
				setTimeout(() => document.querySelector(`#modernGroupeAdder input`).focus(), 300);

				break;
			case "inviter":
				document.querySelector("#modernInviteur h2").innerHTML = data;
				document.getElementById("modernForms").classList.add("opened", "inviteForm");
				setTimeout(() => document.querySelector(`#modernInviteur input`).focus(), 300);
		}

		if(button){
			button.style.transition = "none";
			button.style.opacity = "0";
		}
	}
	static closeModernForms(){
		document.body.style.overflow = "";
		document.body.classList.remove("formed");
		document.querySelector('#modernForms').className = "";
		Array.from(document.querySelectorAll(".adder, #addCourse")).forEach(el => {el.style.opacity = "";el.style.transition = ""});
	}
	static removeItem(index){
		return new Promise((resolve, reject) => {
			const el = document.querySelector(`li[idItem="${index}"]`);
			Animations.removeItem(el).then(() => {
				setTimeout(() => el.remove(), 100);
				resolve();
			});

		})
	}
	static removeArticle(course, itemIndex, rank = 0){
		const selectedElement = document.querySelector(`li[idItem="${itemIndex}"]`),
		positions = course.articlesNodeList.map(el => [el, el.getBoundingClientRect()]),
		anim = Animations.removeItem(selectedElement).then(() => {
			selectedElement.remove();
			positions.forEach((elData, index) => {
				const el = elData[0],
				oldPos = elData[1],
				newPos = el.getBoundingClientRect();

				Animations.createAnimation(el, [
					{
						width: `${oldPos.width}px`,
						height: `${oldPos.height}px`,
						transform: `translate(${-(newPos.left - oldPos.left)}px, ${-(newPos.top - oldPos.top)}px)`
					},
					{
						width: `${newPos.width}px`,
						height: `${newPos.height}px`,
						transform: `translate(0,0)`
					}
				], {
					duration: 200 + (index-rank)*20,
					fill: 'forwards',
					easing: Animations.ease.move
				}).then(el => {
					el.style.width = "";
					el.style.height = "";
					el.style.transform = "";
				});
			});
		});
	}
	static removePreview(course, itemIndex, rank = 0){
		const selectedElement = document.querySelector(`li[idItem="${itemIndex}"]`),
		positions = course.previewsNodeList.map(el => [el, el.getBoundingClientRect()]),
		anim = Animations.removeItem(selectedElement).then(() => {
			selectedElement.remove();
			positions.forEach((elData, index) => {
				const el = elData[0],
				oldPos = elData[1],
				newPos = el.getBoundingClientRect();

				Animations.createAnimation(el, [
					{
						width: `${oldPos.width}px`,
						height: `${oldPos.height}px`,
						transform: `translate(${-(newPos.left - oldPos.left)}px, ${-(newPos.top - oldPos.top)}px)`
					},
					{
						width: `${newPos.width}px`,
						height: `${newPos.height}px`,
						transform: `translate(0,0)`
					}
				], {
					duration: 200 + (index-rank)*20,
					fill: 'forwards',
					easing: Animations.ease.move
				}).then(el => {
					el.style.width = "";
					el.style.height = "";
					el.style.transform = "";
				});
			});
		});
	}
	/* static promptAddFriend(app){
		$('#invitation span').html(app.groupe.nom);

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
	} */
	static showOptions(app, el){
		const optIndex = el.classList.contains('article') ? 0 : 1,
		optionsElement = document.getElementsByClassName('options')[optIndex],
		id = el.getAttribute('idItem'),
		rect = el.getBoundingClientRect(),
		padding = 5;

		optionsElement.style.setProperty("--top", (el.offsetTop + padding) + "px");
		optionsElement.style.setProperty("--left", (el.offsetLeft + padding) + "px");
		optionsElement.style.setProperty("--width", (rect.width - 2*padding) +"px");
		optionsElement.style.setProperty("--height", (rect.height - 2*padding) +"px");
		optionsElement.setAttribute("key", id);
		optionsElement.classList.add('opened');

		if(el.classList.contains('article')){
			const articleData = app.course.items.articles.filter(article => article.id == id)[0],
			childrens = optionsElement.children;

			childrens[0].innerHTML = articleData.prix + app.params.currency +" HT";
			childrens[1].innerHTML = (articleData.prix * (1+app.course.taxes)).toFixed(2) + app.params.currency;
		}

	}
	static hideOptions(){
		Array.from(document.getElementsByClassName('options')).forEach(option => {
			option.classList.remove('opened');
		});
	}
}
