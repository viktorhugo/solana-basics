import * as borsh from "@coral-xyz/borsh";
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { airdropIfRequired, getKeypairFromEnvironment } from '@solana-developers/helpers';
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';

import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, createApproveInstruction, createAssociatedTokenAccountInstruction, createBurnInstruction, createInitializeAccountInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, createMint, createMintToInstruction, createRevokeInstruction, createTransferInstruction, ExtensionType, getAccount, getAccountLenForMint, getAssociatedTokenAddress, getMint, getMintLen, getOrCreateAssociatedTokenAccount, LENGTH_SIZE, mintTo, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenMetadataInitialize, tokenMetadataUpdateField, transfer, TYPE_SIZE } from "@solana/spl-token";
import { pack, TokenMetadata } from "@solana/spl-token-metadata";
import * as bs58 from 'bs58';
import "dotenv/config";


@Injectable()
export class AppService {

  public connection: Connection = new Connection(clusterApiUrl("devnet"), { commitment: "confirmed" });
  public totalSupplyToken = 6500000000000000000;
  
  constructor(private configService: ConfigService) {
    // this.generateKeyPairs();
    // this.getBalanceUsingWeb3();
    // this.newProgram();
    // this.wallet();
    // this.serialize();
    // this.getBalanceUsingWeb3();
    // this.addAirDropAccountDevNet('8XJh532Rumc6e7kEr8Wcj67MGT6LSJ4CPEvBjp5VaE6m');
    // this.getBalance('3gT299BtUQxdDPfTyQ3dLc2AmNXjnpLPAm82MNSZ9wM2')
    // this.getSeedFromSecretKey2("5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG" )
    // this.createTransactions();
    // this.getOrCreateAssociatedTokenAccountSPL();
    // this.getKeypair();
    // this.generateKeyPairWith();
    
    // this.main();
    // this.spl_extensions();
    // this.getAllTokens();
    // this.main2()
    // this.addTokens()
    // this.createTokenSPL_V2();
    // this.transferTokens()
  } 

  public generateKeyPairWith(){
      let keypair = Keypair.generate();
      while (
        !keypair.publicKey.toBase58().startsWith('V1c70R') || 
        !keypair.publicKey.toBase58().startsWith('v1c70R') || 
        !keypair.publicKey.toBase58().startsWith('V1C70R') ||
        !keypair.publicKey.toBase58().startsWith('v1C70R') ||
        !keypair.publicKey.toBase58().startsWith('v1C7oR') ||
        !keypair.publicKey.toBase58().startsWith('v1C7OR') ||
        !keypair.publicKey.toBase58().startsWith('V1C7OR') ||
        !keypair.publicKey.toBase58().startsWith('V1c7OR') 
      ) {
        keypair = Keypair.generate();
        console.log(keypair.publicKey.toBase58());
      }
      console.log(keypair);
  }

