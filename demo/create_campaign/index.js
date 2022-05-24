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

let campaign_launched = false;
let campaign_budget = document.getElementById('campaign-budget');
let campaign_image = document.getElementById('campaign-image');
let sclnk_ad_body = document.getElementsByClassName('sclnk-ad-body')[0];
let sclnk_ad_offer = document.getElementsByClassName('sclnk-ad-offer')[0];
const launch_campaign = document.getElementById('launch-campaign');

const today = new Date()
const year = today.getFullYear();
const month = today.getMonth();
const day = today.getDate();
document.getElementById('campaign-expiration').setAttribute('min', today.toISOString().split('T')[0])
document.getElementById('campaign-expiration').setAttribute('max', new Date(year + 1, month, day).toISOString().split('T')[0])

function launchSuccess() {
    if (campaign_launched) {
        launch_campaign.innerHTML = "Campaign successfully launched";
        launch_campaign.classList.remove("submit-btn");
        launch_campaign.classList.add("successfully-launched");
    }
}

campaign_budget.addEventListener('input', function(){
    let current_value = campaign_budget.value.replaceAll(",", "").replaceAll("$", "")
    campaign_budget.value = "$" + current_value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
})

launch_campaign.addEventListener('click', function() {
    let campaign_data = {}
    let error = false;
    document.querySelectorAll(['input', 'select']).forEach( input => {
        if (!input.value) {
            console.log(`please input a value for ${input.name}`)
            error = true;
        } else {
            campaign_data[input.name] = input.value;
        }
    });
    if (error) {
        return;
    }
    // update to send to backend and save the correct values in localstorage if any
    const campaign_id = 'demo_campaign';
    const merchant_name = 'Demo Merchant';
    const timestamp = new Date();
    campaign_data.campaign_id = campaign_id;
    campaign_data.merchant_name = merchant_name;
    campaign_budget.timestamp = timestamp;
    localStorage.setItem('current_campaign', JSON.stringify(campaign_data))
    campaign_launched = true;
    launchSuccess();
    next_step_available = true;
    activateNextStep();
})

campaign_image.addEventListener('change', function() {
    const selected_image = campaign_image.files[0]
    const src = URL.createObjectURL(selected_image)
    if (src) {
        sclnk_ad_body.style.background = `url(${src}) no-repeat center center`;
        sclnk_ad_body.style.visibility = 'visible'
        sclnk_ad_offer.style.visibility = 'visible'
        document.getElementById('image-preview').style.display = 'none'
        document.getElementById('image-preview-subtext').style.display = 'block'
    } else {
        sclnk_ad_body.style.background = "grey";
        sclnk_ad_body.style.visibility = 'hidden'
        sclnk_ad_offer.style.visibility = 'hidden'
        document.getElementById('image-preview').style.display = 'block'
    }
})