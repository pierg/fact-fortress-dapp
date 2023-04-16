import { ChangeEvent, useEffect, useState } from 'react';

import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useSendTransaction, usePrepareSendTransaction } from 'wagmi';

import { parseEther } from 'ethers/lib/utils.js';
import { Card, Col, Row, Space, Divider, Button, Input, Select, message, QRCode } from 'antd';
import axios from 'axios';
import React from 'react';


const { TextArea } = Input;

export default function Dapp() {
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [transferAmount, setTransferAmout] = useState<string>("0");
  const [publicKey, setPublicKey] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [compute, setCompute] = useState<string>("");
  const [computeRes, setComputeRes] = useState({});
  const [mint, setMint] = useState({});
  const [messageApi, contextHolder] = message.useMessage();
  const [qrCode, setQrCode] = React.useState('https://github.com/pierg/zkp-hackathon');
 
  const consoleRef = React.createRef()
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

  const downloadQRCode = () => {
    const canvas = document.getElementById('myqrcode')?.querySelector<HTMLCanvasElement>('canvas');
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement('a');
      a.download = 'QRCode.png';
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleGetKeyPair = async () => {
    const apiCall = () => {return axios.get('http://localhost:3000/key_pair');}
    const tokenCall = (address: string) => {return axios.get('http://localhost:3000/tokenid', {
      params : {
        'address': address
      }
    })}
    var address = ""

    apiCall()
      .then(response => {
        console.log(response.data);
        setPublicKey(response.data['public_key'])
        setPrivateKey(response.data['private_key'])
        // tokenCall(response.data['public_key'])
        //   .then(response => {
        //     console.log(response.data);
        //     // setPublicKey(response.data['public_key'])
        //   })
        //   .catch(error => {
        //     console.log(error);
        //   });
      })
      .catch(error => {
        console.log(error);
      });
    
  }

  const handleSign = async () => {
    const apiCall = () => {return axios.get('http://localhost:3000/mint?recipient=0x98526c571e324028250B0f5f247Ca4F1b575fadB', {
          headers: {
            'from': 'owner'
          }
          }
        )}

    apiCall()
      .then(response => {
        console.log(response.data);
        // setComputeRes(response.data)
      })
      .catch(error => {
        console.log(error);
      });
  }
  const handleMint = async () => {
    const apiCall = () => {return axios.get('http://localhost:3000/mint?recipient=0x98526c571e324028250B0f5f247Ca4F1b575fadB', {
          headers: {
            'from': 'owner'
          }
          }
        )}

    apiCall()
      .then(response => {
        console.log(response.data);
        setMint(response.data)
      })
      .catch(error => {
        console.log(error);
      });
  }


  const handleCompute = async () => {
    const apiCall = () => {return axios.get('http://localhost:3000/mint', {
                                      params: {
                                        'recipient': publicKey
                                        }
                                      }
                                    )}

    apiCall()
      .then(response => {
        console.log(response.data);
        setComputeRes(response.data)
      })
      .catch(error => {
        console.log(error);
      });
  }

  const handleSelect = (value: string) => {
    setCompute(value)
    console.log(value)
  }

  const successMess = () => {
    messageApi.open({
      type: 'success',
      content: 'Successfully verified',
    });
  };

  const errorMess = () => {
    messageApi.open({
      type: 'error',
      content: 'Error',
    });
  }

  useEffect(() => {
  })

  return (
<div style={{display: 'flex', 'flexDirection': 'column', backgroundColor: 'rgb(15 23 42)', height: '100vh'}}>
      {/* <Card bodyStyle={{background: '#C5C5C5'}} bordered={false}> */}
      {contextHolder}
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
            {/* <Space 
              direction="vertical"
              style={{
                display: 'flex',
              }}
            > */}
            {publicKey != "" &&
              <div style={{ width: '100%', fontWeight: 'bold'}}>
                Token ID
                <textarea readOnly={true} defaultValue={publicKey} style={{width: '100%', maxWidth: '100%', fontWeight: 'bold'}} />

              </div>
            }
            {JSON.stringify(mint) != '{}' &&
              <div style={{ width: '100%', fontWeight: 'bold'}}>
                Mint
                <textarea readOnly={true} defaultValue={JSON.stringify(mint)} style={{width: '100%', maxWidth: '100%', fontWeight: 'bold'}} />
              </div>
            }
            <br/>
              <Button
                  type='primary'
                  shape='round'
                  onClick={handleGetKeyPair}
                >
                Get Token ID
              </Button>
              <Button
                  type='primary'
                  shape='round'
                  onClick={handleMint}
                >
                Mint
              </Button>
            {/* </Space> */}
            </Card>
            <Card type='inner' bodyStyle={{height: '10vh'}} title='Signed Data Secures Storage'>
              <Button
                  type='primary'
                  shape='round'
                  onClick={handleSign}
                >
                Sign
              </Button>
            </Card>
            <Card type='inner' bodyStyle={{height: '10vh'}} title='Select Function'>
              <Space>
                <Select
                  defaultValue="Function"
                  style={{
                    width: 120,
                  }}
                  onChange={handleSelect}
                  options={[
                    {
                      value: 'function1',
                      label: 'function 1',
                    },
                    {
                      value: 'function2',
                      label: 'function 2',
                    },
                    {
                      value: 'function3',
                      label: 'function 3',
                    },

                  ]}
                />
                <Button
                    type='primary'
                    shape='round'
                    onClick={handleCompute}
                  >
                  Compute
                </Button>
              </Space>
            </Card>
            <Card type='inner' title='Proof'>
              <div id="myqrcode">
                <Space direction="horizontal">
                  <QRCode value={qrCode || '-'} />
                  <Button type="primary" onClick={downloadQRCode}>
                    Download
                  </Button>
                </Space>
              </div>
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
              <Space>
                <Button onClick={successMess}>Success</Button>
                <Button onClick={errorMess}>Error</Button>
              </Space>
            </Card>
            </Space>
          </Card>
        </Col>
      </Row>
      {/* </Card> */}
    </div>
  )
}
