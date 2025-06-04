// Gestion des éléments d'interface utilisateur

// Affiche un message quand on ne peut pas se déplacer sur un pion
export function showCannotMoveOnPawnMsg() {
    // Réutilise la modale de victoire pour afficher le message
    const modal = document.getElementById('win-modal');
    const title = document.getElementById('win-title');
    title.innerHTML = `<span style="color:#f67280">Déplacement interdit</span><br>Vous ne pouvez pas passer sur un pion adverse.`;
    modal.style.display = 'flex';
    document.getElementById('win-close').onclick = () => modal.style.display = 'none';
    document.getElementById('win-reload').textContent = "OK";
    document.getElementById('win-reload').onclick = () => modal.style.display = 'none';
    window.onkeydown = (e) => { if(e.key === "Escape") modal.style.display = 'none'; };
}

// Met à jour l'affichage du tour actuel
export function updateTurnDisplay(tour) {
    document.querySelector('.info-wrapper>p>b').innerText = `Au tour du pion ${tour} de jouer`;
}

export default {
    showCannotMoveOnPawnMsg,
    updateTurnDisplay
};
