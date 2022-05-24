const current_campaign = JSON.parse(localStorage.getItem("current_campaign"))

const modal_continue = document.getElementById("modal-continue");
modal_continue.addEventListener('click', ()=> {
    document.getElementById('modal').style.display = 'none';
})

const smart_contract_title = document.getElementById("smart-contract-title");
smart_contract_title.innerHTML += current_campaign.name;

