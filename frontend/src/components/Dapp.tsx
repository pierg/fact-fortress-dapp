import { ChangeEvent, useEffect, useState } from 'react';

import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useSendTransaction, usePrepareSendTransaction } from 'wagmi';

import { parseEther } from 'ethers/lib/utils.js';
import { Card, Col, Row, Space, Divider, Button } from 'antd';
import axios from 'axios';

export default function Dapp() {
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [transferAmount, setTransferAmout] = useState<string>("0");
  const [publicKey, setPublicKey] = useState<string>("");
  const addRecentTransaction = useAddRecentTransaction();


  const onRecipientAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReceiverAddress(e.target.value);
  }

  const onTransferAmountChange = ( e: ChangeEvent<HTMLInputElement>) => {
    setTransferAmout(e.target.value);
  }

  const { config, error } = usePrepareSendTransaction({
    request: {
      to: receiverAddress,
      value: parseEther(transferAmount || '0'),
    }
  });

  const { data, isLoading, isSuccess, sendTransaction } = useSendTransaction(config)

  const handleSendTransaction = async () => {
    sendTransaction?.();
  }

  const handleGetKeyPair = async () => {
    const apiCall = () => {return axios.get('http://localhost:3000/key_pair');}

    apiCall()
      .then(response => {
        console.log(response.data);
        setPublicKey(response.data['public_key'])
      })
      .catch(error => {
        console.log(error);
      });
  }

  useEffect(() => {
  })

  console.log(publicKey)

  return (
<div style={{display: 'flex', 'flex-direction': 'column', backgroundColor: 'rgb(15 23 42)', height: '100vh'}}>
      {/* <Card bodyStyle={{background: '#C5C5C5'}} bordered={false}> */}
      <Divider/>
      <Row gutter={[4, 4]}>
        <Col span={11} offset={1}>
          <Card style={{margin: 5, height: '85vh', overflow: 'scroll'}} headStyle={{backgroundColor: 'rgb(100 116 139)', color: 'white', textAlign: 'center'}} title="Researchers" bordered={true}>
            <Space 
              direction="vertical"
              style={{
                display: 'flex',
              }}
            >
            <Card type='inner' bodyStyle={{height: '30vh'}} title='Token Distribution'>
              <Button
                  className='font-bold text-white bg-indigo-600 mt-4 self-center rounded-full disabled:opacity-75'
                  onClick={handleGetKeyPair}
                >
                Get Public Key
              </Button>
            </Card>
            <Card type='inner' bodyStyle={{height: '10vh'}} title='Signed Data Secures Storage'>
              stuff
            </Card>
            <Card type='inner' bodyStyle={{height: '10vh'}} title='Select Function'>
              stuff
            </Card>
            <Card type='inner' bodyStyle={{height: '10vh'}} title='Proof'>
              stuff
            </Card>
            </Space>
          </Card>
        </Col>
        <Col span={11}>
          <Card style={{margin: 5, height: '85vh', overflow: 'scroll'}}  headStyle={{backgroundColor: 'rgb(100 116 139)', color: 'white', textAlign: 'center'}} title="Verifiers" bordered={true}>
          <Space 
              direction="vertical"
              style={{
                display: 'flex',
              }}
            >
            <Card type='inner' bodyStyle={{height: '30vh'}} title='Upload QR Code'>
              stuff
            </Card>
            <Card type='inner' bodyStyle={{height: '30vh'}} title='Verify Proof'>
              stuff
            </Card>
            </Space>
          </Card>
        </Col>
      </Row>
      {/* </Card> */}
    </div>
  )
}
