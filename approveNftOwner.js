require('dotenv').config()
const Web3 = require('web3');
const web3 = new Web3(process.env.RPC_URL);

const getGasPrice = async () => {
    const gasPrice = await web3.eth.getGasPrice();
    return web3.utils.toBN(gasPrice).add(web3.utils.toBN("20000000000"));
}

const contractAbi = [{ "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
//nft contract address
const NftContractAddress = process.env.NFT_CONTRACT_ADDRESS;
const nftcontract = new web3.eth.Contract(contractAbi, NftContractAddress);

// Nft owner's wallet address
const nftOwnerWallet = process.env.NFT_OWNER_WALLET;
// Nft owner's private key
const privateKey = process.env.NFT_OWNER_PRIVATE_KEY;
const approveNftTransferOnBehalfOfOwner = async (nftSpenderWallet, tokenId, nonce) => {
    const approveMethod = nftcontract.methods.approve(nftSpenderWallet, tokenId);
    try {
        const gasPrice = await getGasPrice();
        const createTransaction = await web3.eth.accounts.signTransaction(
            {
                from: nftOwnerWallet,
                to: NftContractAddress,
                data: approveMethod.encodeABI(),
                value: 0,
                gasPrice: gasPrice,
                nonce: nonce,
                gas: 40000
            },
            privateKey
        );
        console.log(
            `Giving Approval to transfer ${tokenId} to ${nftSpenderWallet}`
        );

        const createReceipt = await web3.eth.sendSignedTransaction(
            createTransaction.rawTransaction
        );
        console.log(
            `Transaction successful with hash: ${createReceipt.transactionHash}`
        );
        console.log(`____________________________________________________________________________________________________`);
    } catch (error) {
        // console.log("Err: ", error)
        console.log(`Error: Transaction filed for tokenId:  ${tokenId}`);
        console.log(`####################################################################################################`);
    }
};

// Scripting part
async function tokenIdAsRange(nftSpenderWallet, tokenIdFrom, tokenIdTo) {
    let nonce = await web3.eth.getTransactionCount(nftOwnerWallet, "pending");
    console.log(`Contract address:  ${NftContractAddress}`)
    for (let tokenId = tokenIdFrom; tokenId < tokenIdTo; tokenId++) {
        console.log(`\n****************************************************************************************************`);
        await approveNftTransferOnBehalfOfOwner(nftSpenderWallet, tokenId, nonce++);

    }
}

async function tokenIdAsArray(nftSpenderWallet, tokenIds) {
    let nonce = await web3.eth.getTransactionCount(nftOwnerWallet, "pending");
    console.log(`Contract address:  ${NftContractAddress}`)
    for (let tokenId = 0; tokenId < tokenIds.length; tokenId++) {
        console.log(`\n****************************************************************************************************`);
        await approveNftTransferOnBehalfOfOwner(nftSpenderWallet, tokenIds[tokenId], nonce++);
    }
}

// nft spender wallet address
let nftSpenderWallet = process.env.NFT_SPENDER_WALLET;

//use this function if you wants to give approval for a range of tokenids
let tokenIdFrom = process.env.TOKEN_ID_FROM; //token id starting from here
let tokenIdTo = process.env.TOKEN_ID_TO; //token id ends here
tokenIdAsRange(nftSpenderWallet, tokenIdFrom, tokenIdTo);

//use this function if you wants to give approval for an array of tokenIds
// let tokenIds = [8100, 8101, 8102];
// tokenIdAsArray(nftSpenderWallet, tokenIds)