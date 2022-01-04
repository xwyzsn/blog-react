---
title:vue+spring前后端分离项目
date:2021-08-14
catalog:blog
---



# vue + spring 前后端分离 项目

## 项目用途

这个项目是给一个,个人空间项目,本来纯前端语言,但是慢慢完善之后到了现在这个样子。

基本的功能包括但不限于如下几个模块

1. 照片墙功能,可以上传照片展示在首页
2. 可以互相设置相应的比赛模块从而获得积分
3. 可以通过积分来互相兑换礼物
4. 记录在一起的时间
5. 邮件提醒和代办事项等



## 前端

前端使用`vue.js`,组件库使用`quasar.js`是基于quasar提供的cli进行开发的。

首先使用`quasar CLI` 创建项目

总件页面设计的过程忽略，记录一下前端开发中遇到的问题和解决方案措施。

### dev模式和build模式区分

因为项目涉及到后端，所以少不了打包，和在本地运行测试，但是每次都需要更改API url就跟麻烦，所以这里可以对不痛的mode进行区分，这里用到了quasar的一个插件

```javascript
quasar ext add dotenv
```

添加插件后，创建两个文件夹分别为`.development.env`和`.production.env`可以在上述的两个文件中输入在两个模式中不同的参数即可做到在不同mode的时候区分开来不同的API。

### axios设置头

因为登陆后验证，返回的jwt保存在网页中，所以应该当如果存在jwt验证的时候带入这个请求头，所以，我们可以在axios设置一个请求拦截器来是的它每次请求都带入jwt

在引入axios的js中添加如下代码

```javascript
axios.interceptors.request.use(config=>{
  if (localStorage.getItem('auth')){
    config.headers.Authorization=localStorage.getItem('auth')
  }
  return config //这里一定要返回这个config
})

//全局引入。
Vue.prototype.$axios = axios
//之后就可以在组件中使用this.$axios访问axios了。
```

### vue guard路由守卫

在一开始的项目中并没有做登录验证，所以不需要路由守卫，但是后来打算添加这个登录模块后，守卫就成了必须的一部分。在一个router实例中可以对页面进行添加路由守卫。

```javascript
//全局的前置路由守卫

Router.beforEach((to,from,next)=>{
//其中to：表示要去的路由的名称
//from:表示当前路由名称
//next:路由下一步跳转
//我们的需求是，如果不存在验证，那么始终返回登录即login页面
//如果存在验证，那么则不需要守卫，即用户访问login时，会自动的跳转（需要验证jwt），
//其他情况下

    let auth = localStorage.getItem('auth')
    if(to.name !== 'login' && !auth ){
      next({name:'login'}) //其他页面无验证的跳转到登录页面
    }
    else if (to.name ==='login' && auth){
          next() //如果存在jwt且要去往的是login就执行next（）跳转
    }
    else if(from.name ==='login' && auth){
        //这里验证jwt是否是伪造的
      axios.get(process.env.API_URL+"/api/study/user",{
        headers:{
          Authorization:localStorage.getItem('auth')
        }
      })
        .then(res=>{
          if(res.data.code!==400){
            next()
          }
        }).catch(err=>{
        localStorage.clear()
      })
    }
    else {
      next()
    }

})
```



### js 中的按key排序

```
//如果在一个object 数组中想要按照某个key值排序。
//首先数组存在sort方法。需要我们自定义一个sort的方式
function compare(a,b){
	return a.key>=b.key?1:0
}
//然后对于一个数组即可执行
array.sort(compare)
```

### js promise 问题

```javascript
//如果定义了一个异步执行的函数，如果想要在之后再添加.then那么就需要把这个操作return出去。
//简单的说就是return一个promise的函数。比如
function A(){
	const f = async ()=>{
	await something;
	}
	f()
}
//如果像上述那样写的话，在别的文件中不能使用A.then()类似的
//需要把f() ，return
function A(){
	const f = async ()=>{
	await something;
	}
	return f()
}
```



### vue语法

