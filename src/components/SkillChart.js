import * as echarts from 'echarts'
import {useEffect, useRef, useState} from "react";

const SkillChart = () => {
    const chartRef = useRef()
    let myChart = null;
    let option={
        title:{
            text:'SKILL CHART',
        },
        tooltip:{
            trigger:'item',
            formatter:'{b}:{c} ({d}%)'
        },
        series:[{
            type: 'pie',
            radius: [20, 140],
            center: ['35%', '50%'],
            roseType: 'radius',
            itemStyle: {
                borderRadius: 5
            },
            label: {
                show: false
            },
            emphasis: {
                label: {
                    show: false
                }
            },

        data:[
            {name:'C++',value:20},
            {name:'python',value:60},
            {name:'JAVA',value:40},
            {name:'html/js/css',value:40},
        ]}
        ]
    }
    const renderChart = ()=>{
        const chart = echarts.getInstanceByDom(chartRef.current)
        if(chart){
            myChart = chart
        }else{
            myChart = echarts.init(chartRef.current)
        }
        myChart.setOption(option)
    }
    useEffect(()=>{
        renderChart();
        return ()=>{
            myChart && myChart.dispose();
        }

    },[])

    let option_2 = {
        title: [
            {
                text: 'INTERESTING ASPECTS'
            }
        ],
        polar: {
            radius: [30, '80%']
        },
        angleAxis: {
            max: 1,
            startAngle: 75
        },
        color:['#91cc75'],
        radiusAxis: {
            type: 'category',
            data: ['front-end', 'dl', 'backend', 'data vis']
        },
        tooltip: {},
        series: {
            type: 'bar',
            data: [1, 0.8, 0.5, 0.8],
            coordinateSystem: 'polar',
            label: {
                show: true,
                position: 'middle',
                formatter: '{b}: {c}'
            }
        }
    };

    let polar_dom = useRef()
    let polar_chart =null;

    function renderPolar(){
        const chart = echarts.getInstanceByDom(polar_dom.current)
        if(chart){
            polar_chart = chart;
        }else{
            polar_chart = echarts.init(polar_dom.current)
        }
        polar_chart.setOption(option_2)
    }
    useEffect(()=>{
        renderPolar()
        return () => {polar_chart&&polar_chart.dispose()}
    })




    return (
        <div className={"xl:grid xl:grid-cols-2 sm:grid-cols-1 justify-center"} >
        <div className={"xl:col-start-1 xl:m-5 xl:pl-10 self-center" } style={{width:"100%", height: "400px"}} ref={chartRef} />
        <div className={"xl:m-5 xl:pl-10 self-center" } style={{width:"100%", height: "400px"}} ref={polar_dom} />
        </div>
    )
}
export default SkillChart
