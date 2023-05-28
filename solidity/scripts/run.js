//I want this code to be able to store a user's addy, and their balance? that would be tough lol
const main = async()=>{

    const [owner, randomPerson] = await hre.ethers.getSigners()
    //creates the waveContract
    const waveContractFactory = await hre.ethers.getContractFactory('UploadPortal')
    //deploys the contracts
    const waveContract = await waveContractFactory.deploy({value: hre.ethers.utils.parseEther('0.1')})
    //waits for the miners to actually deploy the contract
    await waveContract.deployed()
    console.log('Contract deployed to:', waveContract.address)
    console.log('contract deployed by:', owner.address)
    let contractBalance = await hre.ethers.provider.getBalance(waveContract.address)
    console.log('Contract Balance:',hre.ethers.utils.formatEther(contractBalance))
   

    //now we have to set up the txn
    for (let index = 0; index < 5; index++) {
        let txn = await waveContract.upload(`I have waved ${index+1} times`)
    await txn.wait()
    }
    //log the number of waves
    let allUploads = await waveContract.getTotalUploads()
    console.log('I waved %s times', allUploads.toNumber())
//let the random wave now
    for (let index = 0; index < 5; index++) {
    txn = await waveContract.connect(randomPerson).upload('This is some random person message')
    await txn.wait()
    }
    allUploads = await waveContract.getTotalUploads()
     console.log('The random just waved so now there are %s total waves',allUploads.toNumber())
  

let  contractUploads = await waveContract.getAllUploads()
  //console.log(contractUploads)

    //Trying to wave again!
    txn = await waveContract.upload('second Wave!')
    await txn.wait()
//getting a look at the new balance!
    contractBalance = await hre.ethers.provider.getBalance(waveContract.address)
    console.log('Contract Balance:',hre.ethers.utils.formatEther(contractBalance))
//let's see if we can pull the list of one user's messages
let userMessageList = contractUploads.filter(Upload => {return Upload.person === owner.address})
console.log('****************************')
console.log('%s list is:',owner.address)
console.log('THE LIST:',userMessageList)

}



const runMain=async()=>{
    try {
        await main()
        process.exit(0)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}
runMain()