- 在template中访问不用加this。
- 如果存在从后端拿数据然后再渲染页面，即页面可能一段时间是空没有数据的情况下，要添加`v-if`判断是否为空，要不页面可能会报错。
- nextick 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。理解就是设置回调函数，让其能够获得更新后的dom。如果有什么数据是在更新后操作的可以将回调函数放在nexttick里。
- 对于一些重复使用的代码段,最后抽离成一个js文件。





## 后端Spring

没有学习过JAVA 相关的知识，所以Spring只是最最简单的时候方法。

在没有`spring security`的时候，所需要的只是一个`RESTFUL API `所以只需要一个`Controller`层和一个`service`层去实现相关的逻辑即可。

### Controller层

Control层是用于与用户打交道的层结构，这里定义了前端所需要的API接口。

```java
@RestController //Controller和ResponseBody两个的组合注解能够返回Json在页面中
@RequestMapping(path = "api/study" ,method = RequestMethod.GET,produces = {"application/json;charset=UTF-8"}) //使用RequestMapping在Controller层上，定义了整个接口的访问的BaseURl
@CrossOrigin(value = "*") //解决跨域问题，可以具体设置某一个域名或者ip
public class StudyController {

    private final StudyService studyService;
    @Autowired  //注入一个Bean
    public StudyController(StudyService studyService) throws SQLException {
        this.studyService = studyService;
    }
    @GetMapping("{username}") //表示{username}是一个路由变量，使用@PathVariable获得变量
    public List<Study> getStudy(@PathVariable("username") String username) throws Exception {

        return studyService.getStudy(username);
    }
    @PostMapping(path = "score")
    public  void postToDb(@RequestBody Study study) throws Exception {
        studyService.postToDb(study);
    }

    @GetMapping(path = "todolist")
    public List<ToDo> getTodo() throws Exception {
        return studyService.getTodo();
    }
    @DeleteMapping(path = "todo/{itemId}")
    public void deleteTo(@PathVariable("itemId") int itemId) throws Exception {
        studyService.deleteTo(itemId);
    }

    @PostMapping(path = "todo" )
    public void addNewTodo(@RequestBody ToDo toDo) throws Exception {
        studyService.addNewTodo(toDo);
    }
    @GetMapping(path = "chart")
    public List<Chart> getChart() throws Exception {

        return studyService.getChar();
    }
    @GetMapping(path = "chart2")
    public List<Chart> getCharGreatZero() throws Exception {
        return studyService.getCharGreatZero();
    }
    @GetMapping(path = "word")
    public List<Word> getWord() throws Exception {
        return studyService.getWord();
    }
    @PostMapping(path = "wordpost")
    public void addWord(@RequestBody Word word) throws Exception {
        studyService.addWord(word);
    }
    @GetMapping(path="wordtotal")
    public List<TotalWord> getTotalWord() throws Exception {
        return studyService.getTotalWord();
    }

    @PostMapping("/upload") //@RequestParam(value="")获取传过来的参数
    //当请求头中指定Content-Type:multipart/form-data时，传递的json参数，@RequestPart注解可以用对象来接收
    //@RequestParam只能用字符串接收
    public void handleFileUpload(@RequestPart(value = "file") final MultipartFile[] uploadfile,
                                 @RequestParam(value = "title") String title,
                                 @RequestParam(value = "description") String description,
                                 @RequestParam(value = "uploadtime") String uploadtime
    ) throws Exception {

        studyService.saveUploadedFiles(uploadfile ,title,description,uploadtime);
    }
    @GetMapping("/picture")
    public List<Picture> getPictureInfo() throws Exception {
        return studyService.getPictureInfo();
    }
    @GetMapping("/giftlist")
    public List<Study> getGiftList() throws Exception {
       return studyService.getGiftList();
    }
    @PutMapping("/finishgift")
    public void updateGiftStatus(@RequestParam(value="id") Integer id,
                                 @RequestParam(value="finish") String finish) throws Exception {
        studyService.updateGiftStatus(id,finish);
    }
    @GetMapping("/user")
    public String getUser( ){
        return "OK";
    }

}

```

### Service 层

