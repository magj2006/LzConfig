import { EndpointId } from "@layerzerolabs/lz-definitions";
import {
  ExecutorPDADeriver,
  SetConfigType,
  UlnProgram,
} from "@layerzerolabs/lz-solana-sdk-v2";
import { Connection, Keypair } from "@solana/web3.js";

import {
  ClientControllerProgram,
  LzProgram,
} from "../../api/client-controller";
import { sendAndConfirm } from "./utils";

export async function setOappExecutor(
  connection: Connection,
  admin: Keypair,
  remote: EndpointId
): Promise<void> {
  const clientControllerProgram = new ClientControllerProgram.ClientController(
    ClientControllerProgram.PROGRAM_ID
  );
  const [id] = clientControllerProgram.idPDA();
  const defaultOutboundMaxMessageSize = 10000;

  const [executorPda] = new ExecutorPDADeriver(LzProgram.executor).config();
  const expected: UlnProgram.types.ExecutorConfig = {
    maxMessageSize: defaultOutboundMaxMessageSize,
    executor: executorPda,
  };

  const current = (
    await LzProgram.uln.getSendConfigState(connection, id, remote)
  )?.executor;
  const ix = await LzProgram.endpoint.setOappConfig(
    connection,
    admin.publicKey,
    id,
    LzProgram.uln.program,
    remote,
    {
      configType: SetConfigType.EXECUTOR,
      value: expected,
    }
  );
  if (
    current &&
    current.executor.toBase58() === expected.executor.toBase58() &&
    current.maxMessageSize === expected.maxMessageSize
  ) {
    return Promise.resolve();
  }
  await sendAndConfirm(connection, [admin], [ix]);

  console.log(`Oapp executor for ${remote} set`);
}
