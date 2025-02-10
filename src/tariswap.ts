import {
  fromWorkspace,
  TariProvider,
  TransactionBuilder,
} from "@tari-project/tarijs";
import * as wallet from "./wallet.ts";
import * as cbor from "./cbor.ts";

export interface PoolProps {
  resourceA: string;
  resourceB: string;
  poolComponent: string;
}

export async function createPoolIndex(
  provider: TariProvider,
  pool_index_template: string,
  pool_template: string,
  market_fee: number
) {
  const account = await provider.getAccount();
  const builder = new TransactionBuilder().callFunction(
    {
      templateAddress: pool_index_template,
      functionName: "new",
    },
    [pool_template, market_fee]
  );
  const result = await wallet.submitTransactionAndWaitForResult({
    provider,
    account,
    builder,
    requiredSubstates: [{ substate_id: account.address }],
  });
  return result;
}

export async function createPool(
  provider: TariProvider,
  pool_index_component: string,
  tokenA: string,
  tokenB: string
) {
  const account = await provider.getAccount();
  const builder = new TransactionBuilder().callMethod(
    {
      componentAddress: pool_index_component,
      methodName: "create_pool",
    },
    [tokenA, tokenB]
  );
  const result = await wallet.submitTransactionAndWaitForResult({
    provider,
    account,
    builder,
    requiredSubstates: [
      { substate_id: account.address },
      { substate_id: pool_index_component },
    ],
  });
  return result;
}

export async function listPools(
  provider: TariProvider,
  pool_index_component: string
): Promise<PoolProps[]> {
  const substate = await wallet.getSubstate(provider, pool_index_component);

  // extract the map of pools from the index substate
  const component_body = substate.value.substate.Component.body.state.Map as {
    Text: string;
    Map: {
      Array: string[];
    }[][];
  }[][];
  const pools_field = component_body.find((field) => field[0].Text == "pools");
  if (!pools_field) {
    return [];
  }
  const pools_value = pools_field[1].Map;

  // extract the resource addresses and the pool component for each pool
  const pool_data = pools_value.map((value) => {
    const resource_pair = value[0].Array;
    const resourceA = cbor.convertCborValue(resource_pair[0]);
    const resourceB = cbor.convertCborValue(resource_pair[1]);
    const poolComponent = cbor.convertCborValue(value[1]);
    return { resourceA, resourceB, poolComponent };
  });

  return pool_data;
}

export async function getPoolLiquidityResource(
  provider: TariProvider,
  pool_component: string
) {
  const substate = await wallet.getSubstate(provider, pool_component);

  // extract the map of pools from the index substate
  const component_body = substate.value.substate.Component.body.state;
  const lpResource = cbor.getValueByPath(component_body, "$.lp_resource");

  return lpResource;
}

export async function addLiquidity(
  provider: TariProvider,
  pool_component: string,
  tokenA: string,
  amountTokenA: number,
  tokenB: string,
  amountTokenB: number
) {
  const account = await provider.getAccount();
  const builder = new TransactionBuilder()
    .callMethod(
      {
        componentAddress: account.address,
        methodName: "withdraw",
      },
      [tokenA, amountTokenA.toString()]
    )
    .saveVar("tokens_a")
    .callMethod(
      {
        componentAddress: account.address,
        methodName: "withdraw",
      },
      [tokenB, amountTokenB.toString()]
    )
    .saveVar("tokens_b")
    .callMethod(
      {
        componentAddress: pool_component,
        methodName: "add_liquidity",
      },
      [fromWorkspace("tokens_a"), fromWorkspace("tokens_b")]
    )
    .saveVar("tokens_lp")
    .callMethod(
      {
        componentAddress: account.address,
        methodName: "deposit",
      },
      [fromWorkspace("tokens_lp")]
    );
  const result = await wallet.submitTransactionAndWaitForResult({
    provider,
    account,
    builder,
    requiredSubstates: [
      { substate_id: account.address },
      { substate_id: pool_component },
    ],
  });
  return result;
}

export async function removeLiquidity(
  provider: TariProvider,
  pool_component: string,
  lpToken: string,
  amountLpToken: number
) {
  const account = await provider.getAccount();
  const builder = new TransactionBuilder()
    .callMethod(
      {
        componentAddress: account.address,
        methodName: "withdraw",
      },
      [lpToken, amountLpToken.toString()]
    )
    .saveVar("tokens_lp")
    .callMethod(
      {
        componentAddress: pool_component,
        methodName: "remove_liquidity",
      },
      [fromWorkspace("tokens_lp")]
    )
    .saveVar("buckets")
    .callMethod(
      {
        componentAddress: account.address,
        methodName: "deposit",
      },
      [fromWorkspace("buckets.0")]
    )
    .callMethod(
      {
        componentAddress: account.address,
        methodName: "deposit",
      },
      [fromWorkspace("buckets.1")]
    );
  const result = await wallet.submitTransactionAndWaitForResult({
    provider,
    account,
    builder,
    requiredSubstates: [
      { substate_id: account.address },
      { substate_id: pool_component },
    ],
  });
  return result;
}

export async function swap(
  provider: TariProvider,
  pool_component: string,
  inputToken: string,
  amountInputToken: number,
  outputToken: string
) {
  const account = await provider.getAccount();
  const builder = new TransactionBuilder()
    .callMethod(
      {
        componentAddress: account.address,
        methodName: "withdraw",
      },
      [inputToken, amountInputToken.toString()]
    )
    .saveVar("input_tokens")
    .callMethod(
      {
        componentAddress: pool_component,
        methodName: "swap",
      },
      [fromWorkspace("input_tokens"), outputToken]
    )
    .saveVar("output_tokens")
    .callMethod(
      {
        componentAddress: account.address,
        methodName: "deposit",
      },
      [fromWorkspace("output_tokens")]
    );

  const result = await wallet.submitTransactionAndWaitForResult({
    provider,
    account,
    builder,
    requiredSubstates: [
      { substate_id: account.address },
      { substate_id: pool_component },
    ],
  });
  return result;
}
