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
import { useState } from "react";
import { FadeIn } from "./fade-in";

type networkTypes = "Solana" | "Eth" | "Lido" | "Aptos" | "Celestia";

const NetworkPicker = () => {
  const [network, setNetwork] = useState<networkTypes>("Solana");

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
            onValueChange={(e) => setNetwork(e as networkTypes)}
          >
            <DropdownMenuRadioItem value="Solana">Solana</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Eth">Eth</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Lido">Lido</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Aptos">Aptos</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Celestia">
              Celestia
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </FadeIn>
  );
};

export default NetworkPicker;
