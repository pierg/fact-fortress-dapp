import { ChangeEvent, useEffect, useState } from 'react';

import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useSendTransaction, usePrepareSendTransaction } from 'wagmi';

import { parseEther } from 'ethers/lib/utils.js';
import { Card, Col, Row, Space, Divider, Button, Input, Select, message, QRCode, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import axios from 'axios';
import React from 'react';


const { TextArea } = Input;

export default function Verifier() {
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [transferAmount, setTransferAmout] = useState<string>("0");
  const [publicKey, setPublicKey] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [compute, setCompute] = useState<string>("");
  const [computeRes, setComputeRes] = useState({});
  const [uploadFile, setUploadFile] = useState({});
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

  const { Dragger } = Upload;

  const props: UploadProps = {
    name: 'file',
    multiple: true,
    onChange(info) {
      console.log(info)
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        setUploadFile(info)
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  useEffect(() => {
  })

  return (
<div style={{display: 'flex', 'flexDirection': 'column', backgroundColor: 'rgb(49 46 129)', height: '100vh'}}>
      {/* <Card bodyStyle={{background: '#C5C5C5'}} bordered={false}> */}
      {contextHolder}
      <Row gutter={[4, 4]}>
      <Col span={12} offset={6}>
      <Card title="Verifier" style={{margin: 5, overflow: 'scroll',top: "10%", transform: "translate(0px, 0%)"}} headStyle={{backgroundColor: 'rgb(99 102 241)', color: 'white', textAlign: 'center'}}>
          <Space 
              direction="vertical"
              style={{
                display: 'flex',
              }}
            >
            <Card type='inner' title='Upload QR Code'>
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
              </Dragger>
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
