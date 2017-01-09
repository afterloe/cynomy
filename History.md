Cynomy 变动历史
###
> MIT Licensed  
> author: afterloe  
> mail: afterloeliu@jwis.cn  
> webSite: https://github.com/afterloe  

History.md
===

0.0.1 / 2017-1-8 22:4:34
==================
commit by afterloe(lm6289511@gmail.com)
  * master: 修复History.md文件不存在的时候再创建导致信息一栏显示undefined的异常

### modify files
> History.md  
> lib/gitHelper.js  

0.0.1 / 2017-1-8 22:25:51
==================
commit by afterloe(lm6289511@gmail.com)
  * master:调整git push指令，使其更加符合使用场景

### modify files
> History.md  
> lib/gitHelper.js  
> test/funTest.js  

0.0.1 / 2017-1-8 22:31:57
==================
commit by afterloe(lm6289511@gmail.com)
  * master: 修复push功能失效的问题

### modify files
> lib/gitHelper.js  

0.0.1 / 2017-1-8 23:8:45
==================
commit by afterloe (lm6289511@gmail.com)
  * master: 优化git提示功能，关闭push异常导致的push进程意外关闭的bug

### modify files
> lib/gitHelper.js  

0.0.1 / 2017-1-8 23:20:36
==================
commit by afterloe (lm6289511@gmail.com)
  * master: 添加强制构建hook

### modify files
> bin/cynomy  
> lib/gitHelper.js  

0.0.1 / 2017-1-9 14:26:7
==================
commit by afterloe (lm6289511@gmail.com)
  * master: 启动强制构建命令

### new files
> test/makeTest.js  

### modify files
> bin/cynomy  
> lib/gitHelper.js  

0.0.1 / 2017-1-9 14:41:50
==================
commit by afterloe (lm6289511@gmail.com)
  * master: 添加hook关闭自动提交，修复多文件导致文件编码错误的异常


### modify files
> History.md  
> bin/cynomy  
> lib/gitHelper.js  

0.0.1 / 2017-1-9 17:31:37
==================
commit by afterloe (lm6289511@gmail.com)
  * master: 添加mocha支持


### new files
> ../lib/mochaHelper.js  
> fileSystem_test.js  
### modify files
> ../bin/cynomy  
> ../lib/installProject.js  
> ../tools/fileSystem.js  

0.0.1 / 2017-1-9 17:40:55
==================
commit by afterloe (lm6289511@gmail.com)
  * master: mocha支持单文件检测


### modify files
> bin/cynomy  
> lib/mochaHelper.js  

0.0.1 / 2017-1-9 18:5:14
==================
commit by afterloe (lm6289511@gmail.com)
  * master: 微调创建文件markdown格式


### modify files
> History.md  
> lib/content.js  

0.0.1 / 2017-1-9 18:21:5
==================
commit by afterloe (lm6289511@gmail.com)
  * master: git 功能单独抽离


### new files
> tools/gitExtends.js  
### modify files
> lib/gitHelper.js  

0.0.1 / 2017-1-9 22:8:50
==================
commit by afterloe (lm6289511@gmail.com)
  * master: 编写fileSystem关于cp命令的单元测试，修复cynomy test -s 传入出现异常，改成了相对目录。修复了cynomy install不复制文件的异常


### modify files
> lib/createFile.js  
> lib/gitHelper.js  
> lib/installProject.js  
> lib/mochaHelper.js  
> test/fileSystem_test.js  
> tools/fileSystem.js  
