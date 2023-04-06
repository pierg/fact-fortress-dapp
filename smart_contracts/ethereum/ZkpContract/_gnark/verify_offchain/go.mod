module github.com/pierg/zkp-hackathon/gnark/verify

go 1.20

replace github.com/pierg/zkp-hackathon/gnark/common v0.0.0 => ./../common

require (
	github.com/consensys/gnark v0.8.0
	github.com/consensys/gnark-crypto v0.9.1
	github.com/fatih/color v1.15.0
	github.com/pierg/zkp-hackathon/gnark/common v0.0.0
)

require (
	github.com/blang/semver/v4 v4.0.0 // indirect
	github.com/consensys/bavard v0.1.13 // indirect
	github.com/fxamacker/cbor/v2 v2.4.0 // indirect
	github.com/google/pprof v0.0.0-20230207041349-798e818bf904 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.17 // indirect
	github.com/mmcloughlin/addchain v0.4.0 // indirect
	github.com/rs/zerolog v1.29.0 // indirect
	github.com/x448/float16 v0.8.4 // indirect
	golang.org/x/sys v0.6.0 // indirect
	rsc.io/tmplfunc v0.0.3 // indirect
)
