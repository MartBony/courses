import UI from './UI.js';
import { fetcher } from './tools.js';

class Pull{
	static domaines(){
		return fetcher({
			method: 'POST',
			url: 'serveur/structure.php'
		});
	}
	static structure(app){
		return fetcher({
			method: 'POST',
			url: 'serveur/structure.php'
		}).then(res => {
			if(res.action && res.action == "authenticate")  document.getElementById('authContainer').classList.add('opened');
			if(res.status == 200){
				return res.payload;
			} else if (res.status == "offline") {
				UI.msgIsOffline();
				throw "offline";
			} else {
				console.log("here",res.payload ? res.payload.message : null);
				UI.erreur(res.payload ? res.payload.message : null);
				throw res;
			}
		});
	}
	static groupe(app, idGroupe){
		return fetcher({
			method: 'POST',
			url: 'serveur/groupe.php',
			data: { groupe: idGroupe }
		})
		.then(res => {
			if(res.action && res.action == "authenticate")  document.getElementById('authContainer').classList.add('opened');
			if(res.status == 200){
				return res.payload;
			} else if (res.status == "offline") {
				UI.msgIsOffline();
				throw "offline";
			} else {
				UI.erreur(res.payload ? res.payload.message : null);
				throw res;
			}
		});
	}
	static course(idCourse){
		return fetcher({
			method: 'POST',
			url: 'serveur/pull.php',
			data: { course: idCourse }
		}).then(res => {
			if(res.action && res.action == "authenticate")  document.getElementById('authContainer').classList.add('opened');
			if(res.status == 200){
				return res.payload;
			} else if (res.status == "offline") {
				UI.msgIsOffline();
				throw "offline";
			} else{
				UI.erreur(res.payload ? res.payload.message : null);
				throw res;
			}
		});
	}
	static invitations(){
		fetcher({
			method: 'POST',
			url: 'serveur/invites.php',
			body: { pull: true }
		}).then(res => {
			if(res.status == 200) document.querySelector("app-window").updateInvites(res.payload)
			else if(res.status == "offline"){
				document.querySelector("#invitations div").innerHTML = "Le réseau est inssufisant, réessayez";
			}
			else if(res.payload){
				document.querySelector("#invitations div").innerHTML = res.payload.message;
			} else UI.erreur()
		});
	}
	static async authRequest(){
		const res = await fetcher({
			method: "POST",
			url: "serveur/auth.php",
			data: { tryCookiesAuth: true }
		})
		
		if(res.status == 200 && res.payload && res.payload.userId){
			return res.payload.userId;
		}
		throw res;

	}
}

export default Pull;