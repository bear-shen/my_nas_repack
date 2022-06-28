
|---------|------------------------------------|
| key     | ln                                 | 
|---------|------------------------------------| 
| webdav  | http://www.webdav.org/             |
|---------|------------------------------------|



# cmp

- 任务/转码遇到bug的处理没做好
- 各种遇到报错还slice的情况考虑一下
- tag/detach
- 左右翻页
- 文件窗口存在bug，可能无法及时的翻页
- 快捷键
- 一键全屏
- 全屏锁一下移动，对应的resize
- 除了详情模式以外的模式的点击查看没做好，要补一下
- 完全删除文件没做
- kmgt
- 设置页要不然搞成额外的tab。。。
- 考虑一下要不要做物理文件夹的选择工具
- 导入没ui
- 考虑一下做个额外的全屏确认窗口
- 清理残留文件的逻辑
- 重复文件上传的逻辑
  - 这个需要摆到处理完成标志后处理
- 文件处理的时候增加一个状态值
- webdav的性能问题
  - hash的效率，md5太慢了
    - https://github.com/Cyan4973/xxHash
    - http://cyan4973.github.io/xxHash/
    - [What is the difference between a Hash Function and a Cryptographic Hash Function?](https://security.stackexchange.com/questions/11839/what-is-the-difference-between-a-hash-function-and-a-cryptographic-hash-function)
    - https://github.com/BLAKE3-team/BLAKE3
    - https://en.wikipedia.org/wiki/Secure_Hash_Algorithms
    - blake3 -> b3sum
    - blake2
    - sm3
    - `openssl help`
  - 响应速度太慢会导致超时，这块考虑一下
- webdav
  - 配置一下apache然后抓个包出来
  - 反正能爬出来的话就照着实现一份

# dev

# no dbg

# tbd
- webdav的性能问题
  - `IncomingMessage`的效率
- 文件上传状态好像有bug
- 还有文本编辑器最好也搞一个，或者集成vscode也行
- .d.ts需要整理一下
- 设置页做成了tab的形式
  - /media目录的配置
    - 压平文件夹，用setting的ui然后套接directory的逻辑和组件
  - 看看有没有什么其他的
- 更多的快捷键
- webdav
  - 细节上的lock/unlock和xmlcontent之类的
