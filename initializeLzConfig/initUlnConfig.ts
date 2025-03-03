import { EndpointId } from "@layerzerolabs/lz-definitions";
import { Connection, Keypair } from "@solana/web3.js";

import {
  ClientControllerProgram,
  LzProgram,
} from "../../api/client-controller";
import { sendAndConfirm } from "./utils";

export async function initUlnConfig(
  connection: Connection,
  payer: Keypair,
  admin: Keypair,
  remote: EndpointId
): Promise<void> {
  const clientControllerProgram = new ClientControllerProgram.ClientController(
    ClientControllerProgram.PROGRAM_ID
  );
  const [id] = clientControllerProgram.idPDA();

  const current = await LzProgram.uln.getSendConfigState(
    connection,
    id,
    remote
  );
  if (current) {
    return Promise.resolve();
  }
  const ix = await LzProgram.endpoint.initOappConfig(
    admin.publicKey,
    LzProgram.uln,
    payer.publicKey,
    id,
    remote
  );
  await sendAndConfirm(connection, [payer, admin], [ix]);

  console.log(`Uln config for ${remote} initialized`);
}
