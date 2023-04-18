import { ChangeEvent, useEffect, useState } from 'react';

import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useSendTransaction, usePrepareSendTransaction } from 'wagmi';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';

import { parseEther } from 'ethers/lib/utils.js';
import { Card, Col, Row, Space, Divider, Button, Input, Form, Select, message, QRCode, Upload, Checkbox } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import axios from 'axios';
import React from 'react';
import SizeContext from 'antd/es/config-provider/SizeContext';
const { getAddress } = require('../../../src/accounts');

const { TextArea } = Input;

export default function Owner() {
    const [form] = Form.useForm();
    const [mint, setMint] = useState({});
    const [from, setFrom] = useState<CheckboxValueType[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
 

  const handleMint = async (recipient: string) => {
    let address = getAddress(recipient);
    const apiCall = () => {return axios.get('http://localhost:3000/mint?recipient=' + address, {
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
const onChange = (checkedValues: CheckboxValueType[]) => {
    console.log('checked = ', checkedValues);
  };
  
const onFinish = (values: any) => {
    console.log('Finish:', values);
    let mintList = values['recipient1'].concat(values['recipient2']);

    for (let i = 0; i < mintList.length; i++) {
        handleMint(mintList[i]);
    }

    goToNextPage();
  };


  return (
    <div style={{background: 'rgb(82 82 91)', height: '100vh', width: '100%', margin: 0, 'boxSizing': 'border-box'}}>

    <Card 
        title="Mint Tokens" 
        style={{ margin: 5, overflow: 'scroll',top: "30%", left: "30%", transform: "translate(0px, 0%)", width: '45%'}} 
        headStyle={{backgroundColor: 'rgb(161 161 170)', color: 'white', textAlign: 'center'}}
        bodyStyle={{display:'flex', flexDirection:'column', justifyContent:'center'}}
        >
        <Row gutter={[8, 8]}>
            <Col span={5}>
            <Form form={form} name="horizontal_login" layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label='Choose Hospital(s)'
                    name="recipient1"
                    rules={[{ required: true, message: 'Missing Hospital' }]}
                >
                    <Checkbox.Group  onChange={onChange}>
                        <Space>
                            <Checkbox value={1}>Hospital A</Checkbox>
                            <Checkbox value={2}>Hospital B</Checkbox>
                            <Checkbox value={3}>Hospital C</Checkbox>
                        </Space>
                    </Checkbox.Group>
                </Form.Item>
                
                <Form.Item
                    label='Choose Researcher'
                    name="recipient2"
                    rules={[{ required: true, message: 'Missing Researcher' }]}
                >
                   <Checkbox.Group onChange={onChange}>
                            <Checkbox value={4}>Researcher</Checkbox>
                    </Checkbox.Group>
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
                        Mint!
                    </Button>
                    )}
                </Form.Item>
            </Form>
            </Col>
            <Col span={10} offset={7}>
            <Card>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Explicabo doloribus nam quo reiciendis autem consequatur officiis molestias voluptatum itaque earum? Nihil maiores perferendis quod nostrum eaque neque laboriosam explicabo quam.
            </Card>
            </Col>
            </Row>
        </Card>
    </div>
  )
}
