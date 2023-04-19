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
const { Search } = Input;

export default function Owner() {
    const [form] = Form.useForm();
    const [mint, setMint] = useState({});
    const [from, setFrom] = useState<CheckboxValueType[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
 

  const handleMintHospital = async (recipient: string) => {
    // let address = getAddress(recipient);
    console.log(recipient)
    const apiCall = () => {return axios.get('http://localhost:3000/authorize_authority?recipient=' + recipient, {
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
  const handleMintResearcher = async (recipient: string) => {
    // let address = getAddress(recipient);
    console.log(recipient)
    const accessTypes = ["access_type_1", "access_type_2"];
    axios
      .post(
        `/authorize_researcher?recipient=${recipient}`,
        { access_types: accessTypes },
        {
          headers: {
            "Content-Type": "application/json",
            from: "owner",
          },
        }
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
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
    // let mintList = values['recipient1'].concat(values['recipient2']);

    // for (let i = 0; i < mintList.length; i++) {
    //     handleMint(mintList[i]);
    // }

    goToNextPage();
  };


  return (
    <div 
        class="h-14 bg-gradient-to-r from-emerald-500 to-green-900"
        style={{
            width: '100vw',
            height: '100vh', margin: 0, overflow: 'scroll'}}
        >

    <Card 
        title="Mint Tokens" 
        style={{ margin: 5, overflow: 'scroll',top: "10%", left: "30%", transform: "translate(0px, 0%)", width: '45%'}} 
        headStyle={{backgroundColor: 'rgb(4 120 87)', color: 'white', textAlign: 'center'}}
        bodyStyle={{display:'flex', flexDirection:'column', justifyContent:'center'}}
        >
        <Row gutter={[8, 8]}>
            <Col span={20}>
            <Form form={form} name="horizontal_login" layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label='Data Providers'
                    name="recipient1"
                >
                    <Search 
                        addonBefore="Hospital A" 
                        defaultValue="0x98526c571e324028250B0f5f247Ca4F1b575fadB" 
                        enterButton="Mint!"
                        size="large"
                        onSearch={() => {handleMintHospital('0x98526c571e324028250B0f5f247Ca4F1b575fadB')}}
                    />
                </Form.Item>
                <Form.Item
                    name="recipient2"
                >
                    <Search 
                        addonBefore="Hospital B" 
                        defaultValue="0x99eBB39932f6F697194EA70115762d4c06D1A9c9" 
                        enterButton="Mint!"
                        size="large"
                        onSearch={() => {handleMintHospital('0x99eBB39932f6F697194EA70115762d4c06D1A9c9')}}
                    />
                </Form.Item>

                <Form.Item
                    name="recipient3"
                >
                    <Search 
                        addonBefore="Insert Address"  
                        enterButton="Mint!"
                        size="large"
                        onSearch={(e) => {handleMintHospital(e)}}
                    />
                </Form.Item>
                
                <Form.Item
                    label='Data Consumer'
                    name="recipient4"
                >
                   <Search 
                        addonBefore="Researcher" 
                        defaultValue="0xac46159C08f103f7fF87ED138CFf7e389aac0550" 
                        enterButton="Mint!"
                        size="large"
                        onSearch={() => {handleMintResearcher('0xac46159C08f103f7fF87ED138CFf7e389aac0550')}}
                    />
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
