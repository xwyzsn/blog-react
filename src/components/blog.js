import {useContext, useEffect, useState} from "react";
import MyContext from "./Context";
import InfiniteScroll from "react-infinite-scroll-component";
import {Tag,Card, Divider, List, Skeleton,Tooltip } from "antd";
import {MediumOutlined, SearchOutlined} from "@ant-design/icons";

const Blog = () => {
    function unique (arr) {
        return Array.from(new Set(arr))
    }
    const context = useContext(MyContext)
    const [blogDetail,setBlogDetail]=useState([])
    const [blogLength,setBlogLength] = useState(null)
    const [hasMore ,setHasMore] = useState(true)
    const [param,setParam] = useState({low:0,high:5,username:context.username})
    const getBlog = async (param)=>{
        setParam(param)
        const res = await  fetchData(param)
        let temp = [...blogDetail,...res.list]
        setBlogDetail(unique(temp))
        setHasMore(res.hasMore)
    }
    const fetchData = async (param)=>{
        let res = null;
        await fetch(`https://api.xwyzsn.site/api/flask/myarticle/${param.username}/${param.low}/${param.high}`)
            .then(res=>res.json())
            .then(d=>{
                res = {list:d,hasMore:false};
                if(d!==-1){
                    res.hasMore=true;
                }
            })
            .catch(err=>console.log(err))
        return res;
    }


    useEffect(()=>{
        getBlog(param)
        fetch("https://api.xwyzsn.site/api/flask/metaarticle/"+context.username).then(res=>res.json())
            .then(d=>{
                setBlogLength(d);
            })
            .catch(e=>{
                console.log(e)})
    },[])

    const LoadMore = async ()=>{
        await getBlog({
            ...param,
            low:param.high,
            high:param.high+3
        })
        console.log(hasMore)
    }
    const jumpToArticle = (name)=>{
        window.open("https://api.xwyzsn.site/api/flask/article/"+name)
    }
    return (
        <>
            <div id={"blog-scroll"}
                 style={{
                     overflow: 'auto',
                     padding: '0 16px',
                 }}
                 className={"h-screen border-double border-4 border-blue-500"}
            >
                {blogDetail &&
                    <InfiniteScroll
                        dataLength={blogDetail.length}
                        next={LoadMore}
                        hasMore={blogDetail.length<blogLength}
                        loader={<Skeleton paragraph={{ rows: 1 }} active />}
                        endMessage={<Divider plain>别滑了...都看光了 🤐</Divider>}
                        scrollableTarget="blog-scroll"
                    >
                        <List
                            dataSource={blogDetail}

                            renderItem={(item,index) => (
                                <List.Item key={index} >
                                    <Card
                                        hoverable={true}
                                        actions={[
                                            <Tooltip title={"在本站查看~"}>
                                            <SearchOutlined onClick={()=>{jumpToArticle(item.title)}}  />
                                            </Tooltip>,
                                            <Tooltip title={"跳转到CSDN查看"}>
                                              <a href={item.link} target={"_blank"} rel="noreferrer">  <MediumOutlined  /></a>
                                            </Tooltip>
                                        ]}
                                        title={<div><span className={"mr-2"}>{item.title}</span>{item.tag.map((i)=> <Tag  color={"cyan"}>{i}</Tag>)}
                                            <span className={"font-light text-sm"}>{item.time}</span>
                                    </div>}
                                        className={"w-full"}>
                                        {item.detail}
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </InfiniteScroll>


                }
            </div>
        </>

    )

}

export default Blog
