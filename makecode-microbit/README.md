
# Test MakeCode project

To build this project, install the makecode command line tool

```
npm install -g makecode
```

Then run `mkc` to build

```
mkc
```

To build and deploy,

```
mkc -d
```

If you are in a virtual machine without USB access, launch a webserver and navigate to `built/binary.hex` to download the generated hex file.

```
npx http-serve -c-1
```