import { returnCurrentSquare } from './square.js';

export function getNb(prefix, id){
    let el = id.replace(prefix,"");
    return Number(el);
}

export function switchNumOfPlayers(value){
    if(typeof value != 'number' || value > 4){
        console.log('You enterouge an invalid number of players');
    } else {
        window.localStorage.setItem('numberOfPlayers', value);
        if(value == 4){
            window.localStorage.setItem('numberOfWalls', 5);
        }
        if(value == 1  || value == 2){
            window.localStorage.setItem('numberOfWalls', 10);
        }
        location.reload();
    }
}

export function checkIfWon(color){
    let winSquares;
    if(color == 'bleu'){
        winSquares = line.first;
    } else if(color == 'rouge'){
        winSquares = line.second;
    } else if(color == 'vert'){
        winSquares = line.third;
    } else if(color == 'violet'){
        winSquares = line.fourth;
    }

    for (let i = 0; i < winSquares.length; i++){
        let sq = document.querySelector(`#sq${winSquares[i]}`);
        if(sq.getAttribute('data-pawn') == color){
            // Affiche la victoire après le rendu du DOM
            setTimeout(() => {
                showWinBox(color);
            }, 30);
            break;
        }
    }
}

export function showWinBox(color) {
    const modal = document.getElementById('win-modal');
    const title = document.getElementById('win-title');
    title.innerHTML = `<span style="color:var(--pawn-${color});text-transform:capitalize">${color}</span> a gagné !`;
    modal.style.display = 'flex';

    // Fermer ou rejouer
    document.getElementById('win-close').onclick = () => location.reload();
    document.getElementById('win-reload').onclick = () => location.reload();
    // Fermer avec ESC
    window.onkeydown = (e) => { if(e.key === "Escape") location.reload(); };
}

export function showBlockingWallMessage() {
    // Utilise la modale existante pour afficher un message d'erreur
    const modal = document.getElementById('win-modal');
    const title = document.getElementById('win-title');
    title.innerHTML = `
        <span style="color:#f67280">Placement interdit !</span><br>
        <span style="font-size: 0.9em;">Ce mur bloquerait complètement un joueur et l'empêcherait d'atteindre sa ligne d'arrivée.</span><br>
        <span style="font-size: 0.8em; color: #888;">Les règles du Quoridor interdisent d'enfermer complètement un joueur.</span>
    `;
    modal.style.display = 'flex';
    
    // Ajouter une petite animation pour attirer l'attention
    title.style.animation = "shake 0.5s";
    
    // Événements pour fermer la fenêtre
    document.getElementById('win-close').onclick = () => {
        modal.style.display = 'none';
        title.style.animation = "";
    };
    document.getElementById('win-reload').textContent = "OK";
    document.getElementById('win-reload').onclick = () => {
        modal.style.display = 'none';
        title.style.animation = "";
    };
    window.onkeydown = (e) => { 
        if(e.key === "Escape") {
            modal.style.display = 'none';
            title.style.animation = "";
        }
    };
    
    // Masquer la boîte de dialogue après 3 secondes
    setTimeout(() => {
        modal.style.display = 'none';
        title.style.animation = "";
    }, 3000);
}

export function randomInt(min, max){
	return Math.floor((Math.random() * (max+1-min)) + min);
}

export function click(selector){
    let element;

    if(typeof selector == 'string'){
        element = document.querySelector(selector);
    } else {
        element = selector;
    }

    let evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 20
    });

    element.dispatchEvent(evt);
}

export function nextPlayer(){
    if(tour == 'bleu'){
        tour = 'rouge';
    } else if(tour == 'rouge'){
        if(numOfPlayers == 3 || numOfPlayers == 4){
            tour = 'vert';
        } else {
            tour = 'bleu';
        }
    } else if(tour == 'vert'){
        if(numOfPlayers == 4){
            tour = 'violet';
        } else {
            tour = 'bleu';
        }
    } else if(tour == 'violet'){
        tour = 'bleu';
    }

    // Met à jour l'affichage du tour
    document.querySelector('.info-wrapper>p>b').innerText = `Au tour du pion ${tour} de jouer`;
}

export function capitalizeFirstLetter(string) {
    // export function imported from StackOverflow - Author: Steve Harrison
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function prizeDraw(){
    let random;

    if(numOfPlayers == 2){
        random = randomInt(1,2);
    } else if(numOfPlayers == 3){
        random = randomInt(1,3);
    } else if(numOfPlayers == 4){
        random = randomInt(1,4);
    }

    if(random == 1){
        tour = 'bleu';
    } else if(random == 2){
        tour = 'rouge';
    } else if(random == 3){
        tour = 'vert';
    } else if(random == 4){
        tour = 'violet';
    }
}


