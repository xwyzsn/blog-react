---
link: https://blog.csdn.net/xwyzsn/article/details/109231363
title: python Selenium自动化测试 访问校园网爬取成绩数据
description: Selenium自动化测试这个就是能够模拟浏览器的操作然后来实现一些自动的功能,然后就随便写了一个从校园网中爬取成绩的功能,并且输出平均绩点。相对来说程序实现比较简单。分为几个部分。1.实现登陆操作；2.爬取成绩3.对成绩进行处理；实现登陆操作学校网址放在这里了看界面然后点击F12，发现用户名的Id 就叫yhm，然后相同道理我们找到密码...
keywords: python  Selenium自动化测试 访问校园网爬取成绩数据
author: Xwyzsn Csdn认证博客专家 Csdn认证企业博客 码龄2年 暂无认证
date: 2020-10-22T14:52:00.000Z
publisher: null
stats: paragraph=30 sentences=84, words=292
catalog:blog
---
## Selenium自动化测试

这个就是能够模拟浏览器的操作然后来实现一些自动的功能,然后就随便写了一个从校园网中爬取成绩的功能,并且输出平均绩点。相对来说程序实现比较简单。分为几个部分。
1.实现登陆操作；
2.爬取成绩
3.对成绩进行处理；

## 实现登陆操作

这个是学校得网址登陆页面显示，看界面然后点击F12，![](https://img-blog.csdnimg.cn/20201022214214426.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70#pic_center)
发现用户名的Id 就叫yhm，然后相同道理我们找到密码ID叫mm，那么问题就简单了我们可以通过这个模拟出来的浏览器去发送值给这个输入框。

```python
from selenium import webdriver
browser = webdriver.Chrome(chrome_options=chrome_options)
url ='http://www.gdjw.zjut.edu.cn/jwglxt/xtgl/login_slogin.html'
browser.get(url)
png = browser.find_element_by_id('yzmPic')
png.screenshot('capt.png')
print('输入学号')
stu_name=input()
print('输入密码')
stu_pwd=input()
print('输入验证码')
yzm=input()

browser.find_element_by_id('yhm').clear()
browser.find_element_by_id('mm').clear()
browser.find_element_by_id('yzm').clear()

browser.find_element_by_id('yhm').send_keys(stu_name)
browser.find_element_by_id('mm').send_keys(stu_pwd)
browser.find_element_by_id('yzm').send_keys(yzm)
browser.find_element_by_id('dl').click()
```

![](https://img-blog.csdnimg.cn/20201022215525773.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70#pic_center)
这里看到看到查询成绩的窗口在信息查询下，ID为同理我们先点击一下信息查询，然后跳出来窗口之后再选择成绩查询。点击信息查询如上很简单。

```python
import time
time.sleep(3)

browser.find_element_by_xpath("//a[contains(text(),'信息查询')]").click()
time.sleep(2)
browser.find_element_by_xpath("//a[contains(text(),'学生成绩查询')]").click()
time.sleep(4)

wnd= browser.window_handles
browser.switch_to.window(wnd[-1])
```

## 查询成绩

![](https://img-blog.csdnimg.cn/20201022215956484.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70#pic_center)
这里选择要查询的学年或者学期，简单起见我这里选择全部学年的全部学期。也同上，定位到资源位置后点击就好了。

```python
browser.find_element_by_id('xnm_chosen').click()
browser.find_element_by_xpath('//li[1]').click()
browser.find_element_by_id('xqm_chosen').click()

(browser.find_element_by_id('xqm_chosen').find_element_by_xpath('.//li[1]')).click()
time.sleep(1)
browser.find_element_by_id('search_go').click()
time.sleep(2)
```

![](https://img-blog.csdnimg.cn/20201022220412984.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70#pic_center)
结果如上图，一共有四页，那么我们就要加入一个翻页操作。也很简单，一页十五条数据，获取完毕后，翻页就好了
![](https://img-blog.csdnimg.cn/20201022220735455.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70#pic_center)
这个是我们课程数据得记录就是这样一条条对应
![](https://img-blog.csdnimg.cn/20201022220832788.png#pic_center)

可以看到我们要的数据都在tabgrid下面得tr标签中，那么问题也简单了。
代码如下：

```python

table_list=[]
t = browser.find_element_by_id('sp_1_pager').text
t = int(t)
for i in range(t):

    table_tr_list = browser.find_element_by_id('tabGrid').find_elements_by_tag_name('tr')

    for tr in table_tr_list:
        table_td_list = tr.find_elements_by_tag_name("td")
        row_list=[]
        for td in table_td_list:
            row_list.append(td.text)
        table_list.append(row_list)
    browser.find_element_by_id('next_pager').click()
    time.sleep(2)

print(table_list)
```

## 数据处理

没有经过整理得数据很乱，我们用pandas对他处理一下下，使得它好看然后再根据要求统计。
处理过后数据如下
![](https://img-blog.csdnimg.cn/20201022221649340.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70#pic_center)

看到我这里筛选了出去了任选课，然后可以输出平均绩点，只要套用一下公式就好了。

```python
import pandas as pd
l=table_list
df=pd.DataFrame(l)
df=df[[1,2,4,5,6,9]]
df.columns=['学年','学期','课程名字','课程性质','学分','成绩']
for i in range(1,len(df)):
    i=i*16
    print(i)
    if(i>len(df)):
        break
    df=df.drop(i)

df=df.reset_index(drop=True)
bxk=df[df["课程性质"]=="必修课"]
rxk=df[df["课程性质"]=="任选课"]
tyk=df[df["课程性质"]=="体育课"]
xxk=df[df["课程性质"]=="限选课"]
print("不展示选修课\n")
three_cour=df[df["课程性质"]!="任选课"]
print(three_cour)
print("\n 计算总绩点:\n")
three_cour=three_cour.reset_index(drop=True)
three_cour=pd.DataFrame(three_cour)
three_cour['成绩']=pd.to_numeric(three_cour['成绩'])
three_cour['学分']=pd.to_numeric(three_cour['学分'])
s1=(three_cour["学分"].iloc[:]*three_cour["成绩"].iloc[:]).sum()
total_cre=three_cour["学分"].iloc[:].sum()
print(s1/(total_cre))

```

## 总结

这个东西其实很简单，有点像vb一样，主要是要掌握xpath里面对资源的定位，然后就可以爬取想要爬取得东西了。
有一点需要改进得地方就是验证码得识别，原本我调用了，pytesseract想用这个对其实现自动识别，但是学校得验证码噪音太大了，除了点噪音可以去除之外，线噪音我不值得如何去除所以就放弃了验证码自动识别。可以尝试得方向就是用爬取大量的验证码照片然后打上标签，训练一个模型来识别效果可能更好，这个就留着以后有时间再做吧！
完整代码放github啦[代码点这里](https://github.com/xwyzsn/pylearn/tree/master/Selenuim)
有错误希望大家的指正~
