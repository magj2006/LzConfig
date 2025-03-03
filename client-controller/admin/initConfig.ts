import {
  arrayify,
  hexZeroPad,
} from '@ethersproject/bytes';
import { EndpointId } from '@layerzerolabs/lz-definitions';
import {
  Connection,
  Keypair,
  PublicKey,
} from '@solana/web3.js';

import {
  ClientControllerProgram,
  LzProgram,
} from '../../../api/client-controller';
import {
  initOappNonce,
  initReceiveLibrary,
  initSendLibrary,
  initUlnConfig,
  sendAndConfirm,
  setOappExecutor,
  setReceiveLibrary,
  setSendLibrary,
} from '../../initializeLzConfig';
import {
  getDelegate,
  getPayer,
} from '../../utils';

const connection = new Connection(
  "https://quaint-muddy-fog.solana-devnet.quiknode.pro/53cdb6b31c73bc2426e57ab7eb5661cd54b78a0f"
);
// const connection = new Connection("http://0.0.0.0:8899", "confirmed");

const remotePeers: { [key in EndpointId]?: string } = {
  [EndpointId.EXOCORE_V2_TESTNET]: "0xdDf5218Dbff297ADdF17fB7977E2469D774545ED", // EVM counter addr
};

const clientControllerProgram = new ClientControllerProgram.ClientController(
  ClientControllerProgram.PROGRAM_ID
);

(async () => {
  const payer = await getPayer();
  const delegate = await getDelegate();

  await initClientController(connection, payer, delegate.publicKey);

  for (const [remoteStr, remotePeer] of Object.entries(remotePeers)) {
    const remotePeerBytes = arrayify(hexZeroPad(remotePeer, 32));
    const remote = parseInt(remoteStr) as EndpointId;
    await setPeers(connection, delegate, remote, remotePeerBytes);
    await initSendLibrary(connection, delegate, remote);
    await initReceiveLibrary(connection, delegate, remote);
    await initOappNonce(connection, delegate, remote, remotePeerBytes);
    await setSendLibrary(connection, delegate, remote);
    await setReceiveLibrary(connection, delegate, remote);
    await initUlnConfig(connection, payer, delegate, remote);
    await setOappExecutor(connection, delegate, remote);
  }
})();

async function initClientController(
  connection: Connection,
  payer: Keypair,
  delegate: PublicKey
): Promise<void> {
  // const [idPDA] = clientControllerProgram.idPDA();
  const ix = await clientControllerProgram.initConfig(
    connection,
    payer.publicKey,
    delegate,
    LzProgram.endpoint
  );

  await sendAndConfirm(connection, [payer], [ix]);

  console.log(`Client controller initialized`);
}

async function setPeers(
  connection: Connection,
  admin: Keypair,
  remote: EndpointId,
  remotePeer: Uint8Array
): Promise<void> {
  const [idPDA] = clientControllerProgram.idPDA();
  const ix = clientControllerProgram.setRemote(
    admin.publicKey,
    remote,
    remotePeer
  );
  let current = "";
  try {
    const info = await connection.getAccountInfo(idPDA, {
      commitment: "confirmed",
    });
    current = Buffer.from(info.data).toString("hex");
  } catch (e) {
    /*remote not init*/
  }
  if (current == Buffer.from(remotePeer).toString("hex")) {
    return Promise.resolve();
  }
  await sendAndConfirm(connection, [admin], [ix]);

  console.log(`Remote ${remote} set`);
}
