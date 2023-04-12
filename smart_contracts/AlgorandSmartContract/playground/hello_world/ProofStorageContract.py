import beaker as bk
import pyteal as pt
from typing import Final

class MyState:
    result = bk.GlobalStateValue(pt.TealType.uint64)

    # Map: tokenId - Address of the Hospital
    # publicKeys = bk.ReservedGlobalStateValue(
    #     stack_type=pt.Bytes,
    #     max_keys=32,
    #     descr="A reserved app state variable, with 32 possible keys",
    # )
    asa_amt = Final[bk.GlobalStateValue] = bk.GlobalStateValue(
        stack_type=pt.TealType.Uint64,
        default=pt.Int(0),
        descr="Total amount of the ASA",
    )
    asa = Final[bk.GlobalStateValue] = bk.GlobalStateValue(
        stack_type=pt.TealType.Uint64,
        default=pt.Int(0),
        descr="ID of the ASA",
    )

app = bk.Application("ProofStorageContract", state=MyState())

#Create the contract
@app.create(bare=True)
def create() -> pt.Expr:
    #setup the global state
    return app.initialize_global_state()

#Opt the CONTRACT ADDRESS into the asset
@app.external(authorize=bk.Authorize.only(bk.Global.creator_address())) #only the creator can call this method to allow the contract address to optin to the contract
def opt_into_asset(asset: pt.abi.Asset) -> pt.Expr:
    return pt.Seq(
        pt.Assert(app.state.asa==pt.Int(0)), #verify not already opted in and check that the asset opted in is only one
        app.state.asa.set(asset.asset_id()), #save ASA in global state
        pt.InnerTxnBuilder.Execute( #submit optin: it is a 0 ASSET TRANSFER from one address to itself. Innertx: the contract itself is sending the transaction
            {
                pt.TxnField.type_enum: pt.TxnType.AssetTransfer,
                pt.TxnField.fee: pt.Int(0),
                pt.TxnField.asset_receiver: bk.Global.current_application_address(),
                pt.TxnField.xfer_asset: asset.asset_id(),
                pt.TxnField.amount: pt.Int(0),
            }
        ),

    )   

@app.external(authorize=bk.Authorize.only(bk.Global.creator_address()))
def insert_proof(axfer: pt.abi.AssetTransferTransaction) -> pt.Expr:
    return pt.Seq(
        pt.Assert(axfer.get().asset_receiver() == bk.Global.current_application_address()),
        pt.Assert(axfer.get().xfer_asset() == app.state.asa()),
        app.state.asa_amt.set(axfer.get().asset_amount()),
    )
 
@Subroutine(pt.Tealtype.none) #Private method
def pay(receiver: pt.Expr, amount: pt.Expr) -> pt.Expr:
    return pt.InnerTxBuilder.Execute(
        {
            pt.TxnField.type_enum: pt.TxnType.Payment,
            pt.TxnField.receiver: receiver,
            pt.TxnField.amount: amount,
            pt.TxnField.fee: pt.Int(0),
        }
    )


@app.external#(authorize=beaker.Authorize.only_creator())
def add(a: pt.abi.Uint64, b: pt.abi.Uint64, *, output: pt.abi.Uint64) -> pt.Expr:
    #add_result = a.get() + b.get()
    # return pt.Seq(
    #     app.state.result.set(add_result),
    #     output.set(add_result)
    # )
    return output.set(a.get() + b.get())

# @app.external
# def read_result(*, output: pt.abi.Uint64) -> pt.Expr:
#     return output.set(app.state.result)



# @app.external
# def set_reserved_global_state_publicKeys(tokenId: pt.abi.Uint8, publicKeyHospital: pt.abi.String) -> pt.Expr:
#     return app.state.reserved_global_value[tokenId].set(publicKeyHospital.get())


# @app.external(read_only=True)
# def get_reserved_global_state_publicKeys(tokenId: pt.abi.Uint8, *, publicKeyHospital: pt.abi.String) -> pt.Expr:
#     return publicKeyHospital.set(app.state.reserved_global_value[tokenId])



# if __name__ == "__main__":
#     spec = app.build()
#     spec.export("artifacts")


