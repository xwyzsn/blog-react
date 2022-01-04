---
title: (python+离散)实现TP,TN,FP,FN
catalog: blog
date:2020-04-10
---

# (python+离散)实现TP,TN,FP,FN

这个就不多说了,写这个文章就是想介绍一下python代码实现得过程。关于概念就放一张图吧~
![](https://img-blog.csdnimg.cn/20200410220206130.png#pic_center)
代码:
因为这个关于这个代码实现一开始想到就for循环,但是因为在学离散数学,后来想想感觉能用离散数学的知识,所以就用离散的知识打了一段代码。
假设此时有两个数据集：expected(模型的测试数据中所期望得到的值)，precited(预测得到的值)，假设我们得到的结果只有0，1两种结果。
TP：及两个都是1才能得出真值，就是析取。expected&precited
FP:需要expected得值为0，且precited为1，才为真值，所以可以将俩个分别看成事件A，和B，即得到的表达式为~（B—>A）即非B条件A。所以有如下化简。
![](https://img-blog.csdnimg.cn/20200410230008367.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70#pic_center)
TN和TP均可以由TP，和FP得到。

下面是关于模型训练的一段代码

```python

"""
Created on Fri Apr 10 14:58:58 2020

@author: zzh
"""
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn import svm
import numpy as np
breastcan = load_breast_cancer()
x=breastcan.data
y=breastcan.target
classifier = svm.SVC(gamma=0.001)
x_data = pd.DataFrame(x)
def f (precited,expected):
    res =(precited ^expected)
    r = np.bincount(res)
    tp_list = ((precited)&(expected))
    fp_list = (precited&(~expected))
    tp_list=tp_list.tolist()
    fp_list=fp_list.tolist()
    tp=tp_list.count(1)
    fp=fp_list.count(1)
    tn = r[0]-tp
    fn = r[1]-fp
    p=tp/(tp+fp)
    recall = tp/(tp+fn)
    F1=(2*tp)/(2*tp+fn+fp)
    acc=(tp+tn)/(tp+tn+fp+fn)
    return p,recall,F1,acc

x_train_data = x_data.sample(frac=0.8)
x_test_data = x_data.drop(index = x_train_data.index)
y_data=pd.DataFrame(y)
y_test_data = y[x_test_data.index]
y_train_data = y[x_train_data.index]
classifier.fit(x_train_data,y_train_data)
precited = classifier.predict(x_test_data)
expected = y_test_data

p,r,f1,acc=f(precited,expected)
print("留出法")
print("找准率: ",p,"\n召回率",r,"\nF1度量: ",f1,"\n准确率: ",acc)
print("\n")

precited = []
length = len(x_data)/5
length =int(length)
x_data_list = {}
for i in range(0,4):
    x_data_list[i]=x_data.iloc[i*length:(i+1)*length]
x_data_list[4] = x_data.iloc[4*(length):]
result={}
result=pd.DataFrame(result)
for i in range(0,5):
    x_test = x_data_list[i]
    y_test = y[x_test.index]
    x_test = pd.DataFrame(x_test)
    x_train = x_data.drop(index = x_test.index)
    y_train = y[x_train.index]
    classifier.fit(x_train,y_train)
    precited= classifier.predict(x_test)
    expected = y_test
    result[i]=f(precited,expected)
list = result.mean()
print("5折交叉验证法")
print("找准率: ",list[0],"\n召回率",list[1],"\nF1度量: ",list[2],"\n准确率: ",list[3])

length = len(x_data)
x_train=x_data.sample(length,replace=True)
y_train = y[x_train.index]
x_test = x_data.drop(index = x_train.index)
y_test = y[x_test.index]
precited = classifier.predict(x_test)
expected = y_test
p,r,f1,acc=f(precited,expected)
print("\n")
print("有返回采样法")
print("找准率: ",p,"\n召回率",r,"\nF1度量: ",f1,"\n准确率: ",acc)

```

其他的就不多说啦，主要是介绍一下这个方法。加油加油~
