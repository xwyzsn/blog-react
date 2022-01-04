import './App.css';
import 'antd/dist/antd.min.css'
import InitPage from "./components/initpage";
import SecondPage from "./components/SecondPage";
import {useEffect, useState} from "react";
import 'default-passive-events'
import React from "react";
import MyContext from "./components/Context";
function App() {
    const [data,setData] = useState(null)
    useEffect(()=>{
        fetch("https://api.xwyzsn.site/api/flask/person/xwyzsn").then(res => res.json())
            .then(d=>{
                setData(d);
                MyContext.data=d;
            })
            .catch(err=>{
                console.log(err);
            })
    },[])

  return (
    <div className="App  ">
        {data &&
        <MyContext.Provider value={data}>
            {data &&
            < InitPage className={"h-screen w-full"}> </InitPage>}
            {data &&
            <SecondPage className={"h-screen w-full"}/>
            }
        </MyContext.Provider>
        }
        {!data &&<div className={"flex justify-center h-screen"}>
            <div style={{width:'5vh',height:'5vh'}}
                 className={"text-5xl place-self-center bg-gradient-to-r from-green-400 to-blue-500  animate-spin"} >
            </div>

        </div>}

    </div>
  );
}
export default App;
