const API_ENDPOINT = "http://127.0.0.1:5000"
const code_container = document.getElementsByClassName("code-container")[0];

const modal_continue = document.getElementById("modal-continue");
modal_continue.addEventListener('click', ()=> {
    document.getElementById('modal').style.display = 'none';
})

async function get_attribution() {
    const url = `${API_ENDPOINT}/demo/attribution_data`
    let response;
    await $.get(url, (payload)=> {
        response = payload;
    })
    return response
}

async function build_data() {
    const response = await get_attribution();
    const activation = response.activation;
    const transaction = response.transaction;
    const campaign = response.campaign;

    const transaction_hash = transaction.hash;
    const transaction_value = transaction.value;
    const activation_user = activation.user_address;
    const activation_merchant = activation.merchant_address;
    const activation_publisher = activation.publisher_address;
    const campaign_payout = campaign.payout;
    const campaign_reward = campaign.reward;

    let activation_information = `
    <span style="color: blue">Transaction hash:</span> ${transaction_hash} <br><br>
    <span style="color: blue">Transaction value:</span> ${transaction_value} wei<br><br>
    <span style="color: blue">User address:</span> ${activation_user} <br><br>
    <span style="color: blue">Merchant address:</span> ${activation_merchant} <br><br>
    <span style="color: blue">Publisher address:</span> ${activation_publisher} <br><br>
    <span style="color: blue">Publisher payout:</span> ${campaign_payout} wei<br><br>
    <span style="color: blue">User "cash back":</span> ${campaign_reward} wei<br><br>
    `
    code_container.innerHTML += activation_information;
}

build_data()




