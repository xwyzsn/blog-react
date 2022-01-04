# 操作系统课程设计 Thread

**pintos安装**

pintos安装,参照了https://stackoverflow.com/questions/60696354/cloning-pintos-with-ubuntu 成功安装pintos后如下图所示

![](https://img-blog.csdnimg.cn/2020070623371088.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70)

共27个fail,所以开始对其中代码开始分析。

先看到实验的要求如下图

![](https://img-blog.csdnimg.cn/20200706233710199.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70)

要实现的内容有

1. 取消忙等待
2. 优先级调度
3. 多级反馈调度

#### <a name="_nonbusy_sleep_27">;</a> 任务一 non-busy sleep

函数解析

查看timer_sleep函数源代码如下

```
/* Sleeps for approximately TICKS timer ticks.  Interrupts must
   be turned on. */
void
timer_sleep (int64_t ticks)
{
  int64_t start = timer_ticks ();

  ASSERT (intr_get_level () == INTR_ON);
  while (timer_elapsed (start) < ticks)
    thread_yield ();
}
```

看到有调用其他函数timer_ticks

```
/* Returns the number of timer ticks since the OS booted. */
int64_t
timer_ticks (void)
{
  enum intr_level old_level = intr_disable ();
  int64_t t = ticks;
  intr_set_level (old_level);
  return t;
}
```

看到这个函数的功能如注释的，返回一个从运行开始后的时钟周期（相当于一个计时器）。

函数timer_elapsed

```
/* Returns the number of timer ticks elapsed since THEN, which
   should be a value once returned by timer_ticks(). */
int64_t
timer_elapsed (int64_t then)
{
  return timer_ticks () - then;
}

```

还有一个intr_get_level () 和 INTR_ON，在interrupt.c下找到其声明和实现

```
/* Returns the current interrupt status. */
enum intr_level
intr_get_level (void)
{
  uint32_t flags;

  /* Push the flags register on the processor stack, then pop the
     value off the stack into `flags'.  See [IA32-v2b] "PUSHF"
     and "POP" and [IA32-v3a] 5.8.1 "Masking Maskable Hardware
     Interrupts". */
  asm volatile ("pushfl; popl %0" : "=g" (flags));

  return flags & FLAG_IF ? INTR_ON : INTR_OFF;
}
```

```
/* Interrupts on or off? */
enum intr_level
  {
    INTR_OFF,             /* Interrupts disabled. */
    INTR_ON               /* Interrupts enabled. */
  };
```

这里可以看到INTR_OFF即返回一个状态是否启用中断，然后get_intr_level是获取这个中断位的状态。

那么再看到timer_sleep函数的作用，其就是一个忙等待，while循环中不断的测试，占用CPU。要避免忙等待，可以在其代码之前加入一个阻塞的操作直到一个给定的值后再唤醒进程，暂停其对CPU的占用。

##### 函数设计

1. 为线程的结构体加入一个记录阻塞的thread_sleep_tick
2. 在每一个时钟中断时,将thread_sleep_tick减去1直到为0的时候唤起这个进程。实现方法的话，可以维护一个sleep队列每次都对这个队列的block减去1.也可以对所有线程进行检查，但是只有当线程被block和大于0时是有意义的。对线程的检车放在时钟中断的函数中。
3. 当一个线程的thread_sleep_tick为0时，将其加入到就绪队列中，这里需要设计一个函数将一个sleep的加入到就绪队列中。

##### 函数实现

为线程加入一个记录阻塞的记录thread_sleep_tick

```
int64_t thread_sleep_tick;
```

在时钟中断中加入如下代码，这里利用到了作者留下的一个函数thread_foreach（）功能就是给链表中的每一个函数都执行func的函数操作。

```
thread_foreach (blocked_thread_check, NULL);
```

其中block_thread_check实现如下

```
void
blocked_thread_check (struct thread *t, void *aux UNUSED)
{
  if (t->status == THREAD_BLOCKED && t->ticks_blocked > 0)
  {
      t->thread_sleep_tick--;
      if (t->thread_sleep_tick == 0)
      {
          thread_unblock(t);//&#x5C06;&#x7EBF;&#x7A0B;&#x5524;&#x9192;&#x5230;&#x5C31;&#x7EEA;&#x961F;&#x5217;&#x4E2D;&#x3002;
      }
  }
}
```

结束后开始修改timer_sleep()函数。

```
void timer_sleep (int64_t ticks)
{
  if (ticks <= 0) { return; 只有大于0才有意义 } assert (intr_get_level ()="=" intr_on); enum intr_level old_level="intr_disable" (); struct thread *current_thread="thread_current" current_thread->thread_sleep_tick = ticks;//&#x83B7;&#x53D6;&#x8FD0;&#x884C;&#x8FDB;&#x7A0B;&#x7684;sleep_tick&#x5C06;&#x5176;&#x53D8;&#x4E3A;&#x8FD0;&#x884C;&#x7684;tick&#x503C;
  thread_block ();//&#x963B;&#x585E;&#x8FDB;&#x7A0B;
  intr_set_level (old_level);
}
</=>
```

![](https://img-blog.csdnimg.cn/2020070623371059.png)

#### 任务二 priority schedule

##### 函数解析

这个任务要实现一个优先级调度，优先级调度顾名思义，允许优先级大的任务进程先执行（既可以抢占低优先级的线程）。

文档中给出了一个warning：即sleep的进程不论其优先级，都不应该过早的唤醒。

##### 函数设计

所以当一个进程被创建时候，应给出一个优先级，然后如果新的线程的优先级大于运行的线程，则将运行的线程阻塞拉入就绪队列

##### 函数实现

```
void thread_set_priority (int new_priority)
{
  thread_current ()->priority = new_priority;
  thread_yield ();
}//&#x4E3A;&#x4E00;&#x4E2A;&#x65B0;&#x7EBF;&#x7A0B;&#x5206;&#x914D;&#x4E00;&#x4E2A;&#x4F18;&#x5148;&#x7EA7;
```

```
if(thread_current()->priority<priority){thread_yield();} < code></priority){thread_yield();}>
```

![](https://img-blog.csdnimg.cn/2020070623371092.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20200706234115778.png)

![](https://img-blog.csdnimg.cn/2020070623371052.png)

#### 任务三 Priority donation

##### 函数解析

这个任务是要实行一个优先级捐赠，那么什么是优先级捐赠呢？一个Donation model 描述如下

1. 多个进程可以将其优先级捐赠给一个进程
2. 一个进程可以将优先级捐赠给一个正在执行的进程。
3. 当资源被释放的时候Donation就被撤销了
4. 捐赠的行为是可以嵌套的

所以由于以上的模型模式，一个阻塞的线程可能已经修改了其优先级，所以我们这里采用的是对信号量操作作出修改。

理解一下上面这个Donation的模型，就是如下当一个优先级低的任务占用资源而阻塞时，可以由一个正在等待的高优先级的线程将优先级捐赠给它（捐赠是可以进行嵌套的）

##### 函数设计

关键是设计一个函数能够向前捐赠自己的优先级，一个thread的优先级是会发生变化的，所以需要一个记录其原来的优先级，和修改后的优先级。

再一个需要记录拥有锁的优先级，才能够在要获得或者释放锁的时候根据优先级来进行捐赠操作

并且需要记录下线程等待的锁（为了能够实现嵌套的捐赠）

##### 函数实现

为结构体thread添加如下的新成员数据

```
int base_priority;
int locks_priority;//&#x6700;&#x9AD8;&#x4F18;&#x5148;&#x7EA7;
struct list locks;//&#x7EBF;&#x7A0B;&#x6709;&#x7684;&#x9501;
struct lock *lock_waiting;//&#x7B49;&#x5F85;&#x7684;&#x9501;
```

对lock进行修改

1. 记录当前lock得资源是哪个线程所持有得
2. 记录有几个线程在等待这个资源
3. 记录锁得优先级

修改后的lock

```
struct list waiters;//&#x52A0;&#x5165;&#x7B49;&#x5F85;lock&#x5F97;&#x7B49;&#x5F85;&#x8005;&#x961F;&#x5217;
int  priority;//&#x8BB0;&#x5F55;&#x9501;&#x5F97;&#x4F18;&#x5148;&#x7EA7;
sturct list_elem elem;//&#x94FE;&#x8868;&#x8282;&#x70B9;
```

此时修改lock的初始化函数lock_init();

```
void lock_init (struct lock *lock)

