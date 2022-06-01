const API_ENDPOINT = "http://127.0.0.1:5000"
const next_step = document.getElementById("next-btn");
let next_step_available = false;
function activateNextStep() {
    if (next_step_available) {
        next_step.classList.remove('hidden');
        next_step.style.display = 'flex'; 
    }
}

const modal_continue = document.getElementById("modal-continue");
modal_continue.addEventListener('click', ()=> {
    document.getElementById('modal').style.display = 'none';
})

const receiver = document.getElementById('scalelinkiframe').contentWindow;
receiver.addEventListener('load', ()=> {console.log('iframe loaded')})
let offer_activated = false;
let current_campaign;
let campaign_id;
let iFrame_ethereumAddress;

function saveAddress(address, save_remote=false) {
    if (save_remote) {
        setTimeout(() => {
            receiver.postMessage({key: "ethereumAddress", method: "set", data: address}, "https://asttro.xyz/iframe.html");
        }, 1000)
    }
    localStorage.setItem("ethereumAddress", address);
    // accountAddress.innerHTML += address
}

async function getAddress(e=null) {
    if (e) {e.preventDefault();}
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    saveAddress(account, true)
}

function iFrameReceiveAddress(e) {
    if (e.origin == 'https://asttro.xyz') {
        const payload = JSON.parse(JSON.stringify(e.data))
        if (payload.ethereumAddress) {
            iFrame_ethereumAddress = payload.ethereumAddress
            // this could also be sessionStorage - localStorage survives past session restart
            saveAddress(iFrame_ethereumAddress, false)
            console.log('eth address local storage value: ' + iFrame_ethereumAddress)
        }
    }
}

function checkOfferActivated() {
    if (offer_activated) {
        document.getElementsByClassName("sclnk-ad-offer-activate-icon")[0].style.color = "white;";
        document.getElementsByClassName("sclnk-ad-offer-activate-icon")[0].innerHTML = "✅";
        document.getElementsByClassName("sclnk-ad-offer-activate")[0].style.backgroundColor = "white";
    } else {
        document.getElementsByClassName("sclnk-ad-offer-activate-icon")[0].style.color = "black;";
        document.getElementsByClassName("sclnk-ad-offer-activate-icon")[0].innerHTML = "&#43;";
        document.getElementsByClassName("sclnk-ad-offer-activate")[0].style.backgroundColor = "white";
    }
}

// this will be abstracted away by the Address Collection System
async function getAccount() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    return account;
}

async function activateOffer(e) {
    e.preventDefault();
    const publisher_id = current_campaign.publisher_id;
    const campaign_id = current_campaign._id;
    let activation_timestamp = new Date();
    activation_timestamp = activation_timestamp.toString();
    const user_id = localStorage.getItem('ethereumAddress') || await getAccount();
    const message = {publisher_id, campaign_id, user_id, activation_timestamp}
    const signature = await signOffer(user_id, message)
    if (signature) {
        saveActivationSignature(publisher_id, campaign_id, user_id, activation_timestamp, signature)
        next_step_available = true;
        activateNextStep()
    }
}

async function signOffer(account, offer_data) {
    let activations = JSON.parse(localStorage.getItem('activations')) || []
    let results = activations.filter(activation => {activation.campaign_id == campaign_id && activation.user_id == account})
    if (results.length == 0) {
        const hash_response = await getActivationHash(offer_data);
        const offer_data_hash = hash_response.message_hash;
        const signed_offer = await ethereum.request({ method: 'personal_sign', params: [account, offer_data_hash]});
        offer_activated = true;
        checkOfferActivated();
        // make API call to scalelink to store the signature and message
        return signed_offer
    } else {
        console.log('Offer previously activated')
        offer_activated = true;
        checkOfferActivated();
        return null;
    }
}

async function getActivationHash(offer_data) {
    const url = `http://127.0.0.1:8081/hash_activation?user_id=${offer_data.user_id}&campaign_id=${offer_data.campaign_id}&publisher_id=${offer_data.publisher_id}&activation_timestamp=${offer_data.activation_timestamp}`
    return fetch(url)
    .then((response)=>response.json())
    .then((responseJson)=>{return responseJson});
}

function saveActivationSignature(publisher_id, campaign_id, user_id, activation_timestamp, signature) {
    const data = {
        'user_address': user_id,
        'publisher_address': publisher_id,
        'campaign_id': campaign_id,
        'activation_timestamp': activation_timestamp,
        "signature": signature,
    }
    const url = `${API_ENDPOINT}/activations`
    $.post(url, data, ()=>{});
}

