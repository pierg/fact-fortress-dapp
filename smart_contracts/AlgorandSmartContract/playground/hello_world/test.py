import beaker as bk
import pyteal as pt


class MyState:
    result = bk.GlobalStateValue(pt.TealType.uint64)

app = bk.Application("test", state=MyState())

@app.external
def add(a: pt.abi.Uint64, b: pt.abit.Uint64, *, output: pt.abi.Uint64) -> pt.Expr:
    add_result = a.get() + b.get()
    return pt.Seq(
        app.state.result.set(add_result),
        output.set(add_result)
    )

@app.external
def read_result(*, output: pt.abi.Uint64) -> pt.Expr:
    return output.set(app.state.result)

@app.external
def getPublicKey(userAddress:  pt.abi.)



# if __name__ == "__main__":
#     spec = app.build()
#     spec.export("artifacts")


# function getPublicKey(address userAddress, string memory name)


# function setPublicKey(string memory name, string memory publicKey) 

# function authorizeUser(address userAddress) publ

#  function revokeUser(address userAddress) public {

#     function isUserAuthorized(address userAddress