{

 ASSERT (lock != NULL);

 lock->holder = NULL;//no thread hold

 list_init (&lock->waiters);//init the waiterslist

 lock->priority=PRI_UNVALID;//define a invalid for the init priority

}
```

初始化thread

```
void
thread_init (void)
{
  ASSERT (intr_get_level () == INTR_OFF);

  lock_init (&tid_lock);
  list_init (&ready_list);
  list_init (&all_list);

  /* Set up a thread structure for the running thread. */
  initial_thread = running_thread ();
  init_thread (initial_thread, "main", PRI_DEFAULT);
  initial_thread->status = THREAD_RUNNING;
  initial_thread->tid = allocate_tid ();
}
```

初始化完成后开始捐赠模型，先考虑几个函数

1. 线程更新优先级函数：判断线程持有的锁，并且更新线程的优先级。

```
void thread_update_priority(struct thread *t)
{
 t->locks_priority = PRI_UNVALID;//init a invald thread
 struct lock *l;
 struct list_elem *e;
  for (e = list_begin (&t->locks); e != list_end (&t->locks);
      e = list_next (e))//&#x904D;&#x5386;&#x94FE;&#x8868;
    {
     l = list_entry(e, struct lock, elem);
     if(l->priority > t->locks_priority)
       t->locks_priority = l->priority;//&#x627E;&#x5230;&#x6700;&#x5927;&#x7684;&#x4F18;&#x5148;&#x7EA7;
    }
 if(t->base_priority > t->locks_priority)
   t->priority = t->base_priority;
 else
   t->priority = t->locks_priority;//&#x4FEE;&#x6539;&#x7EBF;&#x7A0B;&#x7684;&#x4F18;&#x5148;&#x7EA7;
}
```
2. lock的优先更新函数:从等待的队列中选择优先级别最高的线程来更新自己的优先级。

```
void lock_update_priority(struct lock *l)
{
 l->priority = PRI_UNVALID;
 struct thread *t;
 struct list_elem *e;
  for (e = list_begin (&l->waiters); e != list_end (&l->waiters);
      e = list_next (e))//&#x904D;&#x5386;&#x7B49;&#x5F85;&#x8BE5;&#x9501;&#x7684;&#x7EBF;&#x7A0B;
    {
     t = list_entry(e, struct thread, elem);
     if(t->priority > l->priority)
       l->priority = t->priority;//&#x627E;&#x5230;&#x5176;&#x4E2D;&#x6700;&#x9AD8;&#x7684;&#x4F18;&#x5148;&#x7EA7;
    }
}
```
3. 嵌套的优先级捐赠函数，当传入一个线程时，捐赠自己的优先级（嵌套地相前）。

```
void thread_priority_donate_nest(struct thread *t)
{
 struct lock *l = t->lock_waiting;//&#x8BB0;&#x5F55;&#x7EBF;&#x7A0B;&#x5728;&#x7B49;&#x54EA;&#x4E2A;&#x9501;
 while(l){
   if(t->priority > l->priority)//&#x5982;&#x679C;&#x7EBF;&#x7A0B;&#x4F18;&#x5148;&#x7EA7;&#x5927;&#x4E8E;&#x5176;&#x9501;&#x7684;&#x4F18;&#x5148;&#x7EA7;&#x90A3;&#x4E48;&#x4E45;&#x6350;&#x8D60;
     l->priority = t->priority;
   else
     break;//&#x4E0D;&#x80FD;&#x9000;&#x51FA;
    t = l->holder;//&#x54EA;&#x4E2A;&#x7EBF;&#x7A0B;&#x6301;&#x6709;&#x4E86;&#x8FD9;&#x4E2A;&#x9501;
   if(l->priority > t->locks_priority)
     t->locks_priority = l->priority;//&#x82E5;&#x9501;&#x6BD4;&#x7EBF;&#x7A0B;&#x4F18;&#x5148;&#x7EA7;&#x9AD8;&#xFF0C;&#x5C31;&#x63D0;&#x9AD8;&#x8FD9;&#x4E2A;&#x7EBF;&#x7A0B;&#x7684;&#x4F18;&#x5148;&#x7EA7;
   else
     break;
   if(l->priority > t->priority)//&#x5224;&#x65AD;&#x5360;&#x6709;&#x9501;&#x7684;&#x7EBF;&#x7A0B;&#x548C;&#x6350;&#x8D60;&#x540E;&#x7684;&#x4F18;&#x5148;&#x7EA7;&#x5927;&#x5C0F;
     t->priority = l->priority;
   else
     break;
    l = t->lock_waiting;
  }
}
```

实现完如上三个函数后，接下来修改原有的函数；

1. lock_acquire()函数

```
void lock_acquire (struct lock *lock)//&#x672A;&#x4FEE;&#x6539;
{
  ASSERT (lock != NULL);
  ASSERT (!intr_context ());
  ASSERT (!lock_held_by_current_thread (lock));

  sema_down (&lock->semaphore);
  lock->holder = thread_current ();
}
```

```
void lock_acquire (struct lock *lock)//&#x4FEE;&#x6539;&#x540E;
{
 ASSERT (lock != NULL);
 ASSERT (!intr_context ());
 ASSERT (!lock_held_by_current_thread (lock));
 struct thread *cur_t;
 enum intr_level old_level;
 old_level = intr_disable ();
 while (lock->holder != NULL)
   {//lock&#x88AB;&#x5360;&#x4E86;
     cur_t = thread_current();
     list_push_back (&lock->waiters, &cur_t->elem);//&#x5C06;&#x73B0;&#x5728;&#x8FD0;&#x884C;&#x7684;&#x7EBF;&#x7A0B;&#x52A0;&#x5165;waiter&#x961F;&#x5217;&#x4E2D;
     cur_t->lock_waiting = lock;
     thread_priority_donate_nest(cur_t);//&#x6350;&#x8D60;&#x4F18;&#x5148;&#x7EA7;
     thread_block ();//&#x963B;&#x585E;
    }
    //&#x82E5;&#x6CA1;&#x6709;&#x88AB;&#x5360;&#x7528;&#xFF0C;&#x5C31;&#x5141;&#x8BB8;&#x8FD9;&#x4E2A;&#x7EBF;&#x7A0B;&#x5360;&#x6709;&#x8FD9;&#x4E2A;&#x9501;
 cur_t = thread_current();
 lock->holder = cur_t;
 cur_t->lock_waiting = NULL;
 list_push_back(&cur_t->locks,&lock->elem);
 if(lock->priority > cur_t->locks_priority)
   cur_t->locks_priority = lock->priority;//&#x63D0;&#x9AD8;&#x4F18;&#x5148;&#x7EA7;&#x3002;

 if(lock->priority > cur_t->priority)&#xFF1B;
   cur_t->priority = lock->priority;
 intr_set_level (old_level);
}
```

2.lock_try_acquire()函数：这个函数和lock_acquire（）函数一样，只是返回值类型不同

```
bool lock_try_acquire (struct lock *lock)
{
 bool success;
 ASSERT (lock != NULL);
 ASSERT (!lock_held_by_current_thread (lock));
 struct thread *cur_t;
 enum intr_level old_level;
 old_level = intr_disable ();
  if (lock->holder == NULL)
    {
     cur_t = thread_current();
     lock->holder = cur_t;
      cur_t->lock_waiting = NULL;
     list_push_back(&cur_t->locks,&lock->elem);
     if(lock->priority > cur_t->locks_priority)
       cur_t->locks_priority = lock->priority;
     if(lock->priority > cur_t->priority)
       cur_t->priority = lock->priority;
     success = true;
    }
 else
   success = false;
 intr_set_level (old_level);
 return success;
}

