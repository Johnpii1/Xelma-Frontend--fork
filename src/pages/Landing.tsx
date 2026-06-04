import { useWalletStore } from "../store/useWalletStore";
import { HeroSection } from "../components/HeroSection";

interface LandingProps {
  showNewsRibbon?: boolean;
}

const Landing = ({ showNewsRibbon = true }: LandingProps) => {
  const isWalletConnected = useWalletStore((s) => s.publicKey !== null && s.publicKey !== "");

  return (
    <div className="w-full">
      <HeroSection isLoggedIn={isWalletConnected} showNewsRibbon={showNewsRibbon} />
    </div>
  );
};

export default Landing;
