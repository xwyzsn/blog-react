import {Card, Comment} from "antd";
import { List, Divider } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import {useContext, useEffect, useState} from "react";
import MyContext from "./Context";
const MYComment = () => {
    const context =useContext(MyContext)
    const [param ,setParam] = useState({low:0,high:3,username:context.username})
    const [metaData,setMetaData] = useState(null);

    const [list,setList] = useState([])
    const [hasMore,setHasMore] = useState(true)
    const getList = async (param)=>{
        setParam(param)
        const res = await fetchData(param)
        setList((data)=>[...data,...res.list]);
        setHasMore(res.hasMore)
    }
    const fetchData = async (param)=>{
        const low = param.low;
        const high = param.high
        const username = param.username
        let res = null;
        await fetch(`https://api.xwyzsn.site/api/flask/comment/${username}/${low}/${high}`)
                .then(res=>res.json())
                .then(d=>{
                     res = {list:d,hasMore:false}
                    if(d!==0){
                        res.hasMore = true
                    }
                    return res;
                })
                 .catch(err=>{
                     console.log(err)
                 })

        return res;

    }

    useEffect(()=>{
      getList(param)
      fetch('https://api.xwyzsn.site/api/flask/comment/details/'+context.username).then(res=>res.json()).then(d=>setMetaData(d))

    },[])
    const loadMore = async ()=>{
        await getList({
            ...param,
            low:param.high,
            high:param.high+3,
            }
        )
    }

    return (
        <div
            id="scrollableDiv"
            className={"border-double border-4 border-blue-500"}
            style={{
                height: 400,
                overflow: 'auto',
                padding: '0 16px',
            }}
        >{
            list  && metaData &&
            <InfiniteScroll
            hasMore={list.length<metaData}
            dataLength={list.length}
            next={loadMore}
            loader={<Divider plain className={"text-center"} >LOADING ...</Divider>}
            endMessage={<Divider plain>别滑了...都看光了 🤐</Divider>}
            scrollableTarget="scrollableDiv"
            >
                <List
                    className={"Comment-list"}
                    header={`${list.length} comments`}
                    itemLayout="horizontal"
                    dataSource={list}
                    renderItem={(item) => (
                        <List.Item   className={"mb-2 w-full"}>
                            <Card className={"w-full"}>
                                <Comment
                                    author={item.username}
                                    content={item.content}
                                    datetime={item.datetime}
                                />
                            </Card>
                        </List.Item>
                    )}
                >
                </List>
            </InfiniteScroll>
        }
        </div>
    )
}
export default MYComment