```

3.修改锁的释放函数：lock_release()

```
void lock_release (struct lock *lock)
{
 ASSERT (lock != NULL);
 ASSERT (lock_held_by_current_thread (lock));
 struct list_elem *e;
 struct thread *t;
 enum intr_level old_level;
 old_level = intr_disable();
 lock->holder = NULL;//&#x5C06;&#x6240;&#x6709;&#x8005;&#x7F6E;&#x7A7A;
 list_remove(&lock->elem);//&#x7EBF;&#x7A0B;&#x7684;&#x79FB;&#x9664;&#x8BE5;&#x9501;
 thread_update_priority(thread_current());//&#x7EBF;&#x7A0B;&#x66F4;&#x65B0;&#x4F18;&#x5148;&#x7EA7;
 if(!list_empty(&lock->waiters))
  {//&#x5982;&#x679C;&#x6709;&#x7EBF;&#x7A0B;&#x5728;&#x7B49;&#x9501;
    e = list_max(&lock->waiters,&thread_less_priority,NULL);//&#x627E;&#x5230;&#x6700;&#x9AD8;&#x4F18;&#x5148;&#x7EA7;&#x7684;&#x7EBF;&#x7A0B;
   list_remove(e);
   lock_update_priority(lock);
    t = list_entry(e,struct thread,elem);
   thread_unblock(t);//&#x5524;&#x9192;&#x6700;&#x9AD8;&#x4F18;&#x5148;&#x7EA7;&#x7684;&#x7EBF;&#x7A0B;
  }
 thread_yield();//&#x5C06;&#x5176;&#x52A0;&#x5165;&#x5C31;&#x7EEA;&#x961F;&#x5217;&#xFF0C;&#x5141;&#x8BB8;&#x62A2;&#x5360;
 intr_set_level(old_level);
}
```

在这里需要额外实现一个函数thread_less_priority()来比较两个thread的优先级；函数形式如下。

```
bool thread_less_priority (const struct list_elem *a, const struct list_elem *b, void *aux UNUSED){

 return list_entry(a, struct thread, elem)->priority < list_entry(b, struct thread, elem)->priority;
}
```

4.修改thread_create()函数，目的：若线程优先级大于执行的优先级那么就将其加入就绪队列中。等待抢占。

```
  if(thread_current()->priority<priority){ thread_yield(); } < code></priority){>
```

在创建线程的最后加入上述代码。、

5.修改设置优先级函数thread_set_priority()

```
void thread_set_priority (int new_priority)
{
 struct thread *t;
 enum intr_level old_level;
 old_level = intr_disable();
  t = thread_current();
 t->base_priority = new_priority;
 if(t->base_priority > t->locks_priority)
   t->priority = t->base_priority;
 else
   t->priority = t->locks_priority;//&#x5728;&#x9501;&#x7684;&#x4F18;&#x5148;&#x7EA7;&#x548C;&#x539F;&#x6709;&#x7684;&#x4F18;&#x5148;&#x7EA7;&#x4E2D;&#x9009;&#x62E9;&#x4E00;&#x4E2A;&#x5927;&#x7684;&#x4F18;&#x5148;&#x7EA7;
 thread_yield();
 intr_set_level(old_level);
}
```

6.修改V操作

```
void sema_up (struct semaphore *sema)
{
 struct list_elem *e;
 struct thread *t;
 enum intr_level old_level;
 ASSERT (sema != NULL);
 old_level = intr_disable ();
  if (!list_empty (&sema->waiters))//&#x5728;&#x7B49;&#x5F85;&#x961F;&#x5217;&#x4E2D;&#x9009;&#x62E9;&#x4E00;&#x4E2A;&#x4F18;&#x5148;&#x7EA7;&#x6700;&#x9AD8;&#x7684;&#x5524;&#x9192;
  {
    e = list_max(&sema->waiters, &thread_less_priority, NULL);
    list_remove(e);
    t = list_entry(e, struct thread, elem);
   thread_unblock(t);
  }
 sema->value++;
 intr_set_level (old_level);
 thread_yield();
}
```

7.关于condition原有的是维护一个的等待队列，修改为使用一个信号量机制进行操作。

```
struct condition
  {
  //  struct list waiters;        /* List of waiting threads. */
    struct semaphore sema;
  };
```

同理修改关于condition的函数

```
void
cond_init (struct condition *cond)
{
  ASSERT (cond != NULL);

  sema_init(&cond->sema,0);
}

void cond_wait (struct condition *cond, struct lock *lock)
{
 ASSERT (cond != NULL);
 ASSERT (lock != NULL);
 ASSERT (!intr_context ());
 ASSERT (lock_held_by_current_thread (lock));
 lock_release (lock);
 sema_down (&cond->sema);
 lock_acquire (lock);
}

void cond_signal (struct condition *cond, struct lock *lock UNUSED)
{
 ASSERT (cond != NULL);
 ASSERT (lock != NULL);
 ASSERT (!intr_context ());
 ASSERT (lock_held_by_current_thread (lock));
  if (!list_empty (&cond->sema.waiters))
   sema_up(&cond->sema);
}
```

修改完毕后运行

![](https://img-blog.csdnimg.cn/20200706233710191.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70)

#### 任务四BSD-style scheduler

1. measure CPU usage of each thread every tick
2. decay CPU usage for all threads once per second
3. calculate system load average once per second
4. updata priority every 4th tick
5. run thread with highest priority

#####函数解析

这五个要求就是实现反馈调度,维护一个CPU使用时间和一个调度队列,当一个thread run完一个时间片后下降一个优先级,然后从优先级高的队列中选择出一个线程继续运行。

从其官网上可以得到其计算公式 官网：[http://www.ccs.neu.edu/home/amislove/teaching/cs5600/fall10/pintos/pintos_7.html](http://www.ccs.neu.edu/home/amislove/teaching/cs5600/fall10/pintos/pintos_7.html)

p r i o r i t y = P R I M A X − ( r e c e n t c p u / 4 ) − ( n i c e ∗ 2 ) priority = PRI_MAX - (recent_cpu / 4) - (nice * 2)p r i o r i t y =P R I M ​A X −(r e c e n t c ​p u /4 )−(n i c e ∗2 )

r e c e n t c p u = ( 2 ∗ l o a d a v g ) / ( 2 ∗ l o a d a v g + 1 ) ∗ r e c e n t c p u + n i c e recent_cpu = (2*load_avg)/(2*load_avg + 1) * recent_cpu + nice r e c e n t c ​p u =(2 ∗l o a d a ​v g )/(2 ∗l o a d a ​v g +1 )∗r e c e n t c ​p u +n i c e

l o a d a v g = ( 59 / 60 ) ∗ l o a d a v g + ( 1 / 60 ) ∗ r e a d y t h r e a d s . load_avg = (59/60)*load_avg + (1/60)*ready_threads.l o a d a ​v g =(5 9 /6 0 )∗l o a d a ​v g +(1 /6 0 )∗r e a d y t ​h r e a d s .

>
>> Pintos不支持内核中的浮点运算，因为这会使内核复杂化并减慢速度。由于同样的原因，真正的内核通常也有同样的局限性。这意味着对实际量的计算必须使用整数进行模拟。这不难，但许多学生不知道怎么做。本节介绍基本知识。

这里指出我们要用整数操作模拟出浮点数的运算。算法思想如下。

>
>> 其基本思想是将整数的最右边的位视为表示分数。

>
>> Convert `n`to fixed point: `n * f`Convert `x`to integer (rounding toward zero): `x / f`Convert `x`to integer (rounding to nearest): `(x + f / 2) / f`if `x >= 0`, `(x - f / 2) / f`if `x <= 0< code>.Add <code>x</code> and <code>y</code>:<code>x + y</code>Subtract <code>y</code> from <code>x</code>:<code>x - y</code>Add <code>x</code> and <code>n</code>:<code>x + n * f</code>Subtract <code>n</code> from <code>x</code>:<code>x - n * f</code>Multiply <code>x</code> by <code>y</code>:<code>((int64_t) x) * y / f</code>Multiply <code>x</code> by <code>n</code>:<code>x * n</code>Divide <code>x</code> by <code>y</code>:<code>((int64_t) x) * f / y</code>Divide <code>x</code> by <code>n</code>:<code>x / n</code></=>`

##### 函数实现

首先实现fixed_point参照上述的表格和算法
这里代码是参考一位博主的(链接在文章后面给了)

```
#ifndef __THREAD_FIXED_POINT_H
#define __THREAD_FIXED_POINT_H

/* Basic definitions of fixed point. */
typedef int fixed_t;
/* 16 LSB used for fractional part. */
#define FP_SHIFT_AMOUNT 16
/* Convert a value to fixed-point value. */
#define FP_CONST(A) ((fixed_t)(A << FP_SHIFT_AMOUNT))
/* Add two fixed-point value. */
#define FP_ADD(A,B) (A + B)
/* Add a fixed-point value A and an int value B. */
#define FP_ADD_MIX(A,B) (A + (B << FP_SHIFT_AMOUNT))
/* Substract two fixed-point value. */
#define FP_SUB(A,B) (A - B)
/* Substract an int value B from a fixed-point value A */
#define FP_SUB_MIX(A,B) (A - (B << FP_SHIFT_AMOUNT))
/* Multiply a fixed-point value A by an int value B. */
#define FP_MULT_MIX(A,B) (A * B)
/* Divide a fixed-point value A by an int value B. */
#define FP_DIV_MIX(A,B) (A / B)
/* Multiply two fixed-point value. */
#define FP_MULT(A,B) ((fixed_t)(((int64_t) A) * B >> FP_SHIFT_AMOUNT))
/* Divide two fixed-point value. */
#define FP_DIV(A,B) ((fixed_t)((((int64_t) A) << FP_SHIFT_AMOUNT) / B))
/* Get integer part of a fixed-point value. */
#define FP_INT_PART(A) (A >> FP_SHIFT_AMOUNT)
/* Get rounded integer of a fixed-point value. */
#define FP_ROUND(A) (A >= 0 ? ((A + (1 << (FP_SHIFT_AMOUNT - 1))) >> FP_SHIFT_AMOUNT) \
        : ((A - (1 << (FP_SHIFT_AMOUNT - 1))) >> FP_SHIFT_AMOUNT))

