import { buildVersionedTransaction } from "@layerzerolabs/lz-solana-sdk-v2";
import { Connection, Keypair, TransactionInstruction } from "@solana/web3.js";

export async function sendAndConfirm(
  connection: Connection,
  signers: Keypair[],
  instructions: TransactionInstruction[]
): Promise<void> {
  const tx = await buildVersionedTransaction(
    connection,
    signers[0].publicKey,
    instructions,
    "confirmed"
  );
  tx.sign(signers);

  try {
    const hash = await connection.sendTransaction(tx, {
      skipPreflight: true,
      // preflightCommitment: "confirmed",
    });

    console.log(`Transaction sent: ${hash}`);
  } catch (error) {
    console.error(error);
  }

  await new Promise((resolve) => setTimeout(resolve, 3000));

  // await connection.confirmTransaction(hash, "confirmed");
}
