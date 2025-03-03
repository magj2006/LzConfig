import { EndpointId } from "@layerzerolabs/lz-definitions";
import { Connection, Keypair } from "@solana/web3.js";

import {
  ClientControllerProgram,
  LzProgram,
} from "../../api/client-controller";
import { sendAndConfirm } from "./utils";

export async function initReceiveLibrary(
  connection: Connection,
  admin: Keypair,
  remote: EndpointId
): Promise<void> {
  const clientControllerProgram = new ClientControllerProgram.ClientController(
    ClientControllerProgram.PROGRAM_ID
  );
  const [id] = clientControllerProgram.idPDA();
  const ix = await LzProgram.endpoint.initReceiveLibrary(
    connection,
    admin.publicKey,
    id,
    remote
  );
  if (ix == null) {
    return Promise.resolve();
  }
  await sendAndConfirm(connection, [admin], [ix]);

  console.log(`Receive library for ${remote} initialized`);
}
