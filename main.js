import "dotenv/config";
import { ethers } from "ethers";
import fetch from "node-fetch";
import fs from "fs";

const SESSION_FILE = "session.json";
import { banner } from "./banner.js";

console.log(banner); w

class KlokappBot {
  constructor() {
    this.baseUrl = "https://api1-pp.klokapp.ai/v1";
    this.walletAddress = process.env.WALLET_ADDRESS;
    this.sessionToken = this.loadSessionToken();
    this.running = true;
  }

  loadSessionToken() {
    try {
      if (fs.existsSync(SESSION_FILE)) {
        const data = JSON.parse(fs.readFileSync(SESSION_FILE, "utf8"));
        console.log("🔹 Menggunakan session token yang tersimpan.");
        return data.sessionToken;
      }
    } catch (error) {
      console.error("❌ Gagal memuat session token:", error.message);
    }
    return null;
  }

  saveSessionToken(token) {
    try {
      fs.writeFileSync(SESSION_FILE, JSON.stringify({ sessionToken: token }, null, 2));
      console.log("✅ Session token disimpan.");
    } catch (error) {
      console.error("❌ Gagal menyimpan session token:", error.message);
    }
  }

  async start() {
    try {
      console.log("🔗 Menggunakan wallet:", this.walletAddress);

      while (this.running) {
        try {
          if (!this.sessionToken || !(await this.checkSessionToken())) {
            await this.connectWallet();
          }

          await this.performChats();

          console.log("😴 Istirahat 5 menit...");
          await new Promise((res) => setTimeout(res, 5 * 60 * 1000));
        } catch (error) {
          console.error("❌ Error sesi:", error.message);
          console.log("🔄 Reconnecting in 1 minute...");
          this.sessionToken = null;
          await new Promise((res) => setTimeout(res, 60000));
        }
      }
    } catch (error) {
      console.error("❌ Fatal error:", error);
      console.log("⚠️ Bot berhenti.");
    }
  }

  async connectWallet() {
    try {
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(48)).substring(2);
      const messageToSign = `klokapp.ai wants you to sign in with your Ethereum account:\n${this.walletAddress}\n\nURI: https://klokapp.ai/\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;

      console.log("📝 Minta tanda tangan MetaMask...");
      const signedMessage = await this.signMessage(messageToSign);

      console.log("🔐 Verifikasi wallet...");
      const verifyResponse = await fetch(`${this.baseUrl}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedMessage, message: messageToSign }),
      });

      const verifyData = await verifyResponse.json();
      if (!verifyData.session_token) {
        throw new Error("Tidak ada session_token dalam respons");
      }

      this.sessionToken = verifyData.session_token;
      this.saveSessionToken(this.sessionToken);
      console.log("✅ Wallet terhubung!");
    } catch (error) {
      console.error("❌ Error koneksi wallet:", error.message);
      throw error;
    }
  }

  async checkSessionToken() {
    try {
      console.log("🔎 Memeriksa validitas session token...");
      const response = await fetch(`${this.baseUrl}/rate-limit`, {
        method: "GET",
        headers: { "x-session-token": this.sessionToken },
      });

      if (response.ok) {
        console.log("✅ Session token masih valid.");
        return true;
      } else {
        console.log("❌ Session token tidak valid.");
        return false;
      }
    } catch (error) {
      console.error("❌ Gagal memeriksa session token:", error.message);
      return false;
    }
  }

  async signMessage(message) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
      const signer = provider.getSigner(this.walletAddress);
      return await signer.signMessage(message);
    } catch (error) {
      console.error("❌ Gagal menandatangani pesan:", error.message);
      throw error;
    }
  }

  async performChats() {
    console.log("🚀 Mulai sesi chat...");
    try {
      const messages = ["Apa kabar?", "Bagaimana perkembangan Ethereum?", "Apa itu Layer 2?"];
      for (const message of messages) {
        console.log(`💬 Mengirim: ${message}`);
        const response = await fetch(`${this.baseUrl}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-token": this.sessionToken,
          },
          body: JSON.stringify({ message }),
        });
        
        const data = await response.json();
        console.log(`📩 Respons: ${data.reply}`);
        await new Promise((res) => setTimeout(res, 5000));
      }
    } catch (error) {
      console.error("❌ Gagal menjalankan chat:", error.message);
    }
  }
}

const bot = new KlokappBot();
bot.start().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("\n👋 Bot berhenti...");
  bot.running = false;
  setTimeout(() => process.exit(0), 1000);
});