  public async addAirDropAccountDevNet(account: string) {
    try {

      const publicKey: PublicKey = new PublicKey(account);
      // await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL * 1);
      await airdropIfRequired( 
        this.connection,
        publicKey,
        1 * LAMPORTS_PER_SOL,
        0.5 * LAMPORTS_PER_SOL,
      );
      const balance = await this.connection.getBalance(publicKey);
      console.log('balance', balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.log(error); 
      
    }
  }

  public async getBalance(account: string) {
    try {
      const balance = await this.connection.getBalance(new PublicKey(account));
      console.log('balance', balance/LAMPORTS_PER_SOL, 'SOL');
      return balance;
    } catch (error) {
      console.log(error);
      
    }
  }

  public generateKeyPairs() { //* GENERATE KEY PAIRS
    const keypair = Keypair.generate();

    console.log(`The public key is: `, keypair.publicKey.toBase58());
    console.log(`The secret key is: `, keypair.secretKey);
  }

  public getKeypair() { //* GENERATE KEY PAIRS
    const secretKey = this.configService.get<string>('SECRET_KEY_PAYER');
    // console.log('secretKey', secretKey);
    // console.log(Uint8Array.from(JSON.parse(secretKey)));

    const keypair = getKeypairFromEnvironment('PRIVATE_KEY_WALLET');
    console.log(keypair.publicKey);
    console.log(keypair.secretKey); 
  }

  public async getBalanceUsingWeb3(): Promise<number> {
    try {
      const account = this.configService.get<string>('KEY_WALLET');
      //connet devnet solana
      const connection = new Connection(clusterApiUrl("devnet"));
      const publicKey = new PublicKey(account);
      const validAccount = await connection.getAccountInfo(publicKey);
      console.log('validAccount',account ,validAccount);
      // get balance
      const balance = await connection.getBalance(publicKey);
      console.log(balance);
      console.log(balance / LAMPORTS_PER_SOL);
      return balance
    } catch (error) {
      
    }
  }

  public createTransactions(){
    const transaction = new Transaction();
    const amount = 10
    const sender = new PublicKey('64gK5Dc8iCZUg5irWah8PSBKLJFzWEjoTpqmBnyyCazQ');
    const senderKeypair = getKeypairFromEnvironment('SECRET_KEY_WALLET')
    const recipient = new PublicKey('8XJh532Rumc6e7kEr8Wcj67MGT6LSJ4CPEvBjp5VaE6m');


    const sendSolInstruction = SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: recipient,
        lamports: LAMPORTS_PER_SOL * amount,
    });

    const tx = transaction.add(sendSolInstruction);

