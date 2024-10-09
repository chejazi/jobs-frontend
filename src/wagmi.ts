import { getDefaultConfig } from "connectkit";
import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";

export const config = createConfig(
  getDefaultConfig({
    chains: [base],
    walletConnectProjectId: 'e820108402253110e87b7fb26a516e00',
    appName: "Based Jobs",
    transports: {
      [base.id]: http(),
      // [mainnet.id]: http(),
    },
  }),
);

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
