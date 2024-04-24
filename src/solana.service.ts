// Client

import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction
} from "@solana/web3.js";



import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { createInitializeMetadataPointerInstruction, createInitializeMintInstruction, ExtensionType, getMetadataPointerState, getMint, getMintLen, getTokenMetadata, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from "@solana/spl-token";
import { createInitializeInstruction, createUpdateFieldInstruction, pack, TokenMetadata } from "@solana/spl-token-metadata";
import "dotenv/config";


@Injectable()
export class SolanaService {

  // Connection to devnet cluster
  public connection: Connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  public totalSupplyToken = 6500000000000000000;

  constructor(private configService: ConfigService) {
    // this.main();
  } 

  public async main(){
    // Playground wallet

    const payer = getKeypairFromEnvironment('SECRET_KEY_WALLET');

    console.log("My address:", payer.publicKey.toString());
    const balance = await this.connection.getBalance(payer.publicKey);
    console.log(`My balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    
    
    
    // Transaction to send
    let transaction: Transaction;
    // Transaction signature returned from sent transaction
    let transactionSignature: string;

    // Generate new keypair for Mint Account
    const mintKeypair = Keypair.generate();
    console.log('mintKeypair', mintKeypair.publicKey);
    // Address for Mint Account
    const mint = mintKeypair.publicKey;
    // Decimals for Mint Account
    const decimals = 8;
    // Authority that can mint new tokens
    const mintAuthority = payer.publicKey;
    // Authority that can update the metadata pointer and token metadata
    const updateAuthority = payer.publicKey;
    
    // Metadata to store in Mint Account
    const metaData: TokenMetadata = {
      updateAuthority: updateAuthority,
      mint: mint,
      name: "COP",
      symbol: "COP",
      uri: "https://viktorhugo.github.io/developers/metadata.json",
      additionalMetadata: [["description", "Only Possible On Solana"]],
    };

    // Size of MetadataExtension 2 bytes for type, 2 bytes for length
    const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
    // Size of metadata
    const metadataLen = pack(metaData).length;
    console.log('metadataLen', metadataLen);
    // Size of Mint Account with extension
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    
    // Minimum lamports required for Mint Account
    const lamports = await this.connection.getMinimumBalanceForRentExemption(
      mintLen + metadataExtension + metadataLen,
    );

    // Instruction para invocar el programa del sistema para crear una cuenta
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payer.publicKey, // Account that will transfer lamports to created account
      newAccountPubkey: mint, // direccion de la cuenta a crear
      space: mintLen, // cantidad de bytes para asignar la cuenta creada
      lamports, // Amount of lamports transferred a la cuenta creada
      programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
    });

    // Instruction to initialize the MetadataPointer Extension
    const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(
      mint, // direccion de la cuenta Mint
      updateAuthority, // Autoridad que puede establecer la direccion de metadatos
      mint, // direccion de la cuenta que contiene los metadatos
      TOKEN_2022_PROGRAM_ID,
    );

    // Instruction to initialize Mint Account data
    const initializeMintInstruction = createInitializeMintInstruction(
      mint, // direccion de la cuenta Mint
      decimals, // Decimals of Mint
      mintAuthority, // Autoridad de la moneda designada
      null, // Optional Freeze Authority
      TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
    );

    // Instruction to initialize Metadata Account data
    const initializeMetadataInstruction = createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
      metadata: mint, // direccion de la cuenta que contiene los metadatos
      updateAuthority: updateAuthority, // Authority that can update the metadata
      mint: mint, // Mint Account address
      mintAuthority: mintAuthority, // Designated Mint Authority
      name: metaData.name,
      symbol: metaData.symbol,
      uri: metaData.uri,
    });

    // Instruction to update metadata, adding custom field
    const updateFieldInstruction = createUpdateFieldInstruction({
      programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
      metadata: mint, // Account address that holds the metadata
      updateAuthority: updateAuthority, // Authority that can update the metadata
      field: metaData.additionalMetadata[0][0], // key
      value: metaData.additionalMetadata[0][1], // value
    });

    // Add instructions to new transaction
    transaction = new Transaction().add(
      createAccountInstruction,
      initializeMetadataPointerInstruction,
      // note: las instrucciones anteriores son requeridas antes de inicializar mint
      initializeMintInstruction,
      initializeMetadataInstruction,
      updateFieldInstruction,
    );
    
    // Send transaction
    transactionSignature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [payer, mintKeypair], // Signers
    );
    
    console.log(
      "\nCreate Mint Account:",
      `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
    );



    const mintInfo = await getMint(
      this.connection,
      mint,
      "confirmed",
      TOKEN_2022_PROGRAM_ID,
    );


    
    // Retrieve and log the metadata pointer state
    const metadataPointer = getMetadataPointerState(mintInfo);
    console.log("\nMetadata Pointer:", JSON.stringify(metadataPointer, null, 2))

    const metadata = await getTokenMetadata(
      this.connection,
      mint, // Mint Account address
    );
    console.log("\nMetadata:", JSON.stringify(metadata, null, 2));

  }

}














// // Client

// import {
//   Connection,
//   Keypair,
//   SystemProgram,
//   Transaction,
//   clusterApiUrl,
//   sendAndConfirmTransaction,
// } from "@solana/web3.js";

// import {
//   ExtensionType,
//   TOKEN_2022_PROGRAM_ID,
//   createInitializeMintInstruction,
//   getMintLen,
//   createInitializeMetadataPointerInstruction,
//   getMint,
//   getMetadataPointerState,
//   getTokenMetadata,
//   TYPE_SIZE,
//   LENGTH_SIZE,
// } from "@solana/spl-token";

// import {
//   createInitializeInstruction,
//   createUpdateFieldInstruction,
//   createRemoveKeyInstruction,
//   pack,
//   TokenMetadata,
// } from "@solana/spl-token-metadata";

// // Playground wallet
// const payer = pg.wallet.keypair;

// console.log("My address:", pg.wallet.publicKey.toString());
// const balance = await pg.connection.getBalance(pg.wallet.publicKey);
// console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

// // Connection to devnet cluster
// const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// // Transaction to send
// let transaction: Transaction;
// // Transaction signature returned from sent transaction
// let transactionSignature: string;

// // Generate new keypair for Mint Account
// const mintKeypair = Keypair.generate();
// console.log("mintKeypair", mintKeypair);
// // Address for Mint Account
// const mint = mintKeypair.publicKey;
// // Decimals for Mint Account
// const decimals = 2;
// // Authority that can mint new tokens
// const mintAuthority = pg.wallet.publicKey;
// // Authority that can update the metadata pointer and token metadata
// const updateAuthority = pg.wallet.publicKey;

// // Metadata to store in Mint Account
// const metaData: TokenMetadata = {
//   updateAuthority: updateAuthority,
//   mint: mint,
//   name: "OPOS",
//   symbol: "OPOS",
//   uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json",
//   additionalMetadata: [["description", "Only Possible On Solana"]],
// };

// // Size of MetadataExtension 2 bytes for type, 2 bytes for length
// const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
// // Size of metadata
// const metadataLen = pack(metaData).length;
// console.log("metadataLen", metadataLen);
// // Size of Mint Account with extension
// const mintLen = getMintLen([ExtensionType.MetadataPointer]);

// // Minimum lamports required for Mint Account
// const lamports = await connection.getMinimumBalanceForRentExemption(
//   mintLen + metadataExtension + metadataLen
// );

// // Instruction to invoke System Program to create new account
// const createAccountInstruction = SystemProgram.createAccount({
//   fromPubkey: payer.publicKey, // Account that will transfer lamports to created account
//   newAccountPubkey: mint, // Address of the account to create
//   space: mintLen, // Amount of bytes to allocate to the created account
//   lamports, // Amount of lamports transferred to created account
//   programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
// });
// console.log("createAccountInstruction", createAccountInstruction);

// // Instruction to initialize the MetadataPointer Extension
// const initializeMetadataPointerInstruction =
//   createInitializeMetadataPointerInstruction(
//     mint, // Mint Account address
//     updateAuthority, // Authority that can set the metadata address
//     mint, // Account address that holds the metadata
//     TOKEN_2022_PROGRAM_ID
//   );

// // Instruction to initialize Mint Account data
// const initializeMintInstruction = createInitializeMintInstruction(
//   mint, // Mint Account Address
//   decimals, // Decimals of Mint
//   mintAuthority, // Designated Mint Authority
//   null, // Optional Freeze Authority
//   TOKEN_2022_PROGRAM_ID // Token Extension Program ID
// );

// // Instruction to initialize Metadata Account data
// const initializeMetadataInstruction = createInitializeInstruction({
//   programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
//   metadata: mint, // Account address that holds the metadata
//   updateAuthority: updateAuthority, // Authority that can update the metadata
//   mint: mint, // Mint Account address
//   mintAuthority: mintAuthority, // Designated Mint Authority
//   name: metaData.name,
//   symbol: metaData.symbol,
//   uri: metaData.uri,
// });

// // Instruction to update metadata, adding custom field
// const updateFieldInstruction = createUpdateFieldInstruction({
//   programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
//   metadata: mint, // Account address that holds the metadata
//   updateAuthority: updateAuthority, // Authority that can update the metadata
//   field: metaData.additionalMetadata[0][0], // key
//   value: metaData.additionalMetadata[0][1], // value
// });

// // Add instructions to new transaction
// transaction = new Transaction().add(
//   createAccountInstruction,
//   initializeMetadataPointerInstruction,
//   // note: the above instructions are required before initializing the mint
//   initializeMintInstruction,
//   initializeMetadataInstruction,
//   updateFieldInstruction
// );

// // Send transaction
// transactionSignature = await sendAndConfirmTransaction(
//   connection,
//   transaction,
//   [payer, mintKeypair] // Signers
// );

// console.log(
//   "\nCreate Mint Account:",
//   `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
// );

// const mintInfo = await getMint(
//   connection,
//   mint,
//   "confirmed",
//   TOKEN_2022_PROGRAM_ID
// );

// // Retrieve and log the metadata pointer state
// const metadataPointer = getMetadataPointerState(mintInfo);
// console.log("\nMetadata Pointer:", JSON.stringify(metadataPointer, null, 2));

// const metadata = await getTokenMetadata(
//   connection,
//   mint // Mint Account address
// );
// console.log("\nMetadata:", JSON.stringify(metadata, null, 2));
