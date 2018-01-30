# Launch Tracker Timeline Prototype.

A prototype for the launch tracker timeline functionality which uses D3 to
render launches positioned by date and categorised into features and
products.

[View prototype](https://s3.ap-southeast-2.amazonaws.com/demo-g-lt-timeline/index.html)

## Using the application

Install grunt

```
npm install -g grunt-cli
```

And then be sure to install everything that the repo requires:

```
npm install
```

Uses a local copy of selected modules from the Google closure library, which is
a dependency of the project into which this prototype will be added. This is
in ./lib/google-closure-library

### Development Mode

Run the following command to start the server and load in dev-mode.

```
grunt dev
```

You can now access the website at `http://localhost:8888`