#endif /* thread/fixed_point.h */
```

修改完之后看每个任务的要求。

mlfqs-load-1要求：创建线程，让load_avg提高到0.5，检测时间是否在38~45之内。线程休眠10s检查load_avg是否下降到0.5；

mlfqs-load-60:创建60个线程，然后休眠10s，然后唤醒，再睡眠。循环每隔两秒打印出平均的负载。创建线程后ready队列中的线程会增多,load_avg会变高,休眠之后ready减少,load_avg会降低.

mlfqs-load-avg:创建60个进程,进程i睡眠10+i,唤醒60s然后再次睡眠,到进程结束。同样的load_avg先增高再减少。

mlfqs-recent-1：ready中一个进程（主程序），计算和验证recent_cpu和load_avg的正确性。

mlfqs-fair-2：创建两个线程，nice为0，检查运行时间，由此可知两个进程的优先级应该相同，所以其运行的时间应该保持相同

mlfqs-fair-20：与mlfqs-fair-2相类似，检查20个进程。检查程序运行的时间。

mlfqs-nice-2：创建2个线程，nice分别为0，1。越小的值，其时间片就长。

mlfqs-nice-10同上 创建十个线程，nice从0到9，nice越小，所以时间片越长。

mlfqs-block：主线程拥有一个锁，休眠25s唤醒5s释放，另一线程创建后等待20s，获取这个锁（B在此期间阻塞10s）到了30s,主线程释放之后，B的优先级提到比A高会运行B，在运行A。

所以思路就是实现一下上述三个公式的nice,recent_cpu,load_avg更新操作。

在thread.c中加入加入全局变量load_avg ,并修改thread 结构体如下所示.

```
   int nice;//add nice
   fixed_t recent_cpu;//add recent_cpu
