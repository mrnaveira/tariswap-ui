# tariswap-ui

This project implements a web interface using [Vite](https://vitejs.de) for the [`tariswap`](https://github.com/tari-project/test-templates) Tari template.

The `tariswap` template implements a decentralized exchange smart contract on the Tari network, using a constant-product automated market maker. It allows swapping tokens, adding liquidity and removing liquidity.

# Getting Started

We need a running Tari network with the following:
* A deployed [Tari Metamask Snap](https://github.com/tari-project/tari-snap)
* Both `tariswap_index` and `tariswap_pool` templates deployed. The code can be found in the Tari [test-templates](https://github.com/tari-project/test-templates/tree/main/src/tariswap/templates) repository.
* The `faucet` template deployed. It can be found in the Tari [template_test_tooling](https://github.com/tari-project/tari-dan/tree/development/dan_layer/template_test_tooling/templates/faucet) crate.

Copy the `.env.example` file to `.env` and edit the correct environment variable values.

For the `VITE_POOL_INDEX_COMPONENT` variable we have a bit of a chicken-and-egg situation. One way to solve this is by running the web (leaving that envvar empty) and create a new index component using the `Utilitites -> Create New Index Component` section in the web. Then set the environment value and restart the web.

To run the web:
```shell
npm install
npm run dev
```


