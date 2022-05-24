const accountAddress = document.querySelector("#accountAddress")
let receiver = document.getElementById('scalelinkiframe').contentWindow;
let offer_activated = false;
let current_campaign;
let campaign_id;

function saveAddress(address, save_remote=false) {
    if (save_remote) {
        receiver.top.postMessage({key: "ethereumAddress", method: "set", data: address}, "http://asttro.xyz/iframe.html");
    }
    localStorage.setItem("ethereumAddress", address);
    accountAddress.innerHTML += address
}

async function getAddress(e=null) {
    if (e) {e.preventDefault();}
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    saveAddress(account, true)
}

function iFrameReceiveAddress(e) {
    if (e.origin !== 'https://asttro.xyz/iframe.html') {
        console.log(e.origin)
        return
    }
    const payload = e.data
    console.log(JSON.parse(payload))
    if (payload.ethereumAddress) {
        // this could also be sessionStorage - localStorage survives past session restart
        saveAddress(payload.ethereumAddress, false)
        console.log('eth address local storage value: ' + localStorage.getItem('ethereumAddress'))
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
    let timestamp = new Date();
    timestamp = timestamp.toString();
    const user_id = localStorage.getItem('ethereumAddress') || await getAccount();
    const message = {publisher_id, campaign_id, user_id, timestamp}
    const signature = await signOffer(user_id, message)
    if (signature) {
        console.log(signature)
        saveActivationSignature(publisher_id, campaign_id, user_id, timestamp, message, signature)
    }
}

function saveActivationSignature(publisher_id, campaign_id, user_id, timestamp, message, signature) {
    if (!localStorage.getItem('activations')) {
        localStorage.setItem('activations', JSON.stringify([]))
    }
    let curr_storage = JSON.parse(localStorage.getItem('activations'))
    curr_storage.push({publisher_id, campaign_id, user_id, timestamp, message, signature})
    localStorage.setItem('activations', JSON.stringify(curr_storage))
}

function saveAdServe(data) {
    if (!localStorage.getItem('ad_serves')) {
        localStorage.setItem('ad_serves', JSON.stringify([]))
    }
    let curr_storage = JSON.parse(localStorage.getItem('ad_serves'))
    curr_storage.push(data)
    localStorage.setItem('ad_serves', JSON.stringify(curr_storage))
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
    const url = `http://127.0.0.1:8081/hash_activation?user_id=${offer_data.user_id}&campaign_id=${offer_data.campaign_id}&publisher_id=${offer_data.publisher_id}&timestamp=${offer_data.timestamp}`
    return fetch(url)
    .then((response)=>response.json())
    .then((responseJson)=>{return responseJson});
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
    let main_content = document.getElementById("main-content");
    let html = `<div class="sclnk-ad-body" style="position: sticky; bottom: 0; width: 100%; height: 14vh; background-position: center; border-radius: 5px;">
            <div class="sclnk-ad-actions" style="width: 100%; height: 60%;">
                <span class="sclnk-close-ad" style="color: white; display:inline-block; margin: 10px; cursor: pointer;">&#x2715</span>
                <div class="sclnk-ad-offer" style="cursor: pointer; display: flex; text-align: center; align-items: center; height: 100%; width: 15%; float: right; margin: 10px; background-color: rgba(255, 255, 255, 0.5); border-radius: 5px; user-select: none; -moz-user-select: none; -webkit-user-select: none;">
                    <div class="sclnk-ad-offer-activate" style="margin-left: 10px; display: flex; width: 25%; aspect-ratio: 1; background-color: white; border-radius: 50%">
                        <p class="sclnk-ad-offer-activate-icon" style="margin: auto;">&#43;</p>
                    </div>
                    <div class="sclnk-ad-offer-copy" style="text-align: center; margin-left: 10px;">
                        <div class="sclnk-ad-offer-amount" style="font-size: 20px;"></div>
                        <div class="sclnk-ad-offer-expiration" style="font-size: 14px; color: #434343">
                            7 days left
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>`
    main_content.innerHTML += html;
}

function pointToCorrectAddress() {
    const ethereumAddress = localStorage.getItem('ethereumAddress');
    const publisherEthereumAddress = localStorage.getItem('publisherEthereumAddress')
    if (!ethereumAddress && publisherEthereumAddress) {
        saveAddress(publisherEthereumAddress, true)
    } else if (!ethereumAddress) {
        getAddress();
    }
}

window.addEventListener('message', iFrameReceiveAddress);
pointToCorrectAddress();
injectAd();
const ad_container = document.getElementsByClassName("sclnk-ad-body")[0]
const ad_offer = document.getElementsByClassName("sclnk-ad-offer")[0]
const close_ad = document.getElementsByClassName("sclnk-close-ad")[0]

window.addEventListener('load', async () => {
    current_campaign = JSON.parse(localStorage.getItem('current_campaign'))
    current_campaign.publisher_id = 'merkle_blog';
    const publisher_id = current_campaign.publisher_id;
    campaign_id = current_campaign.campaign_id;
    const offer = current_campaign.reward;
    const expiration = current_campaign.expiration;
    // get the image from the backend
    const image = parseImage(current_campaign.image);
    document.querySelector('.sclnk-ad-offer-amount').innerHTML = `${offer}%`
    document.querySelector('.sclnk-ad-offer-expiration').innerHTML = `${diffDays(expiration)} days`
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

ad_offer.addEventListener('click', (e) => {
    activateOffer(e);
})
close_ad.addEventListener('click', () => {
    ad_container.style.display = "none";
})