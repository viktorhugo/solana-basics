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
import { createInitializeMetadataPointerInstruction, createInitializeMintInstruction, ExtensionType, getMetadataPointerState, getMint, getMintLen, getOrCreateAssociatedTokenAccount, getTokenMetadata, LENGTH_SIZE, mintTo, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from "@solana/spl-token";
import { createInitializeInstruction, createUpdateFieldInstruction, pack, TokenMetadata } from "@solana/spl-token-metadata";
import "dotenv/config";


@Injectable()
export class SolanaService {

  // Connection to devnet cluster
  public connection: Connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  public totalSupplyToken = 6500000000000000000;

  constructor(private configService: ConfigService) {
    // this.mintToken();
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

    //! 1. =======================================  Mint Setup ==================================================
    //* defina las propiedades de la cuenta Mint que crearemos en el siguiente paso.

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
      additionalMetadata: [
        ["description", "Capybara Token Currency"],
        ["autor", "Victor hugo mosquera A."],
        ["company", "VmBross"],
      ],
    };

    //* se determina el tamaño de la nueva Cuenta Mint y calcule los lamports mínimos necesarios para la exención del alquiler (rent exemption).
    //* En el fragmento de código siguiente, asignamos 4 bytes para la TokenMetadataextensión y luego calculamos el espacio requerido por los metadatos.
    //* Con las extensiones de token, el tamaño de la cuenta Mint variará según las extensiones habilitadas.

    // Size of Mint Account with extension
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    // Size of MetadataExtension 2 bytes for type, 2 bytes for length
    const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
    // Size of metadata
    const metadataLen = pack(metaData).length;
    console.log('metadataLen', metadataLen);
    // Minimum lamports required for Mint Account
    const lamports = await this.connection.getMinimumBalanceForRentExemption(
      mintLen + metadataExtension + metadataLen,
    );


    //! 2. ========================================== Build Instructions  ============================================

    //* A continuación, creemos el conjunto de instrucciones para:

    //* Crea una cuenta nueva
    //* Inicializar la MetadataPointerextensión
    //* Inicialice los datos restantes de la cuenta Mint
    //* Inicializar la TokenMetadataextensión y los metadatos del token
    //* Actualice los metadatos del token con un campo personalizado
    //* Primero, cree la instrucción para invocar el Programa del sistema para crear una cuenta y asignar propiedad al Programa de extensiones de token.


    //* Primero, cree la instrucción para invocar el Programa del sistema para crear una cuenta y 
    //* asignar la propiedad al Token Extensions Program.
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payer.publicKey, // Account that will transfer lamports to created account
      newAccountPubkey: mint, // direccion de la cuenta a crear
      space: mintLen, // cantidad de bytes para asignar la cuenta creada
      lamports, // Amount of lamports transferred a la cuenta creada
      programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
    });

    //* A continuación, cree la instrucción para inicializar la MetadataPointerextensión de la cuenta
    //* Mint. En este ejemplo, el puntero de metadatos apuntará a la dirección de Mint, lo que indica que
    //* los metadatos se almacenarán directamente en la cuenta de Mint.
    const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(
      mint, // direccion de la cuenta Mint
      updateAuthority, // Autoridad que puede establecer la direccion de metadatos
      mint, // direccion de la cuenta que contiene los metadatos
      TOKEN_2022_PROGRAM_ID,
    );

    //* A continuación, cree la instrucción para inicializar el resto de los datos de la cuenta Mint.
    //* Esto es lo mismo que con el Programa de Tokens original.
    const initializeMintInstruction = createInitializeMintInstruction(
      mint, // direccion de la cuenta Mint
      decimals, // Decimals of Mint
      mintAuthority, // Autoridad de la moneda designada
      null, // Optional Freeze Authority
      TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
    );

    //* A continuación, cree la instrucción para inicializar la TokenMetadataextensión y los campos de metadatos requeridos (nombre, símbolo, URI).
    //* Para esta instrucción, utilice el Programa de Extensiones de Token como programId, que funciona como el "Programa de Metadatos". Además, 
    //* la dirección de la cuenta Mint se utiliza para (metadata) indicar que la propia Mint es la "Metadata Account".
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

    //* A continuación, cree la instrucción para actualizar los metadatos con un campo personalizado 
    //* utilizando las UpdateFieldinstrucciones de la interfaz de metadatos del token.
    // * Esta instrucción actualizará el valor de un campo existente o lo agregará (additional_metadata) si aún no existe.
    //* Tenga en cuenta que es posible que necesite reasignar más espacio a la cuenta para acomodar los datos adicionales.
    //* En este ejemplo, asignamos todos los lamports necesarios para el alquiler por adelantado al crear la cuenta.
    const updateFieldInstruction1 = createUpdateFieldInstruction({
      programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
      metadata: mint, // Account address that holds the metadata
      updateAuthority: updateAuthority, // Authority that can update the metadata
      field: metaData.additionalMetadata[0][0], // key
      value: metaData.additionalMetadata[0][1], // value
    });

    const updateFieldInstruction2 = createUpdateFieldInstruction({
      programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
      metadata: mint, // Account address that holds the metadata
      updateAuthority: updateAuthority, // Authority that can update the metadata
      field: metaData.additionalMetadata[1][0], // key
      value: metaData.additionalMetadata[1][1], // value
    });

    const updateFieldInstruction3 = createUpdateFieldInstruction({
      programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
      metadata: mint, // Account address that holds the metadata
      updateAuthority: updateAuthority, // Authority that can update the metadata
      field: metaData.additionalMetadata[2][0], // key
      value: metaData.additionalMetadata[2][1], // value
    });

    //! 3. ========================================== SEND TRANSACTION  ============================================

    //* Luego, agregue las instrucciones a una nueva transacción y envíela a la red. Esto creará una cuenta Mint con 
    //* las extensiones (MetadataPointer) y (TokenMetadata) habilitadas y almacenará los metadatos en la cuenta Mint.
    transaction = new Transaction().add(
      createAccountInstruction,
      initializeMetadataPointerInstruction,
      // note: las instrucciones anteriores son requeridas antes de inicializar mint
      initializeMintInstruction,
      initializeMetadataInstruction,
      updateFieldInstruction1,
      updateFieldInstruction2,
      updateFieldInstruction3
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

    //! 4. ========================================== Read Metadata from Mint Account  ============================================
    //* A continuación, verifique que los metadatos se hayan almacenado en la cuenta Mint.
    //* Comience por buscar la cuenta Mint y leer la (MetadataPointer) parte de extensión de los datos de la cuenta:
    const mintInfo = await getMint(
      this.connection,
      mint,
      "confirmed",
      TOKEN_2022_PROGRAM_ID,
    );
    console.log("\nmintInfo:", mintInfo);
    
    // Retrieve and log the metadata pointer state
    const metadataPointer = getMetadataPointerState(mintInfo);
    console.log("\nMetadata Pointer:", JSON.stringify(metadataPointer, null, 2))

    //* lea la parte de Metadatos de los datos de la cuenta:
    const metadata = await getTokenMetadata(
      this.connection,
      mint, // Mint Account address
    );
    console.log("\nMetadata:", JSON.stringify(metadata, null, 2));

    //* Create associate account
    const AssociateTokenAccount = await getOrCreateAssociatedTokenAccount( 
      this.connection,   // Connection to use
      payer,   //Payer of the transaction and initialization fees
      mint,   // Mint associated with the account to set or verify
      mintAuthority,  // Owner of the account to set or verify
      false,  //Allow the owner account to be a PDA (Program Derived Address)
      null,  //Desired level of commitment for querying the state
      {},  //Options for confirming the transaction
      TOKEN_2022_PROGRAM_ID,  //SPL Token program account
      // ASSOCIATED_TOKEN_PROGRAM_ID  //SPL Associated Token program account
    );
    console.log('tokenAccount CREATED', AssociateTokenAccount);

    //* =========== Mint Tokens ===========================
    // Minting tokens is the process of issuing new tokens into circulation. 
    const minto = await mintTo(
      this.connection, 
      payer, // the account of the payer for the transaction
      mint, // the token mint that the new token account is associated with
      AssociateTokenAccount.address, //the token account that tokens will be minted to
      payer.publicKey, // the account authorized to mint tokens
      BigInt(6500000000000000000), // the raw amount of tokens to mint outside of decimals.
      [payer],
      {},
      TOKEN_2022_PROGRAM_ID
    );
  
    console.log(
      `Mint Token Transaction: https://explorer.solana.com/tx/${minto}?cluster=devnet`,
    );

  }


  public async mintToken() {
    try {
      const payer = getKeypairFromEnvironment('SECRET_KEY_WALLET');
      const mint = getKeypairFromEnvironment('SECRET_KEY_TOKEN_CAPY');
      //* =========== Mint Tokens ===========================
        // Minting tokens is the process of issuing new tokens into circulation. 
        const txSignature = await mintTo(
          this.connection, 
          payer, // the account of the payer for the transaction
          mint.publicKey, // the token mint that the new token account is associated with
          mint.publicKey, //the token account that tokens will be minted to
          payer.publicKey, // the account authorized to mint tokens
          BigInt(6500000000000000000), // the raw amount of tokens to mint outside of decimals.
          [payer, mint],
          {},
          TOKEN_2022_PROGRAM_ID
        );
        console.log(txSignature);
    } catch (error) {
      console.log(error);
      
    }
  }

}
