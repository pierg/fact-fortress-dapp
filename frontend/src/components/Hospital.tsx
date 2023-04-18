import { ChangeEvent, useEffect, useState } from 'react';

import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useSendTransaction, usePrepareSendTransaction } from 'wagmi';

import { parseEther } from 'ethers/lib/utils.js';
import { Card, Col, Row, Space, Divider, Button, Input, Form, Select, message, QRCode, Upload } from 'antd';
import { UserOutlined, InboxOutlined, KeyOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import axios from 'axios';
import React from 'react';
import { json } from 'stream/consumers';


const { TextArea } = Input;

export default function Hospital() {
    const [form] = Form.useForm();
    const [mint, setMint] = useState({});
    const [key_a, setKey_a] = useState({});
    const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);

    const { Dragger } = Upload;
 

    const handleGetKeyPair = async (hospital: string) => {
        const apiCall = () => {return axios.get('http://localhost:3000/key_pair');}
        setLoading(true)
    
        apiCall()
          .then(response => {
            console.log(response.data);
            setLoading(false)
            if (hospital == 'A') {
                setKey_a(response.data)
            }

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
    
    const handleUpload = async () => {
        axios.put('http://localhost:3000/publickey?name=' + 'hospitalA&public_key=' + key_a['public_key'],null, {
            headers: {
              'from': 'owner'
            }
            })
        .then(response => {
            console.log(response.data)
        }).catch(error => {
            console.log(error)
        })
    }

  const goToNextPage = () => {
    window.scrollTo({
        top: 1000,
        behavior: "smooth",
    });
};
const onFinish = (values: any) => {
    console.log('Finish:', values);
  };


  return (
    <div style={{display: 'flex', 'flexDirection': 'column', backgroundColor: 'rgb(49 46 129)', height: '100vh'}}>
        <Row align='middle'>
        <Col span={11} offset={1}>

        <Card title="Hospital A" style={{margin: 5, overflow: 'scroll',top: "30%", transform: "translate(0px, 20%)"}} headStyle={{backgroundColor: 'rgb(99 102 241)', color: 'white', textAlign: 'center'}}>
            <Form form={form} name="horizontal_login" layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="recipient1"
                    label="Generate Keys"
                > 
                    {JSON.stringify(key_a) != '{}' &&
                    <div style={{ width: '100%', fontWeight: 'bold'}}>
                        Public and Private Keys
                        <Card bodyStyle={{overflowWrap: 'break-word'}}>{JSON.stringify(key_a)}</Card>
                        {/* <textarea readOnly={true} defaultValue={JSON.stringify(key_a)} style={{width: '100%', maxWidth: '100%', fontWeight: 'bold'}} /> */}
                    </div>
                    }
                     {JSON.stringify(key_a) == '{}' &&
                    <div style={{ width: '100%', fontWeight: 'bold'}}>
                        Public and Private Keys
                        <Card loading={loading}>None</Card>

                    </div>
                    }
                    <Button
                        type="primary"
                        onClick={() => {handleGetKeyPair('A')}}
                    >
                        Generate!
                    </Button>
                </Form.Item>
                <Form.Item
                    name="name"
                    label='Name'
                >   
                {JSON.stringify(key_a) == '{}' &&
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Name" />
                }
                 {JSON.stringify(key_a) != '{}' &&
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} defaultValue={'Hospital A'} disabled={true} />
                }
                </Form.Item>
                <Form.Item
                    name="public_key"
                    label='Public Key'
                >   
                {JSON.stringify(key_a) == '{}' &&
                    <Input prefix={<KeyOutlined className="site-form-item-icon" />} placeholder="Public Key" />
                }
                 {JSON.stringify(key_a) != '{}' &&
                    <Input prefix={<KeyOutlined className="site-form-item-icon" />} defaultValue={key_a['public_key']} disabled={true} />
                }
                </Form.Item>
                <Form.Item >
                    <Button
                        type="primary"
                        onClick={handleUpload}
                        disabled={loading}
                    >
                        Upload
                    </Button>
                </Form.Item>
            </Form>
        </Card>
        </Col>
        <Col span={11}>
            <Card title="Hospital B" style={{margin: 5, overflow: 'scroll',top: "50%", transform: "translate(0px, 50%)"}} headStyle={{backgroundColor: 'rgb(99 102 241)', color: 'white', textAlign: 'center'}}>
            <Form form={form} name="horizontal_login" layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="recipient1"
                    rules={[{ required: true, message: 'Missing first recipient' }]}
                    label="Upload JSON"
                >

                </Form.Item>
                <Form.Item
                    name="private_key"
                    rules={[{ required: true, message: 'Missing Private Key' }]}
                >
                    <Input prefix={<KeyOutlined className="site-form-item-icon" />} placeholder="Private Key" />
                </Form.Item>
                <Form.Item shouldUpdate>
                    {() => (
                    <Button
                        type="primary"
                        htmlType="submit"
                        disabled={loading}
                    >
                        Hash, Sign, and Upload Signature
                    </Button>
                    )}
                </Form.Item>
            </Form>
        </Card>
        </Col>
        </Row>
    </div>
  )
}
