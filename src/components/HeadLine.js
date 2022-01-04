const HeadLine = (props) => {
    const title = props.title;
    const subTitle = props.subTitle;
    const icon = props.icon
    return (
        <div className={"pl-3 "}>

            <div className={"text-lg font-extralight "}>{title}</div>
            <div className={"text-4xl"}>{subTitle}
                {!({icon} === null)&&<i
                    className={" ml-3  place-self-center"}
                     >{icon}</i> }
            </div>

        </div>
    )
}
export default HeadLine
