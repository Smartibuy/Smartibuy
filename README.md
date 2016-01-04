Website of Smartibuy
==
[ ![Codeship Status for Smartibuy/Smartibuy](https://codeship.com/projects/ecd007a0-78aa-0133-9d23-42fad4cc0ef7/status?branch=master)](https://codeship.com/projects/118591)

http://smartibuy.herokuapp.com/

For development
==

After clone this repository, use `bundle` to install all dependences

```sh
$ bundle install
```
Use `rackup` to run the web app  (default port is 9292)
and visit the website http://localhost:port (http://localhost:9292)
that tells you the current API version and Github homepage of API.

```sh
$ rackup config.ru -p [port]
Thin web server (v1.6.4 codename Gob Bluth)
Maximum connections set to 1024
Listening on localhost:[port], CTRL+C to stop
```
**Use `rerun` gem to rackup server when everything change**
```sh
$ gem install rerun
$ rerun 'rackup config.ru -p [port] -E [env]'
```

If you want to run in test environment.
```sh
$ rackup config.ru -p 3000 -E test
```

Run testing

```sh
$ rake spec
```

LICENSE
==
MIT @ Smartibuy
