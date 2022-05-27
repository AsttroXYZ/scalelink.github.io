const next_step = document.getElementById("next-btn");
let next_step_available = false;
let transaction_complete = false;
const current_campaign = JSON.parse(localStorage.getItem("current_campaign"))
const item_name = document.getElementById("item-name")
const item_description = document.getElementsByClassName("item-description")[0]
const item_preview_img = document.getElementById("item-preview-img")
const purchase_btn = document.getElementById("purchase-btn")

function activateNextStep() {
    if (next_step_available) {
        next_step.classList.remove('hidden');
        next_step.style.display = 'flex'; 
    }
}
function transactionSuccess() {
    if (transaction_complete) {
        purchase_btn.innerHTML = "Transaction complete";
        purchase_btn.classList.remove("submit-btn");
        purchase_btn.classList.add("successfully-launched");
    }
}

const modal_continue = document.getElementById("modal-continue");
modal_continue.addEventListener('click', ()=> {
    document.getElementById('modal').style.display = 'none';
})

// requires current campaign to have a valid to address
// purchase_btn.setAttribute('to_address', current_campaign.address);
purchase_btn.setAttribute('to_address', "0x4f34b09b8d1f8A8c9c62cd3CfF77eA519125d119");
item_name.innerHTML = current_campaign.name;
item_description.innerHTML = current_campaign.description;
item_preview_img.src = current_campaign.image;

async function purchaseItem(to_address, value_ether, gas_price_gwei, gas_limit_base, chain_id_base) {
    const transactionParameters = {
        gasPrice: decimal_to_wei_to_hex(gas_price_gwei, 'gwei'), // customizable by user during MetaMask confirmation.
        gas: decimal_to_wei_to_hex(gas_limit_base, 'base'), // customizable by user during MetaMask confirmation.
        to: to_address, // Required except during contract publications.
        from: ethereum.selectedAddress, // must match user's active address.
        value: decimal_to_wei_to_hex(value_ether, 'ether'), // Only required to send ether to the recipient from the initiating external account.
        // data:
        //   '0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // Optional, but used for defining smart contract creation and interaction.
        chainId: decimal_to_wei_to_hex(chain_id_base, 'base'), // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
      };
      
    // txHash is a hex string
    // As with any RPC call, it may throw an error
    ethereum.request({ method: 'eth_requestAccounts' }).then(async () => {
        const txHash = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });
        localStorage.setItem("last_txHash", txHash)
        next_step_available = true;
        activateNextStep();
        transaction_complete = true;
        transactionSuccess()
    });
}

function decimal_to_wei_to_hex(num, denomination='ether') {
    let magnitude = 18;
    if (denomination === 'wei' || denomination === 'base') {
        magnitude = 0;
    }
    if (denomination === 'gwei') {
        magnitude = 9;
    }
    const hex = '0x' + (num*(10**magnitude)).toString(16)
    return hex
}

const price = parseFloat(purchase_btn.attributes.price.value)
const to_address = purchase_btn.attributes.to_address.value;
const gas_price_gwei = 100
const gas_limit_base_units = 21000
const chain_id = 1337
purchase_btn.addEventListener('click', () => {purchaseItem(to_address, price, gas_price_gwei, gas_limit_base_units, chain_id)})