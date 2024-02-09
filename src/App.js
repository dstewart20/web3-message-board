import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import uploadportal from './utils/UploadPortal.json';

const initialState = {
  currentAccount: '',
  message: '',
  uploadCount: 0,
  contractBalance: 0,
};
export default function App() {
  const [state, setState] = useState(initialState);

  let [totalUploads, setTotalUploads] = useState([]);
  const contractAddress = '0x798a2Ad74Dc4D1Dd42EE2b4F36CD1c4A88a4f762';
  const contractABI = uploadportal.abi;
  const handleChange = (e) => {
    setState({ ...state, message: e.target.value });
  };
  const postedDate = (date) =>
    new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    }).format(date);
  const btnPress = () => {
    if (state.message === '') {
      alert('hey write a message first!');
    } else {
      upload(state.message);
      setState({ ...state, message: '' });
      console.log('the message is now', state.message);
    }
  };
  const getAllUploads = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const uploadPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const uploads = await uploadPortalContract.getAllUploads();
        const totalCount = await uploadPortalContract.getTotalUploads();
        const contractBalance = await provider.getBalance(
          uploadPortalContract.address
        );
        console.log(
          'the contract balance is',
          ethers.utils.formatEther(contractBalance)
        );
        console.log('and the count is', totalCount.toNumber());
        let uploadsCleaned = [];
        uploads.forEach((upload) => {
          uploadsCleaned.push({
            address: upload.person,
            message: upload.message,
            timestamp: new Date(upload.timestamp * 1000),
          });
        });

        setTotalUploads(uploadsCleaned);

        //listens for events
        uploadPortalContract.on('NewUpload', (from, timestamp, message) => {
          console.log('NewUpload', from, timestamp, message);
          setTotalUploads((prevState) => [
            ...prevState,
            {
              address: from,
              message: message,
              timestamp: new Date(timestamp * 1000),
            },
          ]);
          //console.log('done with that and the count now is')
        });
      } else {
        console.log('reconnect!');
      }
    } catch (error) {
      console.log(error);
    }
  };
  const checkisWalletConnected = async () => {
    try {
      //checking to see if we first have access to window.ethereum!
      const { ethereum } = window;
      if (!ethereum) {
        console.log('please get a metamask!');
        return;
      } else {
        console.log('we Have the ethereum object', ethereum);
      }
      //Checks to see if we are authorize to acccess the user's wallet
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account', account);
        getAllUploads();
        setState({ ...state, currentAccount: account });
      } else {
        console.log('no authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('get Metamask');
        return;
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('connected!', accounts[0]);
      setState({ ...state, currentAccount: accounts[0] });
    } catch (error) {
      console.log(error);
    }
  };

  const upload = async (message) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const uploadPortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        state.contractBalance = await provider.getBalance(
          uploadPortalContract.address
        );

        const uploadTxn = await uploadPortalContract.upload(message, {
          gasLimit: 300000,
        });
        console.log('mining---', uploadTxn.hash);
        await uploadTxn.wait();
        console.log('mined!', uploadTxn.hash);
        console.log(uploadTxn);
        state.contractBalance = await provider.getBalance(
          uploadPortalContract.address
        );
        console.log(
          'the contract balance is now...',
          ethers.utils.formatEther(state.contractBalance)
        );
        let count = await uploadPortalContract.getTotalUploads();

        console.log('the total count now is', count.toNumber());
      } else {
        console.log('uh-oh reconnect');
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    checkisWalletConnected();
  }, []);

  return (
    <div className='mainContainer'>
      <div className='dataContainer'>
        <div className='btnHeader'>
          {' '}
          {!state.currentAccount && (
            <button className='connectButton' onClick={connectWallet}>
              connect Wallet
            </button>
          )}
          {state.currentAccount && (
            <p>Hello, {state.currentAccount.substring(0, 8)}...</p>
          )}
        </div>
        <div className='header'>
          <p>👋 Hey there!</p>
        </div>

        <div className='bio'>
          The name is Dante, I'm a co-founder and freelance developer, and guess
          what! I'm bringing the creatives and their fans to the blockchain 😎.
        </div>
        {state.currentAccount && (
          <div className='contentContainer'>
            <textarea
              className='comment'
              placeholder='Why are you interested in web3?'
              value={state.message}
              onChange={handleChange}
              maxLength='120'
              rows='5'
              cols='33'
            />
            <button className='waveButton' onClick={() => btnPress()}>
              Put me on!
            </button>
            <p> There are {totalUploads.length} total comments!</p>
            {totalUploads.map((upload, index) => {
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'OldLace',
                    marginTop: '16px',
                    padding: '8px',
                    borderRadius: '10px',
                  }}
                >
                  <div className='commentHeader'>
                    Address: {upload.address.substring(0, 8)}...
                    <div>{postedDate(upload.timestamp)}</div>
                  </div>

                  <div>Message: {upload.message}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
