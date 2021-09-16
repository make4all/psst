# sonification
Repository for sonification
## build instructions
We use node LTS 14.17.5. We recommend using [NVM](https://github.com/nvm-sh/nvm) to use multiple versions of node if you use a different version for other projects. The code goes into src/lib.ts.
1. run yarn install to install dependencies.
2. run yarn build to transpile ts code to js code.
3. run yarn start to start a node server and run the compiled lib.js file.
4. run yarn dev to do on-the-fly transpiling, only for quick development.

## bundling

Run yarn bundle to generate the bundles for the npm package.

*Please make sure yarn build works before you commit until we setup CI/CD to ensure this.*