```

在线程初始化的时候,也对其进行初始化操作

```
  t->nice=0;
  t->recent_cpu=FP_CONST(0);
```

初始化完毕后在时钟中断中设置其优先级每4个tick更新一次,recent_cpu、load_avg、nice每1 ticks更新一次 ,这里引入修改两个函数一个是更新优先级,一个是更新recent_cpu等数据

函数如下:

```
void
thread_mlfqs_update_load_avg_and_recent_cpu (void)
{
  ASSERT (thread_mlfqs);
  ASSERT (intr_context ());

  size_t ready_threads = list_size (&ready_list);
  if (thread_current () != idle_thread)
    ready_threads++;
  load_avg = FP_ADD (FP_DIV_MIX (FP_MULT_MIX (load_avg, 59), 60), FP_DIV_MIX (FP_CONST (ready_threads), 60));

  struct thread *t;
  struct list_elem *e = list_begin (&all_list);
  for (; e != list_end (&all_list); e = list_next (e))
  {
    t = list_entry(e, struct thread, allelem);
    if (t != idle_thread)
    {
      t->recent_cpu = FP_ADD_MIX (FP_MULT (FP_DIV (FP_MULT_MIX (load_avg, 2), FP_ADD_MIX (FP_MULT_MIX (load_avg, 2), 1)), t->recent_cpu), t->nice);
      thread_mlfqs_update_priority (t);
    }
  }
}

