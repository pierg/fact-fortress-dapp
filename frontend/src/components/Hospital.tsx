import { ChangeEvent, useEffect, useState } from 'react';

import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useSendTransaction, usePrepareSendTransaction } from 'wagmi';

import { parseEther } from 'ethers/lib/utils.js';
import { Card, Col, Row, Space, Divider, Button, Input, Form, Select, message, QRCode, Upload } from 'antd';
import { UserOutlined, InboxOutlined, KeyOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import axios from 'axios';
import React from 'react';


const { TextArea } = Input;

export default function Hospital() {
    const [form] = Form.useForm();
    const [mint, setMint] = useState({});
    const [messageApi, contextHolder] = message.useMessage();
  const [uploadFile, setUploadFile] = useState({});

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
 

  const handleMint = async (recipient: string) => {
    const apiCall = () => {return axios.get('http://localhost:3000/mint?recipient=' + recipient, {
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

  const goToNextPage = () => {
    window.scrollTo({
        top: 1000,
        behavior: "smooth",
    });
};
const onFinish = (values: any) => {
    console.log('Finish:', values);
    handleMint(values['recipient1'])
    handleMint(values['recipient2'])
    goToNextPage();
  };

  return (
    <div style={{display: 'flex', 'flexDirection': 'column', backgroundColor: 'rgb(49 46 129)', height: '100vh'}}>
        <Row align='middle'>
        <Col span={11} offset={1}>

        <Card title="Hospital A" style={{margin: 5, overflow: 'scroll',top: "50%", transform: "translate(0px, 50%)"}} headStyle={{backgroundColor: 'rgb(99 102 241)', color: 'white', textAlign: 'center'}}>
            <Form form={form} name="horizontal_login" layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="recipient1"
                    rules={[{ required: true, message: 'Missing first recipient' }]}
                    label="Upload JSON"
                >
                    <Dragger {...props}>
                        <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    </Dragger>
                </Form.Item>
                <Form.Item
                    name="public_key"
                    rules={[{ required: true, message: 'Missing Public Key' }]}
                >
                    <Input prefix={<KeyOutlined className="site-form-item-icon" />} placeholder="Public Key" />
                </Form.Item>
                <Form.Item shouldUpdate>
                    {() => (
                    <Button
                        type="primary"
                        htmlType="submit"
                        disabled={
                        !form.isFieldsTouched(true) ||
                        !!form.getFieldsError().filter(({ errors }) => errors.length).length
                        }
                    >
                        Hash, Sign, and Upload Signature
                    </Button>
                    )}
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
                    <Dragger {...props}>
                        <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    </Dragger>
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
                        disabled={
                        !form.isFieldsTouched(true) ||
                        !!form.getFieldsError().filter(({ errors }) => errors.length).length
                        }
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
