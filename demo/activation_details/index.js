const API_ENDPOINT = "http://127.0.0.1:5000"
const code_container = document.getElementsByClassName("code-container")[0];
let last_activation;
const url = `${API_ENDPOINT}/activations`
    let response;
    await $.get(url, (payload)=> {
        response = payload;
    })
    last_activation = response.activations[0];
// const last_activation = JSON.parse(localStorage.getItem('activations')).slice(-1)[0];
const publisher_id = last_activation.publisher_id;
const campaign_id = last_activation.campaign_id;
const user_id = last_activation.user_id;
const activation_timestamp = last_activation.activation_timestamp;
const message = JSON.stringify(last_activation.message);
const signature = last_activation.signature;
let activation_information = `
<span style="color: blue">Publisher ID:</span> ${publisher_id} <br><br>
<span style="color: blue">Campaign ID:</span> ${campaign_id} <br><br>
<span style="color: blue">User ID:</span> ${user_id} <br><br>
<span style="color: blue">Activation Timestamp:</span> ${activation_timestamp} <br><br>
<span style="color: blue">Signature:</span> ${signature} <br>
`
code_container.innerHTML += activation_information;

const modal_continue = document.getElementById("modal-continue");
modal_continue.addEventListener('click', ()=> {
    document.getElementById('modal').style.display = 'none';
})