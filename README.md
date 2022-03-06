# rubic-cube

a rubic cube game

## deploy

nginx:

```
    server {
        listen       80;
        server_name  localhost;

        ...

        ...


        location /rubik/ { # 末尾必须要有/
            alias   <项目路径>/rubik-cube/; # 末尾必须要有/
            autoindex on;
        }
```
## Reference

* https://github.com/liuxinyu95/unplugged
* https://github.com/newbieYoung/Threejs_rubik
* https://github.com/joews/rubik-js