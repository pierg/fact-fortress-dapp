# Demonstrate the sample contract in this directory by building, deploying and calling the contract
import algokit_utils

import ProofStorageContract
from build import build
import pytest
from algosdk import transaction
from algosdk.atomic_transaction_composer import (
    AtomicTransactionComposer,
    TransactionWithSigner,
)
from algosdk.dryrun_results import DryrunResponse
from algosdk.encoding import encode_address
from beaker import *

@pytest.fixture(scope="module")
def create_app():
    global accounts
    global creator_acct
    global app_client
    accounts = sorted(
        sandbox.get_accounts(),
        key=lambda a: sandbox.clients.get_algod_client().account_info(a.address)[
            "amount"
        ],
    )

    creator_acct = accounts.pop()

    app_client = client.ApplicationClient(
        app=open("./application.json").read(),
        client=sandbox.get_algod_client(),
        signer=creator_acct.signer,
    )

    app_client.create()

@pytest.fixture(scope="module")
def opt_in():
    global asa
    atc = AtomicTransactionComposer()

    # Create ASA
    asa_create = TransactionWithSigner(
        txn=transaction.AssetCreateTxn(
            sender=creator_acct.address,
            total=1,
            decimals=0,
            default_frozen=False,
            unit_name="BASA",
            asset_name="Beaker ASA",
            sp=app_client.get_suggested_params(),
        ),
        signer=creator_acct.signer,
    )

    atc.add_transaction(asa_create)
    tx_id = atc.execute(sandbox.get_algod_client(), 3).tx_ids[0]
    asa = sandbox.get_algod_client().pending_transaction_info(tx_id)["asset-index"]

    # Fund app with account MBR + ASA MBR
    app_client.fund(200_000)

    # Call opt_into_asset
    sp = app_client.get_suggested_params()
    sp.fee = sp.min_fee * 2
    app_client.call("opt_into_asset", asset=asa, suggested_params=sp)



def deploy() -> None:
    # build the app and get back the Path to app spec file
    app_spec_path = build()
    # Get LocalNet algod client
    algod_client = algokit_utils.get_algod_client(algokit_utils.AlgoClientConfig("http://localhost:4001", "a" * 64))
    # Get default account from LocalNet, this will be used as the signer
    account = algokit_utils.get_localnet_default_account(algod_client)
    # Create an Application client
    app_client = algokit_utils.ApplicationClient(
        algod_client=algod_client,
        app_spec=app_spec_path,
        signer=account,
    )

    # Deploy the app on-chain
    create_response = app_client.create()
    print(
        f"""Deployed app in txid {create_response.tx_id}
        App ID: {app_client.app_id} 
        Address: {app_client.app_address} 
    """
    )

    # Call the `hello` method
    # call_response = app_client.call(helloworld.hello, name="Beaker")
    call_response = app_client.call(ProofStorageContract.add, a=1, b=2)
    print(call_response.return_value)  



if __name__ == "__main__":
    deploy()
