import { FadeIn } from "./fade-in";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

type cardTypes = {
  title: string;
  value: string;
  info: string;
};

const NumberCard = ({ title, value, info }: cardTypes) => {
  return (
    <FadeIn className="w-full">
      <Card className="w-full gap-2">
        <CardHeader>
          <CardTitle className="text-xs lg:text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl xl:text-4xl font-semibold">{value}</p>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-xs">{info}</p>
        </CardFooter>
      </Card>
    </FadeIn>
  );
};

export default NumberCard;
