import beaker as bk
import pyteal as pt
from beaker.lib.storage import BoxList, BoxMapping

class MyState:
    result = bk.GlobalStateValue(pt.TealType.uint64)

    # Map: tokenId - Address of the Hospital
    publicKeys = bk.ReservedGlobalStateValue(
        stack_type=pt.abi.String,
        max_keys=32,
        descr="A reserved app state variable, with 32 possible keys",
    )

app = bk.Application("ProofStorageContract", state=MyState())

@app.external#(authorize=beaker.Authorize.only_creator())
def add(a: pt.abi.Uint64, b: pt.abi.Uint64, *, output: pt.abi.Uint64) -> pt.Expr:
    add_result = a.get() + b.get()
    return pt.Seq(
        app.state.result.set(add_result),
        output.set(add_result)
    )

@app.external
def read_result(*, output: pt.abi.Uint64) -> pt.Expr:
    return output.set(app.state.result)



@app.external
def set_reserved_global_state_publicKeys(tokenId: pt.abi.Uint8, publicKeyHospital: pt.abi.String) -> pt.Expr:
    return app.state.reserved_global_value[tokenId].set(publicKeyHospital.get())


@app.external(read_only=True)
def get_reserved_global_state_publicKeys(tokenId: pt.abi.Uint8, *, publicKeyHospital: pt.abi.String) -> pt.Expr:
    return publicKeyHospital.set(app.state.reserved_global_value[tokenId])



# if __name__ == "__main__":
#     spec = app.build()
#     spec.export("artifacts")


