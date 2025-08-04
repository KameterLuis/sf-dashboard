import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Network, useNetworkStore } from "@/lib/network-store";
import { FadeIn } from "./fade-in";

const NetworkPicker = () => {
  const network = useNetworkStore((s) => s.network);
  const setNetwork = useNetworkStore((s) => s.setNetwork);

  return (
    <FadeIn>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{network}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 ml-10">
          <DropdownMenuLabel>Network</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={network}
            onValueChange={(e) => setNetwork(e.toLowerCase() as Network)}
          >
            <DropdownMenuRadioItem value="Solana">Solana</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Ethereum">
              Ethereum
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Lido">Lido</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Aptos">Aptos</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Celestia">
              Celestia
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Sui">Sui</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </FadeIn>
  );
};

export default NetworkPicker;
