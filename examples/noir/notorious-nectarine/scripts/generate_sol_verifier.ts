import { resolve, join } from 'path';
import { compile, acir_to_bytes } from '@noir-lang/noir_wasm';
import { setup_generic_prover_and_verifier } from '@noir-lang/barretenberg/dest/client_proofs';
import { writeFileSync } from 'fs';

async function generate_sol_verifier() {
  let compiled_program = compile(resolve(__dirname, '../src/main.nr'));
  const acir = compiled_program.circuit;

  let [_, verifier] = await setup_generic_prover_and_verifier(acir);

  const sc = verifier.SmartContract();
  syncWriteFile("../contracts/plonk_vk.sol", sc);
  syncWriteFile('../contracts/plonk_vk.acir', acir_to_bytes(acir))

  console.log('done writing sol verifier');
}

function syncWriteFile(filename: string, data: any) {
  writeFileSync(join(__dirname, filename), data, {
    flag: 'w',
  });
}

generate_sol_verifier().then(() => process.exit(0)).catch(console.log);