`Service` 层用来实现`Controller`的逻辑,使用注解`@Service`标记一个Service层。不来讨论这一层的实现逻辑,只需要实现上面的方法就好了。



### Security

重点是security的应用来保护API，这里姑且不分权限。

引入security只需要在pom文件中添加即可。添加完重新启动之后，就会发现API的访问是需要登录的。在没有任何用户的时候spring使用随机生成的密码。

#### userDetailService

所以为了从数据库中拿到用户数据并且登录。我们需要重写`UserDetailsService`这个接口。

可以看到这个接口提供一个方法`loadUserByUsername`来给我们呢重写,所以我们需要重写这个接口.

```java

public interface UserDetailsService {
    UserDetails loadUserByUsername(String var1) throws UsernameNotFoundException;
}
```

创建一个类去实现这个接口

```java
@Service("userDetailsService")
public class UserDetail implements UserDetailsService {
    @Autowired
    private UserMapper userMapper; //这里注入Mybais.简化数据库查询
    @Override
    public UserDetails loadUserByUsername(String s) throws UsernameNotFoundException {
        QueryWrapper<User>wrapper = new QueryWrapper<>();
        wrapper.eq("name",s);
        User user = userMapper.selectOne(wrapper);
        if(user ==null){
            throw new UsernameNotFoundException("用户名不存在");
        }
        List<GrantedAuthority> auth = AuthorityUtils.commaSeparatedStringToAuthorityList("role");//数据库中没有具体的权限故可以随意赋予
        return new org.springframework.security.core.userdetails.User(user.getName(), new BCryptPasswordEncoder().encode(user.getPassword()),auth);//最终返回这个User

    }
}
```

此后就可以从数据库的信息中访问登录API接口了.

#### JWT

从前端中只需要post到这个页面即可,但是我们要返回一个`authentication`避免用户每次使用都要登录,让这个来对用户进行验证这里就是在返回的信息上添加JWT

JWT由几部分组成,

- 过期时间
- 密钥
- header

如下定义一个JWT类

```java
@Data
@Component
@ConfigurationProperties(prefix = "xwyzsn.jwt")//通过这个注解,在application.properties中设置相关的信息如.
//xwyzsn.jwt.header=Authorization
//xwyzsn.jwt.expire=604800000
//xwyzsn.jwt.secret=XXXXXXXXXXXXXX

public class JwtUtils {
    //生成jwt
    private long expire ;
    private String secret;
    private String header;
    public String generateToken(String name){
        Date nowDate = new Date();
        Date expireDate = new Date(nowDate.getTime()+1000*expire);
        return     Jwts.builder().setHeaderParam("typ","JWT")
                .setSubject(name)
                .setIssuedAt(nowDate)
                .setExpiration(expireDate)
                .signWith(SignatureAlgorithm.HS512,secret)
                .compact();
    }
    //解析jwt
    public Claims getClaimByToken(String jwt){
        try {
            return Jwts.parser()
                    .setSigningKey(secret)
                    .parseClaimsJws(jwt)
                    .getBody();
        } catch (Exception e) {
            return null;
        }

    }
    //判断Jwt是否过期

    public boolean isTokenExpired (Claims claims){
        return claims.getExpiration().before(new Date());
    }


}

```



### SecurityConfigure

之后来定义我们自己的`configure`继承基类`WebSecurityConfigurerAdapter`重写两个`configure`方法,添加自己的规则.

首先定义白名单,如`login,logout`允许用户访问.

