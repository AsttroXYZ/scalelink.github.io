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


async function createContract(amount_ether) {
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
	const account = accounts[0]
    const web3 = new Web3(window.ethereum);
    web3.eth.defaultAccount = account;
    const url = `${API_ENDPOINT}/smart_contract`
    let smart_contract_data;
    await $.get(url, (payload)=> {
        smart_contract_data = payload;
    })
    abi = smart_contract_data.abi
    bytecode = smart_contract_data.bytecode
    let contract = new web3.eth.Contract(abi);
    let smart_contract_address;
    const payout = 10
    const reward = document.getElementById("campaign-reward-amount").value
    const expiration = document.getElementById("campaign-expiration").value
    const duration = diffDateSeconds(expiration)
    await contract.deploy({
        // check if bytecode requires 0x prepended
        data: bytecode,
        arguments: [payout, reward, duration]
    })
    .send({
        from: account,
        gas: 4712388,
        gasPrice: '100000000000',
        value: amount_ether*(10**18)
    }, function(error, transactionHash){
        if (error) {
            console.log("ERROR")
        } else {
            console.log(`Transaction Hash: ${transactionHash}`)
        }
    })
    .then(function(newContractInstance){
        smart_contract_address = newContractInstance.options.address
    });
    return smart_contract_address;
}

function diffDateSeconds(date1) {
    const now = new Date();
    const date = new Date(date1);
    const diffTime = Math.abs(date - now);
    const diffSeconds = Math.ceil(diffTime / 1000); 
    return diffSeconds
}

function uploadCampaignToBackend(campaign_data) {
    const url = `${API_ENDPOINT}/campaigns`
    $.ajax({
        url: url,
        type: 'POST',
        data: campaign_data,
        async: false,
        cache: false,
        contentType: false,
        enctype: 'multipart/form-data',
        processData: false,
        success: function (response) {
           console.log(JSON.stringify(response));
        }
     });

}

async function createCampaign() {
    const amount_ether = parseFloat(campaign_budget.value.replaceAll(",", "").replaceAll("$", ""))  / 1950
    const smart_contract_address = await createContract(amount_ether);
    console.log(`Smart Contract Address: ${smart_contract_address}`)

    let campaign_data = new FormData();
    let error = false;
    document.querySelectorAll(['input', 'select']).forEach( input => {
        if (!input.value) {
            console.log(`please input a value for ${input.name}`)
            error = true;
        } else {
            value = input.name == "image" ? input.files[0] : input.value
            campaign_data.append(input.name, value)
        }
    });
    if (error) {
        return;
    }
    
    campaign_data.set("budget", amount_ether*(10**9))
    campaign_data.append("merchant_id", "62959f316ffb872d711a85bc");
    campaign_data.append("address", smart_contract_address);
    campaign_data.append("payout", 10);
    campaign_data.append("start_time", new Date());
    uploadCampaignToBackend(campaign_data);
    campaign_launched = true;
    launchSuccess();
    next_step_available = true;
    activateNextStep();
}

launch_campaign.addEventListener('click', createCampaign)

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