    const signature = sendAndConfirmTransaction(this.connection, transaction, [ senderKeypair ]);
  }

  public async newProgram() {
    const PROGRAM_ADDRESS = "ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa";
    const PROGRAM_DATA_ADDRESS = "Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod";

    const connection: Connection = new Connection(clusterApiUrl("devnet"));
    const payer: Keypair = getKeypairFromEnvironment('SECRET_KEY_PAYER');
    const programId: PublicKey = new PublicKey(PROGRAM_ADDRESS);
    const programDataAccount: PublicKey = new PublicKey(PROGRAM_DATA_ADDRESS);

    const data = { 
      connection, 
      payer, 
      programId, 
      programDataAccount 
    };

    await this.callProgram(data);
  }

  public async callProgram( data: { connection: Connection, payer: Keypair, programId: PublicKey, programDataAccount: PublicKey }) {
    
    try {
      //* 1. create a transaction
      const transaction = new Transaction();
      const { connection, payer, programId, programDataAccount } = data;

      //* 2. create an instruction
      const sendSolInstruction = new TransactionInstruction({
        keys: [
          {
            pubkey: programDataAccount,
            isSigner: false,
            isWritable: true,
          },
        ],
        programId,
      });
      
      //* 3. add the instruction to the transaction
      transaction.add(sendSolInstruction);
      
      //* 4. send the transaction
      const signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [payer],
      );
  
      console.log(signature);
    } catch (error) {
      console.log(error);
      
    }
  }

  public async wallet() {
    const walletAdapter = await import("@solana/wallet-adapter-phantom");
    const endPoint = clusterApiUrl("devnet");
    const wallet = new walletAdapter.PhantomWalletAdapter();
    console.log(wallet);
    const payer: Keypair = getKeypairFromEnvironment('SECRET_KEY_PAYER');
  }

  // public serialize() {

  //   const publicKey = new PublicKey('');
  //   const playerInfoAccount = new PublicKey('');
  //   const PROGRAM_ID = new PublicKey('');
  //   const player = '';

  //   const equipPlayerSchema = struct([
  //     u8("variant"),
  //     u16("playerId"),
  //     u256("itemId"),
  //   ]);
    
  //   const buffer = Buffer.alloc(1000);

  //   equipPlayerSchema.encode( { variant: 2, playerId: 1435, itemId: 737498 }, buffer );
    
  //   // const instructionBuffer = buffer.slice(0, equipPlayerSchema.getSpan(buffer));
  //   const instructionBuffer = Uint8Array.prototype.slice(0, equipPlayerSchema.getSpan(buffer));
  //   console.log(instructionBuffer);
    
  //   const endpoint = clusterApiUrl("devnet");
  //   const connection = new Connection(endpoint);

  //   const transaction = new Transaction();
  //   const instruction = new TransactionInstruction({
  //       keys: [
  //         {
  //             pubkey: publicKey,
  //             isSigner: true,
  //             isWritable: false,
  //         },
  //         {
  //             pubkey: playerInfoAccount,
  //             isSigner: false,
  //             isWritable: true,
  //         },
  //         {
  //             pubkey: SystemProgram.programId,
  //             isSigner: false,
  //             isWritable: false,
  //         },
  //       ],
  //       data: instructionBuffer,
  //       programId: PROGRAM_ID,
  //   });

  //   transaction.add(instruction);

  //   sendAndConfirmTransaction(connection, transaction, [player]).then(
  //       (txid) => {
  //           console.log(
  //               `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`,
  //           );
  //       },
  //   );
    
  // }

  public async getProgramAccounts() {

    const MOVIE_REVIEW_PROGRAM_ID = "CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN";
    const connection = new Connection(clusterApiUrl("devnet"));

    const accounts = await connection.getProgramAccounts(
      new PublicKey(MOVIE_REVIEW_PROGRAM_ID),
      {
        dataSlice: { offset: 0, length: 0 }
      }
    );
    console.log(accounts[0]);
    
    const accountKeys = accounts.map((account) => account.pubkey);
    console.log(accountKeys);

    // getMultipleAccountsInfo
    const paginatedKeys = accountKeys.slice(0, 10);
    const accountInfos = await connection.getMultipleAccountsInfo(paginatedKeys);
    // console.log(accountInfos);
    
    //* deserializedObjects
    const deserializedObjects = accountInfos.map((accountInfo) => {
        // console.log(accountInfo);
        // put logic to deserialize accountInfo.data here
    });
    
    //* deserialize
    const movies: any[] = accounts.map(({ account }) => {
      // return this.deserialize(account.data);
    });
    
  }

  public async getProgramAccountsSorted() {

    const MOVIE_REVIEW_PROGRAM_ID = "CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN";
    const connection = new Connection(clusterApiUrl("devnet"));

    const accounts: any = await connection.getProgramAccounts(
      new PublicKey(MOVIE_REVIEW_PROGRAM_ID),
      {
        dataSlice: { offset: 13, length: 15 },
      }
    );

    console.log(accounts.length);
    console.log(accounts[0]);
    

    accounts.sort((a, b) => {
      const lengthA = a.account.data.readUInt32LE(0);
      const lengthB = b.account.data.readUInt32LE(0);
      const dataA = a.account.data.slice(4, 4 + lengthA);
      const dataB = b.account.data.slice(4, 4 + lengthB);
      return dataA.compare(dataB);
    });
    
    const accountKeys = accounts.map((account) => account.pubkey);
    

    const movies: any[] = accounts.map(({ account }) => {
      // return this.deserialize(account.data);
    });
    
  }

  public async getProgramAccountsFilters() {

    const MOVIE_REVIEW_PROGRAM_ID = "CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN";
    const connection = new Connection(clusterApiUrl("devnet"));

    const accounts = await connection.getProgramAccounts(
      new PublicKey(MOVIE_REVIEW_PROGRAM_ID),
      {
        dataSlice: { offset: 0, length: 0 },
        filters: [
          {
            memcmp: {
              offset: 13,
              // bytes: bs58.encode(Buffer.from('hel')),
              bytes: '',
            },
          },
        ],
      }
    );
    // console.log(accounts);
    const accountKeys = accounts.map((account) => account.pubkey);

    // getMultipleAccountsInfo
    const paginatedKeys = accountKeys.slice(0, 10);
    const accountInfos = await connection.getMultipleAccountsInfo(paginatedKeys);
    console.log(accountInfos);
    
    const deserializedObjects = accountInfos.map((accountInfo) => {
        console.log(accountInfo);
        // put logic to deserialize accountInfo.data here
    });
    

    const movies: any[] = accounts.map(({ account }) => {
      return this.deserialize(account.data);
      
    });
    
  }

  public deserialize(buffer?: Buffer): any|null {
    
    if (!buffer) {
      return null
    }

    const borshAccountSchema = borsh.struct([
      borsh.bool('initialized'),
      borsh.u8('rating'),
      borsh.str('title'),
      borsh.str('description'),
    ]);
    // console.log(borshAccountSchema);

    try {
      const { title, rating, description } = borshAccountSchema.decode(buffer);
      // console.log(title, rating, description);
      
      // return new Movie(title, rating, description)
    } catch(error) {
      console.log('Deserialization error:', error)
      return null
    }
  }

  public async transferTokens() {
    try {
      const payer: Keypair = getKeypairFromEnvironment('SECRET_KEY_WALLET');
      const tokenAddress = new PublicKey('Ef65JLck5EmpXqCaK4bxqYFQ4p6Ey7ALHhH62c9VNBbN'); // (address) Ef65JLck5EmpXqCaK4bxqYFQ4p6Ey7ALHhH62c9VNBbN / (mint) D4a91T7drfr3yX6e2hBaQpL5f5TqxG6Y7iRLDfVHKGLq
      const destinationPayer = getKeypairFromEnvironment('SECRET_KEY_SOLFLARE');
      console.log('payer', payer.publicKey.toBase58()); 
      console.log('destinationPayer', destinationPayer.publicKey.toBase58());

      const a = await getAccount(
        this.connection,
        tokenAddress,
        "confirmed",
        TOKEN_2022_PROGRAM_ID
      );
      console.log('account', a);
      const amountTransfer = 155000000000000000;
      const mint = await getMint(this.connection, a.mint, "confirmed", TOKEN_2022_PROGRAM_ID);
      // console.log('mintInfo', mint);

      //get the token account of the destination address, if it does not exist, create it
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection, //Connection,
        destinationPayer, // payer Signer,
        mint.address, // mint,
        destinationPayer.publicKey, // owner PublicKey,
        false, // allowOwnerOffCurve,
        "confirmed", // Commitment,
        null,
        TOKEN_2022_PROGRAM_ID
      );

      console.log('toTokenAccount', toTokenAccount);
      
      const transactionSignature = await transfer(
        this.connection, //Connection,
        payer, // Signer,
        tokenAddress, // PublicKey,
        toTokenAccount.address, // PublicKey,
        payer, // Signer | PublicKey,
        amountTransfer, // number | bigint,
        [],  // multiSigners: Signer[] = [],
        null, // ConfirmOptions,
        TOKEN_2022_PROGRAM_ID
      );
    
      console.log(
        `Transfer Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
      );
  
    } catch (error) {
      console.log(error);
      
    }
  }

  public getSeedFromSecretKey (secretKey: Uint8Array) {
    return Keypair.fromSecretKey( secretKey );
  }

  public getSeedFromSecretKey2 (secretKey: string) {
    console.log();
    
    const dec = bs58.decode(secretKey);
    // console.log(dec);
    const keypair = Keypair.fromSecretKey(dec);
    // console.log(keypair);
    console.log(keypair.publicKey.toBase58());
    return keypair;
  }

  public async getOrCreateAssociatedTokenAccountSPL() {

    const source = new PublicKey('HAiegFmMgkLiYsezD48Q6ofV5tPQfJSV5ho1hRgJX5AG');
    const mintInfo = await getMint(this.connection, source);
    console.log('mintInfo', mintInfo);
    
    const payer: Keypair = getKeypairFromEnvironment('PRIVATE_KEY_3');
    
    const tokenAccount = await getOrCreateAssociatedTokenAccount( 
      this.connection, 
      payer, 
      mintInfo.address, 
      payer.publicKey,
      false,
      null,
      {},
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    console.log('tokenAccount Get Or CREATED', tokenAccount); 
  }

  public async createTokenSPL_V1() {
    try {
      
      const payer: Keypair = getKeypairFromEnvironment('SECRET_KEY_WALLET');
      const mintAuthority = payer.publicKey;
      const freezeAuthority = payer.publicKey;
      const decimals = 8;
      // console.log('payer.publicKey', payer.publicKey);
      
      //* ==========   1. TOKEN MINT (Un Token Mint es la cuenta que contiene datos sobre un token específico.)
      // Un Token Mint es la cuenta que contiene datos sobre un token específico.

      const tokenMintAccount = await createMint(
        this.connection, // Connection to use
        payer, // Payer of the transaction and initialization fees
        mintAuthority, // Account or multisig that will control minting
        freezeAuthority, // Optional account or multisig that can freeze token accounts
        decimals, // Location of the decimal place
        undefined, // Optional keypair, defaulting to a new random one
        {}, // Options for confirming the transaction
        TOKEN_2022_PROGRAM_ID, // SPL Token program account
      );
      console.log('tokenMint CREATED', tokenMintAccount);

      // const mintInfo = await getMint(this.connection, tokenMintAccount);
      // console.log('mintInfo', mintInfo);
      
      //* ==========   2. TOKEN ACCOUNT (necesita una cuenta de tokens para guardar los tokens recién emitidos.)
      // An Associated Token Account is a Token Account where the address of the Token Account is derived using an owner's public key and a token mint. 

      const owner = payer.publicKey;
      const AssociateTokenAccount = await getOrCreateAssociatedTokenAccount( 
        this.connection,   // Connection to use
        payer,   //Payer of the transaction and initialization fees
        tokenMintAccount,   // Mint associated with the account to set or verify
        owner,  // Owner of the account to set or verify
        false,  //Allow the owner account to be a PDA (Program Derived Address)
        null,  //Desired level of commitment for querying the state
        {},  //Options for confirming the transaction
        TOKEN_2022_PROGRAM_ID,  //SPL Token program account
        // ASSOCIATED_TOKEN_PROGRAM_ID  //SPL Associated Token program account
      );
      console.log('tokenAccount CREATED', AssociateTokenAccount);

      console.log(
        `Token Account: https://explorer.solana.com/address/${AssociateTokenAccount.address}?cluster=devnet`,
      );
      
      
      //* =========== Mint Tokens ===========================
      // Minting tokens is the process of issuing new tokens into circulation. 
      const transactionSignature = await mintTo(
        this.connection, 
        payer, // the account of the payer for the transaction
        tokenMintAccount, // the token mint that the new token account is associated with
        AssociateTokenAccount.address, //the token account that tokens will be minted to
        payer.publicKey, // the account authorized to mint tokens
        BigInt(6500000000000000000), // the raw amount of tokens to mint outside of decimals.
        [payer],
        {},
        TOKEN_2022_PROGRAM_ID
      );
    
      console.log(
        `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
      );

      //* =========== Approve Delegate ===========================
      // Approving a delegate is the process of authorizing another account to transfer or burn tokens from a token account.

    } catch (error) {
      console.log(error);
      
    }
  }

  public async createTokenSPL_V2() {
    try {
      //* Account Wallet
      const payer: Keypair = getKeypairFromEnvironment('SECRET_KEY_WALLET');
      const balance = await this.connection.getBalance(payer.publicKey);
      console.log('balance SOL: ', balance / LAMPORTS_PER_SOL); 

      //* Account Authority
      const mintAuthority = payer.publicKey;
      const updateAuthority = payer.publicKey;
      const freezeAuthority = payer.publicKey;
      const decimals = 8;
      //* Generate new keypair for Mint Account
      const mintKeypair = Keypair.generate();
      console.log('mintKeypair', mintKeypair.publicKey);
      //* Address for Mint Account
      const mint = mintKeypair.publicKey;
      // console.log('payer.publicKey', payer.publicKey);
      

      //* Metadata to store in Mint Account
      const metaData: TokenMetadata = {
        updateAuthority: updateAuthority,
        mint: mint,
        name: "CAPY",
        symbol: "CAPY",
        uri: "https://viktorhugo.github.io/developers/metadata.json",
        additionalMetadata: [
          ["description", "Capybara Token Currency"],
          ["autor", "Victor hugo mosquera A."],
          ["company", "VmBross"],
        ],
      };


      //* Size of Mint Account with extension
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      //* Size of MetadataExtension 2 bytes for type, 2 bytes for length
      const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
      //* Size of metadata
      const metadataLen = pack(metaData).length;
      console.log('metadataLen', metadataLen);
      //* Minimum lamports required for Mint Account
      const lamports = await this.connection.getMinimumBalanceForRentExemption(
        mintLen + metadataExtension + metadataLen,
      );

      //* invoke System Program to create new account
      const createAccount = await this.createAccount(
        payer,
        mintLen,
        lamports,
        mintKeypair
      )
      console.log('createAccount', createAccount);

      //* Initialize the MetadataPointer Extension
      const initializeMetadataPointer = await this.initPointerMetadata(
        payer, 
        mintKeypair, 
        payer.publicKey,
        TOKEN_2022_PROGRAM_ID
      );
      console.log('initializeMetadataPointer TX', initializeMetadataPointer);

      //* Initialize Mint Account data
      const mintedAccount = await this.initMintAccount(
        payer,
        mint,
        mintAuthority,
        freezeAuthority,
        decimals
      )
      console.log('mintedAccount', mintedAccount);
      
      //* Initialize Metadata Account data
      const metadataInitialize = await tokenMetadataInitialize(
        this.connection,
        payer,
        mint,
        updateAuthority,
        mintAuthority,
        metaData.name,
        metaData.symbol,
        metaData.uri,
        [],
        {},
        TOKEN_2022_PROGRAM_ID
      )
      console.log('tokenMetadataInitialize TX', metadataInitialize);
      
      //* ======= Update metadata, adding custom fields ======
      await tokenMetadataUpdateField(
        this.connection,
        payer,
        mint,
        updateAuthority,
        metaData.additionalMetadata[0][0], // key
        metaData.additionalMetadata[0][1], // value
        [],
        {},
        TOKEN_2022_PROGRAM_ID
      )
      await tokenMetadataUpdateField(
        this.connection,
        payer,
        mint,
        updateAuthority,
        metaData.additionalMetadata[1][0], // key
        metaData.additionalMetadata[1][1], // value
        [],
        {},
        TOKEN_2022_PROGRAM_ID
      )
      await tokenMetadataUpdateField(
        this.connection,
        payer,
        mint,
        updateAuthority,
        metaData.additionalMetadata[2][0], // key
        metaData.additionalMetadata[2][1], // value
        [],
        {},
        TOKEN_2022_PROGRAM_ID
      )
      
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
      const transactionSignature = await mintTo(
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
        `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
      );

    } catch (error) {
      console.log(error);
      
    }
  }

  public async createAccount(
    payer: Keypair,
    space: number,
    lamports: number,
    accountKeypair: Keypair,
  ) {
    const programId = TOKEN_2022_PROGRAM_ID;
    const tokenMintTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: accountKeypair.publicKey,
        space,
        lamports,
        programId,
      }),
    );

    // Send transaction
    await sendAndConfirmTransaction(this.connection, tokenMintTransaction, [payer, accountKeypair]);

    return accountKeypair.publicKey;
  }

  public async initMintAccount(
    payer:Keypair,
    mint: PublicKey,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey,
    decimals: number
  ) {
    const initializeMintInstruction = new Transaction().add(
      createInitializeMintInstruction(
        mint, // direccion de la cuenta Mint
        decimals, // Decimals of Mint
        mintAuthority, // Autoridad de la moneda designada
        freezeAuthority, // Optional Freeze Authority
        TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
      )
    );
    const tx = await sendAndConfirmTransaction(
      this.connection,
      initializeMintInstruction,
      [payer], // Signers
    );
    
    return tx;

  }

  public async initPointerMetadata(
    payer: Keypair,
    mintKeypair: Keypair,
    updateAuthority: PublicKey,
    programId
  ) {

    const initializeMetadataPointerInstruction = new Transaction().add(
      createInitializeMetadataPointerInstruction(
        mintKeypair.publicKey, // direccion de la cuenta Mint
        updateAuthority, // Autoridad que puede establecer la direccion de metadatos
        mintKeypair.publicKey, // direccion de la cuenta que contiene los metadatos
        programId,
      )
    );

    const tx = await sendAndConfirmTransaction(
      this.connection,
      initializeMetadataPointerInstruction,
      [payer], // Signers
    );
    
    return tx;
  }

  public async spl_extensions() {
    const payer: Keypair = getKeypairFromEnvironment('SECRET_KEY_WALLET');
    const mintAuthority = payer.publicKey;
    const freezeAuthority = payer.publicKey;
    const decimals = 8;

    // const createTokenMint: PublicKey = await this.buildCreateTokenAccountTransaction(payer, decimals);
    // console.log(createTokenMint);
    
  }


  //* ==========   1. TOKEN MINT (Un Token Mint es la cuenta que contiene datos sobre un token específico.)
  public async buildCreateTokenAccountTransaction(
    payer: Keypair,
    space: number,
    lamports: number,
    accountKeypair: Keypair
  ) {
    const programId = TOKEN_2022_PROGRAM_ID;
    const tokenMintTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: accountKeypair.publicKey,
        space,
        lamports,
        programId,
      }),
    );

    // Send transaction
    const res = await sendAndConfirmTransaction(this.connection, tokenMintTransaction, [payer, accountKeypair]);
    // console.log(res);

    return accountKeypair.publicKey;
  }
  

  //* ==========   2. TOKEN ACCOUNT (necesita una cuenta de tokens para guardar los tokens recién emitidos.)
  public async buildCreateMintTransaction(
    payer: Keypair,
    mint: PublicKey
  ) {

    const mintState = await getMint(this.connection, mint);
    const accountKeypair = await Keypair.generate();
    const space = getAccountLenForMint(mintState);
    const lamports = await this.connection.getMinimumBalanceForRentExemption(space);
    const programId = TOKEN_2022_PROGRAM_ID

    const tokenAccountTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: accountKeypair.publicKey,
        space,
        lamports,
        programId,
      }),
      createInitializeAccountInstruction(
        accountKeypair.publicKey, // New token account
        mint, // Mint account
        payer.publicKey, // Owner of the new account
        programId // SPL Token program account
      )
    );

    // Send transaction
    await sendAndConfirmTransaction(this.connection, tokenAccountTransaction, [payer, accountKeypair]);

    return accountKeypair.publicKey;
  }


  //* ==========   3. ASSOCIATED TOKEN ACCOUNT (Cuenta Token Asociada es una cuenta de tokens para guardar los tokens recién emitidos.)
  // Una cuenta de token asociada es una cuenta de token en la que la dirección de la cuenta de token se deriva utilizando
  // la clave pública del propietario y una moneda de token.
  public async buildCreateAssociatedTokenAccountTransaction(
    payer: PublicKey,
    mint: PublicKey
  ): Promise<Transaction> {
    const associatedTokenAddress = await getAssociatedTokenAddress(mint, payer, false);
  
    const associatedTokenTransaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer,  //Payer of the initialization fees
        associatedTokenAddress,  //New associated token account
        payer,  //Owner of the new account
        mint,  //Token mint account
        TOKEN_2022_PROGRAM_ID,  //SPL Token program account
        null //SPL Associated Token program account
      )
    );

    console.log(associatedTokenTransaction);
    return associatedTokenTransaction;
  }



  //* ==========   4. MINT TOKENS (La acuñación de tokens es el proceso de poner en circulación nuevos tokens.)
  // Sólo la autoridad de acuñación de una casa de moneda puede acuñar nuevos tokens.
  public async buildMintToTransaction(
    authority: PublicKey,
    mint: PublicKey,
    amount: number,
    destination: PublicKey
  ): Promise<Transaction> {
    const transaction = new Transaction().add(
      createMintToInstruction(
        mint,
        destination,
        authority,
        amount,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    )
  
    return transaction
  }


  //* ==========   5. TRANSFERS TOKENS (Transferir fichas)
  // Las transferencias de tokens SPL requieren que tanto el remitente como el receptor tengan cuentas de tokens para la acuñación de los tokens que se transfieren
  public async buildTransferTransaction(
    source: PublicKey,
    destination: PublicKey,
    owner: PublicKey,
    amount: number
  ): Promise<Transaction> {
    const transaction = new Transaction().add(
      createTransferInstruction(
        source,
        destination,
        owner,
        amount,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );
  
    return transaction
  }

  //* ==========   6. BURN TOKENS (quemar fichas)
  // La quema de tokens es el proceso de disminuir el suministro de tokens de una casa de moneda determinada.
  public async buildBurnTransaction(
    account: PublicKey,
    mint: PublicKey,
    owner: PublicKey,
    amount: number
  ): Promise<Transaction> {
    const transaction = new Transaction().add(
      createBurnInstruction(
        account,
        mint,
        owner,
        amount,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    )
  
    return transaction
  }


  //* ==========   7. APPROVE DELEGATE (Aprobar un delegado)
  // Aprobar un delegado es el proceso de autorizar a otra cuenta a transferir o quemar tokens desde una cuenta de token.
  public async buildApproveTransaction(
    account: PublicKey,
    delegate: PublicKey,
    owner: PublicKey,
    amount: number
  ): Promise<Transaction> {
    const transaction = new Transaction().add(
      createApproveInstruction(
        account,
        delegate,
        owner,
        amount,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    )
  
    return transaction
  }


  //* ==========   8. REVOQUE DELEGATE (Revocar un delegado)
  // Una vez que se revoca un delegado, el delegado ya no puede transferir tokens desde la cuenta de tokens del propietario.

  public async buildRevokeTransaction(
    account: PublicKey,
    owner: PublicKey,
  ): Promise<Transaction> {
    const transaction = new Transaction().add(
      createRevokeInstruction(
        account,
        owner,
      )
    )

    return transaction
  }

  public async getAllTokens() {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const tokenAccounts = await connection.getTokenAccountsByOwner(
      new PublicKey('64gK5Dc8iCZUg5irWah8PSBKLJFzWEjoTpqmBnyyCazQ'),
      {
        programId: TOKEN_2022_PROGRAM_ID,
      }
    );

    console.log("Token                                         Balance");
    console.log("------------------------------------------------------------");
    tokenAccounts.value.forEach((tokenAccount) => {

      const accountData = AccountLayout.decode(tokenAccount.account.data);
      console.log(`${new PublicKey(accountData.mint)}   ${accountData.amount}`);
    })

    // const a = await this.buildCreateTokenAccountTransaction(
    //   getKeypairFromEnvironment('PRIVATE_KEY_2'),
    //   8
    // )
    
  }

  public async addTokens() {

    const payer: Keypair = getKeypairFromEnvironment('SECRET_KEY_WALLET');

    // Minting tokens is the process of issuing new tokens into circulation. 
    const transactionSignature = await mintTo(
      this.connection, 
      payer, // the account of the payer for the transaction
      new PublicKey('5uuwgmveAwUhQrkVYkL7vEQUCiNgyHed8H9KThVkAAAY'), // the token mint that the new token account is associated with
      new PublicKey('7RoCSbsayZVcsBnTUrWoAMuFQe7H5YBizQG9KJDUHuRN'), //the token account that tokens will be minted to
      payer.publicKey, // the account authorized to mint tokens
      BigInt(6500000000000000000), // the raw amount of tokens to mint outside of decimals.
      [payer],
      {},
      TOKEN_2022_PROGRAM_ID
    );

    console.log(transactionSignature);
    
  }

  
} 

