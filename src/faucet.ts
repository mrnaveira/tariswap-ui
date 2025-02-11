import {
  fromWorkspace,
  TariProvider,
  TransactionBuilder,
} from "@tari-project/tarijs";
import * as wallet from "./wallet.ts";

export async function createFaucet(
  provider: TariProvider,
  faucetTemplate: string,
  initialSupply: number,
  symbol: string
) {
  const account = await provider.getAccount();
  const builder = new TransactionBuilder().callFunction(
    {
      templateAddress: faucetTemplate,
      functionName: "mint_with_symbol",
    },
    [initialSupply, symbol]
  );
  const result = await wallet.submitTransactionAndWaitForResult({
    provider,
    account,
    builder,
    requiredSubstates: [{ substate_id: account.address }],
  });
  return result;
}

export async function takeFreeCoins(
  provider: TariProvider,
  faucetComponent: string
) {
  const account = await provider.getAccount();
  const builder = new TransactionBuilder()
    .callMethod(
      {
        componentAddress: faucetComponent,
        methodName: "take_free_coins",
      },
      []
    )
    .saveVar("coins")
    .callMethod(
      {
        componentAddress: account.address,
        methodName: "deposit",
      },
      [fromWorkspace("coins")]
    );
  const result = await wallet.submitTransactionAndWaitForResult({
    provider,
    account,
    builder,
    requiredSubstates: [
      { substate_id: account.address },
      { substate_id: faucetComponent },
    ],
  });
  return result;
}
