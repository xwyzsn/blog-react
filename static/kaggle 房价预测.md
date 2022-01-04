# kaggle 房价预测

## 问题描述

​ 在train.csv中给出了一系列的房屋评测的数据特征,最后在SalePirce中留下了真实的房价信息,由此建立模型,对test.csv中的数据进行预测，本文分为两个步骤。 **1.数据读入和预处理。2.模型建立和预测**。附带的一个txt的文件对如下数据项进行了说明。大致数据如下

![](https://img-blog.csdnimg.cn/img_convert/5d4105c5debaa2d6e39e67358d2e2fcd.png)

特征值描述如上。train.csv如下

[外链图片转存失败,源站可能有防盗链机制,建议将图片保存下来直接上传(img-z1Zcto9T-1604919215690)(https://i.loli.net/2020/11/09/xZ7bK9vCjYgNlcW.png)]

## 数据读入和预处理

用pandas读入数据，展示一下数据的基本信息。

```python
data = pd.read_csv(r'H:\desktop\kaggle\house prices\train.csv')
test_data = pd.read_csv(r'H:\desktop\kaggle\house prices\test.csv')
Price = data['SalePrice']
data=data.drop(columns = 'SalePrice')
data = pd.concat([data, test_data], axis=0)
pd.set_option('display.max_rows', None)
print(data.info())
print(data.isnull().sum(axis=0))
```

读入训练集和测试集两部分数据，再将其训练数据拼到训练数据的后面。取出SalePrice数据。并且输出一下data的信息。大致如下

![](https://img-blog.csdnimg.cn/img_convert/0fd8a4459fa60a5a438423e724bae4ff.png)

data信息中大致有两种类型，数值类型的和Object类型的，这里涉及到我们以后的关于数据的处理。关于数据描述的另一个信息是缺失值。大致如下

![](https://img-blog.csdnimg.cn/img_convert/9c8bcb0921b0cd6598a14c6096510ce2.png)

这里展示出了一些确实的数据，我们要对它们进行预处理。

### 粗暴的预处理

在第一次做题目的时候我处理的就是处理的非常粗粒度，直接用众数代替了所有数据中的空值，这个虽然非常快，但是在测试集上的准确率大致只有0.80左右，上交到kaggle上大致排在70%。

### 比较细致的处理

#### 缺失值处理

如果我们要比较细致的处理的话,我们就需要分析各个特征值代表什么，先看空的数据特征。

关于各个特征值的描述信息，在附带的text文件上有描述。

这里留下我对于这些特征值的处理

LotFrontage -> 用平均值或者众数替代
MSZoning ->用众数代替
Utilities(用众数代替)
Exterior1st 众数
Exterior2nd 众数
MasVnrType 众数
MasVnrArea 众数或者中位数,或者平均数
Electrical(众数)
BsmtFullBath(众数)
BsmtHalfBath(众数)
KitchenQual(众数)
Functional(众数)

Alley (把NA改为None)
BsmtQual(改为none)
BsmtCond(如果BsmtQual为none,它也是none,要不就用众数(或者drop掉一个错误数据))
BsmtExposure(同上改为None)
BsmtFinType1(同上,为none的就为none,)
BsmtFinType2(同上,为none,就为none)
BsmtFinSF1(改为0)
BsmtFinSF2(改为0)
BsmtUnfSF(改为0)
TotalBsmtSF(改为0)
FireplaceQu(把空值改为none)

GarageType(空值改为none)
GarageYrBlt(前为空也为none,不为空那么就为众数)
GarageFinish(前为空也为none,不为空那么就为众数)
GarageQual(前为空也为none,不为空就为众数)
GarageCond(前为空也为none,不为空就为众数)
GarageCars(众数)
GarageArea(众数)

PoolQC(空值改为NOne)
Fence(空值为none)
MiscFeature(空值为none)
SaleType(众数)

其实处理的类型就只有两类，一类可以为空的变为'N'即可，一类不能为空的要么改为0，要么改为众数，平均数，或者中位数，我这里选择众数，是方便非整数类型的数据处理。额外提一点就是我对于Garage和Bsmt这一些处理是根据这几个相关数据之间的关系比较细致的处理过，因为从数据中可以看出，比如虽然Garage这一组属性虽然都是用来描述车库的但是其空值的数量不相同，所以这里稍微啰嗦了一点处理（但是也不一定有必要，因为数据就两三行，对模型影响应该不大）

```python

fre_list = ['LotFrontage', 'MSZoning', 'Utilities', 'Exterior1st', 'Exterior2nd', 'MasVnrType', 'MasVnrArea',
            'Electrical', 'BsmtFullBath', 'BsmtHalfBath', 'KitchenQual'
    , 'Functional', 'GarageCars', 'GarageArea', 'SaleType']
from sklearn.impute import SimpleImputer

imr = SimpleImputer(missing_values=np.nan, strategy='most_frequent')
tmp_data = data[fre_list]
imr = imr.fit(tmp_data)
data[fre_list] = imr.transform(tmp_data)

data['Alley'] = data['Alley'].fillna('N')
data['PoolQC'] = data['PoolQC'].fillna('N')
data['Fence'] = data['Fence'].fillna('N')
data['FireplaceQu'] = data['FireplaceQu'].fillna('N')
data['MiscFeature'] = data['MiscFeature'].fillna('N')

tmp = data['BsmtFinType1']
x = np.where(tmp.isnull())
x = list(x)
x = x[0]
print(x)
data['BsmtFinType1'] = data['BsmtFinType1'].fillna('N')
for i in x:
    data.iloc[i, 35] = 0
    data.iloc[i, 32] = 'N'
    data.iloc[i, 30] = 'N'
    data.iloc[i, 31] = 'N'

tmp2 = data['GarageType']
x = np.where(tmp2.isnull())
x = list(x)
x = x[0]
data['GarageType'] = data['GarageType'].fillna('N')
GarageYrBlt_loc = data.columns.get_loc('GarageYrBlt')
GarageFinish_loc = data.columns.get_loc('GarageFinish')
GarageQual_loc =data.columns.get_loc('GarageQual')
GarageCond_loc = data.columns.get_loc('GarageCond')
for i in x:
    data.iloc[i,GarageYrBlt_loc] = 0
    data.iloc[i, GarageFinish_loc] = 'N'
    data.iloc[i, GarageQual_loc] = 'N'
    data.iloc[i, GarageCond_loc] = 'N'

data['BsmtFinSF1'] = data['BsmtFinSF1'].fillna(0)
data['BsmtFinType2'] = data['BsmtFinType2'].fillna(0)
data['BsmtFinSF2'] = data['BsmtFinSF2'].fillna(0)
data['BsmtUnfSF'] = data['BsmtUnfSF'].fillna(0)
data['TotalBsmtSF'] = data['TotalBsmtSF'].fillna(0)

l = ['BsmtFinType2', 'BsmtExposure', 'BsmtCond', 'BsmtQual', 'GarageQual', 'GarageCond', 'GarageFinish']

for i in l:
    x = data[i].mode()
    x = str(x)

    data[i] = data[i].fillna(x)

l = ['GarageYrBlt']
for i in l:
    x = data[i].mode()
    x = float(x)
    data[i] = data[i].fillna(x)

data = data.drop(columns='Id')
```

#### 创建新特征值，修改原特征

1.添加特征值diff_built_sold 用来描述，从修建年份之后到售出年份之间的差值,并且对其分成三类根据这个值

```python
data['diff_built_sold'] = data['YrSold']-data['YearBuilt']
print(data['diff_built_sold'].max())
print(data['diff_built_sold'].min())
print(data['diff_built_sold'].mean())
j=data.columns.get_loc('diff_built_sold')
for i in range(len(data)):
    if data.iloc[i,j]45:
        data.iloc[i,j]=0
    elif data.iloc[i,j]>45 and data.iloc[i,j]<92:
        data.iloc[i,j]=1
    else :
        data.iloc[i,j]=2
```

2.修改特征值 YearBuilt虽然这个属性是年份数据（int）但是取向更像是离散的，所以我们对其进行一个分块，分成三个段处理。

```python
print(data['YearBuilt'].head())
print(data['YearBuilt'].min())
print(data['YearBuilt'].max())

j = data.columns.get_loc('YearBuilt')
for i in range(len(data)):
    if data.iloc[i,j]1918:
        data.iloc[i,j] = 0
    elif data.iloc[i,j]>1918 & data.iloc[i,j]1964:
        data.iloc[i,j] = 1
    else:
        data.iloc[i,j] = 2

print(data['YearBuilt'].head())
```

同理我们对YearRemodAdd这个属性也进行上述处理，因为其和年份一样

```python
j = data.columns.get_loc('YearRemodAdd')
for i in range(len(data)):
    if data.iloc[i,j]1970:
        data.iloc[i,j]=0
    elif data.iloc[i,j]>1970 and data.iloc[i,j]1990:
        data.iloc[i,j]=1
    else :
        data.iloc[i,j] = 2
print(data['YearRemodAdd'].head())
```

3.添加特征值：如下特征值（添加新的特征值可能有助于我们模型的学习）

```python
data['Total_bsmtsf'] = data['BsmtFinSF1']+data['BsmtFinSF2']
data['rebuilt'] = data['YearRemodAdd'] - data['YearBuilt']
data['Total_Porch'] = data['OpenPorchSF'] + data['EnclosedPorch']+data['3SsnPorch']+data['ScreenPorch']
data['Total_bath'] = data['OpenPorchSF'] + data['EnclosedPorch']+data['3SsnPorch']+data['ScreenPorch']data['BsmtFullBath']+data['BsmtHalfBath']+data['FullBath']+data['HalfBath']

j=data.columns.get_loc('PoolArea')
data['has_pool']=''
data['has_bsmt']=''
data['has_garage']=''

k=data.columns.get_loc('has_pool')
for i in range(len(data)):
    if data.iloc[i,j]>0:
        data.iloc[i,k]=1
    else:
        data.iloc[i,k]=0
j=data.columns.get_loc('TotalBsmtSF')
k=data.columns.get_loc('has_bsmt')
for i in range(len(data)):
    if data.iloc[i,j]>0:
        data.iloc[i,k]=1
    else :
        data.iloc[i,k]=0
j = data.columns.get_loc('GarageArea')

k=data.columns.get_loc('has_garage')
for i in range(len(data)):
    if data.iloc[i,j]>0:
        data.iloc[i,k]=1
    else:
        data.iloc[i,k]=0

```

#### 数据得其他处理

添加完特征值和处理完原有的特征值后我们看一下数据类型的特征，看一下对SalePrice的相关性，决定是不是要筛选掉一些特征。

```python
print(data.shape)
tmp = pd.concat([data.iloc[0:1460,:],Price],axis=1)
cor=tmp.corr(method = 'kendall')
cor = pd.DataFrame(cor)
print(cor)
num_l = list(cor)
print(num_l)
```

![](https://img-blog.csdnimg.cn/img_convert/a0f38c9928ffae83e69c1206835ffd41.png)

这里输出了对于SalePrice相关矩阵，从这里我们可以对数据做出筛选。去掉相关性低得特征，我们先留着姑且放到后面在做。

再有一个数据处理就是平滑数据特征。我们展示数值类型得偏度，然后在对其进行处理。

```python
skew_num=[]
s_l = []

for i in num_l:
    s_l.append(data[i].skew())
    if abs(data[i].skew())>=1:
        skew_num.append(i)

for i in skew_num:
    data[i] = np.log1p(data[i])

```

到这里，关于数据特征得处理算是做完了。

#### 处理异常值

我们先打印出这些数据跟最后得SalPrice的图像在进行分析

```python
import seaborn as sns
import matplotlib.pyplot as plt
for i in num_l:
    j = data.columns.get_loc(i)
    x=data.iloc[0:1460,j]
    y=Price
    sns.scatterplot(x,y)
    plt.show()
```

这里展示了数值类型的特征的图像。这里展示部分特征

[外链图片转存失败,源站可能有防盗链机制,建议将图片保存下来直接上传(img-3bAnnWAj-1604919215699)(https://i.loli.net/2020/11/09/72roDx3ug1TOjIz.png)]

其实可以发现这里有些数据高的离谱，或者不符合大部分的情况那么我们就可以去掉这个数据这里只是简单的处理了两个数据，是否有更多的异常值可以自行找到

```python
data.drop(columns='MSSubClass')
index = np.where(data['LotFrontage']>5.5)
index = (index[0])
data.drop(index = index)
Price.drop(index = index)
```

至此数据处理部分就结束啦~，接下来就是模型搭建的过程的

## 模型搭建

模型这里是预测房价是连续性的数据，所以我们运用回归模型可以进行预测，用了三个模型进行处理。

但是处理之前就需要对数据进行独热编码之类的。

```python
from sklearn.model_selection import train_test_split

x = pd.get_dummies(data)
pre_data = x.iloc[1460:, :]
_pre1 = pre_data.copy()
_pre2 = pre_data.copy()
_pre3 = pre_data.copy()
x = x.iloc[0:1460, :]

x_train, x_test, y_train, y_test = train_test_split(x, Price, test_size=0.3, random_state=None)
model = LinearRegression()
model.fit(x_train, y_train)
print(model.score(x_test, y_test))

from sklearn.ensemble import GradientBoostingRegressor

gbr = GradientBoostingRegressor()
gbr.fit(x_train, y_train)
print(gbr.score(x_test, y_test))

from sklearn.linear_model import LassoCV

model_lasso = LassoCV(alphas=[0.1, 1, 0.001, 0.0005]).fit(x_train, y_train)

print(model_lasso.score(x_test, y_test))

pred = model.predict(pre_data)
Id = [i for i in range(1461,2920)]
Id = pd.DataFrame(Id)
pred = pd.DataFrame(pred)
output = pd.concat([Id,pred],axis=1)
output.columns = ['Id','SalePrice']
output.to_csv(r'H:\desktop\output1.csv',index=None)

pred = gbr.predict(_pre1)
pred = pd.DataFrame(pred)
output = pd.concat([Id,pred],axis=1)
output.columns = ['Id','SalePrice']
output.to_csv(r'H:\desktop\output2.csv',index=None)

pred = model_lasso.predict(_pre2)
pred = pd.DataFrame(pred)
output = pd.concat([Id,pred],axis=1)
output.columns = ['Id','SalePrice']
output.to_csv(r'H:\desktop\output3.csv',index=None)

```

至此，我得到了在测试集数据上的准确率大概到了0.9左右。在kaggle上评分到了45%左右

## 总结

这是我的第二个kaggle作业，都是入门级的，第一次的作业没有对数据做过多的处理，只是简单的用众数填充了一下特征值，这次是真正意义上的数据进行比较细致的处理得到了比较好的成果。但是还是不知道那些满分的大佬们是怎么处理数据的，没有看到过有大佬分析notebook出来。

也学习了很多关于数据处理的方法，预处理，新增特征，删除特征等等。