void
thread_mlfqs_update_priority (struct thread *t)
{
  if (t == idle_thread)
    return;

  ASSERT (thread_mlfqs);
  ASSERT (t != idle_thread);

  t->priority = FP_INT_PART (FP_SUB_MIX (FP_SUB (FP_CONST (PRI_MAX), FP_DIV_MIX (t->recent_cpu, 4)), 2 * t->nice));
  t->priority = t->priority < PRI_MIN ? PRI_MIN : t->priority;
  t->priority = t->priority > PRI_MAX ? PRI_MAX : t->priority;
}
```

修改时钟中断函数如下

```
static void
timer_interrupt (struct intr_frame *args UNUSED)
{
  ticks++;
  enum intr_level old_level = intr_disable ();
  if (thread_mlfqs)
  {
    thread_mlfqs_increase_recent_cpu_by_one ();
    if (ticks % TIMER_FREQ == 0)
      thread_mlfqs_update_load_avg_and_recent_cpu ();
    else if (ticks % 4 == 0)
      thread_mlfqs_update_priority (thread_current ());
  }
  thread_foreach (blocked_thread_check, NULL);
  intr_set_level (old_level);
  thread_tick ();
}
```

将一些未完成的函数完成

```
/* Sets the current thread's nice value to NICE. */
void
thread_set_nice (int nice)
{
  thread_current ()->nice = nice;
  thread_mlfqs_update_priority (thread_current ());
  thread_yield ();
}