```java
@Configuration //声明Configure 代替xml
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfigure extends WebSecurityConfigurerAdapter {
    private static final String [] URL_WHITELIST = {
        "login",
        "logout"
    };
    @Autowired
    private UserDetailsService userDetailsService; //注入User
    
    //以下为自定义的一些Handler用来返回当security出错时的行为后续会讲到.
    @Autowired
    private FailHandler failHandler;
    @Autowired
    private SuccessHandler successHandler;
    @Autowired
    private AuthenticationEntryPoint authenticationEntryPoint;

    @Bean
    JwtAuthentication jwtAuthenticationFilter() throws Exception {
        JwtAuthentication jwtAuthenticationFilter = new JwtAuthentication(authenticationManager());
        return jwtAuthenticationFilter;
    }
    @Override
    public void configure(AuthenticationManagerBuilder authenticationManagerBuilder) throws Exception {
        authenticationManagerBuilder.userDetailsService(userDetailsService).passwordEncoder(password());

    }



    @Bean
    PasswordEncoder password(){

        return new BCryptPasswordEncoder();

    }
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
                .formLogin()
                .successHandler(successHandler)
                .failureHandler(failHandler)
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                .antMatchers(URL_WHITELIST).permitAll()
                .anyRequest().authenticated()
                .and()
                .exceptionHandling()
                .authenticationEntryPoint(authenticationEntryPoint)
                .and()
                .addFilter(jwtAuthenticationFilter());
    }
}

```

实现上述的`Handler`用于返回信息.

```java
@Component
public class FailHandler implements AuthenticationFailureHandler {
//当验证失败时,向用户返回信息.实现AuthenticationFailureHandler 里的方法.
    @Override
    public void onAuthenticationFailure(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, AuthenticationException e) throws IOException, ServletException {
        httpServletResponse.setContentType("application/json;charset=UTF-8");
        ServletOutputStream servletOutputStream = httpServletResponse.getOutputStream();
        Result result = Result.fail(e.getMessage()); //Result为自定义的类,用于返回信息
        servletOutputStream.write(JSONUtil.toJsonStr(result).getBytes("UTF-8"));
        servletOutputStream.flush();
        servletOutputStream.close();
    }
}

```

同理实现`SuccessHandler`

```java
@Component
public class SuccessHandler implements AuthenticationSuccessHandler {

   @Autowired
    JwtUtils jwtUtils;
    @Override
    public void onAuthenticationSuccess(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Authentication authentication) throws IOException, ServletException {
        httpServletResponse.setContentType("application/json;charset=UTF-8");
        ServletOutputStream servletOutputStream = httpServletResponse.getOutputStream();
        String jwt =jwtUtils.generateToken(authentication.getName()); //登录成功后,写入jwt
        httpServletResponse.setHeader(jwtUtils.getHeader(),jwt);
        Result result = Result.succ("success");
        servletOutputStream.write(JSONUtil.toJsonStr(result).getBytes("UTF-8"));
        servletOutputStream.flush();
        servletOutputStream.close();
    }
}

```

实现检查JWT

```java
@Component 
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, AuthenticationException e) throws IOException, ServletException {
        httpServletResponse.setContentType("application/json;charset=UTF-8");
        httpServletResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        ServletOutputStream outputStream = httpServletResponse.getOutputStream();
        Result result = Result.fail("请先登录！");
        outputStream.write(JSONUtil.toJsonStr(result).getBytes("UTF-8"));
        outputStream.flush();
        outputStream.close();
    }
}

```

### Bean 和Component注解区别

1. @Component **auto detects** and configures the beans using classpath scanning whereas @Bean **explicitly declares** a single bean, rather than letting Spring do it automatically.
2. @Component **does not decouple** the declaration of the bean from the class definition where as @Bean **decouples** the declaration of the bean from the class definition.
3. @Component is a **class level annotation** whereas @Bean is a **method level annotation** and name of the method serves as the bean name.
4. @Component **need not to be used with the @Configuration** annotation where as @Bean annotation has to be **used within the class which is annotated with @Configuration**.
5. We **cannot create a bean** of a class using @Component, if the class is outside spring container whereas we **can create a bean** of a class using @Bean even if the class is present **outside the spring container**.
6. @Component has **different specializations** like @Controller, @Repository and @Service whereas @Bean has **no specializations**.



## TODO

- 代码规范,封装等
- 代码效率,重复问题

## 总结

整个项目目前大致就是这样了,后期遇到问题会进行更新.完整项目  [github地址](https://github.com/xwyzsn/Jessica.git) 前端在`master`分支中,后端在`spring`分支中,[gitee地址](https://gitee.com/xwyzsn/source-code-about-jessica.git)



