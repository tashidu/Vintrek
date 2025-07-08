# VinTrek - Blockchain-Powered Eco-Tourism Platform

VinTrek is a revolutionary blockchain-powered web platform that gamifies eco-tourism in Sri Lanka. Users can discover hiking trails, record their actual walking paths using real-time GPS tracking, mint NFTs upon completion, and earn TREK tokens for their outdoor activities.

## 🌟 Features

### Core Features
- **Trail Discovery**: Browse and filter hiking trails across Sri Lanka with map-based approach
- **Real-time GPS Tracking**: Record actual walking paths with start/end buttons (similar to Wikiloc)
- **User-Generated Content**: Allow users to add their own trails instead of using mock data
- **Blockchain Integration**: Secure, transparent system using Cardano
- **NFT Minting**: Mint unique trail completion certificates as NFTs
- **Token Rewards**: Earn TREK tokens for completing trails and activities
- **Wallet Integration**: Connect with Cardano wallets (Lace, Eternl, Nami, Flint)

### 🤖 AI-Powered Safety Features
- **Weather Risk Assessment**: Real-time weather analysis with safety recommendations
- **Crowd Density Prediction**: ML-based crowd forecasting for optimal hiking times
- **Personalized Difficulty**: AI adjusts trail difficulty based on your fitness profile
- **Emergency Detection**: Accelerometer + GPS monitoring for fall/emergency detection
- **Smart Recommendations**: AI suggests trails based on weather, crowd, and personal factors
- **Emergency Contact Alerts**: Automated safety check-ins and emergency notifications

### Blockchain Features
- **On-chain Trail Logs**: Transparent trail recording and verification
- **Trail NFTs**: Unique collectible certificates with metadata
- **TREK Token Economy**: Utility token for rewards and premium features
- **Smart Contracts**: Automated minting and reward distribution

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Blockchain**: Cardano, Mesh SDK, Blockfrost API
- **Smart Contracts**: Aiken/Plutus
- **Wallets**: Lace, Eternl, Nami, Flint
- **Maps**: Leaflet, React Leaflet
- **Storage**: IPFS/Arweave for NFT metadata
- **AI/ML**: OpenWeatherMap API, Custom ML models for crowd prediction
- **Safety**: Device motion API, GPS tracking, Emergency contact system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A Cardano wallet (Lace or Eternl recommended)
- Blockfrost API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tashidu/Vintrek.git
   cd Vintrek
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` with your configuration:
   - Blockfrost project ID
   - Smart contract addresses
   - OpenWeatherMap API key (for AI safety features)
   - API keys

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Blockfrost Setup
1. Create account at [Blockfrost.io](https://blockfrost.io)
2. Create a new project for Cardano testnet
3. Copy your project ID to `NEXT_PUBLIC_BLOCKFROST_PROJECT_ID`

### Wallet Setup
1. Install a Cardano wallet:
   - [Lace Wallet](https://www.lace.io/)
   - [Eternl Wallet](https://eternl.io/)
2. Switch to testnet mode
3. Get test ADA from [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)

## 📱 Usage

### For Hikers
1. **Connect Wallet**: Click "Connect Wallet" and select your Cardano wallet
2. **Browse Trails**: Explore available hiking trails with map-based interface
3. **Start Recording**: Use GPS tracking to record your actual walking path
4. **Complete Trail**: Finish recording and verify completion
5. **Mint NFT**: Receive a unique trail completion NFT
6. **Earn Tokens**: Get TREK tokens for activities
7. **Add Trails**: Contribute by adding new trails to the platform

### For Developers
- **Smart Contracts**: Located in `/contracts` directory
- **API Routes**: Backend logic in `/src/app/api`
- **Components**: Reusable UI components in `/src/components`
- **Types**: TypeScript definitions in `/src/types`

## 🏗 Project Structure

```
vintrek/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── add-trail/       # Add trail functionality
│   │   ├── trails/          # Trail pages
│   │   └── api/             # API routes
│   ├── components/          # React components
│   │   ├── trails/          # Trail-related components
│   │   └── ui/              # UI components
│   ├── lib/                 # Utility functions
│   ├── types/               # TypeScript definitions
│   ├── hooks/               # Custom React hooks
│   └── services/            # Service layer
├── contracts/               # Smart contracts (Aiken)
├── public/                  # Static assets
└── docs/                    # Documentation
```

## 🔗 Blockchain Integration

### Smart Contracts
- **NFT Minting Contract**: Mints trail completion certificates
- **Token Contract**: Manages TREK token distribution
- **Trail Recording Contract**: Handles on-chain trail logs

### Wallet Integration
- **Mesh SDK**: Core blockchain interactions
- **Multi-wallet Support**: Lace, Eternl, Nami, Flint
- **Transaction Signing**: Secure transaction handling

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic trail discovery and mapping
- ✅ Real-time GPS tracking functionality
- ✅ User-generated trail content
- ✅ Wallet integration
- ✅ NFT minting functionality
- ✅ Token reward system
- ✅ AI-powered safety features
- ✅ Weather risk assessment
- ✅ Emergency detection system
- ✅ Personalized trail recommendations

### Phase 2 (Next)
- [ ] Advanced AI features (AR plant identification, wildlife spotting)
- [ ] IoT integration (smart trail markers, weather stations)
- [ ] Social features and leaderboards
- [ ] Mobile app (Flutter)

### Phase 3 (Future)
- [ ] Multi-language support
- [ ] National park integrations
- [ ] Advanced analytics
- [ ] Marketplace for NFTs

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.vintrek.com](https://docs.vintrek.com)
- **Discord**: Join our community
- **Email**: support@vintrek.com
- **Issues**: [GitHub Issues](https://github.com/tashidu/Vintrek/issues)

## 🙏 Acknowledgments

- Cardano Foundation for blockchain infrastructure
- Mesh SDK team for excellent developer tools
- Sri Lankan hiking community for inspiration
- Open source contributors

---

**Built with ❤️ for the eco-tourism community in Sri Lanka**

*Vintrek-Blockchain*