/* Returns the current thread's nice value. */
int
thread_get_nice (void)
{
  return thread_current ()->nice;
}

/* Returns 100 times the system load average. */
int
thread_get_load_avg (void)
{
  return FP_ROUND (FP_MULT_MIX (load_avg, 100));
}

/* Returns 100 times the current thread's recent_cpu value. */
int
thread_get_recent_cpu (void)
{
  return FP_ROUND (FP_MULT_MIX (thread_current ()->recent_cpu, 100));
}

```

##### 错误检查

完成上述之后进行make check仍然存在两个fail:mlfqs-load-avg,和mlfqs-block这两个错误。

![](https://img-blog.csdnimg.cn/20200706233710203.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70)

检查mlfqs-load-avg文件中对于题目的说明，其中说了如果pass了大部分的任务，fail了这个的化考虑时钟中断中是否做了过长的代码，但是检查了时间中断就是更新操作就没了，所以这部分暂时检查不出来问题。

第二个时mlfqs-block，关于这个错误当时找了挺久的(一开始没有从文件给出中入手)，先从题目中入手：主线程拥有一个锁，休眠25s唤醒5s释放，另一线程创建后等待20s，获取这个锁（B在此期间阻塞10s）到了30s,主线程释放之后，B的优先级提到比A高会运行B，在运行A。

仔细看一下这个任务和第三个任务优先级捐赠，其实是存在矛盾的——就是这里是根据recent_cpu,nice去更新运行时间从而得到优先级，而优先级捐赠是会更新优先级在传入一个线程的时候，所以这里两个地方都涉及到了更改优先级的操作。所以在进行任务四BSD调度的时候，需要禁掉优先级捐赠。

问题发现之后相对应的修改如下（在可能设计到优先级操作的地方ban掉优先级捐赠）

修改一：在锁的释放的时候，涉及到了优先级变化，这里添加一个判断条件，当执行thread_mlfqs的时候不更新优先级。

```
if(!thread_mlfqs){
 list_remove(&lock->elem);
 thread_update_priority(thread_current());}
```

修改二：在set_priority函数的时候也应当增加判断，若执行thread_mlfqs直接return架空这个函数。

```
 if(thread_mlfqs)
    return;
```

修改完这两处之后再次make check。

![](https://img-blog.csdnimg.cn/20200706233710178.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3h3eXpzbg==,size_16,color_FFFFFF,t_70)

发现全部都pass了。

反过来思考一下为什么之前的mlfqs-load-avg，fail了，可能是因为调用了优先级捐赠让其在一开始的运行时间加长了，所以会出现中间一段大于期待的时间的情况。

### 实验总结

实验总体难度还是挺大的，然后一开始没有什么思路，参考了pintos的官网上的介绍，和一些博客，通过这次实验对操作系统总体上有了一个深刻的认识。对进程的调度上有了一个比较深刻的理解。

四个任务上总体难度最大的是第三个优先级捐赠，这个问题之前在操作系统课上感觉没有听到过，这里算是学习到了新的知识。有时间的话还是期待做一下其他实验的。这个题目思路上比较绕，但是画图后还是能很好的理解。
参考的博客链接:
https://www.cnblogs.com/laiy/p/pintos_project1_thread.html
还有一篇我找不到了...