function saveAdServe(data) {
    if (!localStorage.getItem('ad_serves')) {
        localStorage.setItem('ad_serves', JSON.stringify([]))
    }
    let curr_storage = JSON.parse(localStorage.getItem('ad_serves'))
    curr_storage.push(data)
    localStorage.setItem('ad_serves', JSON.stringify(curr_storage))
}

function diffDays(exp) {
    let exp_pieces = exp.split('-')
    const date = new Date(exp_pieces[0], exp_pieces[1], exp[2])
    const today = new Date();
    const diff_ms = date - today
    const diff_days = Math.floor(diff_ms / 1000 / 60 / 60/ 24)
    return diff_days
}

function injectAd() {
    let ad_container = document.getElementById("top-content");
    let html = `
    <span>Automatic Cash Back</span>
    <div class="sclnk-ad-container">
        <div class="sclnk-ad-body">
            <div class="sclnk-ad-actions" style="width: 100%; height: 60%;">
                <span class="sclnk-close-ad" style="color: white; display:inline-block; margin: 10px; cursor: pointer;">&#x2715</span>
                <div class="sclnk-ad-info">
                    <b id="sclnk-ad-name"></b><br>
                    <span id="sclnk-ad-description"></span>
                </div>
                <div class="sclnk-ad-offer">
                    <div class="sclnk-ad-offer-activate" style="margin-left: 10px; display: flex; width: 25%; aspect-ratio: 1; background-color: white; border-radius: 50%">
                        <p class="sclnk-ad-offer-activate-icon" style="margin: auto;">&#43;</p>
                    </div>
                    <div class="sclnk-ad-offer-copy" style="text-align: center; margin-left: 10px;">
                        <div class="sclnk-ad-offer-amount" style="font-size: 20px;"></div>
                        <div class="sclnk-ad-offer-expiration" style="font-size: 14px;">
                            7 days left
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`
    ad_container.innerHTML += html;
}

function pointToCorrectAddress() {
    const ethereumAddress = localStorage.getItem('ethereumAddress');
    if (ethereumAddress && !iFrame_ethereumAddress) {
        saveAddress(ethereumAddress, true)
    } else if (!ethereumAddress) {
        getAddress();
    }
}

// window.addEventListener('message', iFrameReceiveAddress);
// pointToCorrectAddress();
getAddress();
injectAd();
const ad_container = document.getElementsByClassName("sclnk-ad-body")[0]
const ad_offer = document.getElementsByClassName("sclnk-ad-offer")[0]
const close_ad = document.getElementsByClassName("sclnk-close-ad")[0]

window.addEventListener('load', async () => {
    const url = `${API_ENDPOINT}/campaigns`
    let response;
    await $.get(url, (payload)=> {
        response = payload;
    })
    current_campaign = response.campaigns[0];
    current_campaign.publisher_id = "0xE06Dff47bF94394f4A63C3bc0e6336B672949200";
    const publisher_id = current_campaign.publisher_id;
    campaign_id = current_campaign.campaign_id;
    const offer = current_campaign.reward;
    const expiration = current_campaign.expiration;
    // get the image from the backend
    const image = current_campaign.image;
    localStorage.setItem("current_campaign", JSON.stringify(current_campaign))
    document.querySelector('.sclnk-ad-offer-amount').innerHTML = `${offer}%`
    document.querySelector('.sclnk-ad-offer-expiration').innerHTML = `${diffDays(expiration)} days`
    document.querySelector('#sclnk-ad-name').innerHTML = current_campaign.name;
    document.querySelector('#sclnk-ad-description').innerHTML = current_campaign.description;
    document.querySelector('.sclnk-ad-body').style.backgroundImage = `url(${image})`
    const timestamp = new Date();
    const user_id = localStorage.getItem('ethereumAddress') || await getAccount();
    const data = {campaign_id, publisher_id, user_id, timestamp}
    saveAdServe(data)
})

function parseImage(path) {
    var path_pieces = path.split('\\')
    var suffix = path_pieces.slice(-1)
    var full_path = `assets/img/${suffix}`
    return full_path
}

// const connect_wallet = document.getElementById('connect-wallet');
// connect_wallet.addEventListener('click', (e) => {
//     getAddress();
// });
ad_offer.addEventListener('click', (e) => {
    activateOffer(e);
})
close_ad.addEventListener('click', () => {
    ad_container.style.display = "none";
})