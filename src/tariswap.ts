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
  poolIndexTemplate: string,
  poolTemplate: string,
  marketFee: number
) {
  const account = await provider.getAccount();
  const builder = new TransactionBuilder().callFunction(
    {
      templateAddress: poolIndexTemplate,
      functionName: "new",
    },
    [poolTemplate, marketFee]
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
  poolIndexComponent: string,
  tokenA: string,
  tokenB: string
) {
  const account = await provider.getAccount();
  const builder = new TransactionBuilder().callMethod(
    {
      componentAddress: poolIndexComponent,
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
      { substate_id: poolIndexComponent },
    ],
  });
  return result;
}

export async function listPools(
  provider: TariProvider,
  poolIndexComponent: string
): Promise<PoolProps[]> {
  const substate = await wallet.getSubstate(provider, poolIndexComponent);

  const state = cbor.convertCborValue(substate.value.substate.Component.body.state);
  const pools = state["pools"] as Record<string, string> | undefined;
  if (!pools) {
    return [];
  }

  return Object.entries(pools).map(([resources, poolComponent]) => {
    const [resourceA, resourceB] = resources.split(",");
    return { resourceA, resourceB, poolComponent };
  });
}

export async function getPoolLiquidityResource(
  provider: TariProvider,
  poolComponent: string
) {
  const substate = await wallet.getSubstate(provider, poolComponent);

  const componentBody = substate.value.substate.Component.body.state;
  const lpResource = cbor.getValueByPath(componentBody, "$.lp_resource");

  return lpResource;
}

export async function addLiquidity(
  provider: TariProvider,
  poolComponent: string,
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
        componentAddress: poolComponent,
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
      { substate_id: poolComponent },
    ],
  });
  return result;
}

export async function removeLiquidity(
  provider: TariProvider,
  poolComponent: string,
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
        componentAddress: poolComponent,
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
      { substate_id: poolComponent },
    ],
  });
  return result;
}

export async function swap(
  provider: TariProvider,
  poolComponent: string,
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
        componentAddress: poolComponent,
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
      { substate_id: poolComponent },
    ],
  });
  return result;
}
