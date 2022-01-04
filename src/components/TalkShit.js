import {  Form, Button,Input ,notification } from 'antd';
import { SmileOutlined, UserOutlined} from "@ant-design/icons";
import MYComment from "./Comment";
import dayjs from 'dayjs'
const TalkShit = () => {
    const [form] = Form.useForm();
    const { TextArea } = Input;
    const openNotification = (msg,desc,dur,icon) => {
        const args = {
            message: msg,//'请检查你的输入',
            description:desc,
            duration: dur,//3
            icon: icon//<SmileOutlined style={{ color: '#108ee9' }} />,
        };
        notification.open(args);
    };

    const onSubmit = ()=>{
        form.validateFields(['input','textArea'])
            .then(value => {
                value.datetime=dayjs().format('YYYY-MM-DD-HH:mm:ss')
                //TODO: 这个api和后端有点差异,考虑要修改一下
                let data = {value:value}
                console.log(form.getFieldValue('input'))
                fetch("https://api.xwyzsn.site/api/flask/comment/prepost",{
                    method:'post',
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    body:JSON.stringify(data)
                })
                    .then(msg=>msg.json())
                    .then(d =>{
                        if (d.code ===200){
                            openNotification('发布成功!',
                                '发布成功,等待审核~',
                                3,<SmileOutlined style={{ color: '#108ee9' }} />)
                        }
                        form.resetFields();
                    })
            })
            .catch(err=>{
                openNotification('请检查你的输入','用户名或者留言为空',3,<SmileOutlined style={{ color: '#108ee9' }} />)
            })
    }

    const Editor = ({ onChange, onSubmit, submitting, value,user }) => {
        return (
            <Form form={form}>
                <Form.Item label={"用户名"} name={"input"} rules={[{required: true, message: "NULL IS　NOT　ALLOW！"}]}>
                    <Input  key={"input"} prefix={<UserOutlined/>} style={{width: '50%', marginBottom: '10px'}} placeholder={"留下你的名字"}
                    />
                </Form.Item>
                <Form.Item label={"留言"} name={"textArea"} rules={[{required: true, message: "NULL IS　NOT　ALLOW！"}]}>
                    <TextArea key={"textArea"}
                        // onBlur={e=>textBlur(e)}
                        // onChange={e=>textChange(e)}
                              placeholder={"如果你想留下什么,可以在这里输入~ feel free to say something~"}
                              rows={4}     />
                </Form.Item>
                <Form.Item>
                    <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
                        添加留言
                    </Button>
                </Form.Item>
            </Form>);
    }

    return (
        <>
            <div className={"mb-4"}>
                <MYComment className={"mb-1"} />
            </div>
            <div className={"border-blue-500 border-double border-4 mb-2"}>
                <Editor className={"w-full"} onSubmit={onSubmit}  />
            </div>
        </>
    )


}
export default TalkShit
