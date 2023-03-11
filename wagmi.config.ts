import { defineConfig } from '@wagmi/cli'
import { hardhat, react } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'src/generated/zk-poh-contract.ts',
  plugins: [
    hardhat({
      artifacts: 'build/contracts',
      project: '../zk-proof-of-humanity',
      include: ['ZKProofOfHumanity.json'],
      deployments: {
        ZKProofOfHumanity: {
          5: '0xadd10dC8637b7136b9F9c71AeCCc92e8be9bE9b8',
          31337: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
          1337: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
        }
      }}),
    react({
      useContract: true,
      useContractEvent: false,
      useContractItemEvent: false,
      useContractRead: true,
      useContractFunctionRead: false,
      useContractWrite: false,
      usePrepareContractWrite: false,
      usePrepareContractFunctionWrite: true,
    }),
  ],
})
