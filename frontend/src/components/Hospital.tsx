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
    const [key_b, setKey_b] = useState({});
    const [hash_a, setHash_a] = useState({});
    const [hash_b, setHash_b] = useState({});
    const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [next_a, setNext_a] = useState(false);
  const [loading_b, setLoading_b] = useState(true);
  const [next_b, setNext_b] = useState(false);

    const { Dragger } = Upload;
 

    const handleGetKeyPair = async (hospital: string) => {
        const apiCall = () => {return axios.get('http://localhost:3000/key_pair');}
        if (hospital == 'A') {
            setLoading(true)
        } else {
            setLoading_b(true)
        }
    
        apiCall()
          .then(response => {
            console.log(response.data);
            if (hospital == 'A') {
                setLoading(false)
                setKey_a(response.data)
            } else {
                setLoading_b(false)
                setKey_b(response.data)
            }
          })
          .catch(error => {
            console.log(error);
          });
        
      }
    
    const handleUpload_A = async () => {
        axios.put('http://localhost:3000/publickey?name=' + 'hospitalA&public_key=' + key_a['public_key'],null, {
            headers: {
              'from': 'owner'
            }
            })
        .then(response => {
            setNext_a(true)
            console.log(response.data)
        }).catch(error => {
            console.log(error)
        })
    }

    const handleHSU_A = async () => {
        axios.post('http://localhost:3000/sign_message' ,null)
        .then(response => {
            console.log(response.data)
            setHash_a(response.data)
        }).catch(error => {
            console.log(error)
        })
    }

    const handleHSU_B = async () => {
        axios.post('http://localhost:3000/sign_message' ,null)
        .then(response => {
            console.log(response.data)
            setHash_b(response.data)
        }).catch(error => {
            console.log(error)
        })
    }

    const handleUpload_B = async () => {
        axios.put('http://localhost:3000/publickey?name=' + 'hospitalB&public_key=' + key_b['public_key'],null, {
            headers: {
              'from': 'owner'
            }
            })
        .then(response => {
            setNext_b(true)
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
  const { TextArea } = Input;


  return (
    <div 
    class="h-14 bg-gradient-to-r from-amber-500 to-red-800"
    style={{
            width: '100vw',
            height: '100vh', margin: 0, 'boxSizing': 'border-box'}}
    >
        <Row gutter={[4, 4]}>
        <Col span={11} offset={1}>

        <Card title="Hospital A" style={{ overflow: 'scroll',top: "20%", transform: "translate(0px, 0%)", maxHeight: '70vh'}} headStyle={{backgroundColor: 'rgb(234 88 12)', color: 'white', textAlign: 'center'}}>
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
                        onClick={handleUpload_A}
                        disabled={loading}
                    >
                        Upload
                    </Button>
                </Form.Item>
                <Form.Item
                    name="private_key"
                    label='Private Key'
                >   
                {JSON.stringify(key_a) == '{}' &&
                    <Input prefix={<KeyOutlined className="site-form-item-icon" />} placeholder="Private Key" />
                }
                 {JSON.stringify(key_a) != '{}' &&
                    <Input prefix={<KeyOutlined className="site-form-item-icon" />} defaultValue={key_a['private_key']} disabled={true} />
                }
                </Form.Item>
                <Form.Item
                    name="data_a"
                    label='Input Data'
                >   
                    <TextArea rows={4} />
                </Form.Item>
                <Form.Item >
                    <Button
                        type="primary"
                        onClick={handleHSU_A}
                        disabled={!next_a}
                    >
                        Hash, Sign, and Upload Signature
                    </Button>
                </Form.Item>
                <Form.Item
                    name="output"
                    label="Hash Output"
                > 
                    {JSON.stringify(hash_a) != '{}' &&
                    <div style={{ width: '100%', fontWeight: 'bold'}}>
                        <Card bodyStyle={{overflowWrap: 'break-word'}}>{JSON.stringify(hash_a)}</Card>
                        {/* <textarea readOnly={true} defaultValue={JSON.stringify(key_a)} style={{width: '100%', maxWidth: '100%', fontWeight: 'bold'}} /> */}
                    </div>
                    }
                     {JSON.stringify(key_a) == '{}' &&
                    <div style={{ width: '100%', fontWeight: 'bold'}}>
                        <Card loading={true}>None</Card>

                    </div>
                    }
                </Form.Item>
            </Form>

        </Card>
        </Col>
        <Col span={11}>
            <Card title="Hospital B" style={{ overflow: 'scroll',top: "20%", transform: "translate(0px, 0%)", maxHeight: '70vh'}} headStyle={{backgroundColor: 'rgb(234 88 12)', color: 'white', textAlign: 'center'}}>
            <Form form={form} name="horizontal_login" layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="recipient1b"
                    label="Generate Keys"
                > 
                    {JSON.stringify(key_b) != '{}' &&
                    <div style={{ width: '100%', fontWeight: 'bold'}}>
                        Public and Private Keys
                        <Card bodyStyle={{overflowWrap: 'break-word'}}>{JSON.stringify(key_b)}</Card>
                        {/* <textarea readOnly={true} defaultValue={JSON.stringify(key_a)} style={{width: '100%', maxWidth: '100%', fontWeight: 'bold'}} /> */}
                    </div>
                    }
                     {JSON.stringify(key_b) == '{}' &&
                    <div style={{ width: '100%', fontWeight: 'bold'}}>
                        Public and Private Keys
                        <Card loading={loading_b}>None</Card>

                    </div>
                    }
                    <Button
                        type="primary"
                        onClick={() => {handleGetKeyPair('B')}}
                    >
                        Generate!
                    </Button>
                </Form.Item>
                <Form.Item
                    name="nameb"
                    label='Name'
                >   
                {JSON.stringify(key_b) == '{}' &&
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Name" />
                }
                 {JSON.stringify(key_b) != '{}' &&
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} defaultValue={'Hospital B'} disabled={true} />
                }
                </Form.Item>
                <Form.Item
                    name="public_key"
                    label='Public Key'
                >   
                {JSON.stringify(key_b) == '{}' &&
                    <Input prefix={<KeyOutlined className="site-form-item-icon" />} placeholder="Public Key" />
                }
                 {JSON.stringify(key_b) != '{}' &&
                    <Input prefix={<KeyOutlined className="site-form-item-icon" />} defaultValue={key_b['public_key']} disabled={true} />
                }
                </Form.Item>
                <Form.Item >
                    <Button
                        type="primary"
                        onClick={handleUpload_B}
                        disabled={loading_b}
                    >
                        Upload
                    </Button>
                </Form.Item>
                <Form.Item
                    name="private_key"
                    label='Private Key'
                >   
                {JSON.stringify(key_b) == '{}' &&
                    <Input prefix={<KeyOutlined className="site-form-item-icon" />} placeholder="Private Key" />
                }
                 {JSON.stringify(key_b) != '{}' &&
                    <Input prefix={<KeyOutlined className="site-form-item-icon" />} defaultValue={key_b['private_key']} disabled={true} />
                }
                </Form.Item>
                <Form.Item
                    name="data_a"
                    label='Input Data'
                >   
                    <TextArea rows={4} />
                </Form.Item>
                <Form.Item >
                    <Button
                        type="primary"
                        onClick={handleHSU_B}
                        disabled={!next_b}
                    >
                        Hash, Sign, and Upload Signature
                    </Button>
                </Form.Item>
                <Form.Item
                    name="outputb"
                    label="Hash Output"
                > 
                    {JSON.stringify(hash_b) != '{}' &&
                    <div style={{ width: '100%', fontWeight: 'bold'}}>
                        <Card bodyStyle={{overflowWrap: 'break-word'}}>{JSON.stringify(hash_b)}</Card>
                        {/* <textarea readOnly={true} defaultValue={JSON.stringify(key_a)} style={{width: '100%', maxWidth: '100%', fontWeight: 'bold'}} /> */}
                    </div>
                    }
                     {JSON.stringify(key_b) == '{}' &&
                    <div style={{ width: '100%', fontWeight: 'bold'}}>
                        <Card loading={true}>None</Card>

                    </div>
                    }
                </Form.Item>
            </Form>
        </Card>
        </Col>
        </Row>
    </div>
  )
}
