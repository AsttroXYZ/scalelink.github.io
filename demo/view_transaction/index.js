const API_ENDPOINT = "http://127.0.0.1:5000"
const code_container = document.getElementsByClassName("code-container")[0];

const last_txHash = localStorage.getItem("last_txHash")
const url = `${API_ENDPOINT}/attributed_transacions`
let response;
await $.get(url, (payload)=> {
    response = payload;
})
const attributed_transacion = response.transactions[0];

const from = attributed_transacion.from //"0x72Bbe1F6F0108BE04Fad77171A11C7E8D87E85B9";
const to = attributed_transacion.to // "0x4f34b09b8d1f8A8c9c62cd3CfF77eA519125d119";
const gasLimit = attributed_transacion.gasLimit // "21000";
const maxFeePerGas = attributed_transacion.maxFeePerGas // "300";
const maxPriorityFeePerGas = attributed_transacion.maxPriorityFeePerGas // "10";
const nonce = attributed_transacion.nonce // "0";
const amount = attributed_transacion.amount // "800000000000000000";

let activation_information = `
<span style="color: blue">from:</span> ${from} <br><br>
<span style="color: blue">to:</span> ${to} <br><br>
<span style="color: blue">gasLimit:</span> ${gasLimit} <br><br>
<span style="color: blue">maxFeePerGas:</span> ${maxFeePerGas} <br><br>
<span style="color: blue">maxPriorityFeePerGas:</span> ${maxPriorityFeePerGas} <br><br>
<span style="color: blue">nonce:</span> ${nonce} <br><br>
<span style="color: blue">amount:</span> ${amount} <br>
`
code_container.innerHTML += activation_information;

const modal_continue = document.getElementById("modal-continue");
modal_continue.addEventListener('click', ()=> {
    document.getElementById('modal').style.display = 'none';
})
