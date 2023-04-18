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


const { TextArea } = Input;

export default function Owner() {
    const [form] = Form.useForm();
    const [mint, setMint] = useState({});
    const [from, setFrom] = useState<CheckboxValueType[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
 

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
const onChange = (checkedValues: CheckboxValueType[]) => {
    console.log('checked = ', checkedValues);
  };
  
const onFinish = (values: any) => {
    console.log('Finish:', values);
    let mintList = values['recipient1'].concat(values['recipient2']);

    for (let i = 0; i < mintList.length; i++) {
        handleMint(mintList[i]);
    }
    // handleMint(values['recipient1'].concat(values['recipient2']))
    // handleMint(values['recipient2'])
    goToNextPage();
  };


  return (
    <div style={{background: 'rgb(69 10 10)', height: '100vh', width: '100%', margin: 0, 'boxSizing': 'border-box'}}>
        <Row >
        <Col span={14} offset={1}>

        <Card title="Owner" style={{margin: 5, overflow: 'scroll',top: "50%", transform: "translate(0px, 0%)"}} headStyle={{backgroundColor: 'rgb(220 38 38)', color: 'white', textAlign: 'center'}}>
            <Form form={form} name="horizontal_login" layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label='Choose Hospital(s)'
                    name="recipient1"
                    rules={[{ required: true, message: 'Missing Hospital' }]}
                >
                    <Checkbox.Group style={{ width: '100%' }} onChange={onChange}>
                        <Space>
                            <Checkbox value="A">Hospital A</Checkbox>
                            <Checkbox value="B">Hospital B</Checkbox>
                            <Checkbox value="C">Hospital C</Checkbox>
                        </Space>
                    </Checkbox.Group>
                </Form.Item>
                <Form.Item
                    label='Choose Researcher'
                    name="recipient2"
                    rules={[{ required: true, message: 'Missing Researcher' }]}
                >
                   <Checkbox.Group style={{ width: '100%' }} onChange={onChange}>
                        <Space>
                            <Checkbox value="researcher">Researcher</Checkbox>
                        </Space>
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
        </Card>
        </Col>
        <Col span={8} offset={0}>

            <Card title="description" style={{margin: 5, overflow: 'scroll',top: "50%", transform: "translate(0px, 100%)"}} headStyle={{backgroundColor: 'rgb(220 38 38)', color: 'white', textAlign: 'center'}}>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Beatae cupiditate, delectus nihil dignissimos qui corrupti accusantium error, rerum blanditiis quos fugit inventore alias sint neque in iste reiciendis similique obcaecati.
            </Card>
            </Col>
        </Row>
    </div>
  )
}
