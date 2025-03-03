import { EndpointId } from "@layerzerolabs/lz-definitions";
import { Connection, Keypair } from "@solana/web3.js";

import {
  ClientControllerProgram,
  LzProgram,
} from "../../api/client-controller";
import { sendAndConfirm } from "./utils";

export async function setReceiveLibrary(
  connection: Connection,
  admin: Keypair,
  remote: EndpointId
): Promise<void> {
  const clientControllerProgram = new ClientControllerProgram.ClientController(
    ClientControllerProgram.PROGRAM_ID
  );
  const [id] = clientControllerProgram.idPDA();
  const receiveLib = await LzProgram.endpoint.getReceiveLibrary(
    connection,
    id,
    remote
  );
  const current = receiveLib ? receiveLib.msgLib.toBase58() : "";
  const [expectedMessageLib] = LzProgram.uln.deriver.messageLib();
  const expected = expectedMessageLib.toBase58();
  if (current === expected) {
    return Promise.resolve();
  }
  const ix = await LzProgram.endpoint.setReceiveLibrary(
    admin.publicKey,
    id,
    LzProgram.uln.program,
    remote
  );
  await sendAndConfirm(connection, [admin], [ix]);

  console.log(`Receive library for ${remote} set`);
}
