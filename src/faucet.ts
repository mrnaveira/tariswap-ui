import { fromWorkspace, TariProvider, TransactionBuilder } from "@tari-project/tarijs";
import * as wallet from "./wallet.ts";

export async function createFaucet(provider: TariProvider, faucet_template: string, initial_supply: number, symbol: string) {
    const account = await provider.getAccount();
    const builder = new TransactionBuilder().callFunction(
      {
        templateAddress: faucet_template,
        functionName: "mint_with_symbol",
      },
      [initial_supply, symbol]
    );
    const result = await wallet.submitTransactionAndWaitForResult({
      provider,
      account,
      builder,
      requiredSubstates: [{substate_id: account.address}],
    });
    return result;
}

export async function takeFreeCoins(provider: TariProvider, faucet_component: string) {
    const account = await provider.getAccount();
    const builder = new TransactionBuilder().callMethod({
      componentAddress: faucet_component,
      methodName: "take_free_coins",
    }, [])
    .saveVar("coins")
    .callMethod({
      componentAddress: account.address,
      methodName: "deposit",
    }, [fromWorkspace("coins")])
    ;
    const result = await wallet.submitTransactionAndWaitForResult({
      provider,
      account,
      builder,
      requiredSubstates: [
        { substate_id: account.address },
        { substate_id: faucet_component },
      ],
    });
    return result;
}
