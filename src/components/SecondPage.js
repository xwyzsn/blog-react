import {Layout, Menu, Card, Image, Divider,} from "antd";
import {useContext, useState} from "react";
import {
    MenuFoldOutlined, UserOutlined, StarOutlined, SettingOutlined, SearchOutlined
    , GithubOutlined, TwitterOutlined, MediumOutlined, MailOutlined
} from '@ant-design/icons'
import Person from "./Person";
import TalkShit from "./TalkShit";
import MyContext from "./Context";
import Blog from "./blog";
const {Sider,Content,Footer} =Layout
const SecondPage = () => {
    const context = useContext(MyContext)
    const SubMenu = Menu;
    const [content ,setContent] = useState('person')
    const setBreakPoint = (broken)=>{
        setMenu(!Menu_state)
    }


    const [Menu_state,setMenu] = useState(true);
    const [PersonInfo,setPersonInfo] = useState({
        github:context.personInfo.github,
        twitter:context.personInfo.twitter,
        medium:context.personInfo.medium,
        pic:context.personInfo.pic
    },)
    return (
        <div id={"section2"} className={"h-screen"}>
            <Layout >
                <Sider
                    style={{
                        height: '100vh',
                        position: "sticky",
                        top: 0,
                        left: 0,
                        bottom:0,
                    }}
                    breakpoint="sm"
                        onBreakpoint={(broken)=>{
                        setBreakPoint(broken)}}
                        defaultCollapsed={true} theme={'dark'} trigger={null} collapsible collapsed={Menu_state}>
                    <Menu
                        defaultSelectedKeys={['1']}
                        mode="inline"
                        style={{
                            height:"70%"
                        }}
                    >
                        <div className={"flex justify-end"}>
                            {Menu_state &&<MenuFoldOutlined
                                onClick={()=>{setMenu(!Menu_state)}}
                                style={{ fontSize: '20px', color: '#08c' }}  />}
                            {!Menu_state &&<MenuFoldOutlined
                                onClick={()=>setMenu(!Menu_state)}
                                style={{ fontSize: '20px', color: '#08c' }}  />}
                        </div>
                        <SubMenu key="sub1" >
                            <Menu.ItemGroup key="g1"  >
                                <Card className={"w-full"} style={{height:'20%'}}>
                                    <Image preview={false}
                                        className={"w-full h-full"} src={PersonInfo.pic}>
                                    </Image>
                                </Card>
                            </Menu.ItemGroup>

                        </SubMenu>
                        <SubMenu key="sub2"  title="WELCOME">
                            <Menu.Item key="1" icon={<SearchOutlined />} onClick={()=>{window.scroll({top:0,behavior:"smooth"})}}>首页</Menu.Item>
                            <Menu.Item key="2" icon={<UserOutlined />} onClick={()=>setContent('person')}>个人</Menu.Item>
                            <Menu.Item key="3" icon={<StarOutlined />} onClick={()=>setContent('blog')}>博客</Menu.Item>
                            <Menu.Item key="4" icon={<SettingOutlined />} onClick={()=>setContent('TalkShit')}>碎碎念</Menu.Item>

                        </SubMenu>
                    </Menu>
                    <Card className={"flex justify-center text-center " } style={{
                        height:'30%'
                    }}>
                        <a target={"_blank"} href={PersonInfo.github} rel="noreferrer"><GithubOutlined className={"mr-3"}   /></a>
                        //TODO: 这个MAIL后端要改掉
                        <a target={"_blank"} href={'mailto:'+PersonInfo.twitter} rel="noreferrer" ><MailOutlined className={"mr-3"}   /></a>
                        <a target={"_blank"} href={PersonInfo.medium} rel="noreferrer"><MediumOutlined className={"mr-3"}  /></a>

                        <Divider />
                            <div className={"text-center text-sm"}>Copyright © 2021 xwyzsn  | All rights reserved</div>
                    </Card>
                </Sider>

                <Content className={"relative h-hull w-full"} style={{marginLeft:'100'}}>
                    {content==='person' && <Person />}
                    {
                        content==='TalkShit'&&
                        <div className={"absolute bottom-0 left-1 w-full"}>
                            <TalkShit/>
                        </div>
                    }
                    {
                        content==='blog'&&
                        <Blog />
                    }

                    </Content>



            </Layout>
        </div>

    )
}
export default SecondPage
