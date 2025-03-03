import { EndpointId } from "@layerzerolabs/lz-definitions";
import { Connection, Keypair } from "@solana/web3.js";

import {
  ClientControllerProgram,
  LzProgram,
} from "../../api/client-controller";
import { sendAndConfirm } from "./utils";

export async function setSendLibrary(
  connection: Connection,
  admin: Keypair,
  remote: EndpointId
): Promise<void> {
  const clientControllerProgram = new ClientControllerProgram.ClientController(
    ClientControllerProgram.PROGRAM_ID
  );
  const [id] = clientControllerProgram.idPDA();
  const sendLib = await LzProgram.endpoint.getSendLibrary(
    connection,
    id,
    remote
  );
  const current = sendLib ? sendLib.msgLib.toBase58() : "";
  const [expectedSendLib] = LzProgram.uln.deriver.messageLib();
  const expected = expectedSendLib.toBase58();
  if (current === expected) {
    return Promise.resolve();
  }
  const ix = await LzProgram.endpoint.setSendLibrary(
    admin.publicKey,
    id,
    LzProgram.uln.program,
    remote
  );
  await sendAndConfirm(connection, [admin], [ix]);

  console.log(`Send library for ${remote} set`);
}
