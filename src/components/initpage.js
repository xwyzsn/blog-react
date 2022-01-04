import {Layout,Switch} from 'antd'
import dark from '../assert/index.dark.less'
import light from '../assert/index.less'
const {Header ,Content}=Layout
const InitPage = () => {
    const changeMode=(content)=>{
        // let style = require('antd/dist/antd.dark.less')
        // console.log(style)
        let head = document.getElementsByTagName('head')[0]
        const s = head.getElementsByTagName('style')
        if (s.length > 0) {
            for (let i = 0, l = s.length; i < l; i++) {
                if (s[i].getAttribute('data-type') === 'theme') {
                    s[i].remove();
                }
            }
        }
        // 最后加入对应的主题和加载less的js文件
        let styleDom = document.createElement("style");
        styleDom.dataset.type = "theme";
        styleDom.innerHTML = content;
        head.appendChild(styleDom);

    }
    const removeMode = ()=>{
        let head = document.getElementsByTagName('head')[0]
        const s = head.getElementsByTagName('style')
        if (s.length > 0) {
            for (let i = 0, l = s.length; i < l; i++) {
                if (s[i].getAttribute('data-type') === 'theme') {
                    s[i].remove();
                }
            }
        }
    }

    function onChange(checked) {
        if(checked){
            changeMode(dark)
        }else {
            changeMode(light)
        }
    }
    function onScrollDown(){
        let sec = document.getElementById('section2')
        sec.scrollIntoView({behavior:"smooth"});
    }
    return (
        <Layout className={"h-screen bg-amber-400 "}>
                //TODO: dark mode 还没实现
                <div className={"absolute right-1/4 top-0 w-16"}>
                <Switch
                    style={{width:'100%'}}
                    checkedChildren={"Light"}
                    unCheckedChildren={"Dark"}
                    onChange={onChange}
                />
                </div>

            {/*</Header>*/}
            <Content    className={"flex justify-center"} >
                <div className={"self-center text-center text-5xl bg-gradient-to-r from-blue-500 to-blue-100 my-title"}
                >
                    xwyzsn
                    <br/>
                    <h1 className={"text-sm bg-gradient-to-l from-blue-500 to-blue-100  my-title  "} >
                    这个人很懒,没有留下任何足迹....
                    </h1>
                </div>
                <div style={{width:'5vh',height:'5vh'}}
                     className={"text-5xl self-center text-center   bg-gradient-to-r from-green-400 to-blue-500  animate-spin"} >
                </div>
                <div className={"scroll-down border-amber-400"} onClick={onScrollDown}/>

            </Content>
        </Layout>

    )
}
export default InitPage
