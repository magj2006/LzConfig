import { EndpointId } from "@layerzerolabs/lz-definitions";
import { Connection, Keypair } from "@solana/web3.js";

import {
  ClientControllerProgram,
  LzProgram,
} from "../../api/client-controller";
import { sendAndConfirm } from "./utils";

export async function initOappNonce(
  connection: Connection,
  admin: Keypair,
  remote: EndpointId,
  remotePeer: Uint8Array
): Promise<void> {
  const clientControllerProgram = new ClientControllerProgram.ClientController(
    ClientControllerProgram.PROGRAM_ID
  );
  const [id] = clientControllerProgram.idPDA();
  const ix = await LzProgram.endpoint.initOAppNonce(
    connection,
    admin.publicKey,
    remote,
    id,
    remotePeer
  );
  if (ix === null) return Promise.resolve();
  const current = false;
  try {
    const nonce = await LzProgram.endpoint.getNonce(
      connection,
      id,
      remote,
      remotePeer
    );
    if (nonce) {
      console.log("nonce already set");
      return Promise.resolve();
    }
  } catch (e) {
    /*nonce not init*/
  }
  await sendAndConfirm(connection, [admin], [ix]);

  console.log(`Oapp nonce for ${remote} initialized`);
}
