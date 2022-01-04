import HeadLine from "./HeadLine";
import {Alert, Card, Timeline} from "antd";
import {useContext, useState} from "react";
import SkillChart from "./SkillChart";
import MyContext from "./Context";
const Person = () => {
    const context = useContext(MyContext)
    const [bio,setBio] = useState(context.bio)
    const [intro,setIntro] = useState(context.personInfo.intro)
    return (
        <div >
            <div className={"ml-5 "}  style={{borderLeft:'#22d3ee 10px solid  '}} >
                <HeadLine  title={"ME!"} subTitle={"ABOUT ME !"} />
            </div>
            <div className={"ml-6 mr-6 mt-3"}>
                <Card title={"ABOUT ME"}>
                    <Card>
                        {intro}
                    </Card>
                </Card>
            </div>
            <div className={"ml-5 mt-4 font-sans"} style={{borderLeft:'#22d3ee 10px solid '}} >
                <HeadLine  title={"Life"}  subTitle={"LIFE EXPERIENCE"}  />
            </div>
            <div className={"mt-5"}>
                <Timeline mode="alternate">
                    {
                        bio.map((b,index)=>{
                            return <Timeline.Item key={index} className={"animate__fadeInUp"}>
                                <Card title={b.title}>
                                    {b.content}
                                </Card>
                            </Timeline.Item>
                        })
                    }
                </Timeline>
            </div>
            <div className={"ml-5 mt-4 "}  style={{borderLeft:'#22d3ee 10px solid '}} >
                <HeadLine  title={"SKILL"}  subTitle={"SKILL LEVEL"} />
            </div>
            <div className={"ml-3 mr-3 mt-3"}>
                <Card >
                    <Card>学了三四年了...其实并不认为自己能力很出众了,越发觉得自己想要学的更多,更不满足于现在的水平....
                    <br/>
                    </Card>
                </Card>
                <SkillChart />
            </div>
        </div>
    )

}
